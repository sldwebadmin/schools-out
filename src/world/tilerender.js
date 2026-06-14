// Tile-based ground renderer — draws the base zone texture for a chunk.
// Called by bake.js when USE_SHEETS is true; detail overlays (roads, field
// lines, boardwalk, etc.) are drawn on top by _bakeOverlays in bake.js.

import { TILE, CHUNK_W }                    from '../engine/constants.js';
import { zoneAt, ZONE }                     from './tiledata.js';
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
function neighborMask(wx, wy, zone) {
  const cx = wx + (TILE >> 1);
  const cy = wy + (TILE >> 1);
  let m = 0;
  if (zoneAt(cx,        cy - TILE) === zone) m |= 1; // N
  if (zoneAt(cx + TILE, cy       ) === zone) m |= 2; // E
  if (zoneAt(cx,        cy + TILE) === zone) m |= 4; // S
  if (zoneAt(cx - TILE, cy       ) === zone) m |= 8; // W
  return m;
}

// Diagonal mask: bit0=NE, bit1=NW, bit2=SE, bit3=SW (bit=1 = same zone).
// Only evaluated when all 4 cardinal neighbors are same zone (mask===15).
function diagMask(wx, wy, zone) {
  const cx = wx + (TILE >> 1);
  const cy = wy + (TILE >> 1);
  let m = 0;
  if (zoneAt(cx + TILE, cy - TILE) === zone) m |= 1; // NE
  if (zoneAt(cx - TILE, cy - TILE) === zone) m |= 2; // NW
  if (zoneAt(cx + TILE, cy + TILE) === zone) m |= 4; // SE
  if (zoneAt(cx - TILE, cy + TILE) === zone) m |= 8; // SW
  return m;
}

// ── LAWN autotile ────────────────────────────────────────────────────────
//
// ME Exteriors Grass_1 tile assignments (verified by visual inspection):
//
//   Outer corners (2 adjacent cardinal sides exposed):
//     bitmask  3 (N+E connected, SW exposed) → Grass_1_15  ground_lawn_corner_sw
//     bitmask  6 (E+S connected, NW exposed) → Grass_1_3   ground_lawn_corner_nw
//     bitmask  9 (N+W connected, SE exposed) → Grass_1_14  ground_lawn_corner_se
//     bitmask 12 (S+W connected, NE exposed) → Grass_1_4   ground_lawn_corner_ne
//
//   Edge tiles (exactly 1 cardinal side exposed):
//     bitmask  7 (N+E+S, W exposed)          → Grass_1_8   ground_lawn_edge_w
//     bitmask 11 (N+E+W, S exposed)          → Grass_1_18  ground_lawn_edge_s
//     bitmask 13 (N+S+W, E exposed)          → Grass_1_7   ground_lawn_edge_e
//     bitmask 14 (E+S+W, N exposed)          → Grass_1_19  ground_lawn_edge_n
//
//   Inner corners (all NSEW same, exactly 1 diagonal exposed):
//     NE diagonal → Grass_1_11  ground_lawn_ic_ne
//     NW diagonal → Grass_1_12  ground_lawn_ic_nw
//     SE diagonal → Grass_1_9   ground_lawn_ic_se
//     SW diagonal → Grass_1_10  ground_lawn_ic_sw
//
//   Interior fill (all neighbors same):
//     variant 0–3 → ground_lawn_1 … ground_lawn_4  (Grass_1/2/3/4 flat fills)
//
//   All other bitmasks (corridors, isolated, T-junctions with only 1 NSEW
//   neighbor): fall back to interior flat fill.

const LAWN_MASK_KEY = {
   3: 'ground_lawn_corner_sw',
   6: 'ground_lawn_corner_nw',
   9: 'ground_lawn_corner_se',
  12: 'ground_lawn_corner_ne',
   7: 'ground_lawn_edge_w',
  11: 'ground_lawn_edge_s',
  13: 'ground_lawn_edge_e',
  14: 'ground_lawn_edge_n',
};

function lawnKey(wx, wy, v) {
  const mask = neighborMask(wx, wy, ZONE.LAWN);

  // Outer corner or edge: direct lookup.
  const edgeKey = LAWN_MASK_KEY[mask];
  if (edgeKey) return edgeKey;

  // Full interior — check for inner corners (concave grass indentations).
  if (mask === 15) {
    const dg      = diagMask(wx, wy, ZONE.LAWN);
    const missing = (~dg) & 0xf; // bits set where diagonal ≠ same zone
    const cnt = (missing & 1) + ((missing >> 1) & 1) +
                ((missing >> 2) & 1) + ((missing >> 3) & 1);
    if (cnt === 1) {
      if (missing & 4) return 'ground_lawn_ic_se';
      if (missing & 8) return 'ground_lawn_ic_sw';
      if (missing & 1) return 'ground_lawn_ic_ne';
      if (missing & 2) return 'ground_lawn_ic_nw';
    }
  }

  // Corridors, isolated, multiple-diagonal inner corners: flat fill.
  return 'ground_lawn_' + (v + 1);
}

// ── Main draw function ───────────────────────────────────────────────────

export function drawTiledGround(g, wx0, wy0) {
  const ts = getTileset();
  if (!ts) return; // tileset not built in Node/test environment

  g.imageSmoothingEnabled = false;

  for (let ty = 0; ty < TPC; ty++) {
    for (let tx = 0; tx < TPC; tx++) {
      const wx   = wx0 + tx * TILE;
      const wy   = wy0 + ty * TILE;
      const zone = zoneAt(wx, wy);
      if (zone < 1) continue;

      // Global tile coords for deterministic variant hash across chunk seams.
      const gtx = tx + ((wx0 / TILE) | 0);
      const gty = ty + ((wy0 / TILE) | 0);
      const v   = tileVariant(gtx, gty, zone);

      // LAWN: autotile selects the correct ME Grass_1 single per position.
      if (zone === ZONE.LAWN) {
        const key = lawnKey(wx, wy, v);
        const img = getSprite(key);
        if (img) {
          g.drawImage(img, 0, 0, TILE_W, TILE_H, wx, wy, TILE, TILE);
          continue;
        }
        // sprite not loaded — fall through to tilecache flat-fill below
      }

      // All other zones (and LAWN fallback): blit from pre-built tilecache.
      const srcX = v * TILE_W;
      const srcY = (zone - 1) * TILE_H;
      g.drawImage(ts, srcX, srcY, TILE_W, TILE_H, wx, wy, TILE, TILE);
    }
  }
}
