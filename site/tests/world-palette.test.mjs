import test from 'node:test'
import assert from 'node:assert/strict'
import { worldPalette as palette } from '../sources/data/worldPalette.js'

const rgb = hex => [1,3,5].map(offset=>Number.parseInt(hex.slice(offset,offset+2),16))

test('all tree species use green / yellow-green foliage and warm brown bark', () => {
    for (const colors of Object.values(palette.trees)) {
        assert.equal(colors.length,2)
        for (const hex of colors) {
            const [r,g,b]=rgb(hex)
            assert.ok(g>r && g>b,`${hex} should read as green`)
        }
    }
    const [r,g,b]=rgb(palette.bark)
    assert.ok(r>g && g>b,'bark should read as brown')
    for(const hex of palette.bushes) {
        const [r,g,b]=rgb(hex)
        assert.ok(g>r && g>b)
    }
})

test('water remains blue across shallow and deep regions, lamps are warm HDR emitters', () => {
    for (const hex of Object.values(palette.water)) {
        const [r,g,b]=rgb(hex)
        assert.ok(b>g && g>r,`${hex} should read as blue`)
    }
    for (const hex of [palette.lamp.core,palette.lamp.edge]) {
        const [r,g,b]=rgb(hex)
        assert.ok(r>=g && g>b,'lamps should be warm white / gold, not pink')
    }
    assert.ok(palette.lamp.intensity>1,'light output must exceed bloom threshold')
})

test('natural UV palette retains 24 source slots and distinct wood / cream / metal tones', () => {
    assert.equal(palette.naturalSlots.length,24)
    for (const hex of palette.naturalSlots) assert.match(hex,/^#[0-9a-f]{6}$/i)
    assert.ok(new Set(palette.naturalSlots).size>20)
    const [r,g,b]=rgb(palette.naturalSlots[5])
    assert.ok(r>g && g>b)
})
