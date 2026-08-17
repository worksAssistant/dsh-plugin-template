/**
 * Build script — esbuild bundles the two halves into lib/.
 *
 *  - src/index.ts  → lib/index.js   (ESM, Node platform)    host half
 *  - src/client.ts → lib/client.js  (CJS module-table bundle) browser half
 *
 * @deepseek-ai/* and react stay external on purpose: the host resolves them
 * from the profile's dependency closure, and the browser half resolves them
 * through the shell's module table (window.__ModuleLoader__).
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

await build({
  ...shared,
  entryPoints: ['src/client.ts'],
  outfile: 'lib/client.js',
  format: 'cjs',
  platform: 'browser',
  external: ['react', 'react/jsx-runtime'],
})
