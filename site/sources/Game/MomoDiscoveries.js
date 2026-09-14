import * as THREE from 'three/webgpu'
import { color } from 'three/tsl'
import { MeshDefaultMaterial } from './Materials/MeshDefaultMaterial.js'
import { InteractivePoints } from './InteractivePoints.js'
import { selectProfileTab } from './MomoProfile.js'
import { discoveries, passportGroups, passportStamps, postcards, roundtable, skillExample } from '../data/discoveries.js'
import { readingShelf, readingSources, cornerReadings, codeCase } from '../data/readingShelf.js'
import { projectGroups } from '../data/profile.js'

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const button = (label, action, value = '', cls = '') => `<button type="button" class="island-button ${cls}" data-island-action="${action}" data-value="${esc(value)}">${label}</button>`
const works = projectGroups.flatMap(group => group.projects)

/** An additive content layer: no terrain, physics, game rules or camera mutations. */
export class MomoDiscoveries {
    constructor(game) {
        this.game = game
        this.modal = game.modals.items.get('island')
        this.root = this.modal.element
        this.content = this.root.querySelector('[data-island-content]')
        this.status = this.root.querySelector('[data-island-status]')
        this.points = new Map()
        this.page = 'passport'
        this.renderToken = 0
        this.createCorners()
        this.bind()
    }

    progress(name) { return this.game.achievements.groups.get(name).progress }
    has(id) { return this.progress('momoPassport').has(id) }
    save(group, id) { this.game.achievements.setProgress(group, id) }
    stamp(id) {
        const fresh = !this.has(id)
        this.save('momoPassport', id)
        if (fresh) this.status.textContent = `收下一枚「${passportStamps.find(s => s.id === id).title}」章。`
    }

    bind() {
        document.querySelector('[data-island-open]').addEventListener('click', () => this.open())
        document.addEventListener('click', event => {
            if (event.target.closest('[data-island-shelf]')) this.open('shelf')
            const entry = event.target.closest('[data-island-project]')
            if (entry) this.open('project', entry.dataset.islandProject)
        })
        document.addEventListener('momo-profile-tab', event => {
            if (event.detail === 'about' && this.game.menu.items.get('home').isOpen) this.stamp('hello')
        })
        this.game.menu.items.get('home').events.on('open', () => {
            if (!document.querySelector('[data-profile-panel="about"]').hidden) this.stamp('hello')
        })
        this.root.addEventListener('click', event => {
            const target = event.target.closest('[data-island-action]')
            if (!target) return
            const { islandAction: action, value } = target.dataset
            if (action === 'passport') this.show('passport')
            if (action === 'shelf') this.show('shelf')
            if (action === 'reading') this.show('reading', value)
            if (action === 'corner') this.show('corner', value)
            if (action === 'visit') this.visit(value)
            if (action === 'checkin') {
                if (this.distance(value) >= 10) { this.status.textContent = '先到这个角落，再留下打卡印章。'; return }
                this.save('momoCorners', value)
                target.textContent = '已盖章 · 来过这里 ✓'
                target.disabled = true
                this.status.textContent = this.game.achievements.storage.available ? '这处风景已记进护照。只保存在本机浏览器。' : '浏览器暂时无法保存；这次访问中仍可继续集章。'
            }
            if (action === 'about' || action === 'career' || action === 'projects') {
                this.game.modals.close()
                selectProfileTab(action, true)
                this.game.menu.open('home')
            }
            if (action === 'skills') { this.stamp('curiosity'); this.show('skills') }
            if (action === 'example' || action === 'roundtable') this.show('roundtable')
            if (action === 'choice') { this.stamp('curiosity'); this.show('roundtable', value); this.content.querySelector('[data-decision]')?.focus() }
            if (action === 'project') this.show('project', value)
            if (action === 'postcard') this.show('postcard', value || 'landing')
            if (action === 'make-card') { this.stamp('souvenir'); this.show('postcard', value); this.status.textContent = '明信片做好了。可以保存图片，也可以继续逛小岛。' }
            if (action === 'save-card') this.downloadCard(target)
            if (action === 'reset') this.show('reset')
            if (action === 'confirm-reset') {
                // Deliberately scoped: never reset legacy achievements or paint rewards.
                for (const name of passportGroups) this.game.achievements.groups.get(name).reset()
                this.game.achievements.storage.save()
                this.show('passport')
                this.status.textContent = '护照已重新翻开，原有游戏成就和车漆不受影响。'
            }
        })
        this.root.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault(); event.stopPropagation(); this.game.modals.close()
            }
            if (event.key !== 'Tab') return
            const items = [...this.root.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(el => el.getClientRects().length)
            if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus() }
            else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus() }
        })
        this.modal.events.on('close', () => { this.renderToken++; this.disposeCard() })
        this.modal.events.on('closed', () => {
            if (!this.game.menu.current?.isOpen && !this.game.modals.pending) this.opener?.focus?.({ preventScroll: true })
        })
    }

    open(page = 'passport', value) {
        this.opener = document.activeElement
        this.show(page, value)
        this.game.modals.open('island')
    }

    show(page, value) {
        this.renderToken++
        this.disposeCard()
        this.page = page
        this.status.textContent = ''
        const back = page !== 'passport' ? button('← 小岛护照', 'passport', '', 'island-back') : ''
        this.content.innerHTML = back + this.render(page, value)
        this.content.scrollTop = 0
        if (this.modal.isOpen) this.content.querySelector('h2')?.focus({ preventScroll: true })
        if (page === 'postcard') this.drawCard(value || 'landing', this.renderToken)
    }

    heading(kicker, title, intro) {
        return `<p class="island-kicker">${kicker}</p><h2 id="island-title" tabindex="-1">${title}</h2><p class="island-intro">${intro}</p>`
    }

    render(page, value) {
        if (page === 'shelf') return this.renderShelf()
        if (page === 'reading') return this.renderReading(value)
        if (page === 'passport') {
            const count = passportStamps.filter(stamp => this.has(stamp.id)).length
            const visited = this.progress('momoCorners')
            return this.heading('MOMOZI ISLAND / VOL. 02', '把偶遇，<wbr>夹进小岛护照。', '没有规定路线。读一页作品，在喜欢的角落停一停，就很好。') + `
                <div class="island-passport-top"><span>第一次来小岛</span><strong>${count} / 3 枚章</strong></div>
                <div class="island-stamps">${passportStamps.map(s => `<button type="button" class="island-stamp ${this.has(s.id) ? 'is-collected' : ''}" data-island-action="${s.action}"><span class="stamp-seal" aria-hidden="true">${this.has(s.id) ? '✓' : '·'}</span><strong>${s.title}</strong><small>${s.hint}</small><em>${this.has(s.id) ? '已盖章' : '去看看 →'}</em></button>`).join('')}</div>
                ${count === 3 ? '<p class="island-complete">三枚小章，一段自己的路线。谢谢你来小岛做客 ♡</p>' : '<p class="island-fine">不必按顺序，也不锁任何内容。随时关闭，继续自由探索。</p>'}
                <button type="button" class="island-shelf-door" data-island-action="shelf"><span>momo子讲AI · 小岛书架</span><strong>从这里，翻开 6 篇真实文章与笔记</strong><span>Agent 入门 / 产品思考 / 开源手记 <b>↗</b></span></button>
                <div class="island-section-heading"><h3>路过时的小惊喜</h3><span>${discoveries.filter(d => visited.has(d.id)).length} / 5 处打卡</span></div>
                <div class="island-corners">${discoveries.map(d => `<article class="island-corner-row"><span class="island-number">${d.number}</span><div><h4>${d.title}${visited.has(d.id) ? '<span class="island-check"> 已打卡</span>' : ''}</h4><p>${d.location}</p></div>${button('读便签', 'corner', d.id, 'island-text-button')}${button('去这里 ↗', 'visit', d.id, 'island-text-button')}</article>`).join('')}</div>
                <footer class="island-footer"><p>${this.game.achievements.storage.available ? '与原有成就一起保存在本机浏览器，不跨设备同步。' : '浏览器暂时无法保存；进度只在这次访问中保留。'}</p>${button('只重玩护照', 'reset', '', 'island-text-button')}</footer>`
        }
        if (page === 'corner') {
            const d = discoveries.find(d => d.id === value)
            if (!d) return this.render('passport')
            const nearby = this.distance(d.id) < 10
            const visited = this.progress('momoCorners').has(d.id)
            return this.heading(`拾到一页 / ${d.number} · ${d.location}`, d.title, d.lead) + `<div class="island-letter">${d.paragraphs.map(p => `<p>${p}</p>`).join('')}<span class="island-signature">MoMoZi’s little world</span></div><p class="island-fine">${d.note}</p><div class="island-actions">${button(d.actionLabel, d.action)}${d.project ? button('查看作品卡 ↗', 'project', d.project, 'island-secondary') : ''}${visited ? '<span class="island-collected">已盖章 · 来过这里 ✓</span>' : nearby ? button('在这里盖个章', 'checkin', d.id, 'island-secondary') : button('去现场打卡 ↗', 'visit', d.id, 'island-secondary')}</div>${this.renderReadingLinks(cornerReadings[d.id])}`
        }
        if (page === 'skills') return this.heading('SKILLS / 概念任务卡', '把“怎么做”，留给下一次。', '预设示例，非实时生成；不是 Persona Skills 的实测结果。') + `<div class="island-example"><span class="island-kicker">一个输入</span><h3>${skillExample.task}</h3><ol>${skillExample.steps.map(s => `<li>${s}</li>`).join('')}</ol><span class="island-kicker">一段解释</span><p>${skillExample.takeaway}</p></div><p class="island-fine">${skillExample.limit}</p><div class="island-actions">${button('继续了解 Persona Skills', 'project', 'persona')}${button('也看看永乐大典 Skill', 'project', 'yongle', 'island-secondary')}</div>`
        if (page === 'roundtable') {
            const selected = roundtable.find(r => r.id === value)
            return this.heading('DIRECTORAGENTS / 预设互动演示', '如果给小岛拍一部 30 秒短片…', '同一个题目，三个创作立场。你更愿意先试哪一个？') + `<p class="island-disclaimer">以下是预写提案，不调用 AI，也不代表任何真实导演的原话。</p><div class="island-proposals">${roundtable.map(r => `<button type="button" class="island-proposal ${r.color}" data-island-action="choice" data-value="${r.id}" aria-pressed="${r.id === value}"><span>${r.role}</span><h3>${r.title}</h3><p>${r.text}</p><small>${r.id === value ? '这次选它 ✓' : '试试这个方向 →'}</small></button>`).join('')}</div>${selected ? `<div class="island-decision" data-decision tabindex="0"><strong>你选择了「${selected.role}」</strong><p>${selected.why}</p><p>没有唯一正确答案。协作的价值，是把目标、取舍和分歧摆到同一张桌上。</p></div>` : ''}<div class="island-actions">${button('这张圆桌背后的作品', 'project', 'directors')}</div>`
        }
        if (page === 'project') {
            const project = works.find(p => p.id === value)
            if (!project) return this.render('passport')
            return this.heading('WORK NOTES / 从小岛走向源码', project.title, project.subtitle) + `<img class="island-project-image" src="${project.image}" alt="${esc(project.title)} 已有项目展示图"><p class="island-body">${project.description}</p>${project.note ? `<p class="island-fine">${project.note}</p>` : ''}${value === 'momo-code' ? this.renderCodeCase() : '<p class="island-fine">这里是现有公开作品的摘要，不是完整实测案例。具体能力、安装方式与限制，请以仓库文档为准。</p>'}<div class="island-actions">${project.links.map(l => `<a class="island-button" href="${l.url}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a>`).join('')}${['persona','yongle'].includes(value) ? button('看看 Skills 概念卡', 'skills', '', 'island-secondary') : ['directors','tianya'].includes(value) ? button('试试预设圆桌', 'roundtable', '', 'island-secondary') : ''}</div>${this.renderReadingLinks(readingShelf.filter(r => r.project === value).map(r => r.id))}`
        }
        if (page === 'postcard') {
            const card = postcards.find(p => p.id === value) || postcards[0]
            return this.heading('POSTCARDS / 从小岛寄出的一点颜色', '带走一张，今天的风景。', '三处固定取景，不含访客留言。不用集齐印章，也能保存。') + `<div class="island-card-options">${postcards.map(p => `<button type="button" data-island-action="postcard" data-value="${p.id}" aria-pressed="${p.id === card.id}">${p.title}</button>`).join('')}</div><div class="island-postcard-preview"><img data-card-preview alt="${card.title} · 正在制作明信片"></div><p class="island-fine">固定风景图 + 今天的日期，不是实时截图。PNG 1200 × 900；仅在本机制作，不会发送到服务器。</p><div class="island-actions"><button type="button" class="island-button" data-island-action="make-card" data-value="${card.id}" disabled>选好了，盖上纪念章</button><button type="button" class="island-button island-secondary" data-island-action="save-card" disabled>保存 PNG ↓</button></div><p class="island-fine">手机若未弹出下载，可长按上方图片保存；也可以直接截图。</p>`
        }
        if (page === 'reset') return this.heading('重新翻开 / 只重玩小岛护照', '再走一次自己的路线？', '仅清除三枚护照章与五处打卡记录。原有成就、车漆、赛车和世界状态都不会改变。') + `<div class="island-actions">${button('确认重新开始', 'confirm-reset')}${button('还是保留回忆', 'passport', '', 'island-secondary')}</div>`
        return ''
    }

    renderReadingLinks(ids = []) {
        if (!ids.length) return ''
        return `<aside class="island-related"><span class="island-kicker">这处角落，还夹着几页真实内容</span>${ids.map(id => { const r = readingShelf.find(item => item.id === id); return button(`${esc(r.title)} →`, 'reading', id, 'island-text-button') }).join('')}</aside>`
    }

    renderShelf() {
        return this.heading('momo子讲AI / 小岛书架', '小岛很小，<wbr>好奇心可以很远。', '只选六篇，慢慢翻。来自 MoMoZi 的公开文章与知识库，不是自动信息流。') + `<div class="island-reading-list">${readingShelf.map((r, index) => `<article class="island-reading-card"><span class="island-kicker">${String(index + 1).padStart(2, '0')} / ${r.category}</span><h3>${r.title}</h3><p>${r.idea}</p><small>适合：${r.audience}</small><div class="island-reading-meta">${r.platform} · ${r.date ? `${r.dateLabel} ${r.date}` : `核对 ${readingSources.verifiedAt}`}</div>${button('翻开这页 →', 'reading', r.id, 'island-text-button')}</article>`).join('')}</div><p class="island-fine">卡片采用导读短标题与摘要，不冒充原文逐字摘录。日期有“发表 / 更新 / 核对”之分；文档链接固定到本次阅读版本，不把旧文写成今日新闻。</p><div class="island-actions"><a class="island-button" href="${readingSources.website}" target="_blank" rel="noopener noreferrer">去知 AI 继续读 ↗</a><a class="island-button island-secondary" href="${readingSources.repository}" target="_blank" rel="noopener noreferrer">完整开源知识库 ↗</a></div>`
    }

    renderReading(id) {
        const r = readingShelf.find(item => item.id === id)
        if (!r) return this.renderShelf()
        return this.heading(`${r.category} / 有出处的阅读导览`, r.title, `适合：${r.audience}`) + `<div class="island-reading-meta">${r.platform} · ${r.date ? `${r.dateLabel} ${r.date}` : '原文未标日期'} · 核对 ${readingSources.verifiedAt}</div><p class="island-reading-idea">${r.idea}</p><div class="island-letter">${r.paragraphs.map(p => `<p>${p}</p>`).join('')}</div><div class="island-reading-question"><span class="island-kicker">读完后，留一个小问题</span><p>${r.question}</p></div><details class="island-source-note"><summary>关于这份导读与来源</summary><p>标题为导读短标题，正文是根据原文整理的摘要，不是原文逐字引用。</p><p>${r.caution}</p>${r.platform.startsWith('GitHub') ? `<p>原文版本：${readingSources.revision.slice(0, 12)}。来源为作者维护的知识库，非官方技术规范。</p>` : '<p>标题、发表时间和原文链接来自 momozi.vip 的博客目录，正文已通过该站公开文章核对。微信可能要求在其客户端内打开。</p>'}</details><div class="island-actions"><a class="island-button" href="${r.url}" target="_blank" rel="noopener noreferrer">${r.platform.startsWith('GitHub') ? '阅读 GitHub 原文' : '阅读公众号原文'} ↗</a>${r.mirror ? `<a class="island-button island-secondary" href="${r.mirror}" target="_blank" rel="noopener noreferrer">在知 AI 博客查阅 ↗</a>` : ''}${r.project ? button('回到这件作品', 'project', r.project, 'island-secondary') : ''}${button('← 继续翻书架', 'shelf', '', 'island-text-button')}</div>`
    }

    renderCodeCase() {
        return `<section class="island-code-case"><span class="island-kicker">开发者手记 / 据 2026-06-27 作者原文整理</span><h3>一次任务之后，留下什么？</h3><p>为希望复用反馈与经验的编程 Agent 用户，探索比“一次生成”更长的工作循环。</p><dl><dt>作者的工作</dt><dd>${codeCase.role}</dd><dt>原文演示输入</dt><dd><code>${codeCase.input}</code></dd><dt>过程与输出</dt><dd>${codeCase.process}</dd><dd>${codeCase.output}</dd></dl><figure><img src="${codeCase.image}" alt="MOMO CODE 作者文章中的 evolve 终端演示截图" loading="lazy"><figcaption>${codeCase.caption}</figcaption></figure><dl><dt>为什么分成两条回路</dt><dd>经验注入与训练评估发生在不同的时间尺度；先积累反馈，再判断候选方案是否值得采用，而不是把每次会话都等同于训练模型。</dd><dt>当前需要讲清的边界</dt><dd>${codeCase.boundary}</dd></dl><p class="island-fine">本页未运行 MOMO CODE，未复现效果指标；原文入口见下方“真实内容”。</p></section>`
    }

    distance(id) {
        const point = this.points.get(id)
        return point ? Math.hypot(point.position.x - this.game.player.position.x, point.position.z - this.game.player.position.z) : Infinity
    }

    visit(id) {
        const d = discoveries.find(d => d.id === id)
        if (!d) return
        this.game.modals.close()
        this.game.player.respawn(d.area, () => { this.game.view.focusPoint.isTracking = true })
        // No auto-popup or auto-stamp: arriving at a corner should never hijack driving.
    }

    createCorners() {
        const offsets = { landing: [1, 2.8], career: [2.5, 0], projects: [3, 1], lab: [1, 2.8], social: [2.5, 2] }
        this.props = new THREE.Group()
        this.props.name = 'momoDiscoveryCorners'
        this.game.scene.add(this.props)
        const wood = new MeshDefaultMaterial({ colorNode: color('#9c775e') })
        const paper = new MeshDefaultMaterial({ colorNode: color('#fff1d9') })
        const ink = new MeshDefaultMaterial({ colorNode: color('#644c70') })
        const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
        const addBox = (parent, material, position, scale) => {
            const mesh = new THREE.Mesh(boxGeometry, material)
            mesh.position.set(...position); mesh.scale.set(...scale); mesh.castShadow = true
            parent.add(mesh); return mesh
        }
        for (const d of discoveries) {
            const group = new THREE.Group()
            const spawn = this.game.respawns.getByName(d.area)
            const offset = offsets[d.area]
            group.position.set(spawn.position.x + offset[0], d.area === 'projects' ? 0.64 : 0.05, spawn.position.z + offset[1])
            group.rotation.y = Math.PI / 4
            group.name = `momoCorner-${d.id}`
            this.props.add(group)
            const accent = new MeshDefaultMaterial({ colorNode: color(d.color) })
            if (d.kind === 'letter') {
                addBox(group, wood, [0, .55, 0], [.14, 1.1, .14])
                addBox(group, accent, [0, 1.14, 0], [.9, .7, .55])
                addBox(group, ink, [0, 1.25, .282], [.56, .065, .025])
                const envelope = addBox(group, paper, [0, 1.02, .3], [.38, .24, .035])
                envelope.rotation.z = -.12
                addBox(group, paper, [.54, 1.5, 0], [.22, .16, .05])
                addBox(group, wood, [.45, 1.26, 0], [.045, .62, .045])
            } else if (d.kind === 'book') {
                addBox(group, wood, [0, .75, 0], [1.35, .12, .8])
                for (const x of [-.48, .48]) addBox(group, wood, [x, .37, 0], [.1, .74, .52])
                for (const side of [-1, 1]) {
                    const page = addBox(group, paper, [side * .29, .89, 0], [.56, .1, .63]); page.rotation.z = side * -.12
                    for (let line = 0; line < 3; line++) addBox(group, accent, [side * .29, .96, -.16 + line * .15], [.35, .012, .024])
                }
                addBox(group, accent, [0, .91, .22], [.08, .04, .65])
            } else {
                const top = new THREE.Mesh(new THREE.CylinderGeometry(.72, .72, .12, 20), wood)
                top.position.y = .85; top.castShadow = true; group.add(top)
                addBox(group, wood, [0, .42, 0], [.2, .84, .2])
                for (let i = 0; i < 3; i++) {
                    const angle = i / 3 * Math.PI * 2
                    const mat = new MeshDefaultMaterial({ colorNode: color(['#d890ad', '#b399d1', '#97ad8b'][i]) })
                    addBox(group, mat, [Math.sin(angle) * 1.05, .38, Math.cos(angle) * 1.05], [.43, .15, .43])
                    addBox(group, wood, [Math.sin(angle) * 1.05, .17, Math.cos(angle) * 1.05], [.12, .34, .12])
                    const note = addBox(group, mat, [Math.sin(angle) * .3, .93, Math.cos(angle) * .3], [.27, .025, .32]); note.rotation.y = angle
                }
            }
            // New props are decorative and deliberately do not add collision obstacles.
            const position = group.position.clone().add(new THREE.Vector3(0, 1.9, 0))
            const point = this.game.interactivePoints.create(position, d.title, InteractivePoints.ALIGN_RIGHT, InteractivePoints.STATE_HIDDEN,
                () => this.open('corner', d.id),
                () => this.game.inputs.interactiveButtons.addItems(['interact']),
                () => this.game.inputs.interactiveButtons.removeItems(['interact']),
                () => this.game.inputs.interactiveButtons.removeItems(['interact']))
            this.points.set(d.id, { position, point })
        }
        this.game.ticker.events.on('tick', () => {
            const wandering = this.game.inputs.filters.has('wandering') && this.game.reveal.step === 2
            for (const [id, { point }] of this.points) {
                const show = wandering && this.distance(id) < 10 && !this.game.interactivePoints.temporaryHidden
                if (show && point.state === InteractivePoints.STATE_HIDDEN) point.show()
                else if (!show && point.state !== InteractivePoints.STATE_HIDDEN) point.hide()
            }
        }, 8)
    }

    disposeCard() {
        if (this.cardUrl) URL.revokeObjectURL(this.cardUrl)
        this.cardUrl = null
    }

    async drawCard(id, token) {
        const card = postcards.find(p => p.id === id) || postcards[0]
        try {
            const image = new Image()
            image.src = card.image
            await image.decode()
            if (token !== this.renderToken) return
            const canvas = document.createElement('canvas')
            canvas.width = 1200; canvas.height = 900
            const ctx = canvas.getContext('2d')
            ctx.fillStyle = '#fcf4e9'; ctx.fillRect(0, 0, 1200, 900)
            const crop = Math.max(1128 / image.width, 620 / image.height)
            ctx.save(); ctx.beginPath(); ctx.rect(36, 36, 1128, 620); ctx.clip()
            ctx.drawImage(image, 600 - image.width * crop / 2, 346 - image.height * crop / 2, image.width * crop, image.height * crop); ctx.restore()
            ctx.fillStyle = '#543758'; ctx.font = 'bold 40px "PingFang SC", sans-serif'; ctx.fillText(card.title, 52, 727)
            ctx.font = '23px "PingFang SC", sans-serif'; ctx.fillStyle = '#77677b'; ctx.fillText(card.line, 52, 778)
            ctx.font = '20px sans-serif'; ctx.fillText(`MoMoZi’s little world  /  ${new Date().toLocaleDateString('sv-SE')}`, 52, 849)
            ctx.save(); ctx.translate(1080, 758); ctx.rotate(-.14); ctx.strokeStyle = '#bd85a5'; ctx.lineWidth = 2
            ctx.strokeRect(-52, -52, 104, 104); ctx.textAlign = 'center'; ctx.fillStyle = '#a56a91'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('MOMOZI', 0, -8); ctx.font = '18px sans-serif'; ctx.fillText('来过小岛', 0, 23); ctx.restore()
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
            if (token !== this.renderToken) return
            if (!blob) throw new Error('PNG export unavailable')
            this.cardUrl = URL.createObjectURL(blob)
            this.root.querySelector('[data-card-preview]').src = this.cardUrl
            this.root.querySelector('[data-card-preview]').alt = `${card.title} · MoMoZi 小岛明信片`
            this.root.querySelector('[data-island-action="save-card"]').disabled = false
            this.root.querySelector('[data-island-action="make-card"]').disabled = false
        } catch {
            if (token === this.renderToken) this.status.textContent = '风景图暂时没能载入，请重新选一张；也可以关闭面板，直接截取小岛画面。'
        }
    }

    downloadCard(target) {
        if (!this.cardUrl) return
        const link = document.createElement('a')
        link.href = this.cardUrl; link.download = `MoMoZi-island-${new Date().toLocaleDateString('sv-SE')}.png`
        document.body.append(link); link.click(); link.remove()
        this.stamp('souvenir')
        this.status.textContent = '已请求浏览器下载。如没有弹出保存，可长按预览图片，或手动截图。'
        target.focus()
    }
}
