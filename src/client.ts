/**
 * dsh-plugin-template — browser half (client plugin bundle).
 *
 * Loaded by dsh-client-modules at /plugins/dsh-plugin-template/client.js and
 * executed through the shell's lazy-CJS module table
 * (window.__ModuleLoader__.load). The factory is plain CJS: `require` only
 * resolves platform seed words and registered client bundles — do not
 * import anything else.
 *
 * The skeleton is intentionally inert: it registers no UI and has no side
 * effects. Put your feature in the marked spot below.
 */

declare global {
  interface Window {
    __ModuleLoader__: {
      load(entry: {
        id: string
        factory: (require: (id: string) => unknown) => unknown
      }): unknown
    }
  }
}

/** Structural type for the React instance provided by the module table. */
type ReactLike = {
  createElement(type: unknown, props: Record<string, unknown> | null, ...children: unknown[]): unknown
}

/** Structural type for the client cordis context. */
type ClientContext = {
  get<T = unknown>(name: string): T | undefined
}

window.__ModuleLoader__.load({
  id: 'dsh-plugin-template',
  factory: (require) => {
    const React = require('react') as ReactLike
    // The runtime client gives you `host` for calling the host half:
    //   const { host } = require('@deepseek-ai/dsh-client-runtime/client') as { host: unknown }
    void React

    const plugin = {
      // Declare client-side hard dependencies here (array of service names),
      // e.g. inject: ['slots'] — or keep using ctx.get() with absence checks.
      apply(ctx: ClientContext): void {
        // ─────────────────────────────────────────────────────────────
        // Your browser-side feature goes here.
        //
        // Register UI into a real slot — query the slot first with
        // cordis_inspect_query (never guess names or keys):
        //
        //   const slots = ctx.get('slots') as
        //     | { inject(...args: unknown[]): unknown } | undefined
        //   if (slots === undefined) return
        //   slots.inject('conversation.chat.turnTail', () =>
        //     slots.register(
        //       { name: 'conversation.chat.turnTail', id: 'my-view' },
        //       () => React.createElement('div', null, 'Hello from dsh-plugin-template'),
        //     ),
        //   )
        //
        // Client → Host RPC:
        //   const result = await host.call('my-method', { key: 'demo' })
        //   (host method registered on the host half with harness.handle)
        // ─────────────────────────────────────────────────────────────
      },
    }

    return plugin
  },
})

// Marks this file as a module so the `declare global` augmentation applies.
export {}
