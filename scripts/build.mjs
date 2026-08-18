/**
 * Build script — esbuild bundles the two halves into lib/.
 *
 *  - src/index.ts   → lib/index.js   (ESM, Node platform)    host half
 *  - src/client.tsx → lib/client.js  (CJS module-table bundle) browser half
 *
 * @deepseek-ai/* and react stay external on purpose: the host resolves them
 * from the profile's dependency closure, and the browser half resolves them
 * through the shell's module table (window.__ModuleLoader__).
 *
 * The client bundle is wrapped in a `window.__ModuleLoader__.load` shell so
 * that every `require()` runs inside the factory (the shell only hands the
 * factory a `require` — there is no top-level require in the browser). This
 * mirrors the compiled shape of the shipped ui-* packages.
 */
import { build } from 'esbuild'

/** Mark every @deepseek-ai/* import external (esbuild's `external` option
 * only takes plain strings, so a scoped wildcard needs an onResolve hook). */
const dshExternal = {
  name: 'dsh-external',
  setup(build) {
    build.onResolve({ filter: /^@deepseek-ai\// }, (args) => ({
      path: args.path,
      external: true,
    }))
  },
}

const shared = {
  bundle: true,
  sourcemap: true,
  target: 'es2022',
  logLevel: 'info',
  plugins: [dshExternal],
}

await build({
  ...shared,
  entryPoints: ['src/index.ts'],
  outfile: 'lib/index.js',
  format: 'esm',
  platform: 'node',
})

// Client module id must match the package name (the loader keys modules by
// package name, e.g. /plugins/dsh-cheatsheet/client.js).
const CLIENT_ID = 'dsh-cheatsheet'

await build({
  ...shared,
  entryPoints: ['src/client.tsx'],
  outfile: 'lib/client.js',
  format: 'cjs',
  platform: 'browser',
  external: ['react', 'react/jsx-runtime'],
  jsx: 'automatic',
  banner: {
    js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(CLIENT_ID)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;\n`,
  },
  footer: {
    js: `\nreturn module.exports; } });\n`,
  },
})
