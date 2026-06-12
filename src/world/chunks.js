// Chunk-based ground renderer.
// The world is split into 1024×1024 chunks baked on demand.
// Each chunk runs the full bake.js drawing code but clips to its own region,
// so every chunk is visually identical to that slice of the original single-canvas bake.

import { WORLD, CHUNK_W, VW, VH } from '../engine/constants.js';
import { bakeCanvas } from '../engine/utils.js';
import { bakeGroundInto } from './bake.js';

const COLS = Math.ceil(WORLD.w / CHUNK_W); // 8 for 8192-wide world
const ROWS = Math.ceil(WORLD.h / CHUNK_W); // 8
const MAX_CACHED = 12;

const cache = new Map(); // "cx,cy" → offscreen canvas

function bakeChunk(cx, cy) {
  const [canvas, g] = bakeCanvas(CHUNK_W, CHUNK_W);
  const wx0 = cx * CHUNK_W, wy0 = cy * CHUNK_W;
  g.save();
  // Clip so world draws outside this chunk are discarded
  g.beginPath(); g.rect(0, 0, CHUNK_W, CHUNK_W); g.clip();
  // Translate so bakeGroundInto can use world coordinates unchanged
  g.translate(-wx0, -wy0);
  bakeGroundInto(g, wx0, wy0);
  g.restore();
  return canvas;
}

export function initChunks() {
  cache.clear();
}

function chunkKey(cx, cy) { return `${cx},${cy}`; }

function getChunk(cx, cy) {
  if(cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return null;
  const k = chunkKey(cx, cy);
  if(!cache.has(k)) cache.set(k, bakeChunk(cx, cy));
  return cache.get(k);
}

export function drawChunks(ctx, camX, camY) {
  const cxMin = Math.max(0, Math.floor(camX / CHUNK_W));
  const cyMin = Math.max(0, Math.floor(camY / CHUNK_W));
  const cxMax = Math.min(COLS - 1, Math.floor((camX + VW) / CHUNK_W));
  const cyMax = Math.min(ROWS - 1, Math.floor((camY + VH) / CHUNK_W));
  for(let cy = cyMin; cy <= cyMax; cy++) {
    for(let cx = cxMin; cx <= cxMax; cx++) {
      const chunk = getChunk(cx, cy);
      if(chunk) ctx.drawImage(chunk, cx * CHUNK_W - camX, cy * CHUNK_W - camY);
    }
  }
}

export function evictChunks(camX, camY) {
  if(cache.size <= MAX_CACHED) return;
  const camCx = Math.floor(camX / CHUNK_W);
  const camCy = Math.floor(camY / CHUNK_W);
  for(const k of cache.keys()) {
    const [cx, cy] = k.split(',').map(Number);
    if(Math.abs(cx - camCx) > 2 || Math.abs(cy - camCy) > 2) cache.delete(k);
  }
}

// Exported for tests
export function getCacheSize() { return cache.size; }
export function getCachedKeys() { return [...cache.keys()]; }
