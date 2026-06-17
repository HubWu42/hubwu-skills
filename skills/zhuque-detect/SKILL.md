---
name: zhuque-detect
description: 用腾讯朱雀检测一段中文文本是否 AI 生成，并导出官方「AI 生成检测报告单」PDF。当用户想检测文章/作文/论文的 AI 率、查 AIGC 占比、或要朱雀检测报告时使用。需本机真实 Chrome（带登录态）。
---

# 朱雀 AI 检测（zhuque-detect）

把一段中文文本喂给腾讯朱雀（matrix.tencent.com/ai-detect），拿到 AI 生成检测结果，并导出与产品「下载报告」一致的官方**检测报告单 PDF**（含环形图、AI 分布图、片段解析表、逐段 AIGC 值与原文）。

## 何时使用

- 用户想知道某段文本「像不像 AI 写的」/ AI 率 / AIGC 占比
- 用户要朱雀的检测报告 PDF
- 批量自检自己产出的文案是否会被判为 AI

## 前置依赖

1. **Node 18+**，在 `scripts/` 下装一次依赖：`npm install`（只装 `playwright-core`，不下载浏览器）。
2. **本机真实 Chrome，且用调试端口启动**（关键——见下方「为什么必须连真机」）：
   ```bash
   # macOS
   open -a "Google Chrome" --args --remote-debugging-port=9222
   # Linux
   google-chrome --remote-debugging-port=9222
   # Windows
   chrome.exe --remote-debugging-port=9222
   ```
   该 Chrome 需能正常打开 matrix.tencent.com/ai-detect 并手动跑通检测（朱雀匿名即可用，有每日免费额度）。

## 用法

```bash
cd scripts
npm install                      # 一次
node run.mjs                     # 默认 sample.txt → reports/朱雀报告单-<时间>.pdf
node run.mjs ./my.txt ./out.pdf  # 自定义输入文本 / 输出路径
```

调试端口非 9222 时用 `ZHUQUE_CDP=http://127.0.0.1:PORT node run.mjs`。

## 工作原理（要点）

- **检测**走 WebSocket，签名由页面运行时按真实浏览器环境实时生成 `fp`/`ARGUS_XSS_V3` 令牌。空白自动化 chromium 无有效令牌 → `Invalid request`。**连你已登录的真机**即天然带齐令牌，故脚本用 `connectOverCDP` 接管真机、新开标签页跑。
- **「下载报告」**是隐藏 iframe 调 `contentWindow.print()`（原生打印框，脚本点不动、还冻结页面）。脚本**劫持该 iframe 的 print**，截获其报告单 HTML，注入 `<base>` 后用 CDP `Page.printToPDF` 渲染成等价 PDF —— 全程不弹原生框。

详见 [`reference/anti-bot-notes.md`](reference/anti-bot-notes.md)。

## 约束 / 注意

- 文本须 **≥350 字**，否则朱雀报「检测文本长度需大于350字」。
- 有**每日检测次数额度**（页面「今日剩余 N 次」），用完次日重置。
- **滑块验证码**：冷启动 / 陌生会话（如全新 profile）偶发腾讯滑块验证。脚本会识别并提示——在弹出的 Chrome 窗口**手动拖动完成**后重跑即可。用你**日常常用、已建立信任**的 Chrome 一般不触发。
- 仅供个人学习与自检使用，遵守朱雀服务条款，勿规模化滥用。
