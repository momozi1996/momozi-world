import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { discoveries, postcards, passportGroups, passportStamps, roundtable, skillExample } from '../sources/data/discoveries.js'
import { projectGroups } from '../sources/data/profile.js'
import achievements from '../sources/data/achievements.js'

test('five small corners reuse existing areas, with honest editorial/demo labels', () => {
    assert.equal(discoveries.length, 5)
    assert.equal(new Set(discoveries.map(d => d.id)).size, 5)
    const projects = new Set(projectGroups.flatMap(g => g.projects.map(p => p.id)))
    for (const d of discoveries) {
        assert.ok(['landing', 'career', 'projects', 'lab', 'social'].includes(d.area))
        assert.ok(d.paragraphs.length > 0 && d.note && d.actionLabel)
        if (d.project) assert.ok(projects.has(d.project))
    }
    assert.match(discoveries.find(d => d.id === 'roundtable').note, /预设.*不调用模型/)
    assert.match(discoveries.find(d => d.id === 'skills').note, /不是仓库实测输出/)
    assert.equal(roundtable.length, 3)
    assert.equal(new Set(roundtable.map(r => r.id)).size, 3)
    assert.ok(roundtable.every(r => r.why && r.text))
    assert.ok(skillExample.limit)
})

test('optional passport groups do not change the original achievements or paint thresholds', () => {
    assert.equal(achievements.length, 38)
    assert.deepEqual(passportGroups, ['momoPassport', 'momoCorners'])
    assert.equal(passportStamps.length, 3)
    for (const name of passportGroups) assert.ok(!achievements.some(a => a[0] === name))
    const source = readFileSync(new URL('../sources/Game/Achievements.js', import.meta.url), 'utf8')
    assert.ok(source.includes("this.createGroup(name).progress = new Set()"))
    assert.ok(source.includes("localStorage.setItem('achievements', encodedData)"))
})

test('three same-origin postcard images exist and all new public copy respects privacy', () => {
    assert.equal(postcards.length, 3)
    for (const card of postcards) assert.ok(existsSync(new URL(`../static/${card.image}`, import.meta.url)))
    const copy = JSON.stringify({ discoveries, postcards, roundtable, skillExample })
    assert.doesNotMatch(copy, /阶跃星辰|137\d{8}|\.pdf\b|实时生成中/)
})

test('six real readings distinguish publication dates, verified dates and fixed source revisions', async () => {
    const { readingShelf, readingSources, cornerReadings, codeCase } = await import('../sources/data/readingShelf.js')
    assert.equal(readingShelf.length, 6)
    assert.equal(new Set(readingShelf.map(r => r.id)).size, 6)
    assert.equal(readingShelf.filter(r => r.platform.startsWith('GitHub')).length, 3)
    for (const r of readingShelf) {
        assert.equal(new URL(r.url).protocol, 'https:')
        assert.ok(r.audience && r.question && r.caution && r.paragraphs.length === 2)
        if (r.platform.startsWith('GitHub')) assert.ok(r.url.includes(readingSources.revision))
        else { assert.ok(r.url.startsWith('https://mp.weixin.qq.com/s/')); assert.ok(r.date) }
    }
    for (const ids of Object.values(cornerReadings)) for (const id of ids) assert.ok(readingShelf.some(r => r.id === id))
    assert.ok(existsSync(new URL(`../static/${codeCase.image}`, import.meta.url)))
    assert.match(codeCase.caption, /为 0.*不能作为/)
    assert.match(codeCase.boundary, /不等于 LoRA/)
})
