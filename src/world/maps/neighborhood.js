// Maple Court (Neighborhood) — standalone section map.
// All coordinates are local (origin 0,0 = world 2560,3584).
// Section size: 2560 × 2560 px.

import { CHUNK_W, DAY_SEED } from '../../engine/constants.js';
import { mulberry32, bakeCanvas } from '../../engine/utils.js';
import { ZONE } from '../tiledata.js';
import { drawTiledGround, drawAutotileEdges } from '../tilerender.js';

// ── Road constants in local coords ────────────────────────────────────────
const LRX  = 1888; // main N-S road left edge (world 4448)
const LHY1 =  896; // horizontal road 1 top  (world 4480)
const LHY2 = 1664; // horizontal road 2 top  (world 5248)

// ── Section zone function ─────────────────────────────────────────────────
function zoneAt(lx, ly) {
  if (lx >= 2140 && lx < 2400 && ly >= 116 && ly < 316) return ZONE.COURT;
  // Main N-S road
  if (lx >= LRX && lx < LRX + 140 && ly >= 0 && ly < 2560) return ZONE.ROAD;
  // Horizontal roads
  if (lx >= 0 && lx < 2560 && ly >= LHY1 && ly < LHY1 + 140) return ZONE.ROAD;
  if (lx >= 0 && lx < 2560 && ly >= LHY2 && ly < LHY2 + 140) return ZONE.ROAD;
  // Sidewalks along main road (world 4420-4448 → local 1860-1888; 4588-4616 → 2028-2056)
  if (lx >= 1860 && lx < LRX      && ly >= 0 && ly < 2304) return ZONE.SIDEWALK;
  if (lx >= LRX + 140 && lx < 2056 && ly >= 0 && ly < 2304) return ZONE.SIDEWALK;
  // Sidewalks along HY1
  if (lx >= 0 && lx < 2560 && ly >= LHY1 - 28 && ly < LHY1) return ZONE.SIDEWALK;
  if (lx >= 0 && lx < 2560 && ly >= LHY1 + 140 && ly < LHY1 + 168) return ZONE.SIDEWALK;
  // Sidewalks along HY2
  if (lx >= 0 && lx < 2560 && ly >= LHY2 - 28 && ly < LHY2) return ZONE.SIDEWALK;
  if (lx >= 0 && lx < 2560 && ly >= LHY2 + 140 && ly < LHY2 + 168) return ZONE.SIDEWALK;
  return ZONE.LAWN;
}

// ── Ground bake function ──────────────────────────────────────────────────
function bakeInto(g, lx0, ly0) {
  const rnd = mulberry32(DAY_SEED ^ ((lx0 * 997 + ly0 * 1009) >>> 0));

  function tex(rx0,ry0,rx1,ry1, n, c1,c2, dw,dh){
    const ix0=Math.max(lx0,rx0), ix1=Math.min(lx0+CHUNK_W,rx1);
    const iy0=Math.max(ly0,ry0), iy1=Math.min(ly0+CHUNK_W,ry1);
    if(ix0>=ix1||iy0>=iy1) return;
    const iw=ix1-ix0, ih=iy1-iy0;
    for(let i=0;i<n;i++){
      g.fillStyle=rnd()<.5?c1:c2;
      g.fillRect(ix0+(rnd()*iw)|0, iy0+(rnd()*ih)|0, dw, dh);
    }
  }
  function road(x,y,w,h){
    g.fillStyle="#46406b"; g.fillRect(x,y,w,h);
    tex(x,y,x+w,y+h, Math.max(1,(w*h/1400)|0), "#4d4775","#403a62", 5,5);
    g.fillStyle="#353055";
    if(w>=h){ g.fillRect(x,y,w,5); g.fillRect(x,y+h-5,w,5); }
    else     { g.fillRect(x,y,5,h); g.fillRect(x+w-5,y,5,h); }
  }
  function sidewalk(x,y,w,h){
    g.fillStyle="#6a5c91"; g.fillRect(x,y,w,h);
    g.fillStyle="#5d5083";
    if(w>=h) for(let sx=x;sx<x+w;sx+=46) g.fillRect(sx,y,3,h);
    else     for(let sy=y;sy<y+h;sy+=46) g.fillRect(x,sy,w,3);
  }

  drawTiledGround(g, lx0, ly0, zoneAt);

  // Basketball court lines (local 2144,120)
  g.strokeStyle="#cfc6e8"; g.lineWidth=4;
  g.strokeRect(2144, 120, 252, 192);
  g.strokeRect(2230, 120, 80, 70);
  g.beginPath(); g.arc(2270, 190, 40, 0, Math.PI); g.stroke();

  // Sidewalks
  sidewalk(1860, 0, 28, 2560);          // west side of N-S road
  sidewalk(LRX + 140, 0, 28, 2560);     // east side of N-S road
  sidewalk(0, LHY1 - 28, 2560, 28);     // north of HY1
  sidewalk(0, LHY1 + 140, 2560, 28);    // south of HY1
  sidewalk(0, LHY2 - 28, 2560, 28);     // north of HY2
  sidewalk(0, LHY2 + 140, 2560, 28);    // south of HY2

  // Roads
  road(LRX, 0, 140, 2560);
  road(0, LHY1, 2560, 140);
  road(0, LHY2, 2560, 140);

  // Road center dashes — N-S road (pattern from world y=2116 step 64; local offset = (2116-3584)%64 = 4)
  g.fillStyle="#8d80b8";
  for(let y = 4; y < 2560; y += 64) g.fillRect(LRX + 66, y, 8, 28);
  // Road center dashes — HY1 and HY2 (pattern from world x=2584 step 64; local offset = (2584-2560)%64 = 24)
  for(let x = 24; x < 2560; x += 64) g.fillRect(x, LHY1 + 66, 28, 8);
  for(let x = 24; x < 2560; x += 64) g.fillRect(x, LHY2 + 66, 28, 8);

  // Crosswalk marks at N-S road × HY1 and × HY2
  g.fillStyle="#cfc6e8";
  for(const iy of [LHY1, LHY2])
    for(let i = 0; i < 6; i++) g.fillRect(LRX + 10 + i * 22, iy + 40, 12, 60);

  // Manhole covers on N-S road (world 4518,4200 / 4518,5000 / 4518,5600 → local)
  for(const [mx,my] of [[1958,616],[1958,1416],[1958,2016]]){
    g.fillStyle="#2e294a"; g.beginPath(); g.arc(mx, my, 11, 0, 7); g.fill();
    g.strokeStyle="#55517a"; g.lineWidth=3; g.beginPath(); g.arc(mx, my, 7, 0, 7); g.stroke();
  }
  g.lineWidth=1;

  drawAutotileEdges(g, lx0, ly0, zoneAt);
}

// ── Minimap bake ──────────────────────────────────────────────────────────
function minimapBake() {
  const MSC_L = 150 / 2560;
  const [c, g] = bakeCanvas(150, 150);
  const B = (x,y,w,h,col) => {
    g.fillStyle = col;
    g.fillRect(x*MSC_L, y*MSC_L, Math.max(1,w*MSC_L), Math.max(1,h*MSC_L));
  };
  g.fillStyle = '#3f5d44'; g.fillRect(0, 0, 150, 150);  // lawn base
  // Roads
  B(LRX,  0,    140, 2560, '#2a2345');
  B(0,    LHY1, 2560, 140, '#2a2345');
  B(0,    LHY2, 2560, 140, '#2a2345');
  // Houses
  B(215,  276,  250, 170, '#5a4a6a');   // house 1 (purple)
  B(2215, 276,  250, 170, '#4a5880');   // house 2 (blue)
  B(500,  1116, 260, 180, '#7a5f30');   // house 4 / doghouse yard
  B(2185, 1086, 250, 150, '#3f5b4e');   // house 3 (green)
  B(1295, 2146, 250, 170, '#2a7a75');   // house 5 / player (teal)
  B(215,  1846, 250, 130, '#46325a');   // house 6
  B(2215, 1846, 250, 130, '#6a4550');   // house 7
  // Court
  B(2140, 116, 260, 200, '#3a3760');
  return c;
}

// ── Section definition ────────────────────────────────────────────────────
export const neighborhood = {
  key:    'neighborhood',
  name:   'Maple Court',
  w:      2560,
  h:      2560,
  status: 'open',

  zoneAt,
  bakeInto,
  minimapBake,

  // ── Walls ──────────────────────────────────────────────────────────────
  walls: [
    // House 1 yard (purple)
    {x:80,  y:56,  w:215, h:10,  type:"fence", hop:true},
    {x:385, y:56,  w:215, h:10,  type:"fence", hop:true},
    {x:80,  y:526, w:520, h:10,  type:"fence", hop:true},
    {x:80,  y:56,  w:10,  h:216, type:"fence", hop:true},
    {x:80,  y:348, w:10,  h:188, type:"fence", hop:true},
    {x:590, y:56,  w:10,  h:216, type:"fence", hop:true},
    {x:590, y:348, w:10,  h:188, type:"fence", hop:true},
    {x:215, y:276, w:250, h:170, type:"house", hue:"#6b4a76", trim:"#ffe9c2"},
    {x:116, y:426, w:20,  h:20,  type:"tree"},
    {x:473, y:406, w:24,  h:24,  type:"trash", hop:true},
    {x:393, y:50,  w:10,  h:12,  type:"mailbox", ghost:true},

    // House 2 yard (blue)
    {x:2080, y:56,  w:215, h:10,  type:"fence", hop:true},
    {x:2385, y:56,  w:215, h:10,  type:"fence", hop:true},
    {x:2080, y:526, w:520, h:10,  type:"fence", hop:true},
    {x:2080, y:56,  w:10,  h:216, type:"fence", hop:true},
    {x:2080, y:348, w:10,  h:188, type:"fence", hop:true},
    {x:2530, y:56,  w:10,  h:216, type:"fence", hop:true},
    {x:2530, y:348, w:10,  h:188, type:"fence", hop:true},
    {x:2215, y:276, w:250, h:170, type:"house", hue:"#5c6f9e", trim:"#ffe9c2"},
    {x:2160, y:416, w:8,   h:8,   type:"hoop", ghost:true},
    {x:2473, y:406, w:24,  h:24,  type:"trash", hop:true},
    {x:2393, y:50,  w:10,  h:12,  type:"mailbox", ghost:true},

    // House 3 yard (green)
    {x:2080, y:1076, w:185, h:10,  type:"fence", hop:true},
    {x:2355, y:1076, w:185, h:10,  type:"fence", hop:true},
    {x:2080, y:1306, w:460, h:10,  type:"fence", hop:true},
    {x:2080, y:1076, w:10,  h:108, type:"fence", hop:true},
    {x:2080, y:1260, w:10,  h:56,  type:"fence", hop:true},
    {x:2530, y:1076, w:10,  h:108, type:"fence", hop:true},
    {x:2530, y:1260, w:10,  h:56,  type:"fence", hop:true},
    {x:2185, y:1086, w:250, h:150, type:"house", hue:"#4f6b5e", trim:"#ffe9c2"},
    {x:2443, y:1196, w:24,  h:24,  type:"trash", hop:true},
    {x:2363, y:1070, w:10,  h:12,  type:"mailbox", ghost:true},

    // House 4 yard (doghouse)
    {x:340,  y:1056, w:300, h:10,  type:"fence", hop:true},
    {x:740,  y:1056, w:360, h:10,  type:"fence", hop:true},
    {x:340,  y:1356, w:760, h:10,  type:"fence", hop:true},
    {x:340,  y:1056, w:10,  h:140, type:"fence", hop:true},
    {x:340,  y:1272, w:10,  h:84,  type:"fence", hop:true},
    {x:1100, y:1056, w:10,  h:140, type:"fence", hop:true},
    {x:1100, y:1272, w:10,  h:84,  type:"fence", hop:true},
    {x:500,  y:1116, w:260, h:180, type:"house", hue:"#8a6f3e", trim:"#ffe9c2"},
    {x:920,  y:1176, w:60,  h:50,  type:"doghouse", ghost:true},
    {x:380,  y:1066, w:12,  h:14,  type:"sign", ghost:true, txt:"BEWARE OF DOG", txt2:"(his name is Biscuit)"},
    {x:1160, y:1096, w:20,  h:20,  type:"tree"},
    {x:1260, y:1236, w:20,  h:20,  type:"tree"},

    // House 5 yard (player)
    {x:1200, y:2046, w:170, h:10,  type:"fence", hop:true},
    {x:1460, y:2046, w:180, h:10,  type:"fence", hop:true},
    {x:1200, y:2396, w:440, h:10,  type:"fence", hop:true},
    {x:1200, y:2046, w:10,  h:162, type:"fence", hop:true},
    {x:1200, y:2284, w:10,  h:122, type:"fence", hop:true},
    {x:1630, y:2046, w:10,  h:162, type:"fence", hop:true},
    {x:1630, y:2284, w:10,  h:122, type:"fence", hop:true},
    {x:1295, y:2146, w:250, h:170, type:"house", player:true, hue:"#2e8f8a", trim:"#ffc44d"},
    {x:1180, y:2296, w:20,  h:20,  type:"tree"},
    {x:1553, y:2276, w:24,  h:24,  type:"trash", hop:true},
    {x:1468, y:2040, w:10,  h:12,  type:"mailbox", ghost:true},

    // House 6 yard (south-west)
    {x:80,  y:1816, w:215, h:10,  type:"fence", hop:true},
    {x:385, y:1816, w:215, h:10,  type:"fence", hop:true},
    {x:80,  y:2018, w:520, h:10,  type:"fence", hop:true},
    {x:80,  y:1816, w:10,  h:85,  type:"fence", hop:true},
    {x:80,  y:1977, w:10,  h:29,  type:"fence", hop:true},
    {x:590, y:1816, w:10,  h:85,  type:"fence", hop:true},
    {x:590, y:1977, w:10,  h:29,  type:"fence", hop:true},
    {x:215, y:1846, w:250, h:130, type:"house", hue:"#56406f", trim:"#ffe9c2"},
    {x:116, y:1956, w:20,  h:20,  type:"tree"},
    {x:473, y:1926, w:24,  h:24,  type:"trash", hop:true},
    {x:393, y:1810, w:10,  h:12,  type:"mailbox", ghost:true},

    // House 7 yard (south-east)
    {x:2080, y:1816, w:215, h:10,  type:"fence", hop:true},
    {x:2385, y:1816, w:215, h:10,  type:"fence", hop:true},
    {x:2080, y:2018, w:520, h:10,  type:"fence", hop:true},
    {x:2080, y:1816, w:10,  h:85,  type:"fence", hop:true},
    {x:2080, y:1977, w:10,  h:29,  type:"fence", hop:true},
    {x:2530, y:1816, w:10,  h:85,  type:"fence", hop:true},
    {x:2530, y:1977, w:10,  h:29,  type:"fence", hop:true},
    {x:2215, y:1846, w:250, h:130, type:"house", hue:"#7a5560", trim:"#ffe9c2"},
    {x:2473, y:1926, w:24,  h:24,  type:"trash", hop:true},
    {x:2393, y:1810, w:10,  h:12,  type:"mailbox", ghost:true},

    // Scattered trees
    {x:20,   y:516,  w:20, h:20, type:"tree"},
    {x:2500, y:541,  w:20, h:20, type:"tree"},
    {x:20,   y:1916, w:20, h:20, type:"tree"},
    {x:2510, y:1416, w:20, h:20, type:"tree"},
  ],

  // ── Canopies ──────────────────────────────────────────────────────────
  canopies: [
    {x:126,  y:430,  r:52},
    {x:1170, y:1100, r:56},
    {x:1270, y:1240, r:50},
    {x:1190, y:2300, r:52},
    {x:30,   y:520,  r:52},
    {x:2510, y:545,  r:54},
    {x:30,   y:1920, r:54},
    {x:2520, y:1420, r:52},
    {x:126,  y:1960, r:52},
  ],

  // ── Lamps ─────────────────────────────────────────────────────────────
  lamps: [
    {x:1858, y:116},
    {x:2058, y:516},
    {x:1858, y:876},
    {x:2058, y:876},
    {x:1858, y:1046},
    {x:2058, y:1316},
    {x:1858, y:1644},
    {x:2058, y:1644},
    {x:1858, y:1811},
    {x:2058, y:2116},
  ],

  // ── Interior doors ────────────────────────────────────────────────────
  doors: [
    {x:1363, y:2304, w:64, h:22, target:"house", spawnX:240, spawnY:200,
     worldReturn:{x:1395, y:2348}},
    {x:148,  y:434,  w:50, h:22, target:null, txt:"Nobody home right now."},
    {x:2283, y:434,  w:50, h:22, target:null, txt:"Back in a bit!"},
    {x:2253, y:1214, w:50, h:22, target:null, txt:"Shh — baby napping."},
    {x:148,  y:1964, w:50, h:22, target:null, txt:"Ring the bell?"},
    {x:2283, y:1964, w:50, h:22, target:null, txt:"Gone fishing."},
  ],

  // ── Section transitions (all locked — other sections not built yet) ───
  transitions: [
    {x:0,    y:0,    w:2560, h:32,   status:'locked', txt:'Maple Park',            txt2:'Coming soon!'},
    {x:0,    y:2528, w:2560, h:32,   status:'locked', txt:'Great Waterfront Lake', txt2:'Coming soon!'},
    {x:2528, y:0,    w:32,   h:2560, status:'locked', txt:'Maple Mart District',   txt2:'Coming soon!'},
    {x:0,    y:0,    w:32,   h:2560, status:'locked', txt:'Whispering Woods',      txt2:'Coming soon!'},
  ],

  // ── NPCs (waypoints in local coords) ──────────────────────────────────
  npcs: [
    // Walk patrol across house-1/2 yards
    {kind:"walk", variant:0, wps:[[140,516],[940,516],[940,816],[140,816]],
     spd:1.0, pp:false, shirt:"#7fb069", hair:"#2b2118"},
    // N-S bike patrol on main road (clipped to neighborhood)
    {kind:"bike", variant:0, wps:[[1958,10],[1958,2116]],
     spd:2.6, pp:true, shirt:"#ff8f57", hair:"#2b2118"},
    // E-W bike patrol along HY1
    {kind:"bike", variant:1, wps:[[0,966],[2560,966]],
     spd:2.3, pp:true, shirt:"#57b8ff", hair:"#4a3322"},
    // Stationary court kid
    {kind:"kid", variant:2, wps:[[2160,216]], spd:0,
     shirt:"#a78bdb", hair:"#1b1430",
     lines:["First to 11 wins.","Hoops, then popsicles?"]},
  ],

  // ── Pickup spawn spots (local coords) ────────────────────────────────
  pickupSpots: [
    [440,  616],   // open lawn west of doghouse yard
    [2140, 316],   // basketball court area
    [1140, 1516],  // mid-lawn
    [2440, 1116],  // east lawn
    [1958, 116],   // N-S road north stretch
    [1958, 1116],  // N-S road mid
  ],

  // ── Overworld activities (chores, jobs) — same pattern as interior ────
  activities: [
    { x:1295, y:2400, r:60, txt:"Lawn Mower", txt2:"Hold ↑ to mow lawn",
      activity:{ key:'chore_mow', durationFrames:600, timeMinutes:30, pay:15,
                 doneTxt:"Lawn mowed! +$15", label:"Mowing lawn" } },
  ],
};
