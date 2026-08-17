/**
 * dsh-plugin-template — host half.
 *
 * This is a plain cordis plugin: it exports a named `apply(ctx)` (and
 * optionally `inject`). The cordis loader entry lives in `cordis.patch.yml`.
 *
 * The skeleton is intentionally inert: it builds, installs, and loads
 * without side effects, so you can use it as a clean base. Put your feature
 * in the marked spot below and follow the pattern notes.
 */

export function apply(ctx: HostContext): void {
  // ─────────────────────────────────────────────────────────────────────
  // Your host-side feature goes here.
  //
  // Extension patterns (never guess interfaces — query them first with
  // cordis_inspect_list / cordis_inspect_query):
  //
  // 1. Optional capability  — use ctx.get() and handle absence:
  //      const svc = ctx.get('someService')
  //      if (svc === undefined) return
  //
  // 2. Hard dependency     — declare `inject: ['someService']` on the
  //      plugin object and use ctx.someService directly.
  //
  // 3. Event listener      — ctx.on('some/event', (payload) => { ... })
  //      (waterfall events: (payload, next) => next())
  //
  // 4. Owned subscription  — ctx.effect(() => service.subscribe(...)) and
  //      return a disposer; every side effect must be cleanly removable.
  //
  // 5. Package-private RPC — harness.handle('my-method', async (args) => ...)
  //      called from the client half via host.call('my-method', args).
  //
  // 6. Dynamic model tool  — register through the `harness` builtin
  //      (query Host Builtin.listBuiltins first); JSON-safe args/results.
  // ─────────────────────────────────────────────────────────────────────
}

/**
 * Minimal structural typing for the cordis context, so the skeleton builds
 * without depending on @deepseek-ai/cordis type packages. Replace with real
 * types as the plugin grows.
 */
export interface HostContext {
  get<T = unknown>(name: string): T | undefined
  on(event: string, listener: (...args: unknown[]) => unknown): unknown
  effect(disposable: (() => void) | { dispose(): void }): unknown
}
