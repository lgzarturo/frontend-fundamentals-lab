import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'))
const { version } = pkg

console.log(`Syncing version → v${version}`)

// Locale files: update app.screens.settings.about.version
const locales = [
  {
    path: 'assets/locales/en.json',
    versionStr: `Version ${version} | Built with ❤️ and ☕ by`
  },
  {
    path: 'assets/locales/es.json',
    versionStr: `Versión ${version} | Hecho con ❤️ y ☕ por`
  }
]

for (const { path, versionStr } of locales) {
  const fullPath = resolve(root, path)
  const data = JSON.parse(readFileSync(fullPath, 'utf-8'))
  data.app.screens.settings.about.version = versionStr
  writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n')
  console.log(`  ✓ ${path}`)
}

// index.html: update fallback text inside the about.version span
const indexPath = resolve(root, 'index.html')
let html = readFileSync(indexPath, 'utf-8')
const updatedHtml = html.replace(
  /(data-i18n="app\.screens\.settings\.about\.version"[^>]*>\s*)Version \d+\.\d+\.\d+/,
  `$1Version ${version}`
)
if (updatedHtml === html) {
  throw new Error('Version text not found in index.html')
}
html = updatedHtml
writeFileSync(indexPath, html)
console.log('  ✓ index.html')

// CHANGELOG.md: prepend new section with commits since previous tag
function updateChangelog() {
  // Find the previous tag (current HEAD is still on old version when this runs)
  let prevTag
  try {
    prevTag = execSync('git describe --tags --abbrev=0 HEAD', {
      cwd: root,
      stdio: ['pipe', 'pipe', 'pipe']
    }).toString().trim()
  } catch {
    prevTag = null
  }

  // Get commit subjects since previous tag, skipping npm version auto-commits
  const range = prevTag ? `${prevTag}..HEAD` : 'HEAD'
  let rawCommits
  try {
    rawCommits = execSync(`git log ${range} --pretty=format:"%s"`, { cwd: root })
      .toString()
      .trim()
  } catch {
    rawCommits = ''
  }

  if (!rawCommits) {
    console.log('  ⚠ No commits since last tag — CHANGELOG not updated')
    return
  }

  // Filter out npm version auto-commits (e.g. "0.0.15" or "v0.0.15")
  const lines = rawCommits
    .split('\n')
    .filter(line => !/^v?\d+\.\d+\.\d+$/.test(line.trim()))
    .map(line => `- ${line.trim()}`)

  if (!lines.length) {
    console.log('  ⚠ Only version bump commits found — CHANGELOG not updated')
    return
  }

  const section = `### v${version}\n\n${lines.join('\n')}\n\n`

  const changelogPath = resolve(root, 'CHANGELOG.md')
  const existing = readFileSync(changelogPath, 'utf-8')

  // Skip if this version section already exists (e.g. version:sync run without bump)
  if (existing.includes(`### v${version}`)) {
    console.log(`  ⚠ ### v${version} already in CHANGELOG — skipped`)
    return
  }

  const anchor = '## Historial de cambios\n\n'
  const idx = existing.indexOf(anchor)
  const updated = idx !== -1
    ? existing.slice(0, idx + anchor.length) + section + existing.slice(idx + anchor.length)
    : `${existing}\n${section}`

  writeFileSync(changelogPath, updated)
  console.log('  ✓ CHANGELOG.md')
}

updateChangelog()

console.log(`\nDone. v${version} synced to all files.`)
