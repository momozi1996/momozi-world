import * as THREE from 'three/webgpu'
import { color, texture } from 'three/tsl'
import { MeshDefaultMaterial } from './Materials/MeshDefaultMaterial.js'
import { worldPalette } from '../data/worldPalette.js'

/** Selective recoloring before instancing/physics. Never mutate shared GLB materials. */
export function prepareMomoNature(game) {
    // Same UV layout as the source palette, with quiet wood/brass/cream/sage tones.
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 4
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, 128, 4)
    worldPalette.naturalSlots.forEach((hex, index) => {
        ctx.fillStyle = hex
        ctx.fillRect(index * 4, 0, 4, 4)
    })
    const naturalTexture = new THREE.CanvasTexture(canvas)
    naturalTexture.colorSpace = THREE.SRGBColorSpace
    naturalTexture.minFilter = THREE.NearestFilter
    naturalTexture.magFilter = THREE.NearestFilter
    naturalTexture.generateMipmaps = false
    game.resources.momoNaturePaletteTexture = naturalTexture

    const naturalMaterial = new MeshDefaultMaterial({
        colorNode: texture(naturalTexture).rgb,
        hasLightBounce: false
    })
    naturalMaterial.name = 'momoNaturalProps'
    game.materials.save(naturalMaterial.name, naturalMaterial)
    const barkMaterial = new MeshDefaultMaterial({
        colorNode: color(worldPalette.bark),
        hasLightBounce: false
    })
    barkMaterial.name = 'momoTreeBark'
    game.materials.save(barkMaterial.name, barkMaterial)

    const assignNaturalPalette = mesh => {
        if (!mesh.isMesh || Array.isArray(mesh.material) || mesh.material.name !== 'palette') return
        mesh.material = naturalMaterial
    }
    for (const key of ['benchesModel', 'fencesModel', 'poleLightsModel', 'lanternsModel']) {
        game.resources[key].scene.traverse(assignNaturalPalette)
    }
    for (const key of ['birchTreesVisualModel', 'oakTreesVisualModel', 'cherryTreesVisualModel']) {
        game.resources[key].scene.traverse(mesh => {
            if (mesh.isMesh && mesh.name.startsWith('treeBody')) mesh.material = barkMaterial
        })
    }
    // Bridges, workshop furniture and small everyday props are accent materials;
    // leave landmark buildings, brickwork, roofs, carpets and brand letters pink.
    const propNames = /^(bridge|table|stool|couch|refWood|wood|refCookie|sauceKetchup|sauceMustard|cupPhysical)/i
    for (const key of ['sceneryModel', 'areasModel']) {
        game.resources[key].scene.traverse(object => {
            if (propNames.test(object.name)) object.traverse(assignNaturalPalette)
        })
    }
}
