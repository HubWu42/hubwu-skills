# hubwu-skills — Claude Code 接入

本仓是遵循 [agentskills.io](https://agentskills.io) 开放标准的 Agent Skills 合集（跨 agent 通用，总览见 [`AGENTS.md`](AGENTS.md)）。

## 作为 plugin marketplace 安装

```bash
claude plugin marketplace add HubWu42/hubwu-skills
claude plugin install hubwu-skills@hubwu-skills
```

装好后，匹配到任务时 Claude Code 会自动加载对应 skill。

## 或：直接拷贝单个 skill

把 `skills/<name>/` 整个文件夹拷到 `~/.claude/skills/`（用户级）或项目的 `.claude/skills/`（项目级）即可。

## 现有 skills

| skill | 作用 |
|-------|------|
| [`zhuque-detect`](skills/zhuque-detect/SKILL.md) | 腾讯朱雀 AI 文本检测 → 官方检测报告单 PDF（需本机真实 Chrome） |
