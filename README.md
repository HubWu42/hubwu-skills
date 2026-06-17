# hubwu-skills

> HubWu 精选开源 **Agent Skills** —— 遵循 [agentskills.io](https://agentskills.io) 开放标准，**一份源，跨 agent 通用**（Claude Code · OpenAI Codex · Gemini CLI · Cursor · Copilot · OpenCode · Goose · Amp · pi …）。

每个 skill 是 `skills/<name>/` 下的文件夹，入口 `SKILL.md`（`name` + `description` + 指令），可附 `scripts/` / `reference/` / `assets/`。该格式由 Anthropic 提出并开放，已被 40+ agent 支持，因此无需为每个 agent 改写。

## 现有 skills

| skill | 作用 | 前置 |
|-------|------|------|
| [`zhuque-detect`](skills/zhuque-detect/) | 腾讯朱雀 AI 文本检测：连真实 Chrome → 检测 → 导出官方「AI 生成检测报告单」PDF | 本机 Chrome + Node 18+ |

## 安装

### Claude Code（plugin marketplace）

```bash
claude plugin marketplace add HubWu42/hubwu-skills
claude plugin install hubwu-skills@hubwu-skills
```

### 其它 agent（Codex / Gemini CLI / Cursor / …）

`SKILL.md` 是通用开放格式——把需要的 `skills/<name>/` 文件夹放进该 agent 约定的 skills 位置即可。各 agent 接入要点见 [`AGENTS.md`](AGENTS.md) / [`GEMINI.md`](GEMINI.md) / [`CLAUDE.md`](CLAUDE.md)。

### 手动 / 直接跑脚本

带 `scripts/` 的 skill 也能脱离 agent 直接用，见各 skill 的 `SKILL.md`。

## 新增一个 skill

照 [`template/SKILL.md`](template/SKILL.md) 起一个 `skills/<your-skill>/`，再把它加进 [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) 的 `skills` 列表。

## ⚠️ 免责声明

本仓 skill 仅供**学习与个人使用**，用于自动化你**本人有权访问的免费工具/服务**。请遵守目标服务的服务条款，**勿用于规模化抓取、滥用或商业用途**。因使用本仓代码产生的任何后果由使用者自负。

## License

[MIT](LICENSE) © 2026 HubWu
