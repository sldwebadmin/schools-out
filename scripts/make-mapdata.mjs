/**
 * Validates src/world/mapdata.js — checks that no solid objects land inside
 * the HY1 or HY2 intersection roads, and reports counts per region.
 *
 * Run with: node scripts/make-mapdata.mjs
 *
 * To regenerate mapdata.js from scratch (if the whole neighbourhood is redesigned),
 * you would need to restore the old formula-based map.js, run the original
 * dump-map.mjs to capture positions, apply any fixes, and re-export.
 * For normal content additions, edit mapdata.js directly.
 */
import { buildMap, walls, canopies, lamps, doors } from '../src/world/map.js';

buildMap();

console.log(`mapdata summary:`);
console.log(`  walls: ${walls.length}  canopies: ${canopies.length}  lamps: ${lamps.length}  doors: ${doors.length}`);

// ── Region breakdown ───────────────────────────────────────────────────
const regions = [
  ['SCHOOL',       [4096,512,2240,1600]],
  ['WOODS',        [256,2048,2048,3584]],
  ['PARK',         [2560,2304,2048,1152]],
  ['SHOPPING',     [5632,2560,2240,1920]],
  ['NEIGHBOURHOOD',[2560,3584,2560,2560]],
  ['LAKE',         [2560,6400,5376,1536]],
  ['CONSTRUCTION', [512,512,1536,1280]],
  ['ATHLETIC',     [6336,1024,1024,1088]],
  ['WATERTOWER',   [6656,512,1024,512]],
];
for(const [name,[rx,ry,rw,rh]] of regions){
  const count = walls.filter(w =>
    w.x < rx+rw && w.x+w.w > rx && w.y < ry+rh && w.y+w.h > ry
  ).length;
  console.log(`  ${name.padEnd(14)} ${count} walls`);
}

// ── Sanity checks ──────────────────────────────────────────────────────
const HY1=[4480,4620], HY2=[5248,5388];
let issues=0;

for(const w of walls.filter(w=>w.hop)){
  if(w.y < HY2[1] && w.y+w.h > HY2[0] && w.x >= 2560 && w.x <= 5120){
    console.warn(`  WARN fence in HY2: (${w.x},${w.y},${w.w}×${w.h})`); issues++;
  }
  if(w.y < HY1[1] && w.y+w.h > HY1[0] && w.x >= 2560 && w.x <= 5120){
    console.warn(`  WARN fence in HY1: (${w.x},${w.y},${w.w}×${w.h})`); issues++;
  }
}

const hSE2 = walls.find(w=>w.type==='house'&&w.hue==='#4f6b5e');
if(hSE2 && hSE2.y < 4660){ console.warn(`  WARN SE between-streets house clips above yard (y=${hSE2.y})`); issues++; }
const hSWs = walls.find(w=>w.type==='house'&&w.hue==='#56406f');
if(hSWs && hSWs.y < 5400){ console.warn(`  WARN SW south house in road zone (y=${hSWs.y})`); issues++; }

for(const l of lamps){
  if(l.y>=HY1[0]&&l.y<HY1[1]&&l.x>=2560&&l.x<=5120){ console.warn(`  WARN lamp in HY1: (${l.x},${l.y})`); issues++; }
  if(l.y>=HY2[0]&&l.y<HY2[1]&&l.x>=2560&&l.x<=5120){ console.warn(`  WARN lamp in HY2: (${l.x},${l.y})`); issues++; }
}

if(issues===0) console.log('  All sanity checks passed.');
else           console.log(`  ${issues} issue(s) found — fix in src/world/mapdata.js`);
