# Art Pipeline — School's Out

All external art comes from the **Limezu Modern Exteriors** family of packs
(commercial license, purchased). This document defines how a sprite travels
from a purchased PNG to pixels on screen, and how every future section of
the world should be built the same way.

---

## Pack inventory

| Pack constant  | Status           | Public folder       | Contents                              |
|----------------|------------------|---------------------|---------------------------------------|
| `ME_Exteriors` | Active           | `public/sprites/me/`| Buildings, terrain, props, fences     |
| `ME_Interiors` | Planned          | `public/sprites/me_int/` | Interior backgrounds & furniture |
| `ME_Characters`| Planned          | `public/sprites/me_chr/` | Player, NPCs, Biscuit walk cycles |

Source files (for reference only — not committed): `assets/ModernExteriors/`  
License: see `assets/CREDITS.md` and `assets/ModernExteriors/Modern_Exteriors_License.pdf`.

---

## How to add a sprite (4 steps)

1. **Copy the PNG** into `public/sprites/me/` (or the appropriate pack folder).
2. **Add a row** in `src/render/spriteRegistry.js` with `status: 'active'`.  
   Give it a stable `key` (snake_case). Never rename a key once it's used in a
   bake function — the WeakMap cache is keyed by wall object reference and
   populated at startup.
3. **Call `getSprite(key)`** from `src/render/spriteLoader.js` inside the
   relevant bake function in `src/render/buildsprites.js`.
4. **Record the source** in `assets/CREDITS.md` (pack name, author, license).

That's the entire pipeline. The loader reads the registry automatically —
no other files need touching.

---

## File roles

| File | Role |
|------|------|
| `src/render/spriteRegistry.js` | **Master data table.** One row per sprite: key, file, pack, type, status, region, covers. The `covers` field names the procedural code path this sprite will eventually retire. |
| `src/render/spriteLoader.js`   | **Loader.** Top-level `await` at startup; loads every `status:'active'` entry from the registry. Exports `getSprite(key)`. Pack → path routing lives here. |
| `src/render/buildsprites.js`   | **Bake functions.** One `_bake*()` per wall type. Calls `getSprite()`, draws the sprite onto an offscreen canvas, returns `{ canvas, ox, oy }`. If `getSprite` returns `null`, the function returns `null` → procedural fallback in `props.js`. |
| `src/render/props.js`          | **Per-frame draw.** Calls `getBuildingSprite(w)` → if truthy, blits the canvas. No sprite logic here; just the blit. |
| `src/world/bake.js`            | **Ground bake.** Currently calls `drawTiledGround` (tilecache.js) for the `USE_SHEETS` path. Will switch to ME terrain tiles when ground sprites are activated. |

---

## Bake function conventions

Every `_bake*()` function follows the same contract:

- **Input:** a wall object `w` from `walls.js` (has `.x .y .w .h .type .hue`, etc.)
- **Output:** `{ canvas: OffscreenCanvas, ox: number, oy: number }` or `null`
- `ox`, `oy` are pixel offsets from `(w.x, w.y)` to the sprite canvas top-left
- Bottom-centre alignment is the default:  
  `ox = Math.round(w.w / 2) - spriteHalfWidth`  
  `oy = w.h - spriteHeight`
- `ctx.imageSmoothingEnabled = false` always — pixel grid must stay sharp
- One bake per wall; result cached in a `WeakMap`. Bakes run once at startup
  (`buildBuildingSprites(walls)` in `main.js`), not per frame.

---

## Region–tileset map

Which game region uses which sprites. "Planned" means the sprite is in the
registry with `status:'planned'` but the PNG isn't copied yet.

| Region (tiledata.js regionAt) | Building sprite(s)              | Ground sprite(s) — planned     |
|-------------------------------|---------------------------------|--------------------------------|
| Maple Court (neighbourhood)   | `house_country`, `house_2–7`    | `ground_meadow` (grass)        |
| School District               | `school_facade`                 | `ground_blacktop`, `ground_meadow` |
| Maple Mart District           | `market_mall`, `market_med_1–6` | `ground_blacktop`, `ground_sidewalk` |
| Treehouse Village             | `treehouse`                     | `ground_meadow`, `ground_forest` |
| Whispering Woods              | —                               | `ground_forest`                |
| Maple Park                    | —                               | `ground_meadow`, `ground_sandbox` |
| Athletic Fields               | `bball_net`, `soccer_net`       | `ground_blacktop`              |
| Construction Site             | —                               | `ground_dirt`                  |
| Great Waterfront Lake         | —                               | `ground_sidewalk` (boardwalk)  |
| All (fences)                  | `fence_tl/tm/tr/ml/mr/bl/bm/br` | —                              |

---

## Ground autotile system

LAWN (and future zones) use a 4-neighbor autotile system implemented in
`tilerender.js`. For each tile at world position `(wx, wy)`:

1. **`neighborMask(wx, wy, zone)`** — samples the 4 cardinal neighbours at
   their tile centres (avoiding false negatives near narrow zones like the
   28 px sidewalk strip). Returns a 4-bit bitmask: **N=1, E=2, S=4, W=8**
   where a bit is **1 if that neighbour is the same zone**.

2. **Tile selection** by bitmask value:

   | Bitmask | Connected sides | Exposed | Tile | Key |
   |---------|-----------------|---------|------|-----|
   | 3  | N+E | SW corner | Grass_1_15 | `ground_lawn_corner_sw` |
   | 6  | E+S | NW corner | Grass_1_3  | `ground_lawn_corner_nw` |
   | 9  | N+W | SE corner | Grass_1_14 | `ground_lawn_corner_se` |
   | 12 | S+W | NE corner | Grass_1_4  | `ground_lawn_corner_ne` |
   | 7  | N+E+S | W edge  | Grass_1_8  | `ground_lawn_edge_w`    |
   | 11 | N+E+W | S edge  | Grass_1_18 | `ground_lawn_edge_s`    |
   | 13 | N+S+W | E edge  | Grass_1_7  | `ground_lawn_edge_e`    |
   | 14 | E+S+W | N edge  | Grass_1_19 | `ground_lawn_edge_n`    |
   | 15 | all   | interior| Grass_1_22 (+ 3 variant sets) | `ground_lawn_1–4` |

3. **Inner corners** — when bitmask is 15 (all cardinal same) but exactly
   one diagonal neighbour is a different zone, **`diagMask()`** detects it:
   NE/NW/SE/SW inner corner tiles show a small notch in the corresponding
   corner (Grass_1 tiles 11/12/9/10). Two or more missing diagonals → flat fill.

4. **Fallback** — any bitmask not in the table (corridors, isolated,
   multi-diagonal concave) uses the zone's flat interior fill. Non-ME zones
   skip the autotile step entirely and blit from the pre-built tilecache.

**Tile numbering convention (ME Exteriors Grass_1 / 22-tile set):**
The last tile (22) is the true interior fill. The preceding group (17–21)
contains inner-corner variants and the "other terrain" fill. Tiles 1–16
are edge/corner/transition tiles. Always visually verify a new tile before
assigning it to a bitmask — do not assume ordering.

---

## USE_SHEETS retirement checklist

`USE_SHEETS` in `src/engine/constants.js` gates all three rendering layers.
Remove it only when all three layers are fully ME-based:

- [x] **Buildings** — `buildsprites.js` fully on `getSprite()`. Procedural code
      stays as fallback in `props.js` (returns null → procedural); can be
      removed once every wall type has a registry entry.
- [ ] **Ground tiles** — `bake.js` + `tilecache.js` still procedural for all
      15 zone types. Replace each zone's procedural fill with the matching
      `ground_*` registry entry.
- [ ] **Characters** — `sheet.js` still procedural (player, 3 NPCs, Biscuit).
      Replace once ME_Characters pack is purchased and walk-cycle layout is
      confirmed.

**When all three boxes are checked:**
1. Set `USE_SHEETS = true` permanently (remove the constant and all `if(USE_SHEETS)` guards).
2. Delete the procedural draw paths in `props.js`, `bake.js`, and `sheet.js`.
3. Remove `USE_SHEETS` from `constants.js`.
4. Update this document.

---

## Adding a new region/zone

1. Define the zone in `tiledata.js` (add to the zone constant list and `regionAt()`).
2. Choose which ME Exteriors terrain tiles cover it. Add `status:'planned'`
   registry entries now so the roadmap is documented.
3. When ready to activate: copy PNGs → flip to `status:'active'` → wire into
   `bake.js` ground draw → remove the procedural fill for that zone.

No other files need to know about the new zone until step 3.
