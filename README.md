<div align="center">

# hubwu-skills

**跨 agent 通用的开源 Agent Skills 合集**

精选、可直接装、陆续更新 —— 遵循 [agentskills.io](https://agentskills.io) 开放标准，**一份源，跨 40+ agent 通用**。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Open Standard](https://img.shields.io/badge/Agent_Skills-agentskills.io-blue)](https://agentskills.io)
![Skills](https://img.shields.io/badge/skills-1-green)

Claude Code · OpenAI Codex · Gemini CLI · Cursor · Copilot · OpenCode · Goose · Amp · pi …

</div>

---

## 这是什么

每个 skill 是 `skills/<name>/` 下的一个文件夹，入口 `SKILL.md`（`name` + `description` + 指令），可附带 `scripts/`（可执行）、`reference/`（深度文档）、`assets/`（资源）。该格式由 Anthropic 提出并开放成标准，已被 40+ agent 支持——**同一份 `SKILL.md` 无需改写，到处可用**。

- 🔌 **跨 agent**：装哪个 agent 都认同一套 `SKILL.md`
- 🪶 **渐进披露**：平时只占 `name`+`description`，匹配任务才载入完整指令
- 📦 **自包含**：带 `scripts/` 的 skill 也能脱离 agent 直接命令行跑

## 现有 skills

| skill | 作用 | 前置 |
|-------|------|------|
| [**zhuque-detect**](skills/zhuque-detect/) | 腾讯朱雀 AI 文本检测：连真实 Chrome → 检测 → 导出官方「AI 生成检测报告单」PDF（含环形图、AI 分布图、片段解析表、逐段 AIGC 值） | 本机 Chrome + Node 18+ |

## 安装

### Claude Code（plugin marketplace）

```bash
claude plugin marketplace add HubWu42/hubwu-skills
claude plugin install hubwu-skills@hubwu-skills
```

### 其它 agent（Codex / Gemini CLI / Cursor / …）

`SKILL.md` 是通用开放格式——把需要的 `skills/<name>/` 文件夹放进该 agent 约定的 skills 位置即可，无需改动。各 agent 接入要点见 [`AGENTS.md`](AGENTS.md) · [`GEMINI.md`](GEMINI.md) · [`CLAUDE.md`](CLAUDE.md)。

### 直接命令行跑（不经 agent）

```bash
# 例：zhuque-detect
open -a "Google Chrome" --args --remote-debugging-port=9222   # 先用调试端口启动你的 Chrome
cd skills/zhuque-detect/scripts && npm install
node run.mjs ./my.txt ./report.pdf
```

## 新增一个 skill

1. 照 [`template/SKILL.md`](template/SKILL.md) 起一个 `skills/<your-skill>/`；
2. 把它加进 [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) 的 `skills` 列表。

## ⚠️ 免责声明

本仓 skill 仅供**学习与个人使用**，用于自动化你**本人有权访问的免费工具/服务**。请遵守目标服务的服务条款，**勿用于规模化抓取、滥用或商业用途**。因使用本仓代码产生的任何后果由使用者自负。

## License

[MIT](LICENSE) © 2026 HubWu
