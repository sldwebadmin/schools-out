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
  let count = 0;
  for(const w of walls){
    if(!BUILDING_TYPES.has(w.type) || w.ghost) continue;
    try {
      const sp = _bakeSprite(w);
      if(sp){ _cache.set(w, sp); count++; }
    } catch(e){
      console.error('[buildsprites] bake failed for type=' + w.type, e);
    }
  }
  console.log('[buildsprites] DIAGNOSTIC: built', count, 'building sprites from', walls.length, 'total walls');
}

export function getBuildingSprite(w){
  return _cache.get(w) ?? null;
}

// ── internal helpers ─────────────────────────────────────────────────

// Fill a rect in sprite space. (bx,by) is where (w.x,w.y) lands in the canvas.
function _f(ctx, c, bx, by, dx, dy, fw, fh){
  if(fw <= 0 || fh <= 0) return;
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(bx + dx), Math.round(by + dy), Math.max(1, Math.round(fw)), Math.max(1, Math.round(fh)));
}

// 3-px outline matching PX=3 used by draw.js outline()
function _ol(ctx, bx, by, dx, dy, ow, oh){
  ctx.strokeStyle = '#16102b'; ctx.lineWidth = 3;
  ctx.strokeRect(Math.round(bx + dx) + 1.5, Math.round(by + dy) + 1.5,
                 Math.max(0, Math.round(ow) - 3), Math.max(0, Math.round(oh) - 3));
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
  const bx = OL, by = OT;
  const FW = 48; // facade height (lower coloured section)
  const bodyH = Math.max(0, w.h - FW); // upper body height

  // ── upper body (dark) ──
  _f(ctx, '#2a2147', bx, by, -OL, -OT, w.w + OL + OR, bodyH + OT);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for(let sy = -8; sy < bodyH - 8; sy += 11)
    ctx.fillRect(bx - OL, by + sy, w.w + OL + OR, 2);

  // ── roof band (thicker than procedural, darker top + highlight) ──
  _f(ctx, '#291f48', bx, by, -OL, -OT, w.w + OL + OR, 16); // deep roof shadow
  _f(ctx, '#3a2f5c', bx, by, -OL, -OT + 4, w.w + OL + OR, 10); // main roof colour
  _f(ctx, '#4a3f6e', bx, by, -OL, -OT + 4, w.w + OL + OR, 3);  // top highlight

  // ── upper-floor windows (Stage-2 addition; original has none) ──
  if(bodyH >= 30){
    const nWin = Math.max(1, Math.floor(w.w / 80));
    const WW = 28, WH = 20;
    const winY = Math.round(bodyH / 2 - WH / 2 - 2);
    for(let i = 0; i < nWin; i++){
      const winX = Math.round(w.w / (nWin + 1) * (i + 1) - WW / 2);
      // dark surround
      _f(ctx, '#1b1430', bx, by, winX - 3, winY - 3, WW + 6, WH + 6);
      // pane (bright cream so it reads against the dark body)
      _f(ctx, '#ffe9c2', bx, by, winX, winY, WW, WH);
      // interior shadow (warm amber glow visible through pane)
      _f(ctx, '#ffd27a', bx, by, winX + 3, winY + 3, WW - 6, WH - 6);
      // sill
      _f(ctx, '#4a3f6e', bx, by, winX - 3, winY + WH + 3, WW + 6, 3);
      // mullion cross (dark divider)
      ctx.fillStyle = '#1b1430';
      ctx.fillRect(bx + winX + Math.floor(WW / 2) - 1, by + winY, 2, WH);
      ctx.fillRect(bx + winX, by + winY + Math.floor(WH / 2) - 1, WW, 2);
      // shutters (trim colour)
      const shutterC = w.trim || '#ff6b57';
      _f(ctx, shutterC, bx, by, winX - 9, winY - 1, 6, WH + 2);
      _f(ctx, shutterC, bx, by, winX + WW + 3, winY - 1, 6, WH + 2);
    }
  }

  // ── floor junction strip ──
  _f(ctx, '#241d40', bx, by, -OL, bodyH - 8, w.w + OL + OR, 8);

  // ── facade (coloured lower section) — drawn AFTER upper area ──
  _f(ctx, w.hue || '#7fb069', bx, by, 0, bodyH, w.w, FW);
  ctx.fillStyle = 'rgba(0,0,0,0.14)';
  for(let sy = bodyH + 9; sy < bodyH + FW; sy += 9)
    ctx.fillRect(bx, by + sy, w.w, 2);

  // ── bay-window / lamp glow (same as procedural) ──
  const gwx = w.w * 0.58, gwy = w.h - 36;
  const glx = bx + gwx, gly = by + gwy;
  const grad = ctx.createRadialGradient(glx + 10, gly + 10, 2, glx + 10, gly + 10, 42);
  grad.addColorStop(0, 'rgba(255,200,110,.45)');
  grad.addColorStop(1, 'rgba(255,200,110,0)');
  ctx.fillStyle = grad; ctx.fillRect(glx - 30, gly - 30, 84, 84);
  _f(ctx, '#ffd27a', bx, by, w.w * 0.58, w.h - 36, 22, 22);
  _f(ctx, w.trim || '#ff6b57', bx, by, w.w * 0.58 - 2, w.h - 38, 26, 3);
  _f(ctx, '#a86f3e', bx, by, w.w * 0.58 + 9, w.h - 36, 4, 22);
  _f(ctx, '#ffd27a', bx, by, w.w * 0.78, w.h - 36, 16, 22);

  // ── chimney ──
  _f(ctx, '#241d40', bx, by, w.w * 0.72, -28, 14, 16);
  _f(ctx, '#3a2f5c', bx, by, w.w * 0.72 + 2, -30, 10, 4); // chimney cap

  // ── door ──
  const dx = Math.round(w.w * 0.18);
  _f(ctx, w.player ? '#ffc44d' : '#3a2719', bx, by, dx, w.h - 34, 20, 34);
  _f(ctx, '#1b1430', bx, by, dx + 14, w.h - 19, 3, 3);
  _f(ctx, '#6a5c91', bx, by, dx - 5, w.h - 2, 30, 6);
  if(w.player) _f(ctx, '#2ec4b6', bx, by, dx - 5, w.h + 4, 30, 5);

  // ── outline ──
  _ol(ctx, bx, by, -OL, -OT, w.w + OL + OR, w.h + OT);

  return { canvas: c, ox: -OL, oy: -OT };
}

// ── SCHOOL ───────────────────────────────────────────────────────────
// Visual: (w.x-10, w.y-14) .. (w.x+w.w+10, w.y+w.h)  — b:0 pad
function _bakeSchool(w){
  const OL=10, OR=10, OT=14, OB=0;
  const SW = w.w + OL + OR, SH = w.h + OT + OB;
  const [c, ctx] = bakeCanvas(SW, SH);
  const bx = OL, by = OT;
  const FW = 60;
  const bodyH = Math.max(0, w.h - FW);

  // ── upper dark brick body ──
  _f(ctx, '#7a3d33', bx, by, -OL, -OT, w.w + OL + OR, bodyH + OT);
  // brick texture (horizontal mortar lines)
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for(let sy = -OT + 8; sy < bodyH; sy += 10)
    ctx.fillRect(bx - OL, by + sy, w.w + OL + OR, 2);

  // ── roof parapet ──
  _f(ctx, '#8f4a3e', bx, by, -OL, -OT, w.w + OL + OR, 12);
  _f(ctx, '#a85c50', bx, by, -OL, -OT + 2, w.w + OL + OR, 4); // parapet highlight

  // ── facade (brick lower section) — drawn BEFORE windows so windows go on top ──
  _f(ctx, '#a85546', bx, by, 0, bodyH, w.w, FW);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for(let sy = bodyH + 8; sy < bodyH + FW; sy += 8)
    ctx.fillRect(bx, by + sy, w.w, 2);

  // ── entrance (centre) ──
  _f(ctx, '#ffe9c2', bx, by, w.w / 2 - 34, bodyH, 68, FW);
  _f(ctx, '#3a2719', bx, by, w.w / 2 - 26, bodyH + 6, 24, FW - 6);
  _f(ctx, '#3a2719', bx, by, w.w / 2 + 2,  bodyH + 6, 24, FW - 6);

  // ── windows — drawn AFTER facade so they appear on top of brick ──
  // Distribute windows across full facade width (left & right of entrance)
  const winW = 24, winH = 22, winGap = 14, stride = winW + winGap;
  const halfLimit = w.w / 2 - 34 - 6; // distance from left edge to entrance left

  // left half
  for(let wx2 = 36; wx2 + winW <= halfLimit; wx2 += stride){
    _f(ctx, '#1b1430', bx, by, wx2 - 3, bodyH + 8 - 3, winW + 6, winH + 6);
    _f(ctx, '#ffe9c2', bx, by, wx2,     bodyH + 8,     winW,     winH);
    _f(ctx, '#ffd27a', bx, by, wx2 + 2, bodyH + 10,    winW - 4, winH - 4);
    _f(ctx, '#ffe9c2', bx, by, wx2 + 2, bodyH + 10,    winW - 4, 4);
    ctx.fillStyle = '#1b1430'; // mullion
    ctx.fillRect(bx + wx2 + winW / 2 - 1, by + bodyH + 8, 2, winH);
    ctx.fillRect(bx + wx2, by + bodyH + 8 + winH / 2 - 1, winW, 2);
  }
  // right half (mirror)
  for(let wx2 = 36; wx2 + winW <= halfLimit; wx2 += stride){
    const rx = w.w - 36 - wx2;
    _f(ctx, '#1b1430', bx, by, rx - winW - 3, bodyH + 8 - 3, winW + 6, winH + 6);
    _f(ctx, '#ffe9c2', bx, by, rx - winW,     bodyH + 8,     winW,     winH);
    _f(ctx, '#ffd27a', bx, by, rx - winW + 2, bodyH + 10,    winW - 4, winH - 4);
    _f(ctx, '#ffe9c2', bx, by, rx - winW + 2, bodyH + 10,    winW - 4, 4);
    ctx.fillStyle = '#1b1430';
    ctx.fillRect(bx + rx - winW + winW / 2 - 1, by + bodyH + 8, 2, winH);
    ctx.fillRect(bx + rx - winW, by + bodyH + 8 + winH / 2 - 1, winW, 2);
  }

  // ── school name sign (drawn last so it's on top) ──
  ctx.fillStyle = '#ffe9c2'; ctx.font = '900 15px monospace'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('MAPLE ELEMENTARY', bx + w.w / 2 - 78, by + bodyH - 8);

  // ── outline ──
  _ol(ctx, bx, by, -OL, -OT, w.w + OL + OR, w.h + OT);

  return { canvas: c, ox: -OL, oy: -OT };
}

// ── MARKET ───────────────────────────────────────────────────────────
// Visual: (w.x-8, w.y-12) .. (w.x+w.w+8, w.y+w.h)  — b:0 pad
function _bakeMarket(w){
  const OL=8, OR=8, OT=12, OB=0;
  const SW = w.w + OL + OR, SH = w.h + OT + OB;
  const [c, ctx] = bakeCanvas(SW, SH);
  const bx = OL, by = OT;
  const FW = 56;
  const bodyH = Math.max(0, w.h - FW);

  // ── upper dark body ──
  _f(ctx, '#473a6e', bx, by, -OL, -OT, w.w + OL + OR, bodyH + OT);
  // subtle tile pattern on upper body
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for(let sy = -OT + 16; sy < bodyH; sy += 16)
    ctx.fillRect(bx - OL, by + sy, w.w + OL + OR, 2);

  // ── storefront facade — drawn BEFORE windows/awning ──
  _f(ctx, '#5d4a7a', bx, by, 0, bodyH, w.w, FW);

  // ── awning — full width, wider stripes than original ──
  const aH = 18; // awning band height
  const stripeCount = 10;
  const stripW = Math.ceil((w.w + OL + OR) / stripeCount);
  for(let i = 0; i < stripeCount; i++){
    _f(ctx, i % 2 ? '#ff6b57' : '#ffe9c2', bx, by, -OL + i * stripW, bodyH - aH + 2, stripW, aH);
  }
  // awning shadow lip
  _f(ctx, '#1b1430', bx, by, -OL, bodyH + 2, w.w + OL + OR, 3);

  // ── display window (show products) ──
  const dispW = Math.round(w.w * 0.38), dispH = 36;
  _f(ctx, '#1b1430', bx, by, 24, bodyH + 10, dispW + 4, dispH + 4);
  _f(ctx, '#ffd27a', bx, by, 26, bodyH + 12, dispW, dispH);
  _f(ctx, '#ffe9c2', bx, by, 26, bodyH + 12, dispW, 5);
  // colourful product silhouettes inside window
  _f(ctx, '#ff6b57', bx, by, 32,     bodyH + 20, 8, 18);
  _f(ctx, '#ffc44d', bx, by, 44,     bodyH + 24, 8, 14);
  _f(ctx, '#2ec4b6', bx, by, 56,     bodyH + 18, 8, 20);

  // ── door ──
  _f(ctx, '#3a2719', bx, by, w.w * 0.64, bodyH + 8, 28, FW - 8);
  _f(ctx, '#4a3729', bx, by, w.w * 0.64 + 2, bodyH + 10, 12, FW - 12); // door panel

  // ── store name sign on upper body ──
  _f(ctx, '#1b1430', bx, by, w.w / 2 - 60, -2, 120, 20); // sign backing
  ctx.fillStyle = '#ffc44d'; ctx.font = '900 14px monospace'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('MAPLE MART', bx + w.w / 2 - 46, by + 13);

  // ── upper-body windows (only if tall enough) ──
  if(bodyH >= 50){
    const nWin = Math.min(4, Math.max(1, Math.floor((w.w - 40) / 80)));
    for(let i = 0; i < nWin; i++){
      const wx2 = Math.round((w.w / (nWin + 1)) * (i + 1) - 20);
      const wy2 = Math.round(bodyH * 0.45);
      _f(ctx, '#1b1430', bx, by, wx2 - 2, wy2 - 2, 40 + 4, 14 + 4);
      _f(ctx, '#7a9ab0', bx, by, wx2,     wy2,     40,     14);
      _f(ctx, '#9ac4da', bx, by, wx2 + 2, wy2 + 2, 36, 5);
    }
  }

  // ── outline ──
  _ol(ctx, bx, by, -OL, -OT, w.w + OL + OR, w.h + OT);

  return { canvas: c, ox: -OL, oy: -OT };
}

// ── SNACK SHACK ──────────────────────────────────────────────────────
// Visual: (w.x-8, w.y-10) .. (w.x+w.w+8, w.y+w.h)  — b:0 pad
function _bakeShack(w){
  const OL=8, OR=8, OT=10, OB=0;
  const SW = w.w + OL + OR, SH = w.h + OT + OB;
  const [c, ctx] = bakeCanvas(SW, SH);
  const bx = OL, by = OT;

  // ── wood body ──
  _f(ctx, '#a88050', bx, by, -OL, -OT, w.w + OL + OR, w.h + OT);
  // horizontal plank lines
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for(let py = -OT + 10; py < w.h; py += 10) ctx.fillRect(bx - OL, by + py, w.w + OL + OR, 2);
  // lighter side panels
  _f(ctx, '#c8a870', bx, by, 0, 0, w.w, w.h);

  // ── awning (coral/cream stripes, wider than original) ──
  const aH = 16, nStripes = 8;
  const sw = Math.ceil((w.w + OL + OR) / nStripes);
  for(let i = 0; i < nStripes; i++)
    _f(ctx, i % 2 ? '#ff6b57' : '#ffe9c2', bx, by, -OL + i * sw, -OT, sw, aH);
  _f(ctx, '#1b1430', bx, by, -OL, -OT + aH - 1, w.w + OL + OR, 2); // awning shadow

  // ── service window (open counter — clear dark opening) ──
  const swinW = Math.round(w.w * 0.48), swinH = Math.round(w.h * 0.38);
  const swinX = Math.round(w.w * 0.08), swinY = Math.round(w.h * 0.14);
  _f(ctx, '#1b1430',  bx, by, swinX,       swinY,       swinW,     swinH);
  _f(ctx, '#0f0c1f',  bx, by, swinX + 2,   swinY + 2,   swinW - 4, swinH - 4);
  // counter ledge below window
  _f(ctx, '#d4aa5c', bx, by, swinX - 4, swinY + swinH, swinW + 8, 7);
  _f(ctx, '#b89044', bx, by, swinX - 4, swinY + swinH + 4, swinW + 8, 3);
  // product silhouettes inside window
  _f(ctx, '#2ec4b6', bx, by, swinX + 4, swinY + 4,  6, swinH - 10);
  _f(ctx, '#ffc44d', bx, by, swinX + 14, swinY + 6, 6, swinH - 14);
  _f(ctx, '#ff6b57', bx, by, swinX + 24, swinY + 4, 6, swinH - 10);

  // ── door ──
  const dw2 = Math.round(w.w * 0.18);
  const dx2 = Math.round(w.w * 0.38);
  _f(ctx, '#3a2719', bx, by, dx2, w.h - 36, dw2, 36);
  _f(ctx, '#1b1430', bx, by, dx2 + dw2 - 5, w.h - 20, 3, 3);

  // ── sign ──
  _f(ctx, '#1b1430', bx, by, w.w / 2 - 50, -OT + 1, 100, 13);
  ctx.fillStyle = '#ffc44d'; ctx.font = '700 11px monospace'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('SNACK SHACK', bx + w.w / 2 - 40, by - 1);

  // ── outline ──
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

  // ── trunk ──
  _f(ctx, '#4a3322', bx, by, tx, gh + ch, tw, w.h - gh - ch);
  _f(ctx, '#3a2719', bx, by, tx, gh + ch, Math.floor(tw * 0.4), w.h - gh - ch);
  // trunk bark lines
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for(let py = gh + ch + 8; py < w.h; py += 12)
    ctx.fillRect(bx + tx, by + py, tw, 2);

  // ── tree foliage (base canopy) ──
  ctx.fillStyle = '#2a5530';
  ctx.beginPath();
  ctx.ellipse(bx + w.w / 2, by + gh + ch * 0.5, w.w * 0.52, ch * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#346640';
  ctx.beginPath();
  ctx.ellipse(bx + w.w / 2 - 10, by + gh + ch * 0.38, w.w * 0.38, ch * 0.36, 0, 0, Math.PI * 2);
  ctx.fill();
  // foliage highlight
  ctx.fillStyle = 'rgba(100,200,100,0.15)';
  ctx.beginPath();
  ctx.ellipse(bx + w.w / 2 - 8, by + gh + ch * 0.28, w.w * 0.22, ch * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── platform beam ──
  _f(ctx, '#a86f3e', bx, by, Math.floor(w.w * 0.07), gh - 4, Math.floor(w.w * 0.86), 8);
  _f(ctx, '#8a5730', bx, by, Math.floor(w.w * 0.07), gh - 4, Math.floor(w.w * 0.86), 3);
  // support posts
  _f(ctx, '#6b4020', bx, by, Math.floor(w.w * 0.12), gh + 4, 6, ch * 0.4);
  _f(ctx, '#6b4020', bx, by, Math.floor(w.w * 0.82), gh + 4, 6, ch * 0.4);

  // ── house body (planks) ──
  _f(ctx, '#8a5730', bx, by, Math.floor(w.w * 0.14), 0, Math.floor(w.w * 0.72), gh + 4);
  ctx.fillStyle = 'rgba(0,0,0,0.16)';
  for(let py = 8; py < gh + 4; py += 10) ctx.fillRect(bx + Math.floor(w.w * 0.14), by + py, Math.floor(w.w * 0.72), 2);
  _f(ctx, '#6b4020', bx, by, Math.floor(w.w * 0.14), Math.floor(gh * 0.55), Math.floor(w.w * 0.72), 3);

  // ── windows (teal panes with bright highlight) ──
  const winH2 = Math.floor(gh * 0.45);
  _f(ctx, '#1b1430', bx, by, Math.floor(w.w * 0.18), 2, Math.floor(w.w * 0.20) + 4, winH2 + 4);
  _f(ctx, '#2ec4b6', bx, by, Math.floor(w.w * 0.20), 4, Math.floor(w.w * 0.18), winH2);
  _f(ctx, '#5de8e0', bx, by, Math.floor(w.w * 0.20) + 2, 6, Math.floor(w.w * 0.18) - 6, 4);
  _f(ctx, '#1b8080', bx, by, Math.floor(w.w * 0.29), 4, 2, winH2);

  _f(ctx, '#1b1430', bx, by, Math.floor(w.w * 0.56), 2, Math.floor(w.w * 0.20) + 4, winH2 + 4);
  _f(ctx, '#2ec4b6', bx, by, Math.floor(w.w * 0.58), 4, Math.floor(w.w * 0.18), winH2);
  _f(ctx, '#5de8e0', bx, by, Math.floor(w.w * 0.58) + 2, 6, Math.floor(w.w * 0.18) - 6, 4);
  _f(ctx, '#1b8080', bx, by, Math.floor(w.w * 0.67), 4, 2, winH2);

  // ── door ──
  _f(ctx, '#3a2719', bx, by, Math.floor(w.w * 0.42), gh - 20, Math.floor(w.w * 0.16), 22);
  _f(ctx, '#ffc44d', bx, by, Math.floor(w.w * 0.42) + Math.floor(w.w * 0.16) - 4, gh - 14, 3, 3);

  // ── roof (deeper eaves) ──
  _f(ctx, '#5a3a22', bx, by, Math.floor(w.w * 0.07), -12, Math.floor(w.w * 0.86), 14);
  _f(ctx, '#6b4a2e', bx, by, Math.floor(w.w * 0.03), -16, Math.floor(w.w * 0.94), 6);
  _f(ctx, '#7a5a3e', bx, by, Math.floor(w.w * 0.03), -16, Math.floor(w.w * 0.94), 2); // roof highlight

  // ── outline (upper structure only) ──
  _ol(ctx, bx, by, Math.floor(w.w * 0.07), -16, Math.floor(w.w * 0.86), gh + 16);

  return { canvas: c, ox: -OL, oy: -OT };
}
