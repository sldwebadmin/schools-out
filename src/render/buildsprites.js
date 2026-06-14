// Pre-baked building sprites using Modern Exteriors (Limezu) pixel-art tiles.
// Top-level await loads PNGs before buildBuildingSprites() is called.
// In Node.js (typeof Image === 'undefined') images are skipped → procedural fallback.
//
// ox, oy: offset from (w.x, w.y) to sprite canvas top-left.
// Blit: ctx.drawImage(sp.canvas, snap(w.x - cam.x + sp.ox), snap(w.y - cam.y + sp.oy))

import { bakeCanvas } from '../engine/utils.js';

const BUILDING_TYPES = new Set([
  'house', 'school', 'market', 'shack', 'treehouse',
  'fence', 'hoop', 'goal',
]);
const _cache = new WeakMap();
const _imgs  = new Map();

// House variant assignment — two estate-style (Country_House) + five bungalows (Toy_House).
// Keyed by wall hue. Player's house always gets Country_House.
const HOUSE_VARIANT = {
  '#6b4a76': 'house_country_nb',  // purple lot  → Country_House_No_Banisters (estate)
  '#5c6f9e': 'house_2',           // blue lot     → Toy_House_2
  '#4f6b5e': 'house_3',           // green lot    → Toy_House_3
  '#8a6f3e': 'house_4',           // tan lot      → Toy_House_4
  '#56406f': 'house_6',           // plum lot     → Toy_House_6
  '#7a5560': 'house_7',           // rose lot     → Toy_House_7
};

// ── Image preload (top-level await — resolved before any bake call) ──────
if (typeof Image !== 'undefined') {
  const BASE = import.meta.env.BASE_URL + 'sprites/me/';
  const FILES = [
    // Houses — bungalow style (same shape, different colours)
    ['house_2',          'Toy_House_2.png'],
    ['house_3',          'Toy_House_3.png'],
    ['house_4',          'Toy_House_4.png'],
    ['house_5',          'Toy_House_5.png'],   // unused bungalow (safety fallback)
    ['house_6',          'Toy_House_6.png'],
    ['house_7',          'Toy_House_7.png'],
    // Houses — estate style (completely different silhouette)
    ['house_country',    'Country_House.png'],
    ['house_country_nb', 'Country_House_No_Banisters.png'],
    // School
    ['school',           'School_1.png'],
    // Market
    ['mall',             'Mall_1.png'],
    ['market_med_1',     'Market_Medium_1.png'],
    ['market_med_2',     'Market_Medium_2.png'],
    ['market_med_3',     'Market_Medium_3.png'],
    ['market_med_4',     'Market_Medium_4.png'],
    ['market_med_5',     'Market_Medium_5.png'],
    ['market_med_6',     'Market_Medium_6.png'],
    // Treehouse
    ['treehouse',        'Tree_House_1.png'],
    // Fence tiles — Theme 24 directional set
    ['fence_tl',   'Fence_1_Top_Left.png'],
    ['fence_tm',   'Fence_1_Top_Middle.png'],
    ['fence_tr',   'Fence_1_Top_Right.png'],
    ['fence_ml',   'Fence_1_Middle_Left.png'],
    ['fence_mr',   'Fence_1_Middle_Right.png'],
    ['fence_bl',   'Fence_1_Bottom_Left.png'],
    ['fence_bm',   'Fence_1_Bottom_Middle.png'],
    ['fence_br',   'Fence_1_Bottom_Right.png'],
    // Athletic props
    ['bball_net',  'Basketball_Net_1.png'],
    ['soccer_net', 'Soccer_Net_1.png'],
  ];
  await Promise.all(FILES.map(([key, file]) => new Promise(res => {
    const img = new Image();
    img.onload  = () => { _imgs.set(key, img); res(); };
    img.onerror = () => res(); // missing file → procedural fallback for this type
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
// Both are bottom-centre-aligned to the wall footprint.
function _bakeHouse(w) {
  const key = w.player ? 'house_country' : (HOUSE_VARIANT[w.hue] || 'house_2');
  const img  = _imgs.get(key);
  if (!img) return null;

  const isEstate = key.startsWith('house_country');

  if (isEstate) {
    // Native size 576×512; sprite extends well beyond the collision footprint.
    const SW = 576, SH = 512;
    const ox = Math.round(w.w / 2) - 288;
    const oy = w.h - 512;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, SW, SH);
    if (w.player) {
      // Teal welcome mat at the front of the house so it's instantly recognisable.
      ctx.fillStyle = '#2ec4b6';
      ctx.fillRect(212, 500, 152, 12);
      ctx.fillStyle = '#0a2a28';
      ctx.font = '700 9px monospace';
      ctx.textBaseline = 'middle';
      ctx.fillText('WELCOME HOME', 220, 506);
    }
    return { canvas: c, ox, oy };
  } else {
    // Bungalow: 2× upscale → 256×320.
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
  const img = _imgs.get('school');
  if (!img) return null;
  const SW = 768, SH = 736;
  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox: Math.round(w.w / 2) - 384, oy: w.h - SH };
}

// ── MARKET ────────────────────────────────────────────────────────────────
// Main market (w >= 1000): Mall_1 at 2× (1152×768), centred — architecturally
//   distinct from the stalls.
// Medium section (500 ≤ w < 1000): Market_Medium at 2× (448×576), cycling
//   through 6 colour variants.
function _bakeMarket(w) {
  if (w.w >= 1000) {
    const img = _imgs.get('mall');
    if (!img) return null;
    const SW = 1152, SH = 768; // Mall_1 at 2×
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, SW, SH);
    return { canvas: c, ox: Math.round(w.w / 2) - 576, oy: w.h - SH };
  }
  if (w.w >= 400) {
    // Pick a Market_Medium variant by x position so adjacent walls differ.
    const variant = (Math.abs(Math.round(w.x / 100)) % 6) + 1;
    const img = _imgs.get('market_med_' + variant);
    if (!img) return null;
    const SW = 448, SH = 576; // Market_Medium at 2×
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0, SW, SH);
    return { canvas: c, ox: Math.round(w.w / 2) - 224, oy: w.h - SH };
  }
  return null; // narrow market walls → procedural
}

// ── TREEHOUSE ─────────────────────────────────────────────────────────────
// Tree_House_1 (288×352) at native size — bottom-centre on footprint.
function _bakeTreehouse(w) {
  const img = _imgs.get('treehouse');
  if (!img) return null;
  const SW = 288, SH = 352;
  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox: Math.round(w.w / 2) - 144, oy: w.h - SH };
}

// ── FENCE ─────────────────────────────────────────────────────────────────
// Tiles 32×32 ME fence panels along the wall.
// Horizontal fence (w.w ≥ w.h): Top row (Left cap · Middle × n · Right cap).
// Vertical fence   (w.h >  w.w): Middle col (Top-Left cap · Left × n · Bottom-Left cap).
// Canvas is centred over the thin fence-wall collision strip.
const TILE = 32;
function _bakeFence(w) {
  const horiz = w.w >= w.h;

  if (horiz) {
    const capL = _imgs.get('fence_tl');
    const mid  = _imgs.get('fence_tm');
    const capR = _imgs.get('fence_tr');
    if (!mid) return null;

    const nTiles = Math.ceil(w.w / TILE);
    const SW = nTiles * TILE, SH = TILE;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    // middle tiles first, then end caps on top
    for (let i = 0; i < nTiles; i++) {
      if (mid) ctx.drawImage(mid, i * TILE, 0, TILE, TILE);
    }
    if (capL) ctx.drawImage(capL, 0,              0, TILE, TILE);
    if (capR) ctx.drawImage(capR, SW - TILE, 0, TILE, TILE);

    return { canvas: c, ox: 0, oy: Math.round(w.h / 2) - 16 };
  } else {
    const capT = _imgs.get('fence_tl');
    const mid  = _imgs.get('fence_ml');
    const capB = _imgs.get('fence_bl');
    if (!mid) return null;

    const nTiles = Math.ceil(w.h / TILE);
    const SW = TILE, SH = nTiles * TILE;
    const [c, ctx] = bakeCanvas(SW, SH);
    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i < nTiles; i++) {
      if (mid) ctx.drawImage(mid, 0, i * TILE, TILE, TILE);
    }
    if (capT) ctx.drawImage(capT, 0, 0,         TILE, TILE);
    if (capB) ctx.drawImage(capB, 0, SH - TILE, TILE, TILE);

    return { canvas: c, ox: Math.round(w.w / 2) - 16, oy: 0 };
  }
}

// ── BASKETBALL HOOP ───────────────────────────────────────────────────────
// Hoop collision marker is tiny (8×8). Draw Basketball_Net as a large visual
// centred on that point; the net extends above and to either side.
function _bakeHoop(w) {
  const img = _imgs.get('bball_net');
  if (!img) return null;
  const SW = 96, SH = 128;
  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox: Math.round(w.w / 2) - 48, oy: w.h - SH };
}

// ── SOCCER GOAL ───────────────────────────────────────────────────────────
// Goal wall is 120×54. Soccer_Net_1 is 128×96 — near-perfect fit.
function _bakeSoccerGoal(w) {
  const img = _imgs.get('soccer_net');
  if (!img) return null;
  const SW = 128, SH = 96;
  const [c, ctx] = bakeCanvas(SW, SH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, SW, SH);
  return { canvas: c, ox: Math.round(w.w / 2) - 64, oy: w.h - SH };
}
