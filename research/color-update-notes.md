# Palette refinement · 2026-09-11

## Intent
Retain MoMoZi's pink/lilac island identity while giving natural objects recognizable, harmonious colors. No layout, content, physics or game-control changes.

## Changes
- Tree trunks: shared warm-brown bark material, isolated from the pink UV palette.
- Tree crowns: three green families (sage, woodland green, yellow-green). Bushes and drifting leaves use coordinating greens / muted ochre.
- Water: blue shallow/deep gradient; existing animated ripples, shoreline and water physics unchanged.
- Benches, fences, bridges and selected furniture: separate 24-slot natural palette for warm wood, cream, brass and slate details. Existing UV coordinates and instancing preserved.
- Lamps: warm cream/gold HDR emission and bloom, visible in daylight; night brings fireflies and feathered warm ground pools. Pools use one instanced draw, not a shadow-casting point light per lamp, and are masked off water.
- Daylight: near-neutral warm light and quieter shadows so brown/green/blue are not overwritten by magenta lighting. Background fog and main ground/architecture/vehicle/UI remain pink/lilac. Night retains cool lavender ambience.

## Maintenance
- Color tokens: `site/sources/data/worldPalette.js`.
- Selective natural materials / generated UV palette: `site/sources/Game/MomoNature.js`.
- Tree, shrub, terrain and leaf colors consume those tokens.
- Emission: `Materials.js`; static lamp ground pools: `World/PoleLights.js`.
- Ambient light and fog: `Cycles/DayCycles.js`.
- Original source files backed up under `color-before/` before editing.

## Verification
- `npm test`: 14 passed; no failures/skips.
- `npm run build:online`: production bundle rebuilt. Existing upstream asset-path / bundle-size build warnings remain; browser resource loading succeeded.
- Browser checks against production port 5179: daylight and night across landing, workshop, social plaza and lab; high and low quality; 390px mobile layout; profile, map, driving.
- Actual material assertions: all three tree types use brown bark, benches use the natural palette, lamps remain visible, night ground glow reaches intended strength.
- Zero page errors, console errors, failed requests or HTTP errors.
- Screenshots and machine-readable report: `color-check/`.
