// Maple Court (Neighborhood) — Phase N1: Streets skeleton.
// All coordinates are local (origin 0,0 = world 2560,3584).
// Section size: 2560 × 2560 px.
//
// Road grid:
//   Maple Ave (main N-S, 128px): x=1200..1328  — splits TL/BL from TR/BR
//   Court Dr  (main E-W, 128px): y=1200..1328  — splits TL/TR from BL/BR
//   Elm Ct    (sec  N-S,  64px): x=560..624    — secondary in TL / BL quadrants
//   Ridge Rd  (sec  N-S, 140px): x=1888..2028  — world road, secondary in TR / BR
//   Oak Ave   (sec  E-W, 140px): y=896..1036   — world road HY1, secondary in TL/TR
//   Birch Ave (sec  E-W, 140px): y=1664..1804  — world road HY2, secondary in BL/BR

import { CHUNK_W, DAY_SEED } from '../../engine/constants.js';
import { mulberry32, bakeCanvas } from '../../engine/utils.js';
import { ZONE } from '../tiledata.js';
import { drawTiledGround, drawAutotileEdges } from '../tilerender.js';

// ── Road constants (local coords) ─────────────────────────────────────────
const MNS_X=1200, MNS_W=128;  // Maple Ave N-S
const MEW_Y=1200, MEW_W=128;  // Court Dr E-W
const ELM_X= 560, ELM_W= 64;  // Elm Ct
const RID_X=1888, RID_W=140;  // Ridge Rd (world road)
const OAK_Y= 896, OAK_W=140;  // Oak Ave  (world road HY1)
const BIR_Y=1664, BIR_W=140;  // Birch Ave (world road HY2)
const SW=28;                   // sidewalk strip width

// ── Zone function ─────────────────────────────────────────────────────────
function zoneAt(lx, ly) {
  // Roads first — they win over sidewalks at intersections
  if (lx >= MNS_X && lx < MNS_X+MNS_W) return ZONE.ROAD;
  if (ly >= MEW_Y && ly < MEW_Y+MEW_W) return ZONE.ROAD;
  if (lx >= ELM_X && lx < ELM_X+ELM_W) return ZONE.ROAD;
  if (lx >= RID_X && lx < RID_X+RID_W) return ZONE.ROAD;
  if (ly >= OAK_Y && ly < OAK_Y+OAK_W) return ZONE.ROAD;
  if (ly >= BIR_Y && ly < BIR_Y+BIR_W) return ZONE.ROAD;
  // Sidewalks
  if (lx >= MNS_X-SW && lx < MNS_X)              return ZONE.SIDEWALK;
  if (lx >= MNS_X+MNS_W && lx < MNS_X+MNS_W+SW) return ZONE.SIDEWALK;
  if (ly >= MEW_Y-SW && ly < MEW_Y)               return ZONE.SIDEWALK;
  if (ly >= MEW_Y+MEW_W && ly < MEW_Y+MEW_W+SW)  return ZONE.SIDEWALK;
  if (lx >= ELM_X-SW && lx < ELM_X)              return ZONE.SIDEWALK;
  if (lx >= ELM_X+ELM_W && lx < ELM_X+ELM_W+SW) return ZONE.SIDEWALK;
  if (lx >= RID_X-SW && lx < RID_X)              return ZONE.SIDEWALK;
  if (lx >= RID_X+RID_W && lx < RID_X+RID_W+SW) return ZONE.SIDEWALK;
  if (ly >= OAK_Y-SW && ly < OAK_Y)              return ZONE.SIDEWALK;
  if (ly >= OAK_Y+OAK_W && ly < OAK_Y+OAK_W+SW) return ZONE.SIDEWALK;
  if (ly >= BIR_Y-SW && ly < BIR_Y)              return ZONE.SIDEWALK;
  if (ly >= BIR_Y+BIR_W && ly < BIR_Y+BIR_W+SW) return ZONE.SIDEWALK;
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

  // Sidewalks drawn first; roads then overdraw the cross-over areas
  sidewalk(MNS_X-SW, 0, SW, 2560);
  sidewalk(MNS_X+MNS_W, 0, SW, 2560);
  sidewalk(0, MEW_Y-SW, 2560, SW);
  sidewalk(0, MEW_Y+MEW_W, 2560, SW);
  sidewalk(ELM_X-SW, 0, SW, 2560);
  sidewalk(ELM_X+ELM_W, 0, SW, 2560);
  sidewalk(RID_X-SW, 0, SW, 2560);
  sidewalk(RID_X+RID_W, 0, SW, 2560);
  sidewalk(0, OAK_Y-SW, 2560, SW);
  sidewalk(0, OAK_Y+OAK_W, 2560, SW);
  sidewalk(0, BIR_Y-SW, 2560, SW);
  sidewalk(0, BIR_Y+BIR_W, 2560, SW);

  // Roads
  road(MNS_X, 0, MNS_W, 2560);
  road(0, MEW_Y, 2560, MEW_W);
  road(ELM_X, 0, ELM_W, 2560);
  road(RID_X, 0, RID_W, 2560);
  road(0, OAK_Y, 2560, OAK_W);
  road(0, BIR_Y, 2560, BIR_W);

  // Center-line dashes
  g.fillStyle="#8d80b8";
  for(let y=4; y<2560; y+=64) g.fillRect(MNS_X+60, y, 8, 28);   // Maple Ave
  for(let x=4; x<2560; x+=64) g.fillRect(x, MEW_Y+60, 28, 8);   // Court Dr
  for(let y=4; y<2560; y+=64) g.fillRect(ELM_X+28, y, 8, 28);   // Elm Ct
  for(let y=4; y<2560; y+=64) g.fillRect(RID_X+66, y, 8, 28);   // Ridge Rd
  for(let x=4; x<2560; x+=64) g.fillRect(x, OAK_Y+66, 28, 8);  // Oak Ave
  for(let x=4; x<2560; x+=64) g.fillRect(x, BIR_Y+66, 28, 8);  // Birch Ave

  // Crosswalk marks at major intersections
  g.fillStyle="#cfc6e8";
  for(let i=0;i<6;i++) g.fillRect(MNS_X+10+i*22, OAK_Y+40, 12, 60);  // Maple×Oak
  for(let i=0;i<6;i++) g.fillRect(MNS_X+10+i*22, MEW_Y+40, 12, 60);  // Maple×Court
  for(let i=0;i<6;i++) g.fillRect(MNS_X+10+i*22, BIR_Y+40, 12, 60);  // Maple×Birch
  for(let i=0;i<4;i++) g.fillRect(ELM_X+2+i*14,  OAK_Y+40,  8, 60);  // Elm×Oak
  for(let i=0;i<4;i++) g.fillRect(ELM_X+2+i*14,  MEW_Y+40,  8, 60);  // Elm×Court
  for(let i=0;i<4;i++) g.fillRect(ELM_X+2+i*14,  BIR_Y+40,  8, 60);  // Elm×Birch

  // Manhole covers at mid-block positions
  for(const [mx,my] of [
    [MNS_X+64,  400], [MNS_X+64, 1600], [MNS_X+64, 2200],
    [ELM_X+32,  700], [ELM_X+32, 1800],
    [RID_X+70,  500], [RID_X+70, 1500], [RID_X+70, 2100],
    [200, OAK_Y+70], [900, OAK_Y+70], [1600, OAK_Y+70],
    [200, BIR_Y+70], [900, BIR_Y+70], [1600, BIR_Y+70],
  ]){
    g.fillStyle="#2e294a"; g.beginPath(); g.arc(mx,my,11,0,7); g.fill();
    g.strokeStyle="#55517a"; g.lineWidth=3; g.beginPath(); g.arc(mx,my,7,0,7); g.stroke();
  }
  g.lineWidth=1;

  drawAutotileEdges(g, lx0, ly0, zoneAt);
}

// ── Minimap bake ──────────────────────────────────────────────────────────
function minimapBake() {
  const SC = 150 / 2560;
  const [c, g] = bakeCanvas(150, 150);
  const B = (x,y,w,h,col) => {
    g.fillStyle=col;
    g.fillRect(x*SC, y*SC, Math.max(1,w*SC), Math.max(1,h*SC));
  };
  g.fillStyle='#3f5d44'; g.fillRect(0,0,150,150);
  B(MNS_X, 0,    MNS_W, 2560, '#2a2345');
  B(0,    MEW_Y, 2560,  MEW_W, '#2a2345');
  B(ELM_X, 0,   ELM_W, 2560,  '#2a2345');
  B(RID_X, 0,   RID_W, 2560,  '#2a2345');
  B(0,    OAK_Y, 2560,  OAK_W, '#2a2345');
  B(0,    BIR_Y, 2560,  BIR_W, '#2a2345');
  // Player spawn marker
  g.fillStyle='#ffc44d';
  g.beginPath(); g.arc(592*SC, 1550*SC, 3, 0, Math.PI*2); g.fill();
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

  walls: [],

  canopies: [],

  lamps: [
    {x:1196, y: 892},  // Maple × Oak NW
    {x:1332, y: 892},  // Maple × Oak NE
    {x:1196, y:1196},  // Maple × Court NW
    {x:1332, y:1196},  // Maple × Court NE
    {x:1196, y:1660},  // Maple × Birch NW
    {x:1332, y:1660},  // Maple × Birch NE
    {x: 556, y: 892},  // Elm × Oak W
    {x: 628, y: 892},  // Elm × Oak E
    {x: 556, y:1196},  // Elm × Court W
    {x: 628, y:1196},  // Elm × Court E
    {x: 556, y:1660},  // Elm × Birch
    {x:1884, y: 892},  // Ridge × Oak
    {x:1884, y:1196},  // Ridge × Court
    {x:1884, y:1660},  // Ridge × Birch
  ],

  doors: [
    // Player's house placeholder — BL quadrant; house placed in Phase N2
    {x:270, y:2200, w:64, h:22, target:"house", spawnX:240, spawnY:200,
     worldReturn:{x:302, y:2244}},
  ],

  transitions: [
    {x:0,    y:0,    w:2560, h:32,   status:'locked', txt:'Maple Park',            txt2:'Coming soon!'},
    {x:0,    y:2528, w:2560, h:32,   status:'locked', txt:'Great Waterfront Lake', txt2:'Coming soon!'},
    {x:2528, y:0,    w:32,   h:2560, status:'locked', txt:'Maple Mart District',   txt2:'Coming soon!'},
    {x:0,    y:0,    w:32,   h:2560, status:'locked', txt:'Whispering Woods',      txt2:'Coming soon!'},
  ],

  npcs: [],

  pickupSpots: [
    [300,  420],  // TL quad lawn
    [1600, 420],  // TR quad lawn
    [300, 1900],  // BL quad lawn
    [2200, 2000], // BR quad lawn
    [1264, 550],  // Maple Ave mid-north
    [592,  750],  // Elm Ct mid-north
  ],

  activities: [],
};
