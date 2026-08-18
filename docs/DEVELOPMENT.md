# 开发指南

dsh-cheatsheet（开发者速查工具箱）的代码结构与开发流程说明。

## 目录结构

```
src/
├── data.ts             # 速查数据：12 类 195 条（核心内容，贡献入口）
├── index.ts            # 主机端：惰性 loader + 导出 CHEATSHEET（预留 agent 工具）
├── client.tsx          # 浏览器半部入口：注册设置分区 + 双页签
├── cheatsheet-view.tsx # 「速查」页：搜索 + 主题筛选 + 条目列表
└── tools-view.tsx      # 「工具」页：6 个零依赖交互工具
scripts/
├── build.mjs           # esbuild：host ESM + client CJS(module table 包装)
└── check-market.mjs    # 发布前市场就绪检查
```

## 构建

```sh
npm install
npm run build        # → lib/index.js + lib/client.js
npm run typecheck    # tsc --noEmit（strict）
npm run dts          # → lib/types/*.d.ts
npm run check:market # 发布前检查
```

## 客户端打包机制（重要）

浏览器半部必须编译为「lazy-CJS module table」形态：

```js
window.__ModuleLoader__.load({
  id: 'dsh-cheatsheet',
  factory: (require) => { /* 所有 require 必须在 factory 内 */ },
})
```

`scripts/build.mjs` 通过 esbuild 的 `banner` / `footer` 把产物包进该外壳，
外部依赖（`react` / `react/jsx-runtime`）保持 external，由模块表在运行时解析。

**不要**在源码里手动调用 `window.__ModuleLoader__.load`——那会导致重复包装。
源码只导出 `inject` + `apply` 即可。

## 本地试运行

```sh
dsh plugin --profile web add .     # link 安装（持久目录，勿用 /tmp）
dsh plugin --profile web remove dsh-cheatsheet   # 卸载
```

改代码后重新 `npm run build`，重启客户端生效。

## 发布

```sh
npm login          # 交互式登录
npm publish        # prepublishOnly 自动跑 typecheck/build/dts/check:market
```

## 新增工具

在 `tools-view.tsx` 增加一个 `function XxxTool(): ReactElement`（本地零依赖），
并在 `ToolsPanel` 中挂载即可。参考现有六个工具的写法（`ToolCard` 外壳 + `useState/useMemo`）。
