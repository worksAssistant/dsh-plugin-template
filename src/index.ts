/**
 * dsh-plugin-cheatsheet — host half.
 *
 * 目前是惰性 loader 条目：全部 UI 由浏览器半部（`./client`）承载，DSH 的
 * dsh-client-modules 通过 `dsh.client` 声明自动拾取。
 *
 * 预留：后续可在此用 `harness` builtin 注册一个 `cheatsheet_search` 模型工具，
 * 让 agent 也能查速查表并注入上下文（先查 Builtin.listBuiltins 拿真实签名）。
 */
export { CHEATSHEET } from './data'

export function apply(_ctx: unknown): void {
  // Host 功能预留位。
}
