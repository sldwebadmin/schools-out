export const VW = 960, VH = 540, PX = 3;
export const TILE = 32;
export const CHUNK_W = 1024;
export const WORLD = { w: 8192, h: 8192 };
export const RX = 4026;   // main N-S road left edge (140px wide, center x=4096)
export const HY1 = 6240;  // neighbourhood road 1 top edge (140px tall)
export const HY2 = 6720;  // neighbourhood road 2 top edge
export const GOAL  = { x:4096, y:520, r:70 };
export const SPAWN = { x:4096, y:7680 };
export const NAPS  = [ {x:3700,y:6550}, {x:4700,y:3100}, {x:4500,y:6450} ];
export const USE_SHEETS = true;
const _today = new Date();
export const DAY_SEED = _today.getFullYear()*10000 + (_today.getMonth()+1)*100 + _today.getDate();
export const DAY_NUM  = Math.floor((_today - new Date(_today.getFullYear(),0,0)) / 864e5);
