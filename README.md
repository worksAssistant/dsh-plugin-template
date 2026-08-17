# dsh-plugin-template

一个面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）插件的**起步骨架**：开箱可构建、可安装、可发布。当前版本不包含任何具体功能，作为后续开发的基础。

## 目录结构

```
dsh-plugin-template/
├── package.json          # dsh.bundle / dsh.client 声明、peerDependencies、发布配置
├── cordis.patch.yml      # ★ 主机端 loader 条目（上架硬性要求，缺它无法安装）
├── tsconfig.json         # 类型检查（noEmit）
├── tsconfig.build.json   # 声明文件输出（lib/types）
├── scripts/
│   ├── build.mjs         # esbuild：src → lib（主机 ESM + 浏览器 CJS bundle）
│   └── check-market.mjs  # 发布前的市场就绪检查
├── src/
│   ├── index.ts          # 主机端 cordis 插件（apply(ctx)）
│   └── client.ts         # 浏览器半部（window.__ModuleLoader__.load）
├── README.md
└── LICENSE
```

## 快速开始

```sh
npm install          # 或 pnpm install
npm run build        # → lib/index.js + lib/client.js
npm run typecheck    # tsc --noEmit
npm run dts          # → lib/types/*.d.ts
npm run check:market # 发布前的市场就绪检查
```

### 装进本机 profile 试运行

```sh
# 在插件仓库根目录执行（相对路径会被锚定到你的调用目录）
dsh plugin --profile web add .
```

- 等价于 `pnpm add <绝对路径>`（symlink 形式），改完代码重新 `npm run build` 即生效；
- 验证：`dsh plugin --profile web install` 通过，`--dump-config` 输出里能看到 `dsh-plugin-template` 条目，然后重启桌面客户端；
- 卸载：`dsh plugin --profile web remove dsh-plugin-template`。

> ⚠️ 不要用 `/tmp` 下的路径做 link 安装——macOS 清空 /tmp 后客户端会因解析不到 bundle 而崩溃（血的教训）。务必用持久目录。

## 开发：往哪里加代码

骨架刻意保持「惰性」（零副作用），扩展点在源码里都有注释标记：

| 你想做 | 写在哪 | 参考模式 |
| --- | --- | --- |
| 主机端服务 / 事件 / 副作用 | `src/index.ts` 的 `apply(ctx)` | `ctx.get()` 判空；`ctx.on()`；`ctx.effect()`；硬依赖用 `inject` |
| 注册一个动态模型工具 | 主机端 `apply` | `harness` builtin（先查 `Builtin.listBuiltins`），参数/返回值须 JSON 安全 |
| 浏览器 UI（设置页/侧栏/回合尾部等） | `src/client.ts` 的 `apply(ctx)` | 先 `cordis_inspect_query` 查真实 Slot 再 `slots.register`，用 `React.createElement` |
| 客户端调主机（RPC） | 两端 | 主机 `harness.handle('name', fn)`；客户端 `host.call('name', args)` |
| 主题 / 样式 | 客户端 | 查 `Theme.listTokens` 覆盖 token；局部样式用 `styles.insert(css)` |

> 任何时候不要凭名字猜接口：先 `cordis_inspect_list` / `cordis_inspect_query` 查真实的 Service、Event、Slot、Builtin 签名。

## 发布到 npm（推荐）

```sh
# 1. 先重命名（见下），并在 package.json 里设置 repository 指向你的 GitHub 仓库
#    "repository": { "type": "git", "url": "git+https://github.com/wangjian110/dsh-plugin-template.git" }
# 2. 登录并发布
npm login
npm publish
```

- 市场装包优先走 **npm tarball**（秒级、免构建授权），且会校验 `repository` 与仓库一致（防冒名）；
- 不发 npm 时，可把预构建 tarball 挂到 GitHub Release，并在目录条目里用 `tarball:` 字段指向它。

## 上架 Harness 市场

市场（dsh-market）的插件列表来自精选目录 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)（站点 https://awesome-dsh-plugin.com/plugins.json）。**上架 = 向该仓库提 PR**，合并后站点自动重建，市场约 1 天收录。

1. 仓库要求（CI 自动检查）：
   - `package.json` 声明了 `dsh.bundle`（本骨架已声明）；只声明 `dsh.client` 会被直接拒绝；
   - 仓库创建满 1 天、提交数 ≥ 10；
   - 有真实可用代码（占位/纯 README 不收）；
   - 打上 [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic；
   - 描述只写功能、不夸大（会对照源码核验）。
2. 新增 `data/plugins/wangjian110__dsh-plugin-template.yml`：

   ```yaml
   url: https://github.com/wangjian110/dsh-plugin-template
   name: wangjian110/dsh-plugin-template
   category: ui            # ui usage theme model session memory tools vision skill workflow notify dev market fun
   description:
     en: One-line description ending with a period.
     zh: 一句话描述，以句号结尾。   # 可选，维护者会补
   ```

3. 重新生成两个 README 一起提交（README 是脚本生成的，**不要手改**）：

   ```sh
   npm ci
   node scripts/generate-readme.mjs
   ```

4. 可选：在 `data/screenshots.json` 里以仓库 URL 为 key 加 1~8 张 GitHub 图床截图，市场详情页会像 App Store 一样展示。

## 发布前清单（rename checklist）

- [ ] 全局替换包名：`dsh-plugin-template` → 你的包名（package.json、cordis.patch.yml、src/client.ts 里的 id、README）
- [ ] `package.json` 的 `repository` 设置为你的 GitHub 仓库
- [ ] `description` 改为一句准确的功能描述
- [ ] `dsh.client.inject` 按实际用到的官方 client 包增删（例如用到多语言就加 `@deepseek-ai/dsh-client-locale`）
- [ ] `npm run typecheck && npm run build && npm run dts && npm run check:market` 全部通过
- [ ] 本地 `dsh plugin --profile web add .` 实测可加载，`--dump-config` 无报错
- [ ] 按「上架 Harness 市场」提 PR

## 常见坑

| 坑 | 解法 |
| --- | --- |
| 只声明 `dsh.client`、缺 `dsh.bundle` | 市场 CI 直接拒绝；`cordis.patch.yml` 必须存在并在 `files` 白名单里 |
| `@deepseek-ai/*` 放进 `dependencies` | 一律 `peerDependencies`；peer 范围带预发布分支（`^0.1.0-rc.6` 这种写法是对的） |
| 用 `/tmp` 路径 link 安装 | 客户端会崩；用持久目录 |
| 描述夸大（数字/API 名对不上） | 会被打回；描述与代码严格一致 |

## 参考

- 市场应用：https://github.com/dsh-market/dsh-market
- 插件目录 / 上架 PR：https://github.com/awesome-dsh-plugin/awesome-dsh-plugin
- 官方插件开发 skill（动态插件）：DSH 内置 `cordis-plugin-development`
- 完整上架教程：仓库外的 `dsh-plugin-publish-guide.md`（同工作区）
