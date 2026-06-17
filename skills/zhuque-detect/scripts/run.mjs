#!/usr/bin/env node
/**
 * 腾讯朱雀 AI 检测 自动化（连真实 Chrome / 自包含）
 *   输入文本 → 检测 → 导出官方「朱雀AI生成检测报告单」PDF。
 *
 * 用法：
 *   1) 先用调试端口启动你日常的 Chrome（带登录态，令牌齐）：
 *        macOS:  open -a "Google Chrome" --args --remote-debugging-port=9222
 *        Linux:  google-chrome --remote-debugging-port=9222
 *        Win:    chrome.exe --remote-debugging-port=9222
 *   2) node run.mjs [输入文本文件] [输出PDF]
 *        省略则用 sample.txt → reports/朱雀报告单-<时间>.pdf
 *
 * 为什么必须连真机：朱雀检测走 WebSocket，签名由页面运行时按真实浏览器环境
 *   实时生成 fp(设备指纹)/ARGUS_XSS_V3(风控令牌)。空白自动化 chromium 无有效
 *   令牌 → "Invalid request"。连你已登录的真机即天然带齐令牌。
 *
 * 报告单获取：产品「下载报告」是隐藏 iframe 调 contentWindow.print()（原生打印框，
 *   脚本点不动、还会冻结页面）。本脚本劫持该 iframe 的 print，截获其报告单 HTML，
 *   再用 CDP Page.printToPDF 渲染成等价 PDF —— 全程不弹原生框。
 *
 * 约束：文本须 ≥350 字；有每日检测次数额度。
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const URL = 'https://matrix.tencent.com/ai-detect/';
const CDP = process.env.ZHUQUE_CDP || 'http://localhost:9222';

const die = (m) => { console.error('✗', m); process.exit(1); };

const inFile = process.argv[2] || path.join(HERE, 'sample.txt');
if (!fs.existsSync(inFile)) die(`输入文件不存在：${inFile}`);
const text = fs.readFileSync(inFile, 'utf8').trim();
if (text.length < 350) die(`文本须 ≥350 字，当前 ${text.length} 字`);

const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
const outFile = process.argv[3] || path.join(process.cwd(), 'reports', `朱雀报告单-${stamp}.pdf`);
fs.mkdirSync(path.dirname(outFile), { recursive: true });

console.log(`[1/5] 文本 ${text.length} 字 ← ${inFile}`);

// ── 连接真实 Chrome ──
let browser;
try {
  browser = await chromium.connectOverCDP(CDP);
} catch (e) {
  die(`连不上 Chrome 调试端口 ${CDP}\n   先启动：open -a "Google Chrome" --args --remote-debugging-port=9222\n   （${e.message}）`);
}
const ctx = browser.contexts()[0]; // 真机已有 context：带你的登录态 + ARGUS 令牌
if (!ctx) die('未找到浏览器 context');

const page = await ctx.newPage();
try {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  const ta = page.locator('textarea.el-textarea__inner');
  await ta.waitFor({ state: 'visible', timeout: 20000 });
  await ta.fill(text);
  console.log('[2/5] 文本已填入，点击检测…');

  // 额度预检：按钮禁用多为「今日次数已用完」
  const btn = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /立即检测|Detect/.test(x.innerText));
    return b ? { txt: b.innerText.trim(), disabled: b.disabled } : null;
  });
  if (btn?.disabled) die(`检测按钮禁用：${btn.txt}（多为每日额度用完，次日重置）`);

  await page.getByRole('button', { name: /立即检测|Detect/ }).click();

  // 等结果就绪 或 报错
  let ready = false, err = '';
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(2000);
    const st = await page.evaluate(() => {
      const a = document.querySelector('a.download-link');
      const vis = !!(a && a.getBoundingClientRect().width > 0);
      const captcha = !!document.querySelector('iframe[src*="captcha"]') || /拖动滑块|完成验证/.test(document.body.innerText);
      const body = document.body.innerText;
      let e = '';
      for (const k of ['Invalid request', '检测文本长度需大于', '频率', '额度', '次数已用'])
        if (body.includes(k)) { e = k; break; }
      return { vis, captcha, e };
    });
    if (st.vis) { ready = true; break; }
    if (st.captcha) die('出现滑块验证码 —— 请在弹出的 Chrome 窗口手动完成拖动验证后重跑本脚本（冷启动/陌生会话偶发；用日常常用、已建立信任的 Chrome 一般不触发）。');
    if (st.e) { err = st.e; break; }
  }
  if (err) die(`检测失败：${err}${err === 'Invalid request' ? '（令牌无效——确认 Chrome 已登录且能手动跑朱雀）' : ''}`);
  if (!ready) die('90s 内结果未就绪');
  console.log('[3/5] 结果就绪，劫持「下载报告」iframe…');

  // 劫持新建 iframe 的 print：截获报告单 HTML、吞掉真打印（不弹原生框/不冻结）
  await page.evaluate(() => {
    window.__reportHTML = null;
    const patch = (ifr) => {
      const w = ifr.contentWindow; if (!w) return;
      w.print = function () {
        try {
          const d = ifr.contentDocument || w.document;
          window.__reportHTML = '<!DOCTYPE html>\n' + d.documentElement.outerHTML;
        } catch (e) { /* cross-origin? 忽略 */ }
      };
    };
    const wrap = (orig) => function (n) {
      const r = orig.apply(this, arguments);
      try {
        if (n && n.tagName === 'IFRAME') { patch(n); n.addEventListener('load', () => patch(n), true); }
      } catch (e) { /* noop */ }
      return r;
    };
    Node.prototype.appendChild = wrap(Node.prototype.appendChild);
    Node.prototype.insertBefore = wrap(Node.prototype.insertBefore);
    window.print = function () { window.__reportHTML = '<!DOCTYPE html>\n' + document.documentElement.outerHTML; };
  });

  await page.click('a.download-link');
  await page.waitForTimeout(2000);
  let html = await page.evaluate(() => window.__reportHTML || '');
  if (!html) die('未截获报告单 HTML（页面结构可能已变）');
  console.log(`[4/5] 已截获报告单 HTML（${html.length} 字符），渲染 PDF…`);

  // 注入 <base> 修相对外链
  const base = '<base href="https://matrix.tencent.com/">';
  const i = html.toLowerCase().indexOf('<head>');
  html = i >= 0 ? html.slice(0, i + 6) + base + html.slice(i + 6) : html;
  const srcPath = path.join(path.dirname(outFile), 'report-source.html');
  fs.writeFileSync(srcPath, html);

  // 干净标签页渲染 + CDP printToPDF（headful 不能用 page.pdf，必须走 CDP）
  const rp = await ctx.newPage();
  await rp.goto('file://' + srcPath, { waitUntil: 'load' });
  await rp.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(rp);
  const { data } = await cdp.send('Page.printToPDF', {
    printBackground: true, preferCSSPageSize: true,
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  });
  fs.writeFileSync(outFile, Buffer.from(data, 'base64'));
  await rp.close();

  console.log(`[5/5] ✓ 报告单已保存：${outFile}（${fs.statSync(outFile).size} bytes）`);
} finally {
  await page.close().catch(() => {});
  await browser.close().catch(() => {}); // connectOverCDP：仅断开，不关你的 Chrome
}
