# hubwu-skills — Agent Skills 合集

这是一个遵循 [agentskills.io](https://agentskills.io) **开放标准**的 Agent Skills 仓库。每个 skill 是 `skills/<name>/` 下的一个文件夹，入口为 `SKILL.md`（frontmatter `name` + `description` + 指令），可附带 `scripts/`、`reference/`、`assets/`。

该格式由 Anthropic 提出并开放，已被 40+ agent 支持（Claude Code、OpenAI Codex、Gemini CLI、Cursor、GitHub Copilot、OpenCode、Goose、Amp、pi 等），**同一份 `SKILL.md` 跨 agent 通用**。

## 现有 skills

| skill | 作用 |
|-------|------|
| [`zhuque-detect`](skills/zhuque-detect/SKILL.md) | 腾讯朱雀 AI 文本检测：连真实 Chrome → 检测 → 导出官方「检测报告单」PDF |

## 给各 agent 的接入

- **OpenAI Codex** / 读 `AGENTS.md` 的 agent：把本仓的 `skills/` 纳入技能发现路径（或拷贝到该 agent 的 skills 目录）。
- **Claude Code**：见 `CLAUDE.md`（走 plugin marketplace）。
- **Gemini CLI**：见 `GEMINI.md`。
- **其它**：把需要的 `skills/<name>/` 文件夹放进该 agent 约定的 skills 位置即可——格式通用。

## 渐进披露

agent 启动只读各 skill 的 `name`+`description`；任务匹配时才载入完整 `SKILL.md`；执行时按需跑 `scripts/` 或读 `reference/`。

> ⚠️ 部分 skill 需机器级前置（如 `zhuque-detect` 要本机 Chrome）。详见各 skill 的 `SKILL.md`。
