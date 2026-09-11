/** Verify this local sealed snapshot; --write is deliberately explicit, not part of build. */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const manifestPath = 'release/manifest.sha256.json'
const excludedDirectories = new Set(['node_modules', '.git', '.vercel', '.VSCodeCounter'])
const exclusionNotes = [
    'node_modules/** and tool/VCS caches (.git, .vercel, .VSCodeCounter)',
    '**/.DS_Store and **/.autosave',
    '**/.env* except .env.example (local settings/secrets)',
    'site/data/** (mutable visitor/world state)',
    manifestPath + ' (this inventory cannot hash itself)',
]
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
function collect(directory = '') {
    const entries = []
    for (const item of fs.readdirSync(path.join(root, directory), { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name, 'en'))) {
        const relative = directory ? `${directory}/${item.name}` : item.name
        if (excludedDirectories.has(item.name) || ['.DS_Store', '.autosave'].includes(item.name) ||
            (item.name.startsWith('.env') && item.name !== '.env.example') ||
            relative === 'site/data' || relative === manifestPath) continue
        if (item.isSymbolicLink()) throw new Error(`Unexpected symlink in release: ${relative}`)
        if (item.isDirectory()) entries.push(...collect(relative))
        else if (item.isFile()) {
            const bytes = fs.readFileSync(path.join(root, relative))
            entries.push({ path: relative, bytes: bytes.length, sha256: sha256(bytes) })
        }
    }
    return entries
}
function checkStatic(entries) {
    const byPath = new Map(entries.map(entry => [entry.path, entry]))
    const source = entries.filter(entry => entry.path.startsWith('site/static/'))
    if (!source.length) throw new Error('Static resource directory is empty')
    for (const entry of source) {
        const output = byPath.get(entry.path.replace('site/static/', 'site/dist/'))
        if (!output || output.sha256 !== entry.sha256) throw new Error(`Static/build mismatch: ${entry.path}`)
    }
    if (!byPath.has('site/dist/index.html')) throw new Error('Missing production index.html')
    return source.length
}
function summarize(entries) {
    const groups = {}
    for (const entry of entries) {
        const parts = entry.path.split('/')
        const group = parts[0] === 'site' && parts.length > 2 ? parts.slice(0, 2).join('/') : parts[0]
        groups[group] ||= { files: 0, bytes: 0 }
        groups[group].files++
        groups[group].bytes += entry.bytes
    }
    return groups
}
function main() {
    const args = process.argv.slice(2)
    if (args.length > 1 || (args.length === 1 && args[0] !== '--write')) throw new Error('Usage: node scripts/release-integrity.mjs [--write]')
    const files = collect()
    const staticMatches = checkStatic(files)
    const pkg = JSON.parse(fs.readFileSync(path.join(root, 'site/package.json'), 'utf8'))
    const lock = JSON.parse(fs.readFileSync(path.join(root, 'site/package-lock.json'), 'utf8'))
    if (pkg.version !== lock.version || pkg.version !== lock.packages[''].version ||
        JSON.stringify(pkg.dependencies) !== JSON.stringify(lock.packages[''].dependencies)) throw new Error('package.json and lockfile disagree')
    if (args[0] === '--write') {
        const evidencePath = 'release/checks/acceptance.json'
        const evidence = JSON.parse(fs.readFileSync(path.join(root, evidencePath), 'utf8'))
        if (evidence.status !== 'passed' || evidence.version !== pkg.version) throw new Error('Missing passing acceptance evidence for this version')
        const manifest = {
            schemaVersion: 1,
            project: pkg.name,
            releaseVersion: pkg.version,
            sealedAt: new Date().toISOString(),
            timezone: 'Asia/Shanghai',
            buildCommand: 'npm run build:online',
            environment: evidence.environment,
            acceptanceEvidence: evidencePath,
            exclusions: exclusionNotes,
            staticMatches,
            groups: summarize(files),
            files,
        }
        fs.mkdirSync(path.dirname(path.join(root, manifestPath)), { recursive: true })
        fs.writeFileSync(path.join(root, manifestPath), JSON.stringify(manifest, null, 2) + '\n')
        console.log(`Sealed v${pkg.version}: ${files.length} files; ${staticMatches} static assets match dist.`)
        console.log(`Manifest SHA256: ${sha256(fs.readFileSync(path.join(root, manifestPath)))}`)
        return
    }
    const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'))
    const actual = new Map(files.map(entry => [entry.path, entry]))
    const changes = []
    if (manifest.releaseVersion !== pkg.version) changes.push('VERSION metadata changed')
    for (const expected of manifest.files) {
        const current = actual.get(expected.path)
        if (!current) changes.push(`MISSING ${expected.path}`)
        else if (expected.sha256 !== current.sha256 || expected.bytes !== current.bytes) changes.push(`CHANGED ${expected.path}`)
        actual.delete(expected.path)
    }
    for (const added of actual.keys()) changes.push(`ADDED ${added}`)
    if (changes.length) throw new Error(`Release differs from sealed snapshot (${changes.length}):\n${changes.join('\n')}`)
    console.log(`PASS v${manifest.releaseVersion}: ${files.length} files unchanged; ${staticMatches} static assets match dist.`)
    console.log(`Sealed at ${manifest.sealedAt}; excludes dependencies, local env and mutable state.`)
}
try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
