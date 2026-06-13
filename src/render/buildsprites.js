// Pre-baked building sprites for USE_SHEETS mode.
// buildBuildingSprites(walls) is called once at startup; each eligible wall
// gets a canvas snapshotted into a WeakMap keyed by the wall object.
// getBuildingSprite(w) returns {canvas, ox, oy} or null.
//
// ox, oy: pixel offset from logical (w.x, w.y) to the sprite's top-left corner.
// Blit with: ctx.drawImage(canvas, snap(w.x - cam.x + ox), snap(w.y - cam.y + oy))

import { bakeCanvas } from '../engine/utils.js';

const BUILDING_TYPES = new Set(['house', 'school', 'market', 'shack', 'treehouse']);
const _cache = new WeakMap();

export function buildBuildingSprites(walls){
  for(const w of walls){
    if(!BUILDING_TYPES.has(w.type) || w.ghost) continue;
    const sp = _bakeSprite(w);
    if(sp) _cache.set(w, sp);
  }
}

export function getBuildingSprite(w){
  return _cache.get(w) ?? null;
}

// ── internal helpers ─────────────────────────────────────────────────

// Fill a rect in sprite space: (bx,by) is where (w.x,w.y) lands in the canvas.
function _f(ctx, c, bx, by, dx, dy, fw, fh){
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(bx + dx), Math.round(by + dy), Math.max(1, Math.round(fw)), Math.max(1, Math.round(fh)));
}

// Outline rect in sprite space, 3px border (matching PX=3 in draw.js)
function _ol(ctx, bx, by, dx, dy, ow, oh){
  ctx.strokeStyle = '#16102b'; ctx.lineWidth = 3;
  ctx.strokeRect(Math.round(bx + dx) + 1.5, Math.round(by + dy) + 1.5,
                 Math.round(ow) - 3,         Math.round(oh) - 3);
}

function _bakeSprite(w){
  switch(w.type){
    case 'house':     return _bakeHouse(w);
    case 'school':    return _bakeSchool(w);
    case 'market':    return _bakeMarket(w);
    case 'shack':     return _bakeShack(w);
    case 'treehouse': return _bakeTreehouse(w);
  }
  return null;
}

// ── HOUSE ────────────────────────────────────────────────────────────
// Visual: (w.x-8, w.y-16) .. (w.x+w.w+8, w.y+w.h+16)
function _bakeHouse(w){
  const OL=8, OR=8, OT=16, OB=16;
  const SW = w.w + OL + OR, SH = w.h + OT + OB;
  const [c, ctx] = bakeCanvas(SW, SH);
  const bx = OL, by = OT; // sprite pixel where (w.x,w.y) lands
  const FW = 48;           // facade height (bottom portion)

  // — upper dark body —
  _f(ctx, '#2a2147', bx, by, -OL, -OT, w.w + OL + OR, w.h - FW + OT);
  // subtle horizontal highlight lines on upper body
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for(let sy = -8; sy < w.h - FW - 8; sy += 11)
    ctx.fillRect(bx - OL, by + sy, w.w + OL + OR, 2);

  // — roof strip at top (deeper than original, now 14px with ridge) —
  _f(ctx, '#3a2f5c', bx, by, -OL, -OT, w.w + OL + OR, 14);
  _f(ctx, '#4a3f6e', bx, by, -OL, -OT + 2, w.w + OL + OR, 4); // ridge highlight

  // — upper windows (Stage-2 addition — not in original props.js) —
  const nWin = Math.max(1, Math.floor(w.w / 86));
  const WW = 22, WH = 18;
  const winY = Math.round((w.h - FW) / 2 - WH / 2 - 4);
  for(let i = 0; i < nWin; i++){
    const winX = Math.round(w.w / (nWin + 1) * (i + 1) - WW / 2);
    _f(ctx, '#1b1430', bx, by, winX - 2, winY - 2, WW + 4, WH + 4);
    _f(ctx, '#7a9ab0', bx, by, winX,     winY,     WW,     WH);
    _f(ctx, '#9ac4da', bx, by, winX + 2, winY + 2, WW - 4, 5); // window highlight
    // mullion cross
    ctx.fillStyle = '#1b1430';
    ctx.fillRect(bx + winX + WW / 2 - 1, by + winY, 2, WH);
    ctx.fillRect(bx + winX, by + winY + WH / 2 - 1, WW, 2);
  }

  // — floor junction strip —
  _f(ctx, '#241d40', bx, by, -OL, w.h - FW - 8, w.w + OL + OR, 8);

  // — facade (coloured lower section) —
  _f(ctx, w.hue || '#7fb069', bx, by, 0, w.h - FW, w.w, FW);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  for(let sy = w.h - FW + 9; sy < w.h; sy += 9)
    ctx.fillRect(bx, by + sy, w.w, 2);

  // — bay-window / lamp glow —
  const gwx = w.w * 0.58, gwy = w.h - 36;
  const glx = bx + gwx, gly = by + gwy;
  const grad = ctx.createRadialGradient(glx + 10, gly + 10, 2, glx + 10, gly + 10, 42);
  grad.addColorStop(0, 'rgba(255,200,110,.45)');
  grad.addColorStop(1, 'rgba(255,200,110,0)');
  ctx.fillStyle = grad; ctx.fillRect(glx - 30, gly - 30, 84, 84);
  _f(ctx, '#ffd27a', bx, by, w.w * 0.58, w.h - 36, 22, 22);
  _f(ctx, w.trim || '#ff6b57', bx, by, w.w * 0.58 - 2, w.h - 38, 26, 3);
  _f(ctx, '#a86f3e', bx, by, w.w * 0.58 + 9, w.h - 36, 4, 22);
  _f(ctx, '#ffd27a', bx, by, w.w * 0.78,     w.h - 36, 16, 22);

  // — chimney —
  _f(ctx, '#241d40', bx, by, w.w * 0.72, -28, 14, 16);

  // — door —
  const dx = Math.round(w.w * 0.18);
  const doorC = w.player ? '#ffc44d' : '#3a2719';
  _f(ctx, doorC,    bx, by, dx,      w.h - 34, 20, 34);
  _f(ctx, '#1b1430',bx, by, dx + 14, w.h - 19,  3,  3); // knob
  _f(ctx, '#6a5c91',bx, by, dx - 5,  w.h - 2,  30,  6); // doorstep
  if(w.player) _f(ctx, '#2ec4b6', bx, by, dx - 5, w.h + 4, 30, 5); // welcome mat

  // — outline —
  _ol(ctx, bx, by, -OL, -OT, w.w + OL + OR, w.h + OT); // bottom = w.y+w.h

  return { canvas: c, ox: -OL, oy: -OT };
}

// ── SCHOOL ───────────────────────────────────────────────────────────
// Visual: (w.x-10, w.y-14) .. (w.x+w.w+10, w.y+w.h+14)  — b:0 pad
function _bakeSchool(w){
  const OL=10, OR=10, OT=14, OB=0;
  const SW = w.w + OL + OR, SH = w.h + OT + OB;
  const [c, ctx] = bakeCanvas(SW, SH);
  const bx = OL, by = OT;
  const FW = 60;

  // upper dark brick body
  _f(ctx, '#7a3d33', bx, by, -OL, -OT, w.w + OL + OR, w.h - FW + OT);
  // roof parapet
  _f(ctx, '#8f4a3e', bx, by, -OL, -OT, w.w + OL + OR, 10);

  // — windows distributed across facade (improved: fills full width) —
  const winRowY = w.h - 50;
  const winW = 24, winH = 20, winGap = 12;
  const totalWinW = winW + winGap;
  // left half: from 40px to center entrance (avoid door area)
  const entranceW = 68, entranceMid = w.w / 2;
  for(let wx2 = 40; wx2 + winW < entranceMid - entranceW / 2 - 4; wx2 += totalWinW){
    _f(ctx, '#ffe9c2', bx, by, wx2 - 3, winRowY, winW + 6, winH + 6);
    _f(ctx, '#ffd27a', bx, by, wx2,     winRowY + 3, winW, winH);
    _f(ctx, '#ffe0a0', bx, by, wx2 + 2, winRowY + 5, winW - 4, 6);
  }
  // right half: mirror
  for(let wx2 = 40; wx2 + winW < entranceMid - entranceW / 2 - 4; wx2 += totalWinW){
    const rx = w.w - 40 - wx2;
    _f(ctx, '#ffe9c2', bx, by, rx - winW - 3, winRowY, winW + 6, winH + 6);
    _f(ctx, '#ffd27a', bx, by, rx - winW,     winRowY + 3, winW, winH);
    _f(ctx, '#ffe0a0', bx, by, rx - winW + 2, winRowY + 5, winW - 4, 6);
  }

  // facade lower
  _f(ctx, '#a85546', bx, by, 0, w.h - FW, w.w, FW);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for(let sy = w.h - FW + 8; sy < w.h; sy += 8)
    ctx.fillRect(bx, by + sy, w.w, 2);

  // centre entrance
  _f(ctx, '#ffe9c2', bx, by, w.w / 2 - 34, w.h - 46, 68, 46);
  _f(ctx, '#3a2719', bx, by, w.w / 2 - 26, w.h - 40, 24, 40);
  _f(ctx, '#3a2719', bx, by, w.w / 2 + 2,  w.h - 40, 24, 40);

  // school name sign
  ctx.fillStyle = '#ffe9c2'; ctx.font = '900 15px monospace'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('MAPLE ELEMENTARY', bx + w.w / 2 - 78, by + w.h - 58);

  _ol(ctx, bx, by, -OL, -OT, w.w + OL + OR, w.h + OT);

  return { canvas: c, ox: -OL, oy: -OT };
}

// ── MARKET ───────────────────────────────────────────────────────────
// Visual: (w.x-8, w.y-12) .. (w.x+w.w+8, w.y+w.h+12)  — b:0 pad
function _bakeMarket(w){
  const OL=8, OR=8, OT=12, OB=0;
  const SW = w.w + OL + OR, SH = w.h + OT + OB;
  const [c, ctx] = bakeCanvas(SW, SH);
  const bx = OL, by = OT;
  const FW = 56;

  // dark upper body
  _f(ctx, '#473a6e', bx, by, -OL, -OT, w.w + OL + OR, w.h - FW + OT);

  // sign band (top 30px of facade)
  _f(ctx, '#5d4a7a', bx, by, 0, w.h - FW, w.w, FW);

  // awning stripes across full width
  const stripW = (w.w + OL + OR) / 8;
  for(let i = 0; i < 8; i++){
    _f(ctx, i % 2 ? '#ff6b57' : '#ffe9c2', bx, by, -OL + i * stripW, w.h - FW - 6, Math.ceil(stripW), 12);
  }

  // large sign / display window
  _f(ctx, '#ffd27a', bx, by, 30, w.h - 42, w.w * 0.36, 34);
  _f(ctx, '#ffe9c2', bx, by, 30, w.h - 42, w.w * 0.36, 4);

  // door
  _f(ctx, '#3a2719', bx, by, w.w * 0.62, w.h - 40, 26, 40);

  // store name
  ctx.fillStyle = '#ffc44d'; ctx.font = '900 17px monospace'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('MAPLE MART', bx + w.w / 2 - 48, by + 8 - OT);

  // upper-body windows (small horizontal strip windows)
  if(w.h > 200){
    const wY = Math.round(w.h * 0.35);
    for(let i = 0; i < 4; i++){
      const wX = 20 + i * Math.floor((w.w - 40) / 4);
      _f(ctx, '#1b1430', bx, by, wX - 2, wY - 2, 44, 14);
      _f(ctx, '#7a9ab0', bx, by, wX,     wY,     40, 10);
      _f(ctx, '#9ac4da', bx, by, wX + 2, wY + 2, 36, 4);
    }
  }

  _ol(ctx, bx, by, -OL, -OT, w.w + OL + OR, w.h + OT);

  return { canvas: c, ox: -OL, oy: -OT };
}

// ── SNACK SHACK ──────────────────────────────────────────────────────
// Visual: (w.x-8, w.y-10) .. (w.x+w.w+8, w.y+w.h+10)  — b:0 pad
function _bakeShack(w){
  const OL=8, OR=8, OT=10, OB=0;
  const SW = w.w + OL + OR, SH = w.h + OT + OB;
  const [c, ctx] = bakeCanvas(SW, SH);
  const bx = OL, by = OT;
  const FW = 42;

  // upper wood body (warm tan)
  _f(ctx, '#a88050', bx, by, -OL, -OT, w.w + OL + OR, w.h - FW + OT);
  // horizontal plank lines
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for(let py = -OT + 8; py < w.h - FW; py += 10) ctx.fillRect(bx - OL, by + py, w.w + OL + OR, 2);

  // facade (cream/tan lower section)
  _f(ctx, '#c8a870', bx, by, 0, w.h - FW, w.w, FW);

  // awning stripes
  const stripW = (w.w + OL + OR) / 8;
  for(let i = 0; i < 8; i++){
    _f(ctx, i % 2 ? '#ff6b57' : '#ffe9c2', bx, by, -OL + i * stripW, -OT, Math.ceil(stripW), 12);
  }

  // service window (open counter)
  _f(ctx, '#1b1430', bx, by, Math.round(w.w * 0.1), Math.round(w.h * 0.15), Math.round(w.w * 0.5), Math.round(w.h * 0.4));
  _f(ctx, '#3a2719', bx, by, Math.round(w.w * 0.1) + 2, Math.round(w.h * 0.15) + 2, Math.round(w.w * 0.5) - 4, Math.round(w.h * 0.4) - 4);
  // counter ledge
  _f(ctx, '#c8a262', bx, by, Math.round(w.w * 0.1) - 4, Math.round(w.h * 0.15) + Math.round(w.h * 0.4) - 3, Math.round(w.w * 0.5) + 8, 6);

  // door
  _f(ctx, '#3a2719', bx, by, Math.round(w.w * 0.38), w.h - 36, 28, 36);

  // sign
  ctx.fillStyle = '#ffc44d'; ctx.font = '700 11px monospace'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('SNACK SHACK', bx + w.w / 2 - 38, by - 2);

  _ol(ctx, bx, by, -OL, -OT, w.w + OL + OR, w.h + OT);

  return { canvas: c, ox: -OL, oy: -OT };
}

// ── TREEHOUSE ────────────────────────────────────────────────────────
// Visual: (w.x, w.y-16) .. (w.x+w.w, w.y+w.h)  — l:0,r:0,t:16,b:0
function _bakeTreehouse(w){
  const OL=0, OR=0, OT=16, OB=0;
  const SW = w.w + OL + OR, SH = w.h + OT + OB;
  const [c, ctx] = bakeCanvas(SW, SH);
  const bx = OL, by = OT;

  const gh = Math.floor(w.h * 0.28);
  const ch = Math.floor(w.h * 0.35);
  const tx = Math.floor(w.w * 0.32);
  const tw = Math.max(12, Math.floor(w.w * 0.36));

  // trunk
  _f(ctx, '#4a3322', bx, by, tx, gh + ch, tw, w.h - gh - ch);
  _f(ctx, '#3a2719', bx, by, tx, gh + ch, Math.floor(tw * 0.4), w.h - gh - ch);

  // tree growth (base canopy — drawn below the house structure so y-sort works)
  ctx.fillStyle = '#2a5530';
  ctx.beginPath();
  ctx.ellipse(bx + w.w / 2, by + gh + ch * 0.5, w.w * 0.52, ch * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#346640';
  ctx.beginPath();
  ctx.ellipse(bx + w.w / 2 - 10, by + gh + ch * 0.38, w.w * 0.38, ch * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();

  // platform beam
  _f(ctx, '#a86f3e', bx, by, Math.floor(w.w * 0.07), gh - 4, Math.floor(w.w * 0.86), 8);
  _f(ctx, '#8a5730', bx, by, Math.floor(w.w * 0.07), gh - 4, Math.floor(w.w * 0.86), 3);

  // house body (planks)
  _f(ctx, '#8a5730', bx, by, Math.floor(w.w * 0.14), 0, Math.floor(w.w * 0.72), gh + 4);
  // plank lines
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for(let py = 8; py < gh + 4; py += 10) ctx.fillRect(bx + Math.floor(w.w * 0.14), by + py, Math.floor(w.w * 0.72), 2);
  _f(ctx, '#6b4020', bx, by, Math.floor(w.w * 0.14), Math.floor(gh * 0.55), Math.floor(w.w * 0.72), 3);

  // windows (teal panes — same as original)
  _f(ctx, '#2ec4b6', bx, by, Math.floor(w.w * 0.20), 4, Math.floor(w.w * 0.18), Math.floor(gh * 0.45));
  _f(ctx, '#1b8080', bx, by, Math.floor(w.w * 0.29), 4, 2, Math.floor(gh * 0.45));
  _f(ctx, '#2ec4b6', bx, by, Math.floor(w.w * 0.58), 4, Math.floor(w.w * 0.18), Math.floor(gh * 0.45));
  _f(ctx, '#1b8080', bx, by, Math.floor(w.w * 0.67), 4, 2, Math.floor(gh * 0.45));

  // door
  _f(ctx, '#3a2719', bx, by, Math.floor(w.w * 0.42), gh - 20, Math.floor(w.w * 0.16), 22);
  _f(ctx, '#ffc44d', bx, by, Math.floor(w.w * 0.42) + Math.floor(w.w * 0.16) - 4, gh - 14, 3, 3);

  // roof
  _f(ctx, '#5a3a22', bx, by, Math.floor(w.w * 0.07), -12, Math.floor(w.w * 0.86), 14);
  _f(ctx, '#6b4a2e', bx, by, Math.floor(w.w * 0.03), -16, Math.floor(w.w * 0.94), 6);

  // outline (only the upper house structure, matching props.js)
  _ol(ctx, bx, by, Math.floor(w.w * 0.07), -16, Math.floor(w.w * 0.86), gh + 16);

  return { canvas: c, ox: -OL, oy: -OT };
}
