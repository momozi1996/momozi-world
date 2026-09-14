import { career, projectGroups, skillDirectories, accounts } from '../data/profile.js'

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
const tags = values => `<div class="momo-tags">${values.map(value => `<span>${escape(value)}</span>`).join('')}</div>`
const externalLink = (label, url) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} <span aria-hidden="true">↗</span></a>`

function renderAccounts() {
    return accounts.map(account => `
        <article class="momo-account">
            <span class="momo-kicker">${escape(account.platform)}</span>
            <strong class="momo-account-name">${escape(account.name)}</strong>
            <p>${escape(account.hint)}</p>
            ${account.kind === 'copy'
                ? `<button type="button" class="momo-copy" data-copy-account="${escape(account.name)}" aria-label="复制${escape(account.platform)}账号：${escape(account.name)}">复制账号名 <span aria-hidden="true">＋</span></button>`
                : externalLink('逛逛 GitHub', account.url)}
        </article>`).join('')
}

export function selectProfileTab(name, focus = false) {
    const root = document.querySelector('.momo-profile')
    const selected = root?.querySelector(`[data-profile-tab="${name}"]`)
    if (!selected) return
    root.querySelectorAll('[data-profile-tab]').forEach(tab => {
        const active = tab === selected
        tab.setAttribute('aria-selected', String(active))
        tab.tabIndex = active ? 0 : -1
    })
    root.querySelectorAll('[data-profile-panel]').forEach(panel => {
        panel.hidden = panel.dataset.profilePanel !== name
    })
    root.dataset.activeTab = name
    root.closest('.js-menu')?.classList.toggle('momo-compact-profile', name !== 'about')
    document.dispatchEvent(new CustomEvent('momo-profile-tab', { detail: name }))
    const scroller = root.closest('.home-content')
    if (scroller) scroller.scrollTop = 0
    if (focus) selected.focus({ preventScroll: true })
}

export function installMomoProfile() {
    const timeline = document.querySelector('[data-profile-timeline]')
    timeline.innerHTML = career.map((item, index) => `
        <li class="momo-career-stop ${item.current ? 'is-current' : ''}">
            <span class="momo-career-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
            <div class="momo-career-copy">
                <div class="momo-career-meta">${escape(item.period)}${item.current ? '<span class="momo-now">现在</span>' : ''}</div>
                <h3>${escape(item.company)}</h3>
                <strong class="momo-career-role">${escape(item.role)}</strong>
                <p>${escape(item.description)}</p>
                ${tags(item.tags)}
            </div>
        </li>`).join('')

    document.querySelector('[data-profile-projects]').innerHTML = projectGroups.map(group => `
        <section class="momo-project-group" id="momo-project-${escape(group.id)}">
            <div class="momo-section-label"><span>${group.number}</span> ${escape(group.label)}</div>
            <h3>${escape(group.title)}</h3>
            <p class="momo-group-intro">${escape(group.description)}</p>
            ${group.projects.map(project => `
                <article class="momo-project-card">
                    <div class="momo-project-heading">
                        <img src="${escape(project.image)}" alt="${escape(project.title)} 项目预览" loading="lazy" width="76" height="58">
                        <div><h4>${escape(project.title)}</h4><span>${escape(project.subtitle)}</span></div>
                    </div>
                    <p>${escape(project.description)}</p>
                    ${tags(project.tags)}
                    ${project.note ? `<p class="momo-project-note">${escape(project.note)}</p>` : ''}
                    <div class="momo-project-links"><button type="button" data-island-project="${escape(project.id)}">读一张作品卡 →</button>${project.links.map(link => externalLink(link.label, link.url)).join('')}</div>
                </article>`).join('')}
            ${group.id === 'skills' ? `<aside class="momo-directory-note"><strong>在更多地方遇见我的 Skills</strong><p>Skills 作品已被多个技能目录与开源索引收录。</p>${tags(skillDirectories)}</aside>` : ''}
        </section>`).join('')

    document.querySelectorAll('[data-profile-accounts]').forEach(container => {
        container.innerHTML = renderAccounts()
        if (container.closest('.momo-contact-modal')) container.querySelector('button')?.classList.add('js-main-focus')
    })

    // Keep keyboard navigation inside this dialog; Escape remains handled by the game.
    const contactModal = document.querySelector('.momo-contact-modal')
    contactModal.addEventListener('keydown', event => {
        if (event.key !== 'Tab') return
        const focusable = [...contactModal.querySelectorAll('button, a[href]')]
        const first = focusable[0]
        const last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault(); last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first.focus()
        }
    })

    const tabs = [...document.querySelectorAll('[data-profile-tab]')]
    for (const tab of tabs) {
        tab.addEventListener('click', () => selectProfileTab(tab.dataset.profileTab))
        tab.addEventListener('keydown', event => {
            const index = tabs.indexOf(tab)
            const target = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key]
            if (target === undefined) return
            event.preventDefault()
            event.stopPropagation()
            selectProfileTab(tabs[target].dataset.profileTab, true)
        })
    }
    document.querySelectorAll('[data-profile-go]').forEach(button => {
        button.addEventListener('click', () => selectProfileTab(button.dataset.profileGo, true))
    })

    document.querySelectorAll('[data-copy-account]').forEach(button => {
        const original = button.innerHTML
        let timer
        button.addEventListener('click', async () => {
            const value = button.dataset.copyAccount
            const status = button.closest('[data-contact-scope]').querySelector('[data-copy-status]')
            let copied = false
            try {
                await navigator.clipboard.writeText(value)
                copied = true
            } catch {
                // Clipboard can be unavailable on a LAN HTTP preview. Try the legacy
                // copy path within the user gesture, then provide honest manual guidance.
                const input = document.createElement('textarea')
                input.value = value
                input.setAttribute('aria-hidden', 'true')
                input.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px'
                document.body.append(input)
                input.select()
                try { copied = document.execCommand('copy') } catch { /* manual fallback below */ }
                input.remove()
                button.focus({ preventScroll: true })
            }
            status.textContent = copied ? `已复制「${value}」，去对应平台搜索就能找到我。` : `无法自动复制，请长按或选中账号名手动复制：${value}`
            if (copied) {
                clearTimeout(timer)
                button.textContent = '已复制 ✓'
                timer = setTimeout(() => { button.innerHTML = original }, 2200)
            }
        })
    })
}
