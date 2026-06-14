// Pre-baked building sprites using Modern Exteriors (Limezu) pixel-art tiles.
// Top-level await loads PNGs before buildBuildingSprites() is ever called.
// In Node.js test environments Image is undefined → skip loading → procedural fallback.
//
// ox, oy: offset from (w.x, w.y) to sprite canvas top-left.
// Blit: ctx.drawImage(sp.canvas, snap(w.x - cam.x + sp.ox), snap(w.y - cam.y + sp.oy))

import { bakeCanvas } from '../engine/utils.js';

const BUILDING_TYPES = new Set(['house', 'school', 'market', 'shack', 'treehouse']);
const _cache = new WeakMap();
const _imgs  = new Map();

// Which Toy_House variant (1-7) each non-player house uses (keyed by hue).
const HOUSE_VARIANT = {
  '#6b4a76': 'house_1',
  '#5c6f9e': 'house_2',
  '#4f6b5e': 'house_3',
  '#8a6f3e': 'house_4',
  '#56406f': 'house_6',
  '#7a5560': 'house_7',
};

// ── Image preload (top-level await) ──────────────────────────────────────
if (typeof Image !== 'undefined') {
  const BASE = import.meta.env.BASE_URL + 'sprites/me/';
  const FILES = [
    ['house_1',   'Toy_House_1.png'],
    ['house_2',   'Toy_House_2.png'],
    ['house_3',   'Toy_House_3.png'],
    ['house_4',   'Toy_House_4.png'],
    ['house_5',   'Toy_House_5.png'],
    ['house_6',   'Toy_House_6.png'],
    ['house_7',   'Toy_House_7.png'],
    ['school',    'School_1.png'],
    ['market_1',  'Market_Big_1.png'],
    ['market_2',  'Market_Big_2.png'],
    ['market_3',  'Market_Big_3.png'],
    ['market_4',  'Market_Big_4.png'],
    ['treehouse', 'Tree_House_1.png'],
  ];
  await Promise.all(FILES.map(([key, file]) => new Promise(res => {
    const img = new Image();
    img.onload  = () => { _imgs.set(key, img); res(); };
    img.onerror = () => res(); // missing → procedural fallback for that type
    img.src = BASE + file;
  })));
}

// ── Public API ───────────────────────────────────────────────────────────

export function buildBuildingSprites(walls) {
  let count = 0;
  for (const w of walls) {
    if (!BUILDING_TYPES.has(w.type) || w.ghost) continue;
    try {
      const sp = _bakeSprite(w);
      if (sp) { _cache.set(w, sp); count++; }
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
  }
  return null; // shack → procedural draw in props.js
}

// ── HOUSE ─────────────────────────────────────────────────────────────────
// Toy_House_X: 128×160 native → drawn at 2× = 256×320 px.
// Bottom edge of sprite aligned to bottom edge of wall footprint.
// Horizontally centred on wall.
function _bakeHouse(w) {
  const key = w.player ? 'house_5' : (HOUSE_VARIANT[w.hue] || 'house_1');
  const img = _imgs.get(key);
  if (!img) return null;

  const SW = 256, SH = 320;
  const ox = Math.round(w.w / 2) - 128;  // centre on wall width
  const oy = w.h - 320;                  // bottom-align: sprite extends above w.y

  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);

  // Player's house: teal welcome mat so it's instantly recognisable
  if (w.player) {
    ctx.fillStyle = '#2ec4b6';
    ctx.fillRect(88, 308, 80, 10);
    ctx.fillStyle = '#0a2a28';
    ctx.font = '700 8px monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText('WELCOME HOME', 91, 313);
  }

  return { canvas: c, ox, oy };
}

// ── SCHOOL ────────────────────────────────────────────────────────────────
// School_1: 768×736 native. Applied only to the main façade (w.w >= 1000).
// Smaller school walls (wings, annexe) fall back to procedural.
function _bakeSchool(w) {
  if (w.w < 1000) return null;
  const img = _imgs.get('school');
  if (!img) return null;

  const SW = 768, SH = 736;
  const ox = Math.round(w.w / 2) - 384;  // centre on wall width
  const oy = w.h - SH;                   // bottom-align

  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox, oy };
}

// ── MARKET ────────────────────────────────────────────────────────────────
// Market_Big_1-4: 224×384 native → 2× = 448×768. Tile 4 stalls side-by-side.
// Applied only to the large market wall (w.w >= 1000).
// Cycles through 4 colour variants so the stalls aren't identical.
function _bakeMarket(w) {
  if (w.w < 1000) return null;
  const STALL_W = 448, STALL_H = 768;
  const nStalls = Math.max(1, Math.round(w.w / STALL_W));
  const SW = STALL_W * nStalls, SH = STALL_H;
  const ox = Math.round(w.w / 2 - SW / 2);
  const oy = w.h - SH;

  const KEYS = ['market_1', 'market_2', 'market_3', 'market_4'];
  if (!KEYS.some(k => _imgs.has(k))) return null;

  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < nStalls; i++) {
    const img = _imgs.get(KEYS[i % KEYS.length]);
    if (img) ctx.drawImage(img, i * STALL_W, 0, STALL_W, STALL_H);
  }
  return { canvas: c, ox, oy };
}

// ── TREEHOUSE ─────────────────────────────────────────────────────────────
// Tree_House_1: 288×352 native (at pixel-grid native scale).
// Bottom-centre aligned to wall footprint.
function _bakeTreehouse(w) {
  const img = _imgs.get('treehouse');
  if (!img) return null;

  const SW = 288, SH = 352;
  const ox = Math.round(w.w / 2) - 144;
  const oy = w.h - SH;

  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox, oy };
}
