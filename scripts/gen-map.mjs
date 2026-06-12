/**
 * Generates public/map.json — a Tiled-compatible map with:
 *   Layer 1: ground  (tile layer, 125×94 zone IDs)
 *   Layer 2: walls   (object layer — collision geometry)
 *   Layer 3: canopies (object layer — tree canopy ellipses)
 *   Layer 4: lamps   (object layer — lamp positions)
 *   Layer 5: objects (object layer — pickup spots)
 *
 * Run with: node scripts/gen-map.mjs
 * Open the result in Tiled (mapeditor.org) — tileset.png must be in the same
 * folder as map.json (both live in public/).
 */
import { writeFileSync, mkdirSync } from 'fs';
import { buildMap, walls, canopies, lamps } from '../src/world/map.js';
import { POP_SPOTS, BIKE_SPOTS } from '../src/entities/pickups.js';
import { buildTileLayer, ZONE } from '../src/world/tiledata.js';
import { WORLD, TILE } from '../src/engine/constants.js';

buildMap();

// ── 1. Ground tile layer ─────────────────────────────────────────────
const { data, cols, rows } = buildTileLayer();
const groundLayer = {
  type: 'tilelayer', id: 1, name: 'ground',
  x: 0, y: 0, width: cols, height: rows,
  visible: true, opacity: 1, encoding: 'csv',
  data,
};

// ── 2. Walls object layer ────────────────────────────────────────────
let nextId = 2000;
function wallProps(w) {
  const p = [];
  if(w.hop)      p.push({name:'hop',      type:'bool',   value:true});
  if(w.ghost)    p.push({name:'ghost',    type:'bool',   value:true});
  if(w.noshadow) p.push({name:'noshadow', type:'bool',   value:true});
  if(w.player)   p.push({name:'player',   type:'bool',   value:true});
  if(w.hue)      p.push({name:'hue',      type:'string', value:w.hue});
  if(w.trim)     p.push({name:'trim',     type:'string', value:w.trim});
  if(w.txt)      p.push({name:'txt',      type:'string', value:w.txt});
  if(w.txt2 !== undefined && w.txt2 !== null)
                 p.push({name:'txt2',     type:'string', value:String(w.txt2)});
  return p;
}
const wallLayer = {
  type: 'objectgroup', id: 2, name: 'walls',
  x: 0, y: 0, visible: true, opacity: 1, color: '#ff6b57',
  objects: walls.map(w => ({
    id: nextId++, name: w.type, class: w.type,
    x: w.x, y: w.y, width: w.w, height: w.h,
    visible: true, rotation: 0, properties: wallProps(w),
  })),
};

// ── 3. Canopies layer ────────────────────────────────────────────────
const canopyLayer = {
  type: 'objectgroup', id: 3, name: 'canopies',
  x: 0, y: 0, visible: true, opacity: 1, color: '#2ec4b6',
  objects: canopies.map(c => ({
    id: nextId++, name: 'canopy', class: 'canopy',
    ellipse: true,
    x: c.x - c.r, y: c.y - c.r, width: c.r*2, height: c.r*2,
    visible: true, rotation: 0, properties: [],
  })),
};

// ── 4. Lamps layer ───────────────────────────────────────────────────
const lampLayer = {
  type: 'objectgroup', id: 4, name: 'lamps',
  x: 0, y: 0, visible: true, opacity: 1, color: '#ffc44d',
  objects: lamps.map(L => ({
    id: nextId++, name: 'lamp', class: 'lamp',
    point: true, x: L.x, y: L.y, width: 0, height: 0,
    visible: true, rotation: 0, properties: [],
  })),
};

// ── 5. Pickups / spawn objects layer ─────────────────────────────────
const objectLayer = {
  type: 'objectgroup', id: 5, name: 'objects',
  x: 0, y: 0, visible: true, opacity: 1, color: '#ffc44d',
  objects: [
    ...POP_SPOTS.map(([x,y]) => ({
      id: nextId++, name: 'pop', class: 'pickup',
      point: true, x, y, width: 0, height: 0,
      visible: true, rotation: 0,
      properties: [{name:'type',type:'string',value:'pop'}],
    })),
    ...BIKE_SPOTS.map(([x,y]) => ({
      id: nextId++, name: 'bike', class: 'pickup',
      point: true, x, y, width: 0, height: 0,
      visible: true, rotation: 0,
      properties: [{name:'type',type:'string',value:'bike'}],
    })),
  ],
};

// ── Tileset (inline) ─────────────────────────────────────────────────
const NUM_ZONES = 13;
const tileset = {
  firstgid: 1,
  name: 'zones',
  tilewidth: TILE, tileheight: TILE,
  spacing: 0, margin: 0,
  columns: 1, tilecount: NUM_ZONES,
  image: 'tileset.png',
  imagewidth: TILE, imageheight: NUM_ZONES * TILE,
};

// ── Assemble map ──────────────────────────────────────────────────────
const tmj = {
  version: '1.10', type: 'map', tiledversion: '1.10.2',
  width: cols, height: rows,
  tilewidth: TILE, tileheight: TILE,
  infinite: false, orientation: 'orthogonal', renderorder: 'right-down',
  backgroundcolor: '#1b1430',
  tilesets: [tileset],
  layers: [groundLayer, wallLayer, canopyLayer, lampLayer, objectLayer],
  nextlayerid: 6,
  nextobjectid: nextId,
};

mkdirSync('./public', { recursive: true });
writeFileSync('./public/map.json', JSON.stringify(tmj, null, 2));
console.log(`Wrote public/map.json  (${cols}×${rows} tiles | ${walls.length} walls | ${canopies.length} canopies | ${lamps.length} lamps)`);
