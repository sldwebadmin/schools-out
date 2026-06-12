import { WORLD, RX, HY1, HY2 } from '../engine/constants.js';
import { mulberry32 } from '../engine/utils.js';

export const walls = [];
export const canopies = [];
export const lamps = [];

function addWall(x,y,w,h,type,o={}){ walls.push(Object.assign({x,y,w,h,type,hop:false,ghost:false}, o)); }
function addTree(x, y, r){
  addWall(x, y, 20, 20, "tree");
  canopies.push({x:x+10, y:y+4, r});
}
function fence(x, y, len, horiz, gaps){
  const T = 10;
  let segs = [[0, len]];
  for(const [go, gw] of gaps){
    const out = [];
    for(const [s, e] of segs){
      if(go > s && go < e){ out.push([s, go]); out.push([go+gw, e]); }
      else out.push([s, e]);
    }
    segs = out;
  }
  for(const [s, e] of segs){
    if(e - s < 8) continue;
    if(horiz) addWall(x+s, y, e-s, T, "fence", {hop:true});
    else      addWall(x, y+s, T, e-s, "fence", {hop:true});
  }
}
function yard(x, y, w, h, hue, opts={}){
  const frontGapAt = opts.frontGapAt !== undefined ? opts.frontGapAt : w/2 - 45;
  fence(x, y, w, true, [[frontGapAt, 90]]);
  fence(x, y+h-10, w, true, []);
  fence(x, y, h, false, [[h*.45, 76]]);
  fence(x+w-10, y, h, false, [[h*.45, 76]]);
  const hw = opts.hw || Math.min(250, w-150), hh = 170;
  const hx = x + (w-hw)/2, hy = y + h - hh - 90;
  addWall(hx, hy, hw, hh, "house", {hue, trim:opts.trim||"#ffe9c2", player:!!opts.player});
  if(opts.tree) addTree(x+36, y+h-110, 52);
  addWall(hx+hw+8, hy+hh-40, 24, 24, "trash", {hop:true});
  if(opts.mailbox) addWall(x+frontGapAt+98, y-6, 10, 12, "mailbox", {ghost:true});
}

export function buildMap(){
  walls.length = 0; canopies.length = 0; lamps.length = 0;
  // world border hedge
  addWall(0,0,WORLD.w,26,"hedge"); addWall(0,WORLD.h-26,WORLD.w,26,"hedge");
  addWall(0,0,26,WORLD.h,"hedge"); addWall(WORLD.w-26,0,26,WORLD.h,"hedge");

  /* ---- NORTH DISTRICT: Maple Elementary ---- */
  fence(1280, 100, 1580, true, []);
  fence(1280, 690, 1580, true, [[600, 150]]);
  fence(1280, 100, 590, false, [[260, 90]]);
  fence(2850, 100, 590, false, []);
  addWall(1480, 140, 760, 300, "school");
  addWall(2520, 560, 8, 8, "flag", {ghost:true});
  addWall(2400, 520, 8, 8, "swing", {ghost:true});
  addWall(2660, 540, 8, 8, "slide", {ghost:true});
  addWall(2080, 640, 46, 12, "rack", {hop:true});
  addWall(1830, 705, 12, 14, "sign", {ghost:true, txt:"MAPLE ELEMENTARY", txt2:"playground out back"});
  addTree(1340, 560, 50);
  addTree(760, 300, 60); addTree(960, 540, 52); addTree(520, 170, 56);
  addTree(2980, 280, 60); addTree(3140, 520, 52); addTree(3380, 200, 58); addTree(3700, 420, 62);
  addTree(3640, 760, 54); addTree(3880, 980, 56);

  /* ---- GREENBELT ---- */
  addWall(660, 800, 1220, 110, "hedge");
  addWall(2020, 800, 1220, 110, "hedge");
  const sg = mulberry32(7);
  for(let x = 700; x < 3220; x += 95 + sg()*50){
    if(x > 1820 && x < 2080) continue;
    canopies.push({x, y: 830 + sg()*60, r: 48 + sg()*22});
  }

  /* ---- WEST: Whispering Woods ---- */
  const sf = mulberry32(99);
  for(let i=0;i<26;i++){
    const tx = 70 + sf()*500, ty = 1000 + sf()*1880;
    if(tx > 290 && ty > 1440 && ty < 1620) continue;
    if(tx > 150 && tx < 430 && ty > 1260 && ty < 1610) continue;
    addTree(tx, ty, 46 + sf()*24);
  }
  addWall(566, 1500, 12, 14, "sign", {ghost:true, txt:"WHISPERING WOODS", txt2:"trails coming soon"});

  /* ---- EAST TREE LINE + MAPLE MART DISTRICT ---- */
  addWall(3280, 950, 110, 500, "hedge");
  addWall(3280, 1590, 110, 1370, "hedge");
  for(let y = 980; y < 2930; y += 95 + sg()*50){
    if(y > 1400 && y < 1640) continue;
    canopies.push({x: 3335 + sg()*30, y, r: 46 + sg()*22});
  }
  addWall(3500, 1180, 420, 220, "market");
  addWall(3560, 1700, 26, 20, "cart", {hop:true});
  addWall(3610, 1740, 26, 20, "cart", {hop:true});
  addWall(3640, 1990, 10, 10, "cone", {ghost:true});
  addWall(3850, 1990, 10, 10, "cone", {ghost:true});
  addWall(3620, 2060, 12, 14, "sign", {ghost:true, txt:"E-BIKE GRAND PRIX", txt2:"saturday · starts here"});
  addTree(3460, 2350, 56); addTree(3880, 2480, 60); addTree(3560, 2700, 52);

  /* ---- THE NEIGHBORHOOD ---- */
  addWall(860, 1090, 380, 220, "pond", {noshadow:true});
  addWall(1380, 1100, 56, 30, "table", {hop:true});
  addWall(1500, 1250, 56, 30, "table", {hop:true});
  addWall(1786, 1190, 12, 14, "sign", {ghost:true, txt:"MAPLE PARK", txt2:""});
  addTree(740, 1000, 54); addTree(1640, 1020, 58);
  yard(2080, 980, 500, 440, "#6b4a76", {tree:true, mailbox:true});
  yard(2640, 980, 500, 440, "#5c6f9e", {mailbox:true});
  yard(760, 1640, 490, 430, "#7a5560", {tree:true, mailbox:true});
  yard(1310, 1640, 490, 430, "#4f6b5e", {mailbox:true});
  yard(820, 2300, 520, 430, "#56406f", {tree:true, mailbox:true});
  addWall(1560, 2400, 10, 10, "scare", {ghost:true});
  addWall(1430, 2330, 12, 14, "sign", {ghost:true, txt:"COMMUNITY GARDEN", txt2:""});
  // Biscuit's house
  fence(2080, 1640, 740, true, [[300, 100]]);
  fence(2080, 2060, 740, true, []);
  fence(2080, 1640, 430, false, [[190, 76]]);
  fence(2810, 1640, 430, false, [[190, 76]]);
  addWall(2330, 1700, 260, 180, "house", {hue:"#8a6f3e", trim:"#ffe9c2"});
  addWall(2500, 1930, 60, 50, "doghouse", {ghost:true});
  addWall(2400, 1648, 12, 14, "sign", {ghost:true, txt:"BEWARE OF DOG", txt2:"(his name is Biscuit)"});
  addTree(2920, 1700, 56); addTree(3060, 1920, 52);
  yard(2480, 2300, 520, 430, "#7a5560", {mailbox:true});
  addWall(2290, 2336, 8, 8, "hoop", {ghost:true});
  addTree(3080, 2400, 56);
  /* YOUR HOUSE */
  yard(1640, 2560, 640, 380, "#2e8f8a", {player:true, trim:"#ffc44d", mailbox:true, frontGapAt:265, tree:true});

  /* streetlamps */
  const LP = [[1860,1150],[2040,1900],[1860,2330],[2090,2520],
              [1100,1430],[1700,1610],[2600,1430],[3100,1610],[3700,1430],
              [1000,2100],[1700,2280],[2600,2100],[3100,2280],
              [1850,880],[2050,880]];
  for(const [lx,ly] of LP) lamps.push({x:lx, y:ly});
}
