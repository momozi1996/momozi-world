import * as THREE from 'three/webgpu'
import { Game } from '../Game.js'
import { InstancedGroup } from '../InstancedGroup.js'
import { color, Fn, hash, instancedArray, instanceIndex, positionWorld, sin, uniform, uv, vec3, vec4 } from 'three/tsl'
import gsap from 'gsap'
import { MeshDefaultMaterial } from '../Materials/MeshDefaultMaterial.js'
import { worldPalette } from '../../data/worldPalette.js'

export class PoleLights
{
    constructor()
    {
        this.game = Game.getInstance()

        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '🏮 Pole lights',
                expanded: false,
            })
        }

        // Base and references
        const [ base, references ] = InstancedGroup.getBaseAndReferencesFromInstances(this.game.resources.poleLightsModel.scene.children)
        this.references = references
        
        // Setup base
        for(const child of base.children)
        {
            child.name = child.name.replace(/[0-9]+$/i, '') // Set clear name to retrieve it later as instances
            child.castShadow = true
            child.receiveShadow = true
        }

        // Update materials 
        this.game.materials.updateObject(base)

        // Create instanced group
        this.instancedGroup = new InstancedGroup(this.references, base, false)

        this.glass = this.instancedGroup.meshes.find(mesh => mesh.instance.name === 'glass').instance
        
        this.setPhysics()
        // this.setEmissives()
        this.setFireflies()
        this.setLightPools()
        this.setSwitchInterval()
    }

    setPhysics()
    {
        for(const reference of this.references)
        {
            this.game.objects.add(
                null,
                {
                    type: 'fixed',
                    position: reference.position,
                    rotation: reference.quaternion,
                    colliders: [ { shape: 'cuboid', parameters: [ 0.2, 1.7, 0.2 ], category: 'object' } ],
                    onCollision: (force, position) =>
                    {
                        this.game.audio.groups.get('hitDefault').playRandomNext(force, position)
                    }
                },
            )
        }
    }

    // setEmissives()
    // {
    //     this.emissive = {}
    //     this.emissive.offMaterial = this.game.materials.getFromName('palette')
    //     this.emissive.onMaterial = this.game.materials.getFromName('emissiveOrangeRadialGradient')
    // }

    setFireflies()
    {
        this.firefliesScale = uniform(0)

        const countPerLight = 5
        const count = this.references.length * countPerLight
        const positions = new Float32Array(count * 3)

        let i = 0
        for(const reference of this.references)
        {
            for(let j = 0; j < countPerLight; j++)
            {
                const i3 = i * 3

                const angle = Math.random() * Math.PI * 2
                positions[i3 + 0] = reference.position.x + Math.cos(angle)
                positions[i3 + 1] = reference.position.y + 1
                positions[i3 + 2] = reference.position.z + Math.sin(angle)
                i++
            }
        }
        
        const positionAttribute = instancedArray(positions, 'vec3').toAttribute()

        const material = new THREE.SpriteNodeMaterial()
        material.outputNode = this.game.materials.getFromName('emissiveOrangeRadialGradient').outputNode

        const baseTime = this.game.ticker.elapsedScaledUniform.add(hash(instanceIndex).mul(999))
        const flyOffset = vec3(
            sin(baseTime.mul(0.4)).mul(0.5),
            sin(baseTime).mul(0.2),
            sin(baseTime.mul(0.3)).mul(0.5)
        )
        material.positionNode = positionAttribute.add(flyOffset)
        material.scaleNode = this.firefliesScale

        const geometry = new THREE.CircleGeometry(0.015, 8)

        const mesh = new THREE.Mesh(geometry, material)
        mesh.count = count
        mesh.frustumCulled = false
        this.game.scene.add(mesh)
    }

    setLightPools()
    {
        // The stylized lighting pipeline does not use per-lamp point lights.
        // One instanced, feathered pool pass adds warm spill without extra shadow maps.
        this.poolStrength = uniform(0.045)
        const material = new THREE.MeshBasicNodeMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        })
        material.name = 'momoWarmLampPools'
        material.outputNode = Fn(() =>
        {
            const radial = uv().sub(0.5).length().mul(2).oneMinus().max(0).pow(2)
            const terrainData = this.game.terrain.terrainNode(positionWorld.xz)
            // Keep the warm spill on land, not hovering over the river.
            terrainData.b.greaterThan(0.17).discard()
            const alpha = radial.mul(this.poolStrength).mul(this.game.fog.strength.oneMinus())
            const rgb = MeshDefaultMaterial.revealDiscardNodeBuilder(this.game, color(worldPalette.lamp.edge))
            return vec4(rgb, alpha)
        })()
        const geometry = new THREE.PlaneGeometry(5, 5)
        geometry.rotateX(-Math.PI * 0.5)
        const mesh = new THREE.InstancedMesh(geometry, material, this.references.length)
        mesh.name = 'momoWarmLampPools'
        // Draw above the ground, before water and other transparent effects.
        mesh.renderOrder = 1
        const matrix = new THREE.Matrix4()
        this.references.forEach((reference, index) => {
            matrix.makeTranslation(reference.position.x, 0.022, reference.position.z)
            mesh.setMatrixAt(index, matrix)
        })
        mesh.instanceMatrix.needsUpdate = true
        this.game.scene.add(mesh)
        this.lightPools = mesh
    }

    setSwitchInterval()
    {

        const intervalChange = (inInterval) =>
        {
            if(inInterval)
            {
                this.glass.visible = true

                gsap.to(this.firefliesScale, { value: 1, duration: 5, overwrite: true })
                gsap.to(this.poolStrength, { value: 0.48, duration: 2, overwrite: true })
            }
            else
            {
                // Lamps stay softly emissive in daylight; night adds fireflies and bloom.
                this.glass.visible = true

                gsap.to(this.firefliesScale, { value: 0, duration: 5, overwrite: true })
                gsap.to(this.poolStrength, { value: 0.045, duration: 2, overwrite: true })
            }
        }

        this.game.dayCycles.events.on('night', intervalChange)
        intervalChange(this.game.dayCycles.intervalEvents.get('night').inInterval)
    }
}