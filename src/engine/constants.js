export const VW = 960, VH = 540, PX = 3;
export const WORLD = { w: 4000, h: 3000 };
export const RX = 1880;
export const HY1 = 1450, HY2 = 2120;
export const GOAL  = { x:2520, y:650, r:70 };
export const SPAWN = { x:1950, y:2592 };
export const NAPS  = [ {x:2450,y:1950}, {x:1250,y:1390}, {x:2300,y:1604} ];

export const USE_SHEETS = true;

const _today = new Date();
export const DAY_SEED = _today.getFullYear()*10000 + (_today.getMonth()+1)*100 + _today.getDate();
export const DAY_NUM  = Math.floor((_today - new Date(_today.getFullYear(),0,0)) / 864e5);
