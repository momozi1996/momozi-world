import * as THREE from 'three/webgpu'
import { Cycles } from './Cycles.js'

const presets = {
    day:   { revealColor: new THREE.Color('#f4a7e4'), revealIntensity: 12, electricField: 0, temperature: 5, lightColor: new THREE.Color('#ffe4f2'), lightIntensity: 1.2, shadowColor: new THREE.Color('#9471c4'), fogColorA: new THREE.Color('#ecd5fa'), fogColorB: new THREE.Color('#efbfdf'), fogNearRatio: 0.315, fogFarRatio: 1.25 },
    dusk:  { revealColor: new THREE.Color('#ff86d9'), revealIntensity: 5.55, electricField: 0.25, temperature: 0, lightColor: new THREE.Color('#edb0d8'), lightIntensity: 1.2, shadowColor: new THREE.Color('#743e9a'), fogColorA: new THREE.Color('#9975ca'), fogColorB: new THREE.Color('#e4a6d0'), fogNearRatio: 0, fogFarRatio: 1.25 },
    night: { revealColor: new THREE.Color('#b678ff'), revealIntensity: 10, electricField: 1, temperature: -7.5, lightColor: new THREE.Color('#9273cf'), lightIntensity: 3.8, shadowColor: new THREE.Color('#562e8c'), fogColorA: new THREE.Color('#372351'), fogColorB: new THREE.Color('#633657'), fogNearRatio: -0.85, fogFarRatio: 1 },
    dawn:  { revealColor: new THREE.Color('#ff9d9d'), revealIntensity: 4.85, electricField: 0.25, temperature: 0, lightColor: new THREE.Color('#ffe0f2'), lightIntensity: 1.2, shadowColor: new THREE.Color('#a566ae'), fogColorA: new THREE.Color('#d6b4ef'), fogColorB: new THREE.Color('#f5b8cf'), fogNearRatio: 0.3, fogFarRatio: 1.25 },
}

export class DayCycles extends Cycles
{
    constructor()
    {
        const forcedProgress = import.meta.env.VITE_DAY_CYCLE_PROGRESS ? parseFloat(import.meta.env.VITE_DAY_CYCLE_PROGRESS) : null
        super('🕜 Day Cycles', 4 * 60, forcedProgress, false)
    }

    get presets()
    {
        return presets
    }

    getKeyframesDescriptions()
    {
        // Debug
        if(this.game.debug.active)
        {
            this.debugPanel.addBinding(this, 'duration', { min: 1, max: 60 * 10, step: 1 })

            for(const presetKey in presets)
            {
                const preset = presets[presetKey]
                const presetsDebugPanel = this.debugPanel.addFolder({
                    title: presetKey,
                    expanded: true,
                })

                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.revealColor, 'revealColor')
                presetsDebugPanel.addBinding(preset, 'revealIntensity', { min: 0, max: 20, step: 0.001 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.lightColor, 'lightColor')
                presetsDebugPanel.addBinding(preset, 'lightIntensity', { min: 0, max: 20 })
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.shadowColor, 'shadowColor')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorA, 'fogColorA')
                this.game.debug.addThreeColorBinding(presetsDebugPanel, preset.fogColorB, 'fogColorB')
                presetsDebugPanel.addBinding(preset, 'fogNearRatio', { label: 'near', min: -2, max: 2, step: 0.001 })
                presetsDebugPanel.addBinding(preset, 'fogFarRatio', { label: 'far', min: -2, max: 2, step: 0.001 })
            }
        }

        return [
            [
                { properties: presets.day, stop: 0.0 }, // day
                { properties: presets.day, stop: 0.15 }, // day
                { properties: presets.dusk, stop: 0.25 }, // Dusk
                { properties: presets.night, stop: 0.35 }, // Night
                { properties: presets.night, stop: 0.6 }, // Night
                { properties: presets.dawn, stop: 0.8 }, // Dawn
                { properties: presets.day, stop: 0.9 }, // day
            ]
        ]
    }

    getIntervalDescriptions()
    {
        return [
            { name: 'night', start: 0.25, end: 0.7 },
            { name: 'deepNight', start: 0.35, end: 0.6 },
        ]
    }
}