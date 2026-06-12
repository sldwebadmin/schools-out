/**
 * One-time export: runs buildMap() and serialises the result as a Tiled JSON
 * map (public/map.json) plus a JS wrapper (src/world/mapdata.js).
 * Run with: node scripts/export-map.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import { buildMap, walls, canopies, lamps } from '../src/world/map.js';

buildMap();

const TILE = 16;
const W = 4000, H = 3000;
let nextId = 1;
const id = () => nextId++;

function wallProps(w) {
  const p = [];
  if(w.hop)                        p.push({name:'hop',      type:'bool',   value:true});
  if(w.ghost)                      p.push({name:'ghost',    type:'bool',   value:true});
  if(w.noshadow)                   p.push({name:'noshadow', type:'bool',   value:true});
  if(w.player)                     p.push({name:'player',   type:'bool',   value:true});
  if(w.hue)                        p.push({name:'hue',      type:'string', value:w.hue});
  if(w.trim)                       p.push({name:'trim',     type:'string', value:w.trim});
  if(w.txt)                        p.push({name:'txt',      type:'string', value:w.txt});
  if(w.txt2 !== undefined && w.txt2 !== null)
                                   p.push({name:'txt2',     type:'string', value:w.txt2});
  return p;
}

const wallLayer = {
  type: 'objectgroup', id: 1, name: 'walls',
  x: 0, y: 0, visible: true, opacity: 1, color: '#ff6b57',
  objects: walls.map(w => ({
    id: id(), name: w.type, class: w.type,
    x: w.x, y: w.y, width: w.w, height: w.h,
    visible: true, rotation: 0,
    properties: wallProps(w),
  })),
};

const canopyLayer = {
  type: 'objectgroup', id: 2, name: 'canopies',
  x: 0, y: 0, visible: true, opacity: 1, color: '#2ec4b6',
  objects: canopies.map(c => ({
    id: id(), name: 'canopy', class: 'canopy',
    ellipse: true,
    x: c.x - c.r, y: c.y - c.r,
    width: c.r * 2, height: c.r * 2,
    visible: true, rotation: 0, properties: [],
  })),
};

const lampLayer = {
  type: 'objectgroup', id: 3, name: 'lamps',
  x: 0, y: 0, visible: true, opacity: 1, color: '#ffc44d',
  objects: lamps.map(L => ({
    id: id(), name: 'lamp', class: 'lamp',
    point: true,
    x: L.x, y: L.y, width: 0, height: 0,
    visible: true, rotation: 0, properties: [],
  })),
};

const tmj = {
  version: '1.10', type: 'map', tiledversion: '1.10.2',
  width: Math.ceil(W / TILE), height: Math.ceil(H / TILE),
  tilewidth: TILE, tileheight: TILE,
  infinite: false, orientation: 'orthogonal', renderorder: 'right-down',
  backgroundcolor: '#1b1430',
  tilesets: [],
  layers: [wallLayer, canopyLayer, lampLayer],
  nextlayerid: 4,
  nextobjectid: nextId,
};

mkdirSync('./public', {recursive: true});
writeFileSync('./public/map.json', JSON.stringify(tmj, null, 2));
writeFileSync('./src/world/mapdata.js',
  `// Auto-generated from public/map.json — edit in Tiled, then run: npm run import-map\nexport default ${JSON.stringify(tmj)};\n`);

console.log(`Exported ${walls.length} walls, ${canopies.length} canopies, ${lamps.length} lamps`);
console.log('Wrote → public/map.json + src/world/mapdata.js');
