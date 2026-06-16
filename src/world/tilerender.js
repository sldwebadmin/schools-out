// Tile-based ground renderer — draws the base zone texture for a chunk.
// Called by bake.js when USE_SHEETS is true; detail overlays (roads, field
// lines, boardwalk, etc.) are drawn on top by _bakeOverlays in bake.js.

import { TILE, CHUNK_W }                    from '../engine/constants.js';
import { ZONE }                             from './tiledata.js';
import { getTileset, TILE_W, TILE_H, VARIANTS } from './tilecache.js';
import { getSprite }                        from '../render/spriteLoader.js';

const TPC = Math.ceil(CHUNK_W / TILE); // 32 tiles per chunk side (1024 / 32)

// Deterministic variant picker: hash global tile coords so identical tiles
// across chunk boundaries remain consistent.
function tileVariant(gtx, gty, zone) {
  return ((gtx * 1973) ^ (gty * 9277) ^ (zone * 4099)) & (VARIANTS - 1);
}

// ── Autotile helpers ─────────────────────────────────────────────────────

// 4-neighbor bitmask: N=1, E=2, S=4, W=8 (bit=1 = same-zone neighbor).
// Samples each neighbor at its tile centre to avoid false negatives near
// narrow zone strips (e.g. the 28px sidewalk).
function neighborMask(wx, wy, zone, zoneAtFn) {
  const cx = wx + (TILE >> 1);
  const cy = wy + (TILE >> 1);
  let m = 0;
  if (zoneAtFn(cx,        cy - TILE) === zone) m |= 1; // N
  if (zoneAtFn(cx + TILE, cy       ) === zone) m |= 2; // E
  if (zoneAtFn(cx,        cy + TILE) === zone) m |= 4; // S
  if (zoneAtFn(cx - TILE, cy       ) === zone) m |= 8; // W
  return m;
}

// Diagonal mask: bit0=NE, bit1=NW, bit2=SE, bit3=SW (bit=1 = same zone).
// Only evaluated when all 4 cardinal neighbors are same zone (mask===15).
function diagMask(wx, wy, zone, zoneAtFn) {
  const cx = wx + (TILE >> 1);
  const cy = wy + (TILE >> 1);
  let m = 0;
  if (zoneAtFn(cx + TILE, cy - TILE) === zone) m |= 1; // NE
  if (zoneAtFn(cx - TILE, cy - TILE) === zone) m |= 2; // NW
  if (zoneAtFn(cx + TILE, cy + TILE) === zone) m |= 4; // SE
  if (zoneAtFn(cx - TILE, cy + TILE) === zone) m |= 8; // SW
  return m;
}

// ── LAWN autotile ────────────────────────────────────────────────────────
//
// ME Exteriors Grass_1 — only a subset of tiles exist on disk and they are
// NOT symmetric pairs. Grass_1_8 (edge_w) is the one clean-looking edge.
// All four edge directions and the symmetrically-paired corners are derived
// from it via canvas rotation/flip so every side of every lawn looks the same.
//
//   Canonical sources:
//     ground_lawn_edge_w  (Grass_1_8)  — subtle shadow on left  ← single edge source
//     ground_lawn_corner_ne (Grass_1_4) — NE outer corner        ← single corner source
//     ground_lawn_ic_se   (Grass_1_9)  — SE inner corner         ← single ic source
//
//   Rotation convention (rot degrees CW on screen):
//     rot 0   → shadow stays on left  (edge_w)
//     rot 90  → shadow moves to top   (edge_n: road to north)
//     rot 270 → shadow moves to bottom (edge_s: road to south)
//     flipH   → shadow moves to right (edge_e: road to east)

const LAWN_MASK_KEY = {
   3: 'ground_lawn_corner_sw',  // N+E connected, SW exposed
   6: 'ground_lawn_corner_nw',  // E+S connected, NW exposed
   9: 'ground_lawn_corner_se',  // N+W connected, SE exposed
  12: 'ground_lawn_corner_ne',  // S+W connected, NE exposed
   7: 'ground_lawn_edge_w',     // N+E+S, W exposed
  11: 'ground_lawn_edge_s',     // N+E+W, S exposed
  13: 'ground_lawn_edge_e',     // N+S+W, E exposed
  14: 'ground_lawn_edge_n',     // E+S+W, N exposed
};

// {src, rot, flipH, flipV} — rot and flip are mutually exclusive per entry.
const LAWN_FLIP = {
  'ground_lawn_edge_e':    { src: 'ground_lawn_edge_w',    rot: 0,   flipH: true,  flipV: false },
  'ground_lawn_edge_n':    { src: 'ground_lawn_edge_w',    rot: 90,  flipH: false, flipV: false },
  'ground_lawn_edge_s':    { src: 'ground_lawn_edge_w',    rot: 270, flipH: false, flipV: false },
  'ground_lawn_corner_nw': { src: 'ground_lawn_corner_ne', rot: 0,   flipH: true,  flipV: false },
  'ground_lawn_corner_se': { src: 'ground_lawn_corner_ne', rot: 0,   flipH: false, flipV: true  },
  'ground_lawn_corner_sw': { src: 'ground_lawn_corner_ne', rot: 0,   flipH: true,  flipV: true  },
  'ground_lawn_ic_sw':     { src: 'ground_lawn_ic_se',     rot: 0,   flipH: true,  flipV: false },
  'ground_lawn_ic_ne':     { src: 'ground_lawn_ic_se',     rot: 0,   flipH: false, flipV: true  },
  'ground_lawn_ic_nw':     { src: 'ground_lawn_ic_se',     rot: 0,   flipH: true,  flipV: true  },
};

function drawLawnTile(g, key, wx, wy) {
  const flip = LAWN_FLIP[key];
  if (!flip) {
    const img = getSprite(key);
    if (img) g.drawImage(img, 0, 0, TILE_W, TILE_H, wx, wy, TILE, TILE);
    return;
  }
  const img = getSprite(flip.src);
  if (!img) return;
  g.save();
  if (flip.rot) {
    // rotate(π/2) CW on screen: left shadow → top    (edge_n)
    // rotate(-π/2) CCW on screen: left shadow → bottom (edge_s)
    if (flip.rot === 90)  { g.translate(wx + TILE, wy);        g.rotate( Math.PI / 2); }
    if (flip.rot === 270) { g.translate(wx,        wy + TILE); g.rotate(-Math.PI / 2); }
    g.drawImage(img, 0, 0, TILE_W, TILE_H, 0, 0, TILE, TILE);
  } else {
    g.translate(wx + (flip.flipH ? TILE : 0), wy + (flip.flipV ? TILE : 0));
    g.scale(flip.flipH ? -1 : 1, flip.flipV ? -1 : 1);
    g.drawImage(img, 0, 0, TILE_W, TILE_H, 0, 0, TILE, TILE);
  }
  g.restore();
}

function lawnKey(wx, wy, v, zoneAtFn) {
  const mask = neighborMask(wx, wy, ZONE.LAWN, zoneAtFn);

  const edgeKey = LAWN_MASK_KEY[mask];
  if (edgeKey) return edgeKey;

  if (mask === 15) {
    const dg      = diagMask(wx, wy, ZONE.LAWN, zoneAtFn);
    const missing = (~dg) & 0xf;
    const cnt = (missing & 1) + ((missing >> 1) & 1) +
                ((missing >> 2) & 1) + ((missing >> 3) & 1);
    if (cnt === 1) {
      if (missing & 4) return 'ground_lawn_ic_se';
      if (missing & 8) return 'ground_lawn_ic_sw';
      if (missing & 1) return 'ground_lawn_ic_ne';
      if (missing & 2) return 'ground_lawn_ic_nw';
    }
  }

  return 'ground_lawn_' + (v + 1);
}

// ── Post-overlay border pass ─────────────────────────────────────────────
//
// Re-draws only LAWN edge/corner/inner-corner tiles, called AFTER bake.js
// overlays (road, sidewalk) so the ME transition sprites appear on top of
// any procedural fills that overlap the tile boundaries.

export function drawAutotileEdges(g, wx0, wy0, zoneAtFn) {
  g.imageSmoothingEnabled = false;
  for (let ty = 0; ty < TPC; ty++) {
    for (let tx = 0; tx < TPC; tx++) {
      const wx = wx0 + tx * TILE;
      const wy = wy0 + ty * TILE;
      if (zoneAtFn(wx + (TILE >> 1), wy + (TILE >> 1)) !== ZONE.LAWN) continue;

      const gtx = tx + ((wx0 / TILE) | 0);
      const gty = ty + ((wy0 / TILE) | 0);
      const v   = tileVariant(gtx, gty, ZONE.LAWN);
      const key = lawnKey(wx, wy, v, zoneAtFn);
      if (key === 'ground_lawn_' + (v + 1)) continue;

      drawLawnTile(g, key, wx, wy);
    }
  }
}

// ── Main draw function ───────────────────────────────────────────────────

export function drawTiledGround(g, wx0, wy0, zoneAtFn) {
  const ts = getTileset();
  if (!ts) return; // tileset not built in Node/test environment

  g.imageSmoothingEnabled = false;

  for (let ty = 0; ty < TPC; ty++) {
    for (let tx = 0; tx < TPC; tx++) {
      const wx   = wx0 + tx * TILE;
      const wy   = wy0 + ty * TILE;
      const zone = zoneAtFn(wx, wy);
      if (zone < 1) continue;

      const gtx = tx + ((wx0 / TILE) | 0);
      const gty = ty + ((wy0 / TILE) | 0);
      const v   = tileVariant(gtx, gty, zone);

      if (zone === ZONE.LAWN) {
        const key = lawnKey(wx, wy, v, zoneAtFn);
        drawLawnTile(g, key, wx, wy);
        continue;
      }

      const srcX = v * TILE_W;
      const srcY = (zone - 1) * TILE_H;
      g.drawImage(ts, srcX, srcY, TILE_W, TILE_H, wx, wy, TILE, TILE);
    }
  }
}
