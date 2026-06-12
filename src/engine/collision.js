import { WORLD } from './constants.js';
import { clamp } from './utils.js';
import { nearbyWalls } from './spatialgrid.js';

let _BW = WORLD.w, _BH = WORLD.h;
export function setBounds(w, h){ _BW = w; _BH = h; }

export function blocked(x, y, r, ignoreHop){
  for(const w of nearbyWalls(x, y, r)){
    if(ignoreHop && w.hop) continue;
    const nx = clamp(x, w.x, w.x+w.w), ny = clamp(y, w.y, w.y+w.h);
    if((x-nx)*(x-nx) + (y-ny)*(y-ny) < r*r) return w;
  }
  return null;
}

export function hitCR(a, w){
  const nx = clamp(a.x, w.x, w.x+w.w), ny = clamp(a.y, w.y, w.y+w.h);
  return (a.x-nx)*(a.x-nx) + (a.y-ny)*(a.y-ny) < a.r*a.r;
}

export function moveActor(a, dx, dy, ignoreHop){
  a.x = clamp(a.x + dx, 34, _BW-34);
  for(const w of nearbyWalls(a.x, a.y, a.r + 6)){
    if(w.ghost || (ignoreHop && w.hop)) continue;
    if(hitCR(a, w)){ a.x = dx > 0 ? w.x - a.r : w.x + w.w + a.r; }
  }
  a.y = clamp(a.y + dy, 34, _BH-34);
  for(const w of nearbyWalls(a.x, a.y, a.r + 6)){
    if(w.ghost || (ignoreHop && w.hop)) continue;
    if(hitCR(a, w)){ a.y = dy > 0 ? w.y - a.r : w.y + w.h + a.r; }
  }
}
