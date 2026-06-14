// Pre-baked building sprite canvases using Modern Exteriors (Limezu) tiles.
// Images are loaded by spriteLoader.js (top-level await) before this module
// is used — getSprite() returns null for any missing file, triggering the
// procedural fallback in props.js drawWall.
//
// ox, oy: pixel offset from (w.x, w.y) to the sprite canvas top-left.
// Blit:   ctx.drawImage(sp.canvas, snap(w.x - cam.x + sp.ox), snap(w.y - cam.y + sp.oy))

import { bakeCanvas } from '../engine/utils.js';
import { getSprite }  from './spriteLoader.js';

const BUILDING_TYPES = new Set([
  'house', 'school', 'market', 'shack', 'treehouse',
  'fence', 'hoop', 'goal',
]);
const _cache = new WeakMap();

// House variant assignment — two estate-style + five bungalows.
// Keyed by wall hue; player's house always gets Country_House.
const HOUSE_VARIANT = {
  '#6b4a76': 'house_country_nb',  // purple lot  → estate (no banisters)
  '#5c6f9e': 'house_2',           // blue lot     → bungalow 2
  '#4f6b5e': 'house_3',           // green lot    → bungalow 3
  '#8a6f3e': 'house_4',           // tan lot      → bungalow 4
  '#56406f': 'house_6',           // plum lot     → bungalow 6
  '#7a5560': 'house_7',           // rose lot     → bungalow 7
};

// ── Public API ───────────────────────────────────────────────────────────

export function buildBuildingSprites(walls) {
  for (const w of walls) {
    if (!BUILDING_TYPES.has(w.type) || w.ghost) continue;
    try {
      const sp = _bakeSprite(w);
      if (sp) _cache.set(w, sp);
    } catch (e) {
      console.error('[buildsprites] bake failed for type=' + w.type, e);
    }
  }
}

export function getBuildingSprite(w) {
  return _cache.get(w) ?? null;
}

// ── Dispatch ─────────────────────────────────────────────────────────────

function _bakeSprite(w) {
  switch (w.type) {
    case 'house':     return _bakeHouse(w);
    case 'school':    return _bakeSchool(w);
    case 'market':    return _bakeMarket(w);
    case 'treehouse': return _bakeTreehouse(w);
    case 'fence':     return _bakeFence(w);
    case 'hoop':      return _bakeHoop(w);
    case 'goal':      return _bakeSoccerGoal(w);
  }
  return null; // shack → procedural
}

// ── HOUSE ─────────────────────────────────────────────────────────────────
// Two architectural styles:
//   • Estate (Country_House, 576×512) — player's house + one neighbour.
//     Drawn at native size; visually larger than the collision footprint.
//   • Bungalow (Toy_House, 128×160 → 2× = 256×320) — remaining five lots.
// Both bottom-centre-aligned to the wall footprint.
function _bakeHouse(w) {
  const key = w.player ? 'house_country' : (HOUSE_VARIANT[w.hue] || 'house_2');
  const img  = getSprite(key);
  if (!img) return null;

  const isEstate = key.startsWith('house_country');

  if (isEstate) {
    const SW = 576, SH = 512;
    const ox = Math.round(w.w / 2) - 288;
    const oy = w.h - 512;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, SW, SH);
    if (w.player) {
      // Teal welcome mat so the player's house is instantly recognisable.
      ctx.fillStyle = '#2ec4b6';
      ctx.fillRect(212, 500, 152, 12);
      ctx.fillStyle = '#0a2a28';
      ctx.font = '700 9px monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText('WELCOME HOME', 220, 506);
    }
    return { canvas: c, ox, oy };
  } else {
    const SW = 256, SH = 320;
    const ox = Math.round(w.w / 2) - 128;
    const oy = w.h - 320;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, SW, SH);
    return { canvas: c, ox, oy };
  }
}

// ── SCHOOL ────────────────────────────────────────────────────────────────
// School_1 (768×736) applied only to the main façade (w.w >= 1000).
function _bakeSchool(w) {
  if (w.w < 1000) return null;
  const img = getSprite('school_facade');
  if (!img) return null;
  const SW = 768, SH = 736;
  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox: Math.round(w.w / 2) - 384, oy: w.h - SH };
}

// ── MARKET ────────────────────────────────────────────────────────────────
// Main market (w >= 1000): Mall_1 at 2× (1152×768), centred.
// Medium section (400 ≤ w < 1000): Market_Medium at 2× (448×576),
//   cycling through 6 colour variants by x-position so adjacent walls differ.
function _bakeMarket(w) {
  if (w.w >= 1000) {
    const img = getSprite('market_mall');
    if (!img) return null;
    const SW = 1152, SH = 768;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, SW, SH);
    return { canvas: c, ox: Math.round(w.w / 2) - 576, oy: w.h - SH };
  }
  if (w.w >= 400) {
    const variant = (Math.abs(Math.round(w.x / 100)) % 6) + 1;
    const img = getSprite('market_med_' + variant);
    if (!img) return null;
    const SW = 448, SH = 576;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, SW, SH);
    return { canvas: c, ox: Math.round(w.w / 2) - 224, oy: w.h - SH };
  }
  return null;
}

// ── TREEHOUSE ─────────────────────────────────────────────────────────────
// Tree_House_1 (288×352) at native size — bottom-centre on footprint.
function _bakeTreehouse(w) {
  const img = getSprite('treehouse');
  if (!img) return null;
  const SW = 288, SH = 352;
  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox: Math.round(w.w / 2) - 144, oy: w.h - SH };
}

// ── FENCE ─────────────────────────────────────────────────────────────────
// Tiles 32×32 ME fence panels along the wall length.
// Horizontal fence: Top row (Left cap · Middle × n · Right cap).
// Vertical fence:   Middle column (Top-Left cap · Left × n · Bottom-Left cap).
const TILE = 32;
function _bakeFence(w) {
  const horiz = w.w >= w.h;

  if (horiz) {
    const capL = getSprite('fence_tl');
    const mid  = getSprite('fence_tm');
    const capR = getSprite('fence_tr');
    if (!mid) return null;

    const nTiles = Math.ceil(w.w / TILE);
    const SW = nTiles * TILE, SH = TILE;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i < nTiles; i++) {
      ctx.drawImage(mid, i * TILE, 0, TILE, TILE);
    }
    if (capL) ctx.drawImage(capL, 0,         0, TILE, TILE);
    if (capR) ctx.drawImage(capR, SW - TILE,  0, TILE, TILE);
    return { canvas: c, ox: 0, oy: Math.round(w.h / 2) - 16 };
  } else {
    const capT = getSprite('fence_tl');
    const mid  = getSprite('fence_ml');
    const capB = getSprite('fence_bl');
    if (!mid) return null;

    const nTiles = Math.ceil(w.h / TILE);
    const SW = TILE, SH = nTiles * TILE;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i < nTiles; i++) {
      ctx.drawImage(mid, 0, i * TILE, TILE, TILE);
    }
    if (capT) ctx.drawImage(capT, 0, 0,         TILE, TILE);
    if (capB) ctx.drawImage(capB, 0, SH - TILE, TILE, TILE);
    return { canvas: c, ox: Math.round(w.w / 2) - 16, oy: 0 };
  }
}

// ── BASKETBALL HOOP ───────────────────────────────────────────────────────
// Collision marker is tiny (8×8). Basketball_Net_1 (96×128) is drawn as a
// large visual centred on that point, extending above and to either side.
function _bakeHoop(w) {
  const img = getSprite('bball_net');
  if (!img) return null;
  const SW = 96, SH = 128;
  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox: Math.round(w.w / 2) - 48, oy: w.h - SH };
}

// ── SOCCER GOAL ───────────────────────────────────────────────────────────
// Goal wall is 120×54; Soccer_Net_1 (128×96) is a near-perfect fit.
function _bakeSoccerGoal(w) {
  const img = getSprite('soccer_net');
  if (!img) return null;
  const SW = 128, SH = 96;
  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox: Math.round(w.w / 2) - 64, oy: w.h - SH };
}
