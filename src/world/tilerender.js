// Tile-based ground renderer — draws the base zone texture for a chunk.
// Called by bake.js when USE_SHEETS is true; detail overlays (roads, field
// lines, boardwalk, etc.) are drawn on top by _bakeOverlays in bake.js.

import { TILE, CHUNK_W } from '../engine/constants.js';
import { zoneAt }        from './tiledata.js';
import { getTileset, TILE_W, TILE_H, VARIANTS } from './tilecache.js';

// Tiles-per-chunk side — ceiling handles chunks that touch world edges
const TPC = Math.ceil(CHUNK_W / TILE); // 32 tiles per side (1024 / 32)

// Deterministic, framerate-independent variant picker: hash tile grid coords
function tileVariant(tx, ty, zone){
  // Wang-style: XOR of two large primes gives good distribution without PRNG overhead
  return ((tx * 1973) ^ (ty * 9277) ^ (zone * 4099)) & (VARIANTS - 1);
}

export function drawTiledGround(g, wx0, wy0){
  const ts = getTileset();
  if(!ts) return; // tileset not yet built (Node/test environment)

  for(let ty = 0; ty < TPC; ty++){
    for(let tx = 0; tx < TPC; tx++){
      const wx = wx0 + tx * TILE;
      const wy = wy0 + ty * TILE;
      const zone = zoneAt(wx, wy);
      if(zone < 1) continue;

      const v    = tileVariant(tx + (wx0 / TILE) | 0, ty + (wy0 / TILE) | 0, zone);
      const srcX = v    * TILE_W;
      const srcY = (zone - 1) * TILE_H;

      g.drawImage(ts, srcX, srcY, TILE_W, TILE_H, wx, wy, TILE, TILE);
    }
  }
}
