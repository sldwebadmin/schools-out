import { VW, VH, PX } from '../engine/constants.js';

let _ctx = null, _cam = null;

export function initDraw(ctx, cam){ _ctx = ctx; _cam = cam; }
export function getCtx(){ return _ctx; }
export function getCam(){ return _cam; }

export function snap(v){ return Math.round(v / PX) * PX; }

export function rectW(c, x, y, w, h){
  _ctx.fillStyle = c;
  _ctx.fillRect(snap(x - _cam.x), snap(y - _cam.y), Math.max(PX, snap(w)), Math.max(PX, snap(h)));
}

export function inView(x, y, w, h, m=140){
  return x + w > _cam.x - m && x < _cam.x + VW + m && y + h > _cam.y - m && y < _cam.y + VH + m;
}

export function outline(x, y, w, h){
  _ctx.strokeStyle = "#16102b"; _ctx.lineWidth = PX;
  _ctx.strokeRect(snap(x - _cam.x), snap(y - _cam.y), snap(w), snap(h));
}
