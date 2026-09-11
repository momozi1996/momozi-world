import * as THREE from 'three/webgpu'
import { FontLoader } from 'three/addons/loaders/FontLoader.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import fontData from '../data/momo-font.json'
import { MeshDefaultMaterial } from './Materials/MeshDefaultMaterial.js'
import { color } from 'three/tsl'

const font = new FontLoader().parse(fontData)
const pinks = ['#ec90bb', '#b48add', '#f0aed0', '#c3a0e6', '#e99fc9', '#b69cdd']

/** Rewrite author-dependent geometry before upstream physics parses the GLB. */
export function prepareMomoWorld(game) {
    const landing = game.resources.areasModel.scene.children.find(c => c.name === 'landing')
    const letters = landing.children.filter(c => /^refLettersPhysical/.test(c.name)).sort((a, b) => a.position.x - b.position.x)
    for (let i = 0; i < letters.length; i++) {
        const mesh = letters[i]
        if (i >= 6) { mesh.removeFromParent(); continue }
        const geometry = new TextGeometry('MoMoZi'[i], { font, size: 1.85, depth: .42, curveSegments: 8, bevelEnabled: true, bevelThickness: .045, bevelSize: .045, bevelSegments: 3 })
        geometry.center()
        geometry.computeBoundingBox()
        const size = geometry.boundingBox.getSize(new THREE.Vector3())
        mesh.geometry = geometry
        mesh.material = new THREE.MeshStandardMaterial({ color: pinks[i] })
        mesh.material.name = `momoLetter${i}`
        const along = (i - 2.5) * 1.75
        mesh.position.set(-5.21 + along * .9063, -2.49, 3.09 - along * .4226)
        // Use the real letter dimensions for physical collision boxes.
        const collider = mesh.children.find(c => c.name.startsWith('cuboid'))
        if (collider) { collider.scale.copy(size); collider.position.set(0,0,0) }
    }
    // Replace the original author's self-portrait statue with a toppleable bunny mascot.
    const social = game.resources.areasModel.scene.children.find(c => c.name === 'social')
    const plaques = {x:'GH',bluesky:'HOME',youtube:'CODE',mail:'SKILLS',twitch:'FILM',gitHub:'TY',linkedIn:'LAB',discord:'HF',onlyfans:'FANS'}
    for (const [prefix,label] of Object.entries(plaques)) {
        const mesh = social.children.find(c => c.name.startsWith(prefix+'PhysicalDynamic'))
        if (!mesh) continue
        const geometry = new TextGeometry(label,{font,size:.7,depth:.24,curveSegments:5,bevelEnabled:true,bevelThickness:.025,bevelSize:.02,bevelSegments:2})
        geometry.center();geometry.computeBoundingBox()
        let size=geometry.boundingBox.getSize(new THREE.Vector3());const ratio=Math.min(1.65/size.x,1.25/size.y)
        geometry.scale(ratio,ratio,1);geometry.computeBoundingBox();size=geometry.boundingBox.getSize(new THREE.Vector3())
        mesh.geometry=geometry;mesh.quaternion.identity()
        mesh.material=new THREE.MeshStandardMaterial({color:'#e8b9ee'});mesh.material.name='momoSocial'+prefix
        const physical = mesh.children.filter(c=>!c.isMesh)
        physical.forEach(c=>c.removeFromParent())
        const collider = new THREE.Object3D();collider.name='cuboidMomo'+prefix;collider.scale.copy(size);mesh.add(collider)
    }
    const statue = social.children.find(c => c.name.startsWith('refStatue'))
    if (statue) {
        const parts = []
        const add = (geometry, x, y, z) => { geometry.translate(x,y,z); parts.push(geometry) }
        add(new THREE.CylinderGeometry(.7,.85,.35,20),0,-2.25,0)
        add(new THREE.SphereGeometry(.85,24,16).scale(.8,1.3,.7),0,-1.05,0)
        add(new THREE.SphereGeometry(.84,24,16).scale(1,.9,.85),0,.25,0)
        for (const side of [-1,1]) add(new THREE.CapsuleGeometry(.21,.92,6,12).rotateZ(-side*.14),side*.34,1.35,0)
        statue.geometry = mergeGeometries(parts)
        statue.material = new THREE.MeshStandardMaterial({color:'#ffdaeb'}); statue.material.name = 'momoBunnyStatue'
        for (const side of [-1,1]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(.075,12,8),new THREE.MeshStandardMaterial({color:'#4c2c60'}))
            eye.material.name='momoBunnyEyes';eye.position.set(side*.27,.36,.66);statue.add(eye)
            const cheek = new THREE.Mesh(new THREE.SphereGeometry(.13,12,8).scale(1,.6,.3),new THREE.MeshStandardMaterial({color:'#ec83bc'}))
            cheek.material.name='momoBunnyCheeks';cheek.position.set(side*.49,.12,.60);statue.add(cheek)
        }
        const colliders = statue.children.filter(c => c.name.startsWith('cuboid'))
        if(colliders[1]) colliders[1].removeFromParent()
    }
    const career = {
        careerFreelancerTexture: ['AI PRODUCT', 'MOYAn / BEIJING'],
        careerHeticTexture: ['AI AGENTS', 'BUILD WITH CURIOSITY'],
        careerImmersiveGardenTexture: ['SENSENOVA', 'SENSETIME'],
        careerIRLTeacherTexture: ['PADDLEPADDLE', 'BAIDU RESEARCH'],
        careerOnlineTeacherTexture: ['OPEN SOURCE', 'MOMOZI1996 / GITHUB'],
        careerUzikTexture: ['MEITUAN CLC', 'AI TPM']
    }
    for (const [key, lines] of Object.entries(career)) {
        const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#000'; ctx.fillRect(0,0,1024,256)
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '900 86px Nunito'; ctx.fillText(lines[0],512,116)
        ctx.font = '700 35px Nunito'; ctx.fillText(lines[1],512,185)
        const texture = new THREE.CanvasTexture(canvas); texture.flipY = false
        texture.minFilter = THREE.LinearFilter; texture.magFilter = THREE.LinearFilter
        game.resources[key] = texture
    }
}

/** Small original additions; all upstream mechanical assemblies remain intact. */
export function finishMomoWorld(game) {
    const chassis = game.world.visualVehicle.parts.chassis
    const cream = new MeshDefaultMaterial({ colorNode: color('#ffe9f5') })
    const rose = new MeshDefaultMaterial({ colorNode: color('#e68dbb') })
    for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.CapsuleGeometry(.10,.38,5,8), cream)
        ear.name = 'momoBunnyEar'; ear.position.set(side * .27, .98, -.05); ear.rotation.z = -side * .17
        ear.castShadow = true; chassis.add(ear)
        const inner = new THREE.Mesh(new THREE.CapsuleGeometry(.052,.26,4,8), rose)
        inner.position.z = .072; ear.add(inner)
    }
    // Upstream's 2008–2025 career chronology must not be attributed to MoMoZi.
    game.world.areas.career.year.group.visible = false
    for (const digit of game.world.areas.career.year.digits) digit.mesh.removeFromParent()
}

export function installMomoHud() {
    const root = document.documentElement
    const enter = document.querySelector('#momo-enter')
    const progress = document.querySelector('#momo-progress')
    const error = document.querySelector('#momo-error')
    let started = false
    let readyAt = 0
    const interval = setInterval(() => {
        const game = window.game
        if (!game) return
        if (game.world?.intro) {
            const value = Math.round((game.world.intro.circle?.progress || 0) * 100)
            if (progress) progress.textContent = `${value}%`
        }
        if (game.world?.areas && !readyAt) readyAt = Date.now()
        if (game.reveal?.step === 0 && game.world?.intro?.soundButton?.mesh && !enter.dataset.ready) {
            enter.dataset.ready = 'true'; enter.disabled = false; enter.innerHTML = '出发，去逛逛 <span>↗</span>'
        }
        if (game.reveal?.step >= 1 && !started) {
            started = true; root.classList.add('momo-playing'); root.classList.remove('momo-loading')
        }
        if (started && game.reveal?.step === 2) {
            clearInterval(interval)
            // Mark actual gameplay-ready, separate from asset-ready.
            window.__playable = true
        }
    }, 150)
    root.classList.add('momo-loading')
    enter.addEventListener('click', () => {
        const game = window.game
        if (game?.world?.areas && game.reveal.step === 0) {
            game.inputs.events.trigger('introStart')
        }
    })
    document.querySelectorAll('[data-momo-action]').forEach(button => button.addEventListener('click', () => {
        const game = window.game
        if (!game?.player || !started) return
        const action = button.dataset.momoAction
        if (action === 'map') game.modals.open('map')
        else if (action === 'projects') {
            game.menu.close(); game.modals.close()
            game.player.respawn('projects', () => { game.view.focusPoint.isTracking = true })
        }
        else if (action === 'sound') {
            game.audio.mute.toggle()
            button.textContent = game.audio.mute.active ? '声音关' : '声音开'
        }
        else if (action === 'day') {
            const next = game.dayCycles.progress < .25 || game.dayCycles.progress > .75 ? .45 : .1
            game.dayCycles.newAbsoluteProgress = next
            game.dayCycles.newAbsoluteProgressBinding.manualValue = next
            game.dayCycles.newAbsoluteProgressBinding.manual = true
            game.dayCycles.update(true)
            button.textContent = next === .45 ? '月光夜' : '棉花糖昼'
        }
        else game.menu.open(action)
    }))
    window.addEventListener('keydown', event => {
        if (event.key === '?' && started && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) window.game.menu.open('controls')
    })
    window.addEventListener('unhandledrejection', event => {
        if (!started) {
            error.hidden = false
            error.innerHTML = '小世界加载遇到了问题。请使用最新版 Chrome / Edge，刷新后再试。<br><a href="https://github.com/momozi1996" target="_blank" rel="noreferrer">也可以先逛 MoMoZi 的 GitHub ↗</a>'
            console.error('MoMoZi boot:', event.reason)
        }
    })
}
