# 朱雀检测自动化 —— 技术笔记

> 仅技术记录，便于排障与理解原理。请遵守目标服务条款，勿滥用。

## 1. 为什么必须连真实 Chrome（不能 headless + 静态令牌）

- 检测请求走 **WebSocket**，签名依赖 `localStorage` 的 `fp`（设备指纹）与 `ARGUS_XSS_V3`（腾讯天御/ARGUS 风控令牌）。
- 这些令牌**由页面运行时按真实浏览器环境实时生成**，不是一次性静态值。把真机导出的 `storageState`（cookie + localStorage）喂给 headless chromium **已不再奏效**——会被识破，服务端返回 `Invalid request`。
- 唯一稳定路径：`connectOverCDP` 接管**用户已登录的真实 Chrome**，新开标签页跑。令牌天然在、签名天然有效。

> 诊断口诀：真机能跑、自动化报错时，按「① 自动化标志 → ② 真实内核 → ③ profile 令牌/指纹」排除。本例命中 ③，且令牌不可离线复算，故必须用真机本体。

## 2. `Invalid request` 的含义

= 风控拒绝文案（**不是参数写错**）。常见原因：用了无有效令牌的自动化浏览器、或会话未登录。排查方向是「令牌/环境」而非请求参数。

## 3. 「下载报告」为什么脚本点不动

- 它**不是** `window.print()`，而是产品当场建一个**隐藏 iframe**、写入排版好的「检测报告单」HTML，再调 `iframe.contentWindow.print()`。
- 屏蔽顶层 `window.print` 拦不到它（跨 realm）；在 macOS 上 `print()` 会转成**系统打印面板**，**同步冻结整个页面 JS 线程**（CDP `Runtime.evaluate` 全超时）。

## 4. 取报告单的正确姿势：iframe-print 劫持

在点「下载报告」**之前**，劫持新建 iframe 的 `print`，把报告单 HTML 抓出来、吞掉真打印：

```js
window.__reportHTML = null;
const patch = (ifr) => {
  const w = ifr.contentWindow; if (!w) return;
  w.print = function () {
    const d = ifr.contentDocument || w.document;
    window.__reportHTML = '<!DOCTYPE html>\n' + d.documentElement.outerHTML;
  };
};
const wrap = (o) => function (n) {
  const r = o.apply(this, arguments);
  if (n && n.tagName === 'IFRAME') { patch(n); n.addEventListener('load', () => patch(n), true); }
  return r;
};
Node.prototype.appendChild = wrap(Node.prototype.appendChild);
Node.prototype.insertBefore = wrap(Node.prototype.insertBefore);
```

要点：
- 同时覆盖 `appendChild` 和 `insertBefore`，并补 `load` 监听（srcdoc/导航会重置 iframe 的 print）。
- 截获的 HTML 含相对 `<link>`，**必须注入** `<base href="https://matrix.tencent.com/">` 才能在别处渲染出样式；环形图/色条是内联元素（非 canvas），`outerHTML` 已带全。
- headful 浏览器**不能用** `page.pdf()`（仅 headless），改用 CDP `Page.printToPDF`（Playwright 走 `context.newCDPSession(page)`）。

## 5. 业务约束

- 文本须 **≥350 字**。
- 有**每日检测额度**（「今日剩余 N 次」），按钮禁用多为额度用完。
