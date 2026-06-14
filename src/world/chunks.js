// Chunk-based ground renderer.
// Each section has its own chunk cache keyed by section ID.
// Chunks are baked on demand using the active section's bakeInto function.

import { CHUNK_W, VW, VH } from '../engine/constants.js';
import { bakeCanvas } from '../engine/utils.js';
import { bakeGroundInto } from './bake.js';

const caches = new Map();  // sectionKey → Map<"cx,cy" → canvas>
let currentKey = '__world__';
let currentBakeInto = bakeGroundInto;
let COLS = 8, ROWS = 8;
const MAX_CACHED = 12;

export function setSection(key, bakeIntoFn, sectionW, sectionH) {
  currentKey = key;
  currentBakeInto = bakeIntoFn || bakeGroundInto;
  COLS = Math.ceil(sectionW / CHUNK_W);
  ROWS = Math.ceil(sectionH / CHUNK_W);
  if (!caches.has(key)) caches.set(key, new Map());
}

function activeCache() {
  if (!caches.has(currentKey)) caches.set(currentKey, new Map());
  return caches.get(currentKey);
}

function bakeChunk(cx, cy) {
  const [canvas, g] = bakeCanvas(CHUNK_W, CHUNK_W);
  const lx0 = cx * CHUNK_W, ly0 = cy * CHUNK_W;
  g.save();
  g.beginPath(); g.rect(0, 0, CHUNK_W, CHUNK_W); g.clip();
  g.translate(-lx0, -ly0);
  currentBakeInto(g, lx0, ly0);
  g.restore();
  return canvas;
}

export function initChunks() {
  activeCache().clear();
}

function chunkKey(cx, cy) { return `${cx},${cy}`; }

function getChunk(cx, cy) {
  if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return null;
  const cache = activeCache();
  const k = chunkKey(cx, cy);
  if (!cache.has(k)) cache.set(k, bakeChunk(cx, cy));
  return cache.get(k);
}

export function drawChunks(ctx, camX, camY) {
  const cxMin = Math.max(0, Math.floor(camX / CHUNK_W));
  const cyMin = Math.max(0, Math.floor(camY / CHUNK_W));
  const cxMax = Math.min(COLS - 1, Math.floor((camX + VW) / CHUNK_W));
  const cyMax = Math.min(ROWS - 1, Math.floor((camY + VH) / CHUNK_W));
  for (let cy = cyMin; cy <= cyMax; cy++) {
    for (let cx = cxMin; cx <= cxMax; cx++) {
      const chunk = getChunk(cx, cy);
      if (chunk) ctx.drawImage(chunk, cx * CHUNK_W - camX, cy * CHUNK_W - camY);
    }
  }
}

export function evictChunks(camX, camY) {
  const cache = activeCache();
  if (cache.size <= MAX_CACHED) return;
  const camCx = Math.floor(camX / CHUNK_W);
  const camCy = Math.floor(camY / CHUNK_W);
  for (const k of cache.keys()) {
    const [cx, cy] = k.split(',').map(Number);
    if (Math.abs(cx - camCx) > 2 || Math.abs(cy - camCy) > 2) cache.delete(k);
  }
}

// Exported for tests
export function getCacheSize() { return activeCache().size; }
export function getCachedKeys() { return [...activeCache().keys()]; }
