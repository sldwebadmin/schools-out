// Maple Court (Neighborhood) — Phase N1: Streets skeleton.
// All coordinates are local (origin 0,0 = world 2560,3584).
// Section size: 2560 × 2560 px.
//
// Road layout:
//   Maple Ave (main N-S, 128px): x=1216..1344  — centered on map (x=2560/2)
//
//   LEFT-SIDE ONLY (x=0..1216):
//   Oak Ave  (E-W, 140px): y=1210..1350  — centered on map (y=2560/2)
//   Court Dr (E-W, 128px): y=1700..1828  — temp position, TBD
//   Birch Ave(E-W, 140px): y=2300..2440  — temp position, TBD
//
//   RIGHT-SIDE ONLY (x=1344..2560):
//   Oak Ave  (E-W, 140px): y=1210..1350  — continues east from Maple (4-way)

import { CHUNK_W, DAY_SEED } from '../../engine/constants.js';
import { mulberry32, bakeCanvas } from '../../engine/utils.js';
import { ZONE } from '../tiledata.js';
import { drawTiledGround, drawAutotileEdges } from '../tilerender.js';

// ── Road constants (local coords) ─────────────────────────────────────────
const MNS_X=1216, MNS_W=128;  // Maple Ave N-S — centered: 2560/2 − 128/2
const OAK_Y=1210, OAK_W=140;  // Oak Ave E-W  — centered: 2560/2 − 140/2
const MEW_Y=1700, MEW_W=128;  // Court Dr E-W  — left side only (temp position)
const BIR_Y=2300, BIR_W=140;  // Birch Ave E-W — left side only (temp position)
const SW=28;                   // sidewalk strip width

// ── Zone function ─────────────────────────────────────────────────────────
function zoneAt(lx, ly) {
  // Maple Ave: full height
  if (lx >= MNS_X && lx < MNS_X+MNS_W) return ZONE.ROAD;
  // Oak Ave: left side + right side (gap covered by Maple above)
  if (ly >= OAK_Y && ly < OAK_Y+OAK_W && lx <  MNS_X)       return ZONE.ROAD;
  if (ly >= OAK_Y && ly < OAK_Y+OAK_W && lx >= MNS_X+MNS_W) return ZONE.ROAD;
  // Court Dr and Birch Ave: left side only
  if (ly >= MEW_Y && ly < MEW_Y+MEW_W && lx < MNS_X)         return ZONE.ROAD;
  if (ly >= BIR_Y && ly < BIR_Y+BIR_W && lx < MNS_X)         return ZONE.ROAD;

  // Sidewalks — Maple Ave (full height)
  if (lx >= MNS_X-SW && lx < MNS_X)              return ZONE.SIDEWALK;
  if (lx >= MNS_X+MNS_W && lx < MNS_X+MNS_W+SW) return ZONE.SIDEWALK;
  // Sidewalks — Oak Ave (both sides)
  if (ly >= OAK_Y-SW && ly < OAK_Y && lx <  MNS_X)                    return ZONE.SIDEWALK;
  if (ly >= OAK_Y-SW && ly < OAK_Y && lx >= MNS_X+MNS_W)              return ZONE.SIDEWALK;
  if (ly >= OAK_Y+OAK_W && ly < OAK_Y+OAK_W+SW && lx <  MNS_X)       return ZONE.SIDEWALK;
  if (ly >= OAK_Y+OAK_W && ly < OAK_Y+OAK_W+SW && lx >= MNS_X+MNS_W) return ZONE.SIDEWALK;
  // Sidewalks — Court Dr (left side only)
  if (ly >= MEW_Y-SW && ly < MEW_Y && lx < MNS_X)              return ZONE.SIDEWALK;
  if (ly >= MEW_Y+MEW_W && ly < MEW_Y+MEW_W+SW && lx < MNS_X) return ZONE.SIDEWALK;
  // Sidewalks — Birch Ave (left side only)
  if (ly >= BIR_Y-SW && ly < BIR_Y && lx < MNS_X)              return ZONE.SIDEWALK;
  if (ly >= BIR_Y+BIR_W && ly < BIR_Y+BIR_W+SW && lx < MNS_X) return ZONE.SIDEWALK;

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

  // ── Sidewalks ─────────────────────────────────────────────────────────────
  sidewalk(MNS_X-SW,   0,  SW, 2560);              // Maple Ave left
  sidewalk(MNS_X+MNS_W,0,  SW, 2560);              // Maple Ave right
  sidewalk(0,            OAK_Y-SW,    MNS_X,                SW);  // Oak left N
  sidewalk(MNS_X+MNS_W, OAK_Y-SW,    2560-(MNS_X+MNS_W),   SW);  // Oak right N
  sidewalk(0,            OAK_Y+OAK_W, MNS_X,                SW);  // Oak left S
  sidewalk(MNS_X+MNS_W, OAK_Y+OAK_W, 2560-(MNS_X+MNS_W),   SW);  // Oak right S
  sidewalk(0, MEW_Y-SW,    MNS_X, SW);             // Court Dr N
  sidewalk(0, MEW_Y+MEW_W, MNS_X, SW);             // Court Dr S
  sidewalk(0, BIR_Y-SW,    MNS_X, SW);             // Birch Ave N
  sidewalk(0, BIR_Y+BIR_W, MNS_X, SW);             // Birch Ave S

  // ── Roads ─────────────────────────────────────────────────────────────────
  road(MNS_X, 0, MNS_W, 2560);                                  // Maple Ave
  road(0,          OAK_Y, MNS_X,               OAK_W);          // Oak Ave left
  road(MNS_X+MNS_W, OAK_Y, 2560-(MNS_X+MNS_W), OAK_W);         // Oak Ave right
  road(0, MEW_Y, MNS_X, MEW_W);                                 // Court Dr
  road(0, BIR_Y, MNS_X, BIR_W);                                 // Birch Ave

  // ── Center-line dashes ────────────────────────────────────────────────────
  g.fillStyle="#8d80b8";
  for(let y=4;     y<2560; y+=64)  g.fillRect(MNS_X+60,   y,  8, 28);  // Maple Ave
  for(let x=4;     x<MNS_X; x+=64) g.fillRect(x, OAK_Y+66, 28,  8);   // Oak left
  for(let x=MNS_X+MNS_W; x<2560; x+=64) g.fillRect(x, OAK_Y+66, 28, 8); // Oak right
  for(let x=4;     x<MNS_X; x+=64) g.fillRect(x, MEW_Y+60, 28,  8);   // Court Dr
  for(let x=4;     x<MNS_X; x+=64) g.fillRect(x, BIR_Y+66, 28,  8);   // Birch Ave

  // ── Crosswalk marks ───────────────────────────────────────────────────────
  g.fillStyle="#cfc6e8";
  for(let i=0;i<6;i++) g.fillRect(MNS_X+10+i*22, OAK_Y+40, 12, 60);  // Maple×Oak
  for(let i=0;i<6;i++) g.fillRect(MNS_X+10+i*22, MEW_Y+40, 12, 60);  // Maple×Court
  for(let i=0;i<6;i++) g.fillRect(MNS_X+10+i*22, BIR_Y+40, 12, 60);  // Maple×Birch

  // ── Manhole covers ────────────────────────────────────────────────────────
  for(const [mx,my] of [
    [MNS_X+64,  300], [MNS_X+64,  900],
    [MNS_X+64, 1600], [MNS_X+64, 2200],  // Maple Ave
    [200, OAK_Y+70], [600, OAK_Y+70], [900, OAK_Y+70],  // Oak left
    [1600, OAK_Y+70],[1900, OAK_Y+70],[2200, OAK_Y+70],  // Oak right
    [200, MEW_Y+64], [600, MEW_Y+64], [900, MEW_Y+64],   // Court Dr
    [200, BIR_Y+70], [600, BIR_Y+70], [900, BIR_Y+70],   // Birch Ave
  ]){
    g.fillStyle="#2e294a"; g.beginPath(); g.arc(mx,my,11,0,7); g.fill();
    g.strokeStyle="#55517a"; g.lineWidth=3; g.beginPath(); g.arc(mx,my,7,0,7); g.stroke();
  }
  g.lineWidth=1;

  // ── Road name labels (temporary — high-contrast for layout review) ─────────
  function label(text, x, y, vertical) {
    g.save();
    g.font = 'bold 18px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    if (vertical) { g.translate(x, y); g.rotate(Math.PI / 2); }
    else          { g.translate(x, y); }
    const m = g.measureText(text);
    const pw = m.width + 12, ph = 24;
    g.fillStyle = 'rgba(20,16,40,0.82)';
    g.fillRect(-pw/2, -ph/2, pw, ph);
    g.fillStyle = '#ffe9c2';
    g.fillText(text, 0, 0);
    g.restore();
  }
  const MNS_CX = MNS_X+64;
  const OAK_CY = OAK_Y+70, MEW_CY = MEW_Y+64, BIR_CY = BIR_Y+70;
  for(const y of [300, 900, 1600, 2200]) { label('Maple Ave', MNS_CX, y, true); }
  for(const x of [200, 700])             { label('Oak Ave',   x, OAK_CY, false); }
  for(const x of [1600, 2100])           { label('Oak Ave',   x, OAK_CY, false); }
  for(const x of [200, 700])             { label('Court Dr',  x, MEW_CY, false); }
  for(const x of [200, 700])             { label('Birch Ave', x, BIR_CY, false); }

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
  B(MNS_X, 0,    MNS_W, 2560, '#2a2345');  // Maple Ave
  B(0,          OAK_Y, MNS_X,               OAK_W, '#2a2345');  // Oak left
  B(MNS_X+MNS_W, OAK_Y, 2560-(MNS_X+MNS_W), OAK_W, '#2a2345'); // Oak right
  B(0, MEW_Y, MNS_X, MEW_W, '#2a2345');    // Court Dr
  B(0, BIR_Y, MNS_X, BIR_W, '#2a2345');    // Birch Ave
  g.fillStyle='#ffc44d';
  g.beginPath(); g.arc(300*SC, 400*SC, 3, 0, Math.PI*2); g.fill();
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
    {x: MNS_X-4,       y: OAK_Y-4},   // Maple × Oak NW
    {x: MNS_X+MNS_W+4, y: OAK_Y-4},   // Maple × Oak NE
    {x: MNS_X-4,       y: MEW_Y-4},   // Maple × Court NW
    {x: MNS_X+MNS_W+4, y: MEW_Y-4},   // Maple × Court NE
    {x: MNS_X-4,       y: BIR_Y-4},   // Maple × Birch NW
    {x: MNS_X+MNS_W+4, y: BIR_Y-4},   // Maple × Birch NE
  ],

  doors: [
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
    [ 300,  420],
    [1600,  420],
    [ 300, 1900],
    [2200, 2000],
    [MNS_X+64, 550],
  ],

  activities: [],
};
