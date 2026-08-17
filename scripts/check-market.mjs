/**
 * Pre-publish market-readiness check.
 *
 * Verifies the parts the DSH market / awesome-dsh-plugin CI actually look at:
 *  1. `dsh.bundle.patch` is declared (declaring only dsh.client fails CI);
 *  2. the patch file exists and is inside the `files` publish whitelist;
 *  3. the built host/client entries exist;
 *  4. `repository` is set (market installs verify the repo — required to
 *     avoid being treated as a squatted name).
 *
 * Exits non-zero with a message when something is missing.
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url)) + '/..'
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const problems = []

const dsh = pkg.dsh ?? {}
const bundlePatch = dsh.bundle?.patch
const patchBasename = typeof bundlePatch === 'string' ? bundlePatch.replace(/^\.\//, '') : undefined
if (!bundlePatch) {
  problems.push('package.json is missing "dsh.bundle.patch" — required by the market CI (dsh.client alone is NOT installable)')
} else if (!existsSync(join(root, bundlePatch))) {
  problems.push(`"dsh.bundle.patch" points at "${bundlePatch}" but that file does not exist`)
} else if (!(pkg.files ?? []).includes(patchBasename)) {
  problems.push(`"${patchBasename}" is not in the "files" publish whitelist — it will not be shipped`)
}

for (const [label, file] of [
  ['host (main)', pkg.main],
  ['client', pkg.exports?.['./client']?.default],
]) {
  if (typeof file !== 'string') {
    problems.push(`missing ${label} entry`)
  } else if (!existsSync(join(root, file))) {
    problems.push(`${label} entry "${file}" does not exist — run \`npm run build\` first`)
  }
}

if (!pkg.repository?.url) {
  problems.push('"repository" is not set — set it to your GitHub repo before publishing (market installs verify the repo against the npm package)')
}

if (problems.length > 0) {
  console.error('✗ market-readiness check failed:')
  for (const p of problems) console.error(`  - ${p}`)
  process.exit(1)
}

console.log('✓ market-readiness check passed (dsh.bundle manifest, patch file, built entries, repository)')
