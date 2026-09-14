// V2 has its own manifest; the sealed v1 manifest is never read or rewritten here.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const manifestName = 'release/v2/manifest.sha256.json'
const scopes = ['site/sources', 'site/static', 'site/dist', 'site/tests', 'site/scripts', 'release/v2/checks', 'README.md', 'research/README.md', 'FREEZE.md', '.gitignore', 'site/.gitignore', 'site/readme.md', 'release/v2/RELEASE.md', 'site/package.json', 'site/package-lock.json', 'site/vite.config.js', 'site/server.mjs', 'site/.env.example', 'site/.npmrc', 'site/license.md']
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
function collect(name) {
    const full = path.join(root, name)
    if (fs.lstatSync(full).isSymbolicLink()) throw Error(`Unexpected symlink: ${name}`)
    if (fs.statSync(full).isDirectory()) return fs.readdirSync(full).sort().filter(n => n !== '.DS_Store').flatMap(n => collect(`${name}/${n}`))
    return [{ path: name, sha256: hash(fs.readFileSync(full)) }]
}
const files = scopes.flatMap(collect)
const actual = new Map(files.map(f => [f.path, f.sha256]))
for (const file of files.filter(f => f.path.startsWith('site/static/'))) {
    if (actual.get(file.path.replace('site/static/', 'site/dist/')) !== file.sha256) throw Error(`Rebuild needed: ${file.path}`)
}
const args = process.argv.slice(2)
if (args.length && (args.length !== 1 || args[0] !== '--write')) throw Error('Usage: release-v2-integrity.mjs [--write]')
if (args[0] === '--write') {
    const reports = ['browser-report.json', 'production/browser-report.json'].map(name => JSON.parse(fs.readFileSync(path.join(root, 'release/v2/checks', name))))
    const colors = JSON.parse(fs.readFileSync(path.join(root, 'release/v2/checks/colors/report.json')))
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'site/package.json')))
    const lock = JSON.parse(fs.readFileSync(path.join(root, 'site/package-lock.json')))
    if (reports.some(report => !report.passed || ['errors', 'httpErrors', 'consoleErrors'].some(key => !Array.isArray(report[key]) || report[key].length)) || ['errors', 'httpErrors', 'consoleErrors', 'failed'].some(key => !Array.isArray(colors[key]) || colors[key].length)) throw Error('Need passing development, production and color browser reports')
    if (pkg.version !== '2.0.0' || pkg.version !== lock.version || pkg.version !== lock.packages[''].version) throw Error('Need matching V2 package versions')
    fs.writeFileSync(path.join(root, manifestName), JSON.stringify({ version: pkg.version, createdAt: new Date().toISOString(), baseline: 'fa9104b', scopes, exclusions: ['runtime site/data/', 'local .env', 'node_modules/', 'historical research artifacts except research/README.md; resources/v1 release'], files }, null, 2) + '\n')
    console.log(`V2 snapshot written: ${files.length} files. V1 manifest untouched.`)
} else {
    const saved = JSON.parse(fs.readFileSync(path.join(root, manifestName)))
    const expected = new Map(saved.files.map(f => [f.path, f.sha256]))
    const differences = [...new Set([...actual.keys(), ...expected.keys()])].filter(p => actual.get(p) !== expected.get(p))
    if (differences.length) { console.error(differences.join('\n')); process.exitCode = 1 }
    else console.log(`V2 snapshot verified: ${files.length} files; static assets match dist.`)
}
