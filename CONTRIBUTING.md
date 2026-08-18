# Contributing / 贡献指南

感谢你关注 dsh-cheatsheet！本仓库采用 DSH（DeepSeek Harness）插件标准结构。

## 开发环境

- Node ≥ 18、pnpm（或 npm）
- 本地安装到 profile 试运行：`dsh plugin --profile web add .`

## 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：

```text
feat: 新增 XX 功能
fix: 修复 XX 问题
docs: 文档变更
style: 格式调整
refactor: 重构
perf: 性能优化
test: 测试
chore: 杂项
```

## 分支与 PR

- 新功能从 `main` 拉分支，完成后 PR 到 `main`。
- PR 描述说明改动动机与验证方式（`npm run build && npm run typecheck`）。
- 合并前请确保：`npm run build`、`npm run typecheck`、`npm run dts`、`npm run check:market` 全部通过。

## 上架市场须知

- 仓库需打上 [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic。
- 上架入口：向 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 提交
  `data/plugins/worksAssistant__dsh-cheatsheet.yml`（详见 README 上架章节）。

## 速查内容贡献

新增速查条目：编辑 `src/data.ts`，保持条目简洁（key + 一句话说明 + 可选命令），
分类不符时优先复用现有分类。
