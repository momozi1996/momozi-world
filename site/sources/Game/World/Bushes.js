import { worldPalette } from '../../data/worldPalette.js'
import * as THREE from 'three/webgpu'
import { color, uniform } from 'three/tsl'
import { Foliage } from './Foliage.js'
import { Game } from '../Game.js'

export class Bushes
{
    constructor()
    {
        this.game = Game.getInstance()

        this.colorANode = uniform(color(worldPalette.bushes[0]))
        this.colorBNode = uniform(color(worldPalette.bushes[1]))
        this.foliage = new Foliage(this.game.resources.bushesReferences.scene.children, this.colorANode, this.colorBNode)

        // Debug
        if(this.game.debug.active)
        {
            const debugPanel = this.game.debug.panel.addFolder({
                title: '🌳 Bushes',
                expanded: false,
            })
            this.game.debug.addThreeColorBinding(debugPanel, this.colorANode.value, 'colorA')
            this.game.debug.addThreeColorBinding(debugPanel, this.colorBNode.value, 'colorB')
            debugPanel.addBinding(this.foliage.material.shadowOffset, 'value', { label: 'shadowOffset', min: 0, max: 2, step: 0.001 })
        }
    }
}