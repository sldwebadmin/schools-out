// Procedurally-generated 32×32 pixel-art ground tiles for all 15 zone types.
// buildTileset() is called once at startup; getTileset() returns the canvas.
// Layout: 4 variant columns × 15 zone rows → 128×480 canvas.

import { bakeCanvas } from '../engine/utils.js';
import { mulberry32 } from '../engine/utils.js';
import { ZONE } from './tiledata.js';

export const TILE_W   = 32;
export const TILE_H   = 32;
export const VARIANTS = 4;

let _tileset = null;

export function buildTileset(){
  const [canvas, ctx] = bakeCanvas(TILE_W * VARIANTS, TILE_H * Object.keys(ZONE).length);
  ctx.imageSmoothingEnabled = false;
  const ZONES = Object.values(ZONE); // [1..15]
  for(const z of ZONES){
    for(let v = 0; v < VARIANTS; v++){
      const rnd = mulberry32((z * 17 + v + 1) * 7919);
      drawZoneTile(ctx, v * TILE_W, (z - 1) * TILE_H, z, v, rnd);
    }
  }
  _tileset = canvas;
  return canvas;
}

export function getTileset(){ return _tileset; }

// ── pixel helpers ────────────────────────────────────────────────────

function px(ctx, col, x, y, w=1, h=1){
  ctx.fillStyle = col;
  ctx.fillRect(x, y, w, h);
}

function scatter(ctx, ox, oy, rnd, n, cols, pw, ph){
  for(let i = 0; i < n; i++){
    ctx.fillStyle = cols[(rnd() * cols.length) | 0];
    ctx.fillRect(ox + (rnd() * TILE_W) | 0, oy + (rnd() * TILE_H) | 0, pw, ph);
  }
}

// ── tile drawers ─────────────────────────────────────────────────────

function drawZoneTile(ctx, ox, oy, zone, v, rnd){
  switch(zone){
    case ZONE.MEADOW:   return drawMeadow(ctx, ox, oy, v, rnd);
    case ZONE.FOREST:   return drawForest(ctx, ox, oy, v, rnd);
    case ZONE.LAWN:     return drawLawn(ctx, ox, oy, v, rnd);
    case ZONE.SCHOOL:   return drawSchoolGrass(ctx, ox, oy, v, rnd);
    case ZONE.BLACKTOP: return drawBlacktop(ctx, ox, oy, v, rnd);
    case ZONE.SANDBOX:  return drawSand(ctx, ox, oy, v, rnd);
    case ZONE.ROAD:     return drawRoad(ctx, ox, oy, v, rnd);
    case ZONE.SIDEWALK: return drawSidewalk(ctx, ox, oy, v, rnd);
    case ZONE.DIRT:     return drawDirt(ctx, ox, oy, v, rnd);
    case ZONE.POND:     return drawPond(ctx, ox, oy, v, rnd);
    case ZONE.GARDEN:   return drawGarden(ctx, ox, oy, v, rnd);
    case ZONE.COURT:    return drawCourt(ctx, ox, oy, v, rnd);
    case ZONE.MARKET:   return drawMarket(ctx, ox, oy, v, rnd);
    case ZONE.WATER:    return drawWater(ctx, ox, oy, v, rnd);
    case ZONE.GRAVEL:   return drawGravel(ctx, ox, oy, v, rnd);
    default:
      ctx.fillStyle = '#4e7d4a'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  }
}

// ── individual zone tiles ─────────────────────────────────────────────

function drawMeadow(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#4e7d4a'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  // dark grass blades
  scatter(ctx, ox, oy, rnd, 16, ['#3a6340','#3e6845','#355e3c'], 1, 2);
  // light patches
  scatter(ctx, ox, oy, rnd, 10, ['#578854','#5a8856'], 2, 1);
  // extra speckling
  scatter(ctx, ox, oy, rnd,  8, ['#3a6340'], 1, 1);
  // flowers on variants 1 & 3
  if(v === 1 || v === 3){
    const fc = ['#ff9ac1','#ffd27a','#cdb8ff'];
    for(let i = 0; i < 3; i++){
      ctx.fillStyle = fc[(rnd() * 3) | 0];
      ctx.fillRect(ox + (rnd() * (TILE_W - 2)) | 0, oy + (rnd() * (TILE_H - 2)) | 0, 2, 2);
    }
  }
  // darker shade on variant 2 (e.g. under canopy)
  if(v === 2){
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
    scatter(ctx, ox, oy, rnd, 10, ['#335c38'], 2, 1);
  }
}

function drawForest(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#26492e'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 20, ['#1d3b25','#20402a'], 3, 2);
  scatter(ctx, ox, oy, rnd, 12, ['#2e5535','#336038'], 2, 1);
  if(v >= 2) scatter(ctx, ox, oy, rnd,  8, ['#4a3520','#3d2e18'], 1, 1); // leaf litter
  if(v === 3){ // clearing hint
    ctx.fillStyle = 'rgba(80,130,70,0.18)'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  }
}

function drawLawn(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#4c7a4f'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 14, ['#3e6840','#56885a'], 1, 2);
  scatter(ctx, ox, oy, rnd,  8, ['#56885a','#4f8356'], 2, 1);
  if(v === 1) scatter(ctx, ox, oy, rnd, 4, ['#ff9ac1','#ffd27a'], 1, 1);
  if(v === 2) scatter(ctx, ox, oy, rnd, 6, ['#3e6840'], 2, 2);
}

function drawSchoolGrass(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#467a4d'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  // mow stripes (alternating bands, 6px)
  for(let y = 0; y < TILE_H; y += 6){
    if(((y / 6) | 0) % 2 === 0){
      ctx.fillStyle = 'rgba(0,0,0,0.07)'; ctx.fillRect(ox, oy + y, TILE_W, 6);
    }
  }
  scatter(ctx, ox, oy, rnd, 12, ['#3d6a44','#508855'], 1, 2);
  if(v === 3){ // science wing side — slightly darker
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  }
}

function drawBlacktop(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#55517a'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 18, ['#4c4870','#5e5a84','#504c76'], 2, 1);
  scatter(ctx, ox, oy, rnd,  8, ['#48446e'], 1, 1);
  if(v >= 2){ // worn patches
    ctx.fillStyle = '#4a466c';
    for(let i = 0; i < 3; i++) ctx.fillRect(ox + (rnd() * 24) | 0, oy + (rnd() * 24) | 0, 4, 3);
  }
}

function drawSand(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#d9c08c'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 30, ['#cdb27c','#c4a870','#e3cd9d','#c8b47e'], 2, 1);
  scatter(ctx, ox, oy, rnd, 12, ['#c4a870','#bda46a'], 1, 1);
  if(v === 2 || v === 3) scatter(ctx, ox, oy, rnd, 6, ['#e8d4a6'], 3, 2); // ripple marks
}

function drawRoad(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#46406b'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 14, ['#4d4775','#403a62','#4a446e'], 3, 2);
  scatter(ctx, ox, oy, rnd,  8, ['#3e3860','#524e78'], 1, 1);
  // subtle crack on variants 1 & 3
  if(v === 1 || v === 3){
    ctx.fillStyle = '#3a3460';
    const cx = (rnd() * 18 + 7) | 0;
    const ch = (rnd() * 10 + 8) | 0;
    ctx.fillRect(ox + cx, oy + (rnd() * (TILE_H - ch)) | 0, 1, ch);
  }
}

function drawSidewalk(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#6a5c91'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 10, ['#5d5083','#726498','#635582'], 2, 1);
  // concrete slab joint lines
  ctx.fillStyle = '#574878';
  ctx.fillRect(ox,      oy + 15, TILE_W, 2); // horizontal joint seam at mid-tile
  if(v >= 2) ctx.fillRect(ox + 15, oy, 2, TILE_H); // vertical joint (for wide sidewalk)
  // highlight top edge (where light would catch)
  ctx.fillStyle = '#7a6ea0';
  ctx.fillRect(ox, oy, TILE_W, 1);
}

function drawDirt(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#8a7350'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 22, ['#79643f','#6b5838','#937a58'], 3, 2);
  scatter(ctx, ox, oy, rnd, 12, ['#6b5838','#7d6848'], 2, 1);
  if(v >= 2) scatter(ctx, ox, oy, rnd, 8, ['#574530','#9a8060'], 1, 1);
  if(v === 3){ // muddy
    ctx.fillStyle = 'rgba(40,25,10,0.15)'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
    scatter(ctx, ox, oy, rnd, 6, ['#4a3420'], 4, 2);
  }
}

function drawPond(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#2e6f8e'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  const offsets = v < 2 ? [5, 14, 23] : [3, 12, 21, 30];
  for(const dy of offsets){
    if(oy + dy >= oy + TILE_H) continue;
    ctx.fillStyle = 'rgba(63,134,168,0.55)'; ctx.fillRect(ox + 3, oy + dy, 18, 2);
    ctx.fillStyle = 'rgba(70,150,180,0.4)';  ctx.fillRect(ox + 5, oy + dy, 10, 1);
  }
  scatter(ctx, ox, oy, rnd, 5, ['#256080','#1f5578'], 2, 1);
}

function drawGarden(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  // planting rows
  const rows = [4, 20];
  for(const ry of rows){
    ctx.fillStyle = '#5a3c24'; ctx.fillRect(ox, oy + ry, TILE_W, 4);
    for(let bx = ox + 2; bx < ox + TILE_W; bx += 8){
      ctx.fillStyle = '#5fae5a'; ctx.fillRect(bx, oy + ry - 2, 4, 5);
    }
  }
  scatter(ctx, ox, oy, rnd, 5, ['#7a5538','#5e3e25'], 2, 1);
}

function drawCourt(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#3a3760'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 14, ['#333060','#404070','#38356a'], 2, 1);
  scatter(ctx, ox, oy, rnd,  6, ['#2e2b58'], 1, 1);
  if(v >= 2){ // scuff marks
    ctx.fillStyle = '#45427a';
    for(let i = 0; i < 3; i++) ctx.fillRect(ox + (rnd() * 26) | 0, oy + (rnd() * 26) | 0, 4, 2);
  }
}

function drawMarket(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#3f3a60'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  // paving stone grout lines
  ctx.fillStyle = '#37325a';
  for(let y = oy; y < oy + TILE_H; y += 16){ ctx.fillRect(ox, y, TILE_W, 1); }
  for(let x = ox; x < ox + TILE_W; x += 16){ ctx.fillRect(x, oy, 1, TILE_H); }
  // subtle stone surface variation
  scatter(ctx, ox, oy, rnd, 8, ['#46406a','#383458'], 3, 2);
  if(v === 1) scatter(ctx, ox, oy, rnd, 4, ['#3c376a'], 1, 1);
}

function drawWater(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#1f4a63'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  // wave highlight lines
  const wys = v < 2 ? [5, 14, 23] : [2, 11, 20, 29];
  for(const dy of wys){
    if(oy + dy >= oy + TILE_H) continue;
    ctx.fillStyle = '#24567a'; ctx.fillRect(ox + 2,  oy + dy, 22, 2);
    ctx.fillStyle = '#2a6888'; ctx.fillRect(ox + 4,  oy + dy,  13, 1);
    ctx.fillStyle = '#1e4a62'; ctx.fillRect(ox + 18, oy + dy,   6, 1);
  }
  // deep dark spots
  scatter(ctx, ox, oy, rnd, 6, ['#183c5a','#1c4460'], 2, 1);
  // occasional foam dot
  if(v === 1 || v === 3){
    ctx.fillStyle = 'rgba(200,230,255,0.25)';
    ctx.fillRect(ox + (rnd() * 26) | 0, oy + (rnd() * 26) | 0, 3, 2);
  }
}

function drawGravel(ctx, ox, oy, v, rnd){
  ctx.fillStyle = '#7a6a50'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
  scatter(ctx, ox, oy, rnd, 28, ['#6b5a3e','#8a7a58','#9a8a6a','#5a4a2e'], 4, 3);
  scatter(ctx, ox, oy, rnd, 14, ['#9a8a6a','#5a4a2e','#847060'], 2, 2);
  scatter(ctx, ox, oy, rnd,  8, ['#706050'], 1, 1);
  if(v === 3){ // concrete pad variant (used under construction buildings)
    ctx.fillStyle = 'rgba(154,144,140,0.55)'; ctx.fillRect(ox, oy, TILE_W, TILE_H);
    scatter(ctx, ox, oy, rnd, 16, ['#888080','#a0a0a8','#909098'], 4, 3);
  }
}
