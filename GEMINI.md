# hubwu-skills — Gemini CLI 接入

本仓是遵循 [agentskills.io](https://agentskills.io) 开放标准的 Agent Skills 合集（跨 agent 通用，总览见 [`AGENTS.md`](AGENTS.md)）。

## 安装

Gemini CLI 按其 [skills 文档](https://geminicli.com/docs/cli/skills/) 加载 skills。把需要的 `skills/<name>/` 文件夹放进 Gemini CLI 约定的 skills 目录即可——`SKILL.md` 格式通用，无需改动。

## 现有 skills

| skill | 作用 |
|-------|------|
| [`zhuque-detect`](skills/zhuque-detect/SKILL.md) | 腾讯朱雀 AI 文本检测 → 官方检测报告单 PDF（需本机真实 Chrome） |
