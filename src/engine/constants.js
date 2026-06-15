export const VW = 960, VH = 540, PX = 3;
export const TILE = 32;
export const CHUNK_W = 1024;
export const WORLD = { w: 8192, h: 8192 };
export const RX = 4448;   // main N-S road left edge (140px wide, center x=4518)
export const HY1 = 4480;  // neighbourhood road 1 top edge (140px tall)
export const HY2 = 5248;  // neighbourhood road 2 top edge
export const GOAL  = { x:5200, y:1600, r:70 };
export const SPAWN = { x:592, y:1550 };   // neighborhood-local, Elm Ct in BL (middle-income) quadrant
export const NAPS  = [ {x:290,y:400}, {x:1600,y:400}, {x:2200,y:2000} ]; // neighborhood-local, spread TL/TR/BR
export const USE_SHEETS = true;
const _today = new Date();
export const DAY_SEED = _today.getFullYear()*10000 + (_today.getMonth()+1)*100 + _today.getDate();
export const DAY_NUM  = Math.floor((_today - new Date(_today.getFullYear(),0,0)) / 864e5);
