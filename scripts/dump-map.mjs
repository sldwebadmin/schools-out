/**
 * Dumps the current runtime map state (walls, canopies, lamps, doors)
 * as a flat JSON audit file. Used once to convert from formula placement
 * to explicit data. Run with: node scripts/dump-map.mjs
 */
import { writeFileSync } from 'fs';
import { buildMap, walls, canopies, lamps, doors } from '../src/world/map.js';

buildMap();

// Compact each object to only include non-default properties
function cleanWall(w) {
  const obj = { x: w.x, y: w.y, w: w.w, h: w.h, type: w.type };
  if (w.hop)      obj.hop      = true;
  if (w.ghost)    obj.ghost    = true;
  if (w.noshadow) obj.noshadow = true;
  if (w.player)   obj.player   = true;
  if (w.hue)      obj.hue      = w.hue;
  if (w.trim)     obj.trim     = w.trim;
  if (w.txt)      obj.txt      = w.txt;
  if (w.txt2 !== undefined && w.txt2 !== '') obj.txt2 = w.txt2;
  return obj;
}

const out = {
  walls: walls.map(cleanWall),
  canopies: canopies.map(c => ({ x: c.x, y: c.y, r: c.r })),
  lamps: lamps.map(L => ({ x: L.x, y: L.y })),
  doors: doors.map(d => {
    const obj = { x: d.x, y: d.y, w: d.w, h: d.h };
    if (d.target) obj.target = d.target;
    if (d.spawnX) obj.spawnX = d.spawnX;
    if (d.spawnY) obj.spawnY = d.spawnY;
    if (d.worldReturn) obj.worldReturn = d.worldReturn;
    if (d.txt) obj.txt = d.txt;
    return obj;
  }),
};

writeFileSync('./scripts/map-dump.json', JSON.stringify(out, null, 2));
console.log(`walls: ${walls.length}, canopies: ${canopies.length}, lamps: ${lamps.length}, doors: ${doors.length}`);
// Print region-by-region summary for audit
const regions = [
  ['BORDER',       [0,0,8192,8192]],
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
for (const [name, [rx,ry,rw,rh]] of regions) {
  const rw2 = walls.filter(w =>
    w.x < rx+rw && w.x+w.w > rx &&
    w.y < ry+rh && w.y+w.h > ry
  );
  console.log(`${name.padEnd(14)} ${rw2.length} walls`);
}
