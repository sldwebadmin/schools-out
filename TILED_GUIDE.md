# TILED_GUIDE.md — Editing the School's Out map in Tiled

This guide explains how to open the world map in Tiled, move something, and see it reflected in the game. Written for non-developers.

---

## What Tiled is (quick version)

[Tiled](https://mapeditor.org) is a free map editor for games. Our world is stored in `public/map.json` — Tiled can open that file and show you every wall, tree, lamp, and pickup as a coloured object you can drag around. When you save your changes and regenerate, the game reflects them.

---

## 1 — Install Tiled

1. Go to **https://mapeditor.org** and click **Download**.
2. Install normally (Windows installer or zip).
3. Open Tiled. You should see an empty workspace.

---

## 2 — Open the map

1. In Tiled choose **File → Open File or Project…**
2. Navigate to your project folder and open `public/map.json`.
3. Tiled loads the map. You'll see a 4000×3000 world with coloured tiles (the ground) and coloured rectangles/dots on top (walls, trees, lamps, pickups).

### The layers (left panel)

| Layer | Colour | Contains |
|-------|--------|----------|
| `ground` | — | 32×32 zone tiles (meadow, forest, road, etc.) |
| `walls` | red | Collision rectangles — houses, fences, hedges, signs |
| `canopies` | teal | Tree canopy ellipses (drawn above everything) |
| `lamps` | gold | Street lamp positions |
| `objects` | gold | Popsicle and bike pickup spots |

Click the eye icon next to a layer to show/hide it.

---

## 3 — Move a tree (example walkthrough)

1. In the Layers panel, click **canopies** to select that layer.
2. In the toolbar, choose the **Select Objects** tool (arrow icon, shortcut `S`).
3. Click on any teal ellipse to select a tree canopy.
4. Drag it to a new spot, or type exact coordinates in the Properties panel (bottom-left).
5. Press **Ctrl+S** to save `map.json`.

> **Note:** The canopy is just the visual shadow/leaf circle. The trunk (collision box) is a rectangle in the `walls` layer with class `tree`. Move both to move a whole tree.

---

## 4 — See your change in the game

The game reads world data from source files. To apply your Tiled edits you currently need to update the source. The workflow will be automated in a future update — for now, **ask the developer** (Claude Code) to import your edited map.json.

If you just want to preview the ground-zone layout changes, the `ground` tile layer is informational only — the actual ground art is generated procedurally in the same zones, so moving a tile there won't change the art (yet). Moving walls/trees/canopies is what moves visible objects.

---

## 5 — Reference: zone colours in the tile layer

The `ground` layer uses solid-colour tiles from `public/tileset.png` to show which zone each 32×32 cell belongs to. These are only for reference in Tiled; the actual rendered art is richer.

| Tile # | Zone | Colour |
|--------|------|--------|
| 1 | Wild meadow | dark green |
| 2 | Forest floor | very dark green |
| 3 | Neighbourhood lawn | medium green |
| 4 | School grounds | lighter green |
| 5 | Blacktop | blue-purple |
| 6 | Sandbox | tan/yellow |
| 7 | Road | dark purple |
| 8 | Sidewalk | medium purple |
| 9 | Dirt path | brown |
| 10 | Pond | blue |
| 11 | Community garden | dark brown |
| 12 | Basketball court | dark blue-purple |
| 13 | Market plaza | very dark purple |

---

## 6 — Regenerating the map after code changes

If a developer edits the wall layout in `src/world/map.js` (adding a new house, etc.), they regenerate the map with:

```
npm run gen-all
```

This rewrites `public/tileset.png` and `public/map.json`. Open Tiled and reload the file to see the update.

---

## Frequently asked questions

**Can I add a new tree?**
Yes — duplicate an existing `walls` rectangle with type `tree` and a `canopies` ellipse, then ask the developer to import your map.json.

**Can I move the goal ring?**
The goal ring is a game mechanic constant (`GOAL` in `src/engine/constants.js`). It's not in the map — ask the developer to move it.

**Will my edits survive a `npm run gen-map`?**
No — `gen-map` overwrites `public/map.json` from source code. Always tell the developer about map edits you want kept so they can add them to `map.js`.

**What's next?**
A future update will let the game load walls directly from `map.json`, so Tiled edits flow into the game without code changes. For now the JSON is the design reference and Tiled is the visual editor.
