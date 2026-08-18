# Changelog

本项目的版本变更记录（Keep a Changelog 风格）。

## [0.1.0] - 2026-08-18

首个可发布版本：开发者速查工具箱。

### 新增

- **速查**：12 个主题分类、195 条速查条目（Git / 提交规范 / 正则 / HTTP 状态码 / Linux / Docker / SQL / 终端快捷键 / Markdown / JavaScript / Python / 日期时间与编码），支持关键词搜索与主题筛选。
- **工具**：6 个零依赖交互工具
  - 正则表达式实时测试（命中高亮、错误提示、匹配统计）
  - JSON 格式化 / 校验
  - 时间戳 ↔ 日期（秒 / 毫秒自动识别）
  - Base64 / URL 编解码（UTF-8 安全）
  - Cron 表达式生成（预设 + 自定义 + 中文描述）
  - 文本行 Diff 对比（LCS 行级 diff）
- 设置页独立分区「开发者速查」，速查 / 工具双页签。

### 技术

- host + client 双半部结构（cordis 插件，`dsh.bundle` manifest）。
- 客户端以 lazy-CJS module table 形态构建（`window.__ModuleLoader__.load`）。
- 全部依赖仅 react（平台种子词），peer 声明官方 `@deepseek-ai/*` 包。
