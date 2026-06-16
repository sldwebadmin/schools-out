// Runtime loader for the Tiled neighborhood map (public/neighborhood.json).
// Uses top-level await so all exported values are ready before any caller runs.
// Edit the map in Tiled (open public/neighborhood.json), save, then refresh.

import { ZONE }                          from './tiledata.js';
import { CHUNK_W, DAY_SEED }             from '../engine/constants.js';
import { mulberry32, bakeCanvas }        from '../engine/utils.js';
import { drawTiledGround, drawAutotileEdges } from './tilerender.js';

const NBHD_W = 5632, NBHD_H = 3072;
const TILE   = 32;
const GRID_W = NBHD_W / TILE;  // 176
const GRID_H = NBHD_H / TILE;  //  96

// ── GID → ZONE lookup (matches neighborhood.tsx tile layout) ─────────────
// Tile IDs (0-indexed) in neighborhood.tsx:
//   0-3  : LAWN flat/variants   → ZONE.LAWN
//   4-6  : ROAD                 → ZONE.ROAD
//   7-10 : SIDEWALK             → ZONE.SIDEWALK
//   11-22: LAWN edge/corner/ic  → ZONE.LAWN
function gidToZone(gid, firstgid) {
  const id = gid - firstgid;
  if (id < 0)  return ZONE.LAWN;
  if (id <= 3)  return ZONE.LAWN;
  if (id <= 6)  return ZONE.ROAD;
  if (id <= 10) return ZONE.SIDEWALK;
  return ZONE.LAWN; // edge/corner tiles also represent LAWN
}

// ── Zone grid ─────────────────────────────────────────────────────────────
let _zones    = null;
let _firstgid = 1;

export function zoneAt(lx, ly) {
  if (!_zones) return ZONE.LAWN;
  const tx = (lx / TILE) | 0;
  const ty = (ly / TILE) | 0;
  if (tx < 0 || ty < 0 || tx >= GRID_W || ty >= GRID_H) return ZONE.LAWN;
  return _zones[ty * GRID_W + tx];
}

// ── Object parser ─────────────────────────────────────────────────────────
function parseObjects(layer) {
  const walls = [], lamps = [], doors = [], transitions = [], pickupSpots = [];

  for (const obj of layer.objects) {
    const p = {};
    for (const entry of (obj.properties || [])) p[entry.name] = entry.value;

    switch (obj.class) {
      case 'wall':
        walls.push({
          type:     p.type,
          x: obj.x, y: obj.y, w: obj.width, h: obj.height,
          hue:      p.hue      ?? undefined,
          trim:     p.trim     ?? undefined,
          hop:      p.hop      ?? false,
          ghost:    p.ghost    ?? false,
          player:   p.player   ?? false,
          noshadow: p.noshadow ?? false,
        });
        break;
      case 'lamp':
        lamps.push({ x: obj.x, y: obj.y });
        break;
      case 'door':
        doors.push({
          x: obj.x, y: obj.y, w: obj.width, h: obj.height,
          target:      p.target ?? null,
          spawnX:      p.spawnX ?? 0,
          spawnY:      p.spawnY ?? 0,
          worldReturn: (p.worldReturnX != null)
            ? { x: p.worldReturnX, y: p.worldReturnY }
            : null,
          txt: p.txt ?? '',
        });
        break;
      case 'transition':
        transitions.push({
          x: obj.x, y: obj.y, w: obj.width, h: obj.height,
          status: p.status ?? 'locked',
          txt:    p.txt    ?? '',
          txt2:   p.txt2   ?? 'Coming soon!',
        });
        break;
      case 'pickup':
        pickupSpots.push([obj.x, obj.y]);
        break;
    }
  }

  return { walls, lamps, doors, transitions, pickupSpots };
}

// ── Load neighborhood.json ────────────────────────────────────────────────
async function _load() {
  let raw;
  // window.location is present in real browsers; the test stub sets window={} without it
  if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
    raw = await fetch('/neighborhood.json').then(r => r.json());
  } else {
    const fs   = await import(/* @vite-ignore */ 'fs');
    const url  = await import(/* @vite-ignore */ 'url');
    const path = await import(/* @vite-ignore */ 'path');
    const dir  = path.dirname(url.fileURLToPath(import.meta.url));
    raw = JSON.parse(
      fs.readFileSync(path.join(dir, '../../public/neighborhood.json'), 'utf8')
    );
  }

  // Resolve firstgid from the tileset reference
  _firstgid = raw.tilesets?.[0]?.firstgid ?? 1;

  // Build zone grid from the ground tile layer
  const groundLayer = raw.layers.find(l => l.name === 'ground');
  if (groundLayer) {
    _zones = new Uint8Array(GRID_W * GRID_H);
    for (let i = 0; i < groundLayer.data.length; i++) {
      _zones[i] = gidToZone(groundLayer.data[i], _firstgid);
    }
  }

  // Parse objects layer
  const objectLayer = raw.layers.find(l => l.name === 'objects');
  return objectLayer
    ? parseObjects(objectLayer)
    : { walls: [], lamps: [], doors: [], transitions: [], pickupSpots: [] };
}

const _data = await _load();

export const walls       = _data.walls;
export const lamps       = _data.lamps;
export const doors       = _data.doors;
export const transitions = _data.transitions;
export const pickupSpots = _data.pickupSpots;

// ── Ground bake (procedural overlays on top of zone-based tiles) ──────────
// Road constants for overlays — must stay in sync with the Tiled map geometry.
const MNS_X = 2752, MNS_W = 128;
const OAK_Y = 1440, OAK_W = 128;
const MEW_Y = 1920, MEW_W = 128;
const BIR_Y = 2528, BIR_W = 128;
const SW    = 32;

export function bakeInto(g, lx0, ly0) {
  const rnd = mulberry32(DAY_SEED ^ ((lx0 * 997 + ly0 * 1009) >>> 0));

  function tex(rx0, ry0, rx1, ry1, n, c1, c2, dw, dh) {
    const ix0 = Math.max(lx0, rx0), ix1 = Math.min(lx0 + CHUNK_W, rx1);
    const iy0 = Math.max(ly0, ry0), iy1 = Math.min(ly0 + CHUNK_W, ry1);
    if (ix0 >= ix1 || iy0 >= iy1) return;
    const iw = ix1 - ix0, ih = iy1 - iy0;
    for (let i = 0; i < n; i++) {
      g.fillStyle = rnd() < .5 ? c1 : c2;
      g.fillRect((ix0 + rnd() * iw) | 0, (iy0 + rnd() * ih) | 0, dw, dh);
    }
  }

  function road(x, y, w, h) {
    g.fillStyle = '#46406b'; g.fillRect(x, y, w, h);
    tex(x, y, x+w, y+h, Math.max(1, (w*h/1400) | 0), '#4d4775', '#403a62', 5, 5);
    g.fillStyle = '#353055';
    if (w >= h) { g.fillRect(x, y, w, 5); g.fillRect(x, y+h-5, w, 5); }
    else         { g.fillRect(x, y, 5, h); g.fillRect(x+w-5, y, 5, h); }
  }

  function sidewalk(x, y, w, h) {
    g.fillStyle = '#6a5c91'; g.fillRect(x, y, w, h);
    g.fillStyle = '#5d5083';
    if (w >= h) for (let sx = x; sx < x+w; sx += 46) g.fillRect(sx, y, 3, h);
    else        for (let sy = y; sy < y+h; sy += 46) g.fillRect(x, sy, w, 3);
  }

  drawTiledGround(g, lx0, ly0, zoneAt);

  // Sidewalk overlays
  sidewalk(MNS_X - SW,    0, SW, NBHD_H);
  sidewalk(MNS_X + MNS_W, 0, SW, NBHD_H);
  sidewalk(0,             OAK_Y - SW, MNS_X,                  SW);
  sidewalk(MNS_X + MNS_W, OAK_Y - SW, NBHD_W-(MNS_X+MNS_W), SW);
  sidewalk(0,             OAK_Y + OAK_W, MNS_X,              SW);
  sidewalk(MNS_X + MNS_W, OAK_Y + OAK_W, NBHD_W-(MNS_X+MNS_W), SW);
  sidewalk(0, MEW_Y - SW,     MNS_X, SW);
  sidewalk(0, MEW_Y + MEW_W,  MNS_X, SW);
  sidewalk(0, BIR_Y - SW,     MNS_X, SW);
  sidewalk(0, BIR_Y + BIR_W,  MNS_X, SW);

  // Road overlays
  road(MNS_X, 0, MNS_W, NBHD_H);
  road(0,            OAK_Y, MNS_X,                 OAK_W);
  road(MNS_X + MNS_W, OAK_Y, NBHD_W-(MNS_X+MNS_W), OAK_W);
  road(0, MEW_Y, MNS_X, MEW_W);
  road(0, BIR_Y, MNS_X, BIR_W);

  // Centre-line dashes
  g.fillStyle = '#8d80b8';
  for (let y = 4;            y < NBHD_H; y += 64) g.fillRect(MNS_X + 60,     y,  8, 28);
  for (let x = 4;            x < MNS_X;  x += 64) g.fillRect(x, OAK_Y + 60, 28,  8);
  for (let x = MNS_X+MNS_W; x < NBHD_W; x += 64) g.fillRect(x, OAK_Y + 60, 28,  8);
  for (let x = 4;            x < MNS_X;  x += 64) g.fillRect(x, MEW_Y + 60, 28,  8);
  for (let x = 4;            x < MNS_X;  x += 64) g.fillRect(x, BIR_Y + 60, 28,  8);

  // Crosswalk marks
  g.fillStyle = '#cfc6e8';
  for (let i = 0; i < 6; i++) g.fillRect(MNS_X+10+i*22, OAK_Y+34, 12, 60);
  for (let i = 0; i < 6; i++) g.fillRect(MNS_X+10+i*22, MEW_Y+34, 12, 60);
  for (let i = 0; i < 6; i++) g.fillRect(MNS_X+10+i*22, BIR_Y+34, 12, 60);

  // Manhole covers
  for (const [mx, my] of [
    [MNS_X+64,  300], [MNS_X+64,  900],
    [MNS_X+64, 1620], [MNS_X+64, 2300],
    [200,  OAK_Y+64], [700,  OAK_Y+64], [1200, OAK_Y+64],
    [1800, OAK_Y+64], [2400, OAK_Y+64],
    [3200, OAK_Y+64], [3800, OAK_Y+64], [4400, OAK_Y+64],
    [5000, OAK_Y+64],
    [200,  MEW_Y+64], [700,  MEW_Y+64], [1200, MEW_Y+64],
    [200,  BIR_Y+64], [700,  BIR_Y+64], [1200, BIR_Y+64],
  ]) {
    g.fillStyle = '#2e294a'; g.beginPath(); g.arc(mx, my, 11, 0, 7); g.fill();
    g.strokeStyle = '#55517a'; g.lineWidth = 3; g.beginPath(); g.arc(mx, my, 7, 0, 7); g.stroke();
  }
  g.lineWidth = 1;

  // Road name labels
  function label(text, x, y, vertical) {
    g.save();
    g.font = 'bold 18px sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (vertical) { g.translate(x, y); g.rotate(Math.PI / 2); }
    else          { g.translate(x, y); }
    const m = g.measureText(text);
    const pw = m.width + 12, ph = 24;
    g.fillStyle = 'rgba(20,16,40,0.82)'; g.fillRect(-pw/2, -ph/2, pw, ph);
    g.fillStyle = '#ffe9c2'; g.fillText(text, 0, 0);
    g.restore();
  }
  const MNS_CX = MNS_X + 64;
  const OAK_CY = OAK_Y + 64, MEW_CY = MEW_Y + 64, BIR_CY = BIR_Y + 64;
  for (const y of [300, 900, 1620, 2300])   label('Maple Ave', MNS_CX, y, true);
  for (const x of [200, 700, 1400, 2100])   label('Oak Ave',   x, OAK_CY, false);
  for (const x of [3200, 3900, 4600, 5300]) label('Oak Ave',   x, OAK_CY, false);
  for (const x of [200, 700])               label('Court Dr',  x, MEW_CY, false);
  for (const x of [200, 700])               label('Birch Ave', x, BIR_CY, false);

  drawAutotileEdges(g, lx0, ly0, zoneAt);
}

// ── Minimap ───────────────────────────────────────────────────────────────
// 5632×3072 at 1/32 scale → 176×96. Each tile = 1 minimap pixel exactly.
export function minimapBake() {
  const [c, g] = bakeCanvas(176, 96);
  g.fillStyle = '#3f5d44'; g.fillRect(0, 0, 176, 96);

  if (_zones) {
    for (let ty = 0; ty < GRID_H; ty++) {
      for (let tx = 0; tx < GRID_W; tx++) {
        const z = _zones[ty * GRID_W + tx];
        if      (z === ZONE.ROAD)     { g.fillStyle = '#2a2345'; g.fillRect(tx, ty, 1, 1); }
        else if (z === ZONE.SIDEWALK) { g.fillStyle = '#3a3060'; g.fillRect(tx, ty, 1, 1); }
      }
    }
  }

  return c;
}
