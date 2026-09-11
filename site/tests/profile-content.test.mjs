import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { identity, career, projectGroups, skillDirectories, accounts } from '../sources/data/profile.js'
import projects from '../sources/data/projects.js'
import social from '../sources/data/social.js'

const html = readFileSync(new URL('../sources/index.html', import.meta.url), 'utf8')

test('public profile preserves the requested identity, anonymity and six-step career order', () => {
    assert.equal(identity.name, '莫琰')
    assert.equal(identity.socialName, 'momo子讲AI')
    assert.deepEqual(career.map(item => item.company), ['某大模型公司', '美团', '商汤', '百度飞桨', '百度研究院', 'AI 医学图像'])
    assert.equal(career.filter(item => item.current).length, 1)
    assert.equal(career[3].period, career[4].period)
    const published = html + JSON.stringify({ identity, career, projectGroups, accounts })
    assert.doesNotMatch(published, /阶跃星辰|1996-07|137\d{8}|\.pdf\b/i)
})

test('selected works cover all requested categories, repositories and website', () => {
    assert.deepEqual(projectGroups.map(group => group.id), ['skills', 'multi-agent', 'code-agent'])
    const works = projectGroups.flatMap(group => group.projects)
    assert.equal(new Set(works.map(project => project.id)).size, works.length)
    for (const project of works) {
        assert.ok(project.description.length > 20)
        assert.ok(existsSync(new URL(`../static/${project.image}`, import.meta.url)))
        for (const link of project.links) assert.equal(new URL(link.url).protocol, 'https:')
    }
    const links = works.flatMap(project => project.links.map(link => link.url))
    for (const name of ['DirectorAgents', 'tianya-skills', 'momo-code']) assert.ok(links.includes(`${identity.githubUrl}/${name}`))
    assert.ok(links.includes('https://momozi.cc/'))
    assert.deepEqual(skillDirectories, ['SkillHub', 'OpenAgentSkill', 'Skills.Rest', 'mcpskills.io', 'ecosyste.ms'])
    assert.match(works.find(project => project.id === 'momo-code').note, /opencode.*Pioneer Agent/)
})

test('social accounts use copy actions rather than invented profile URLs', () => {
    assert.deepEqual(accounts.map(account => account.platform), ['小红书', '微信公众号', 'GitHub'])
    for (const account of accounts.slice(0, 2)) {
        assert.equal(account.name, identity.socialName)
        assert.equal(account.kind, 'copy')
        assert.equal(account.url, undefined)
    }
    assert.equal(accounts[2].url, identity.githubUrl)
    assert.equal(social.filter(link => link.modal === 'discord').length, 2)
    assert.match(html, /data-momo-action="connect"/)
    assert.match(html, /data-name="discord" role="dialog"/)
})

test('about tabs have unique accessible relationships and a single initial selection', () => {
    for (const name of ['about', 'career', 'projects', 'connect']) {
        assert.equal((html.match(new RegExp(`id="momo-tab-${name}"`, 'g')) || []).length, 1)
        assert.equal((html.match(new RegExp(`id="momo-panel-${name}"`, 'g')) || []).length, 1)
        assert.ok(html.includes(`aria-controls="momo-panel-${name}"`))
        assert.ok(html.includes(`aria-labelledby="momo-tab-${name}"`))
    }
    assert.equal((html.match(/aria-selected="true"/g) || []).length, 1)
    assert.equal((html.match(/data-copy-status role="status" aria-live="polite"/g) || []).length, 2)
})

test('3D project attributes describe the work without stale live-looking star counts', () => {
    for (const project of projects) {
        assert.doesNotMatch(JSON.stringify(project.attributes), /\d+ stars/)
        assert.ok(project.attributes.role)
        assert.ok(project.attributes.with)
    }
    assert.equal(projects.find(project => project.title === 'MOMO CODE').attributes.role, 'Coding Agent')
})
