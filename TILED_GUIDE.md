# TILED_GUIDE.md — Editing the Neighborhood in Tiled

This is your map editor workflow. The neighborhood (`public/neighborhood.json`) is now the single source of truth. Edit it in Tiled, save, refresh the browser — your changes appear immediately.

---

## 1 — Install Tiled

Go to **https://www.mapeditor.org** → Download. Install as normal. Open it once to confirm it works.

---

## 2 — Open the neighborhood map

1. In Tiled: **File → Open File or Project…**
2. Navigate to your `SchoolsOut` folder, then into `public/`, and open **`neighborhood.json`**.
3. Tiled loads the map. You'll see a 5632 × 3072 world (176 × 96 tiles at 32 px each).

> **Tip:** Tiled will ask for the tileset when you first open. It should find `neighborhood.tsx` automatically — if not, point it to `public/neighborhood.tsx`.

---

## 3 — What you're looking at

### Ground layer (`ground`)

The ground is painted with ME terrain tiles. What you see is close to what the game renders:

| Tile colour | Means |
|-------------|-------|
| Green       | Lawn (grass) |
| Dark purple | Road |
| Medium purple | Sidewalk |

The game engine adds edge-transition tiles automatically at zone boundaries, so you don't need to paint those corners yourself.

### Objects layer (`objects`)

Everything that isn't ground is an **object** on this layer:

| Class | What it is |
|-------|-----------|
| `wall` (type=house) | A building — property `hue` sets which sprite |
| `wall` (type=fence) | A fence segment — `hop:true` means the player can jump over it |
| `lamp` | Street lamp position (point) |
| `door` | Doorway that takes the player into an interior |
| `transition` | Map boundary (locks the player out with a "Coming soon!" message) |
| `pickup` | Where a popsicle/pickup spawns (point) |

Click the eye icon next to a layer to show/hide it.

---

## 4 — Move a building (example walkthrough)

1. Click the **objects** layer in the Layers panel (right side).
2. Press **S** (Select Objects tool).
3. Click on a house rectangle — it highlights in blue.
4. Drag it to a new position, or type exact coordinates in the Properties panel.
5. Press **Ctrl+S** to save.
6. Switch back to the browser running `npm run dev` and press **F5** — your building moved.

---

## 5 — Paint a new zone (example: extend a road)

1. Click the **ground** layer.
2. Press **T** (Stamp Brush tool).
3. In the **Tilesets** panel, click the road tile (dark purple).
4. Click/drag on the map to paint road cells.
5. **Ctrl+S** → **F5** in the browser to see the result.

The grass-to-road edge transitions (the subtle shadowed border where grass meets pavement) are generated automatically by the game engine at chunk-bake time, so you'll only see them in-game, not in Tiled.

---

## 6 — Add a new object

### New fence segment

1. Click the **objects** layer.
2. Press **R** (Insert Rectangle).
3. Draw the rectangle where you want the fence.
4. In the **Properties** panel, set:
   - **Class** → `wall`
   - Add custom property `type` (string) → `fence`
   - Add custom property `hop` (bool) → `true` (player can jump over)
5. **Ctrl+S** → **F5**.

### New pickup spot

1. Click the **objects** layer.
2. Press **I** (Insert Point) — top toolbar.
3. Click the spot on the map.
4. Set **Class** → `pickup`.
5. **Ctrl+S** → **F5**.

---

## 7 — See changes live (dev) vs. deployed

| Workflow | How |
|----------|-----|
| `npm run dev` (local) | Edit in Tiled → save → **F5** in browser. Instant. |
| Deployed to GitHub Pages | After saving, run `git add public/neighborhood.json && git commit -m "Update neighborhood map" && git push`. The live URL updates in ~1 min. |

---

## 8 — House sprite colours (hue reference)

The `hue` property on a house wall tells the engine which sprite to draw:

| `hue` value | Sprite |
|-------------|--------|
| `#6b4a76`  | Country House (no banisters) — purple-lot |
| `#3a6e7a`  | Modern House — teal-lot |
| `#7a6e3a`  | Japanese House — olive-lot |
| `#7a5c34`  | Villa 1 (brown roof) |
| `#8b3a2a`  | Villa 3 (red roof) |
| `#2a5a8b`  | Villa 4 (blue roof) |

---

## 9 — What NOT to edit in Tiled

| Thing | Where it really lives | How to change it |
|-------|-----------------------|------------------|
| Goal ring position | `src/engine/constants.js` `GOAL` | Edit constants.js |
| Player spawn point | `src/engine/constants.js` `SPAWN` | Edit constants.js |
| Dog nap spots | `src/engine/constants.js` `NAPS` | Edit constants.js |
| Road stripe/crosswalk/manhole art | `src/world/neighborhoodLoader.js` `bakeInto()` | Edit the JS code |
| Interior house layout | `src/world/interiorMaps.js` | Edit the JS code |

---

## 10 — Regenerating from scratch (nuclear option)

The export script `scripts/gen-neighborhood.mjs` re-generates `public/neighborhood.json` from the hardcoded constants in the script. **This will overwrite your Tiled edits.** Only use it if you want to start fresh from the code baseline:

```
node scripts/gen-neighborhood.mjs --force
```

You almost never need this. Edit in Tiled instead.
