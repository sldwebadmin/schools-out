import { PX } from '../engine/constants.js';
import { bakeCanvas } from '../engine/utils.js';

// Humanoid sprite cell: (CX, CY) is the foot anchor within the cell
export const SW = 42, SH = 72, CX = 18, CY = 60;

// Dog sprite cell: (DCX, DCY) is the foot anchor
export const DSW = 50, DSH = 50, DCX = 24, DCY = 38;

// Human sheet row indices (direction)
export const DIR_DOWN  = 0;
export const DIR_LEFT  = 1;
export const DIR_RIGHT = 2;
export const DIR_UP    = 3;

// Dog sheet row indices
export const DOG_WALK_L  = 0;
export const DOG_WALK_R  = 1;
export const DOG_SLEEP   = 2;
export const DOG_ALERT_L = 3;
export const DOG_ALERT_R = 4;

let _sheets = null;

export function buildSheets(){
  const PALS = [
    { skin:"#e8a87c", shirt:"#7fb069", hair:"#2b2118", pants:"#2e6f8e" },
    { skin:"#e8a87c", shirt:"#b07f9e", hair:"#4a3322", pants:"#3a2719" },
    { skin:"#c07850", shirt:"#6f8eb0", hair:"#1b1430", pants:"#2e4a5e" },
  ];
  _sheets = {
    player: buildHumanSheet({ skin:"#e8a87c", shirt:"#ff6b57", hair:"#5a3a25", pants:"#2e6f8e" }, true),
    npc0:   buildHumanSheet(PALS[0], false),
    npc1:   buildHumanSheet(PALS[1], false),
    npc2:   buildHumanSheet(PALS[2], false),
    dog:    buildDogSheet(),
  };
  return _sheets;
}

export function getSheets(){ return _sheets; }

// ── pixel helper (integer coords, no PX snap — sheet is pre-rasterised) ──

function r(ctx, col, x, y, w, h){
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

// ── humanoid sheet (4 dirs × 4 frames) ───────────────────────────────

function buildHumanSheet(pal, hasPack){
  const [c, ctx] = bakeCanvas(SW * 4, SH * 4);
  for(let dir = 0; dir < 4; dir++)
    for(let fr = 0; fr < 4; fr++)
      drawHumanCell(ctx, fr * SW, dir * SH, dir, fr, pal, hasPack);
  return c;
}

function drawHumanCell(ctx, ox, oy, dir, fr, pal, hasPack){
  const cx = ox + CX, cy = oy + CY;
  // leg phase: 0=neutral, 1=step-A, -1=step-B; arms high on odd frames
  const lp = [0, 1, 0, -1][fr];
  const ah = fr === 1 || fr === 3;
  if     (dir === DIR_LEFT)  sideChar(ctx, cx, cy, -1, lp, ah, pal, hasPack);
  else if(dir === DIR_RIGHT) sideChar(ctx, cx, cy,  1, lp, ah, pal, hasPack);
  else if(dir === DIR_DOWN)  frontChar(ctx, cx, cy, lp, pal, hasPack);
  else                       backChar(ctx, cx, cy, lp, pal, hasPack);
}

function sideChar(ctx, cx, cy, face, lp, ah, { skin, shirt, hair, pants }, hasPack){
  // dark outline silhouette (same dimensions as original drawBody)
  r(ctx, "#16102b", cx-12, cy-47, 25, 50);
  // legs
  if(lp === 1)       { r(ctx, skin, cx-9, cy-8, 7, 14); r(ctx, skin, cx+3, cy-4, 7, 10); }
  else if(lp === -1) { r(ctx, skin, cx-9, cy-4, 7, 10); r(ctx, skin, cx+3, cy-8, 7, 14); }
  else               { r(ctx, skin, cx-9, cy-6, 7, 12); r(ctx, skin, cx+3, cy-6, 7, 12); }
  // shoes
  r(ctx, "#fff7e8", cx-10, cy+4, 9, 5);
  r(ctx, "#fff7e8", cx+2,  cy+4, 9, 5);
  // pants + shirt
  r(ctx, pants, cx-10, cy-16, 21, 10);
  r(ctx, shirt, cx-10, cy-32, 21, 17);
  r(ctx, "rgba(0,0,0,.15)", cx-10, cy-18, 21, 3);
  // backpack on opposite side of travel direction
  if(hasPack) r(ctx, "#ffc44d", cx - face*15, cy-30, 8, 14);
  // front arm (swings with steps)
  r(ctx, skin, cx + face*10, ah ? cy-28 : cy-32, 6, 11);
  // head + hair
  r(ctx, skin, cx-6, cy-45, 15, 14);
  r(ctx, hair, cx-7, cy-49, 17, 8);
  r(ctx, hair, cx - face*7, cy-44, 4, 8);
  // eye
  r(ctx, "#1b1430", cx + face*4, cy-41, PX, PX);
}

function frontChar(ctx, cx, cy, lp, { skin, shirt, hair, pants }){
  // outline
  r(ctx, "#16102b", cx-12, cy-47, 25, 52);
  // two legs side by side; alternating rise for walk animation
  const lUp = lp ===  1 ? 5 : 0;
  const rUp = lp === -1 ? 5 : 0;
  r(ctx, skin, cx-9, cy-16-lUp, 8, 16+lUp);
  r(ctx, skin, cx+1, cy-16-rUp, 8, 16+rUp);
  // shoes
  r(ctx, "#fff7e8", cx-10, cy+3, 9, 5);
  r(ctx, "#fff7e8", cx+1,  cy+3, 9, 5);
  // pants band
  r(ctx, pants, cx-9, cy-20, 18, 6);
  // shirt
  r(ctx, shirt, cx-10, cy-36, 20, 17);
  r(ctx, "rgba(0,0,0,.15)", cx-10, cy-22, 20, 3);
  // both arms visible at sides
  const lAY = lp === -1 ? cy-30 : cy-33;
  const rAY = lp ===  1 ? cy-30 : cy-33;
  r(ctx, skin, cx-13, lAY, 5, 11);
  r(ctx, skin, cx+8,  rAY, 5, 11);
  // head (slightly wider front-on)
  r(ctx, skin, cx-7, cy-47, 14, 12);
  // hair: top band + side tufts
  r(ctx, hair, cx-8, cy-49, 16, 7);
  r(ctx, hair, cx-8, cy-44, 3, 8);
  r(ctx, hair, cx+5, cy-44, 3, 8);
  // two eyes
  r(ctx, "#1b1430", cx-4, cy-41, PX, PX);
  r(ctx, "#1b1430", cx+2, cy-41, PX, PX);
}

function backChar(ctx, cx, cy, lp, { skin, shirt, hair, pants }, hasPack){
  r(ctx, "#16102b", cx-12, cy-47, 25, 52);
  const lUp = lp ===  1 ? 5 : 0;
  const rUp = lp === -1 ? 5 : 0;
  r(ctx, skin, cx-9, cy-16-lUp, 8, 16+lUp);
  r(ctx, skin, cx+1, cy-16-rUp, 8, 16+rUp);
  r(ctx, "#fff7e8", cx-10, cy+3, 9, 5);
  r(ctx, "#fff7e8", cx+1,  cy+3, 9, 5);
  r(ctx, pants, cx-9, cy-20, 18, 6);
  r(ctx, shirt, cx-10, cy-36, 20, 17);
  r(ctx, "rgba(0,0,0,.15)", cx-10, cy-22, 20, 3);
  // pack visible on back
  if(hasPack) r(ctx, "#ffc44d", cx-4, cy-33, 8, 14);
  const lAY = lp === -1 ? cy-30 : cy-33;
  const rAY = lp ===  1 ? cy-30 : cy-33;
  r(ctx, skin, cx-13, lAY, 5, 11);
  r(ctx, skin, cx+8,  rAY, 5, 11);
  // back of head — hair covers most of it
  r(ctx, skin, cx-6, cy-47, 12, 14);
  r(ctx, hair, cx-8, cy-49, 18, 10);
  r(ctx, hair, cx-7, cy-43, 14, 6);
}

// ── dog sheet (4 frames × 5 rows) ────────────────────────────────────

function buildDogSheet(){
  const [c, ctx] = bakeCanvas(DSW * 4, DSH * 5);
  for(let fr = 0; fr < 4; fr++){
    drawDogCell(ctx, fr*DSW, 0,       -1, "walk",  fr);
    drawDogCell(ctx, fr*DSW, DSH,      1, "walk",  fr);
    drawDogCell(ctx, fr*DSW, DSH*2,    1, "sleep",  0);
    drawDogCell(ctx, fr*DSW, DSH*3,   -1, "alert",  0);
    drawDogCell(ctx, fr*DSW, DSH*4,    1, "alert",  0);
  }
  return c;
}

function drawDogCell(ctx, ox, oy, face, mode, fr){
  const cx = ox + DCX, cy = oy + DCY;
  const step = fr === 1 || fr === 3;

  if(mode === "sleep"){
    r(ctx, "#16102b", cx-17, cy-16, 36, 22);
    r(ctx, "#96632f", cx-15, cy-14, 32, 18);  // curled body
    r(ctx, "#7a4e2a", cx+8,  cy-18, 12, 10);  // head
    r(ctx, "#7a4e2a", cx-14, cy-16,  8,  6);  // tail curl
    return;
  }

  if(mode === "alert"){
    r(ctx, "#16102b", cx-16, cy-12, 34, 16);
    r(ctx, "#96632f", cx-14, cy-10, 30, 12);           // body
    r(ctx, "#96632f", cx + face*8, cy-16, 14, 12);    // raised head
    r(ctx, "#1b1430", cx + face*16, cy-13, PX, PX);   // nose
    return;
  }

  // walk / chase
  r(ctx, "#16102b", cx-16, cy-29, 36, 32);
  // hind legs (alternating)
  if(step){ r(ctx, "#7a4e2a", cx-11, cy-2, 6, 9);  r(ctx, "#7a4e2a", cx+6, cy-4, 6, 11); }
  else     { r(ctx, "#7a4e2a", cx-11, cy-4, 6, 11); r(ctx, "#7a4e2a", cx+6, cy-2, 6, 9); }
  r(ctx, "#96632f", cx-14, cy-18, 30, 15);          // body
  r(ctx, "#ab7438", cx-14, cy-18, 30,  4);          // back stripe
  r(ctx, "#96632f", cx + face*9,  cy-27, 15, 14);  // neck + head
  r(ctx, "#7a4e2a", cx + face*9,  cy-32,  6,  8);  // ear base
  r(ctx, "#7a4e2a", cx + face*16, cy-31,  6,  7);  // ear tip
  r(ctx, "#1b1430", cx + face*17, cy-23, PX, PX);  // nose
  r(ctx, "#5a3a25", cx + face*20, cy-19,  5,  5);  // muzzle
  r(ctx, "#7a4e2a", cx - face*16, cy-22 + (step?0:3), 7, 7); // wagging tail
  r(ctx, "#ff6b57", cx + face*7,  cy-16,  4,  6);  // tongue
}
