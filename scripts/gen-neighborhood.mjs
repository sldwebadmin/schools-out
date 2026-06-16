#!/usr/bin/env node
// scripts/gen-neighborhood.mjs — ONE-TIME BOOTSTRAP ONLY
//
// Reads the neighborhood constants below and emits public/neighborhood.json,
// which is the Tiled-format source of truth for the neighborhood section.
//
// After this runs ONCE, edit the map in Tiled (open public/neighborhood.json).
// DO NOT add this script to package.json scripts — it must not run automatically.
//
// Usage:
//   node scripts/gen-neighborhood.mjs           # fails if file already exists
//   node scripts/gen-neighborhood.mjs --force   # overwrites (clobbers Tiled edits!)

import { existsSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT   = join(__dir, '../public/neighborhood.json');

if (existsSync(OUT) && !process.argv.includes('--force')) {
  console.error(`\nERROR: ${OUT} already exists.`);
  console.error('Overwriting would clobber your Tiled edits.');
  console.error('Pass --force only if you intentionally want to regenerate from code.\n');
  process.exit(1);
}

// ── Neighborhood constants (keep in sync with neighborhood.js) ────────────
const NBHD_W = 5632, NBHD_H = 3072;
const MNS_X = 2752, MNS_W = 128;
const OAK_Y = 1440, OAK_W = 128;
const MEW_Y = 1920, MEW_W = 128;
const BIR_Y = 2528, BIR_W = 128;
const SW   = 32;
const TILE = 32;
const GRID_W = NBHD_W / TILE;   // 176
const GRID_H = NBHD_H / TILE;   //  96

// ZONE values (mirrors tiledata.js)
const ZONE_ROAD     = 7;
const ZONE_SIDEWALK = 8;
const ZONE_LAWN     = 3;

function zoneAt(lx, ly) {
  if (lx >= MNS_X && lx < MNS_X + MNS_W) return ZONE_ROAD;
  if (ly >= OAK_Y && ly < OAK_Y + OAK_W && lx <  MNS_X)        return ZONE_ROAD;
  if (ly >= OAK_Y && ly < OAK_Y + OAK_W && lx >= MNS_X + MNS_W) return ZONE_ROAD;
  if (ly >= MEW_Y && ly < MEW_Y + MEW_W && lx <  MNS_X)         return ZONE_ROAD;
  if (ly >= BIR_Y && ly < BIR_Y + BIR_W && lx <  MNS_X)         return ZONE_ROAD;

  if (lx >= MNS_X - SW && lx < MNS_X)                return ZONE_SIDEWALK;
  if (lx >= MNS_X + MNS_W && lx < MNS_X + MNS_W + SW) return ZONE_SIDEWALK;

  if (ly >= OAK_Y - SW && ly < OAK_Y && lx <  MNS_X)                       return ZONE_SIDEWALK;
  if (ly >= OAK_Y - SW && ly < OAK_Y && lx >= MNS_X + MNS_W)               return ZONE_SIDEWALK;
  if (ly >= OAK_Y + OAK_W && ly < OAK_Y + OAK_W + SW && lx <  MNS_X)      return ZONE_SIDEWALK;
  if (ly >= OAK_Y + OAK_W && ly < OAK_Y + OAK_W + SW && lx >= MNS_X + MNS_W) return ZONE_SIDEWALK;

  if (ly >= MEW_Y - SW && ly < MEW_Y           && lx < MNS_X) return ZONE_SIDEWALK;
  if (ly >= MEW_Y + MEW_W && ly < MEW_Y + MEW_W + SW && lx < MNS_X) return ZONE_SIDEWALK;
  if (ly >= BIR_Y - SW && ly < BIR_Y           && lx < MNS_X) return ZONE_SIDEWALK;
  if (ly >= BIR_Y + BIR_W && ly < BIR_Y + BIR_W + SW && lx < MNS_X) return ZONE_SIDEWALK;

  return ZONE_LAWN;
}

// Tile IDs in neighborhood.tsx (id = tile index, GID = id + firstgid):
//   LAWN flat:  id 0 (GID 1, Grass_1_22)
//   ROAD:       id 4 (GID 5, Asphalt_1_25)
//   SIDEWALK:   id 7 (GID 8, Sidewalk_1_1)
function zoneToGid(zone) {
  if (zone === ZONE_ROAD)     return 5;
  if (zone === ZONE_SIDEWALK) return 8;
  return 1; // LAWN (and anything else) → Grass_1_22
}

// ── Ground layer (176×96 tile array) ─────────────────────────────────────
console.log('Building ground layer (176×96)...');
const groundData = new Array(GRID_W * GRID_H);
for (let ty = 0; ty < GRID_H; ty++) {
  for (let tx = 0; tx < GRID_W; tx++) {
    // Sample at tile centre to match the runtime zoneAt lookup
    const lx = tx * TILE + (TILE >> 1);
    const ly = ty * TILE + (TILE >> 1);
    groundData[ty * GRID_W + tx] = zoneToGid(zoneAt(lx, ly));
  }
}

// ── Object helpers ────────────────────────────────────────────────────────
let nextId = 1;
const objects = [];

function prop(name, type, value) { return { name, type, value }; }

function addRect(cls, x, y, w, h, props = []) {
  objects.push({
    id: nextId++, name: '', class: cls, type: '',
    x, y, width: w, height: h,
    visible: true, rotation: 0,
    properties: props,
  });
}

function addPoint(cls, x, y, props = []) {
  objects.push({
    id: nextId++, name: '', class: cls, type: '',
    x, y, width: 0, height: 0,
    visible: true, rotation: 0, point: true,
    properties: props,
  });
}

// ── Walls ─────────────────────────────────────────────────────────────────
const WALLS = [
  // Upper-left — Lot A (Villa_1 brown, wide estate)
  { type:'fence', x:64,   y:200,  w:960,  h:10,  hop:true },
  { type:'fence', x:64,   y:200,  w:10,   h:1080, hop:true },
  { type:'fence', x:1024, y:200,  w:10,   h:1080, hop:true },
  { type:'fence', x:64,   y:1280, w:496,  h:10,  hop:true },
  { type:'fence', x:624,  y:1280, w:400,  h:10,  hop:true },
  { type:'house', x:448,  y:1056, w:288,  h:128, hue:'#7a5c34', trim:'#ffe9c2' },
  // Upper-left — Lot B (Villa_3 red)
  { type:'fence', x:1088, y:200,  w:672,  h:10,  hop:true },
  { type:'fence', x:1088, y:200,  w:10,   h:1080, hop:true },
  { type:'fence', x:1760, y:200,  w:10,   h:1080, hop:true },
  { type:'fence', x:1088, y:1280, w:304,  h:10,  hop:true },
  { type:'fence', x:1456, y:1280, w:304,  h:10,  hop:true },
  { type:'house', x:1280, y:1088, w:288,  h:128, hue:'#8b3a2a', trim:'#ffe9c2' },
  // Upper-left — Lot C (Villa_4 blue)
  { type:'fence', x:1824, y:200,  w:576,  h:10,  hop:true },
  { type:'fence', x:1824, y:200,  w:10,   h:1080, hop:true },
  { type:'fence', x:2400, y:200,  w:10,   h:1080, hop:true },
  { type:'fence', x:1824, y:1280, w:256,  h:10,  hop:true },
  { type:'fence', x:2144, y:1280, w:256,  h:10,  hop:true },
  { type:'house', x:1968, y:1120, w:288,  h:128, hue:'#2a5a8b', trim:'#e8f0ff' },
  // Upper-right — Row 2 Japanese House (×4)
  { type:'house', x:3028, y:480, w:448, h:128, hue:'#7a6e3a', trim:'#ffc44d' },
  { type:'house', x:3708, y:480, w:448, h:128, hue:'#7a6e3a', trim:'#ffc44d' },
  { type:'house', x:4388, y:480, w:448, h:128, hue:'#7a6e3a', trim:'#ffc44d' },
  { type:'house', x:5068, y:480, w:448, h:128, hue:'#7a6e3a', trim:'#ffc44d' },
  // Upper-right — Row 1 Maple-edge fence + Country House NB (×2)
  { type:'fence', x:2912, y:32,  w:10,  h:1376, hop:true },
  { type:'house', x:2970, y:1152, w:576, h:160, hue:'#6b4a76', trim:'#ffe9c2' },
  { type:'house', x:3644, y:1152, w:576, h:160, hue:'#6b4a76', trim:'#ffe9c2' },
  // Upper-right — Row 1 Modern House (×2)
  { type:'house', x:4372, y:1184, w:480, h:128, hue:'#3a6e7a', trim:'#2ec4b6' },
  { type:'house', x:5052, y:1184, w:480, h:128, hue:'#3a6e7a', trim:'#2ec4b6' },
];

for (const w of WALLS) {
  const props = [prop('type', 'string', w.type)];
  if (w.hue)    props.push(prop('hue',    'string', w.hue));
  if (w.trim)   props.push(prop('trim',   'string', w.trim));
  if (w.hop)    props.push(prop('hop',    'bool',   true));
  if (w.ghost)  props.push(prop('ghost',  'bool',   true));
  if (w.player) props.push(prop('player', 'bool',   true));
  addRect('wall', w.x, w.y, w.w, w.h, props);
}

// ── Lamps ─────────────────────────────────────────────────────────────────
const LAMPS = [
  { x: MNS_X - 4,       y: OAK_Y - 4 },
  { x: MNS_X + MNS_W + 4, y: OAK_Y - 4 },
  { x: MNS_X - 4,       y: MEW_Y - 4 },
  { x: MNS_X + MNS_W + 4, y: MEW_Y - 4 },
  { x: MNS_X - 4,       y: BIR_Y - 4 },
  { x: MNS_X + MNS_W + 4, y: BIR_Y - 4 },
];
for (const L of LAMPS) addPoint('lamp', L.x, L.y);

// ── Doors ─────────────────────────────────────────────────────────────────
addRect('door', 270, 2200, 64, 22, [
  prop('target',        'string', 'house'),
  prop('spawnX',        'int',    240),
  prop('spawnY',        'int',    200),
  prop('worldReturnX',  'int',    302),
  prop('worldReturnY',  'int',    2244),
]);

// ── Transitions (boundary walls) ──────────────────────────────────────────
const TRANSITIONS = [
  { x: 0,         y: 0,         w: NBHD_W, h: 32,     txt: 'Maple Park',            txt2: 'Coming soon!' },
  { x: 0,         y: NBHD_H-32, w: NBHD_W, h: 32,     txt: 'Great Waterfront Lake', txt2: 'Coming soon!' },
  { x: NBHD_W-32, y: 0,         w: 32,     h: NBHD_H, txt: 'Maple Mart District',   txt2: 'Coming soon!' },
  { x: 0,         y: 0,         w: 32,     h: NBHD_H, txt: 'Whispering Woods',      txt2: 'Coming soon!' },
];
for (const t of TRANSITIONS) {
  addRect('transition', t.x, t.y, t.w, t.h, [
    prop('status', 'string', 'locked'),
    prop('txt',    'string', t.txt),
    prop('txt2',   'string', t.txt2),
  ]);
}

// ── Pickup spots ──────────────────────────────────────────────────────────
const PICKUPS = [
  [400,  420],
  [4200, 420],
  [400,  1750],
  [1800, 2200],
  [MNS_X - 300, 550],
];
for (const [px, py] of PICKUPS) addPoint('pickup', px, py);

// ── Assemble Tiled JSON ───────────────────────────────────────────────────
const tiledMap = {
  version:     '1.10',
  tiledversion:'1.10.2',
  type:        'map',
  orientation: 'orthogonal',
  renderorder: 'right-down',
  width:  GRID_W,
  height: GRID_H,
  tilewidth:  TILE,
  tileheight: TILE,
  infinite:   false,
  nextlayerid: 3,
  nextobjectid: nextId,
  tilesets: [{ firstgid: 1, source: 'neighborhood.tsx' }],
  layers: [
    {
      id: 1, name: 'ground', type: 'tilelayer',
      x: 0, y: 0, width: GRID_W, height: GRID_H,
      visible: true, opacity: 1,
      data: groundData,
    },
    {
      id: 2, name: 'objects', type: 'objectgroup',
      x: 0, y: 0,
      visible: true, opacity: 1, draworder: 'topdown',
      objects,
    },
  ],
};

writeFileSync(OUT, JSON.stringify(tiledMap, null, 2), 'utf8');
const nRoad = groundData.filter(g => g === 5).length;
const nSW   = groundData.filter(g => g === 8).length;
const nLawn = groundData.filter(g => g === 1).length;
console.log(`Wrote ${OUT}`);
console.log(`  Ground: ${GRID_W}×${GRID_H} = ${groundData.length} tiles`);
console.log(`    LAWN=${nLawn}  ROAD=${nRoad}  SIDEWALK=${nSW}`);
console.log(`  Objects: ${objects.length} (walls:${WALLS.length} lamps:${LAMPS.length} pickups:${PICKUPS.length})`);
