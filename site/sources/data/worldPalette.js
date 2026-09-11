// Pink/lilac remains the island identity. Natural objects get their own material
// palette, instead of inheriting the all-pink shared UV palette.
export const worldPalette = {
    bark: '#916342',
    trees: {
        birch: ['#7c954f', '#becf7c'],
        oak: ['#4c815c', '#91bc79'],
        cherry: ['#628c58', '#aac67e']
    },
    bushes: ['#65876b', '#a8bf88'],
    fallenLeaves: ['#7e985b', '#c7b86d'],
    water: { shallow: '#65b4d1', deep: '#245f99' },
    lamp: { core: '#fff1c9', edge: '#efa64c', intensity: 2.4 },
    // Matching slots in the original 128×4 palette; UVs and model detail stay intact.
    naturalSlots: [
        '#85818e', '#ecd8ae', '#69513e', '#70bbd5',
        '#cbc5bc', '#594839', '#59666b', '#e7c6a8',
        '#caaa62', '#8fa477', '#d39a79', '#9f8262',
        '#acb46b', '#ae9b79', '#b78055', '#d79c62',
        '#d17c65', '#f7e9dd', '#eac18c', '#b46472',
        '#b798cf', '#e3a5c3', '#362e2b', '#fff4e6'
    ]
}
