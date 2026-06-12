// Ground drawing logic — called per-chunk by chunks.js.
// bakeGroundInto(g, wx0, wy0) draws the full world in world coordinates;
// the caller sets up clip + translate so only the chunk region is visible.
// wx0, wy0: chunk's world-space origin, used for chunk-local texture PRNG.

import { WORLD, GOAL, RX, HY1, HY2, CHUNK_W, DAY_SEED } from '../engine/constants.js';
import { mulberry32 } from '../engine/utils.js';

export function bakeGroundInto(g, wx0, wy0) {
  const W = WORLD.w, H = WORLD.h;
  // Chunk-local PRNG — unique per chunk + day, deterministic
  const rnd = mulberry32(DAY_SEED ^ ((wx0 * 997 + wy0 * 1009) >>> 0));

  // n texture dots within the intersection of this chunk and world rect [rx0,ry0,rx1,ry1]
  function tex(rx0,ry0,rx1,ry1, n, c1,c2, dw,dh){
    const ix0=Math.max(wx0,rx0), ix1=Math.min(wx0+CHUNK_W,rx1);
    const iy0=Math.max(wy0,ry0), iy1=Math.min(wy0+CHUNK_W,ry1);
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
  function dirt(x,y,w,h){
    g.fillStyle="#8a7350"; g.fillRect(x,y,w,h);
    tex(x,y,x+w,y+h, Math.max(1,(w*h/450)|0), "#79643f","#6b5838", 5,4);
    g.fillStyle="#6b5838"; g.fillRect(x,y,w,4); g.fillRect(x,y+h-4,w,4);
  }

  /* ── 1. Wild meadow base ─────────────────────────────────────────── */
  g.fillStyle="#4e7d4a"; g.fillRect(0,0,W,H);
  // Chunk-local texture — all dots within this chunk's world rect (no waste)
  tex(wx0,wy0,wx0+CHUNK_W,wy0+CHUNK_W, 750, "#588a55","#446e42", 6,4);
  tex(wx0,wy0,wx0+CHUNK_W,wy0+CHUNK_W, 40, "#3a6340","#3a6340", 3,7);
  for(let i=0;i<20;i++){
    const iw=CHUNK_W, ih=CHUNK_W;
    g.fillStyle=["#ff9ac1","#ffd27a","#cdb8ff"][(rnd()*3)|0];
    g.fillRect(wx0+(rnd()*iw)|0, wy0+(rnd()*ih)|0, 5,5);
  }

  /* ── 2. Whispering Woods (x=0..3200, y=2048..4608) ─────────────── */
  g.fillStyle="rgba(18,42,26,.55)"; g.fillRect(0,2048,3200,2560);
  tex(0,2048,3200,4608, 500, "#26492e","#1d3b25", 7,5);

  /* ── 3. School district (x=2976..5216, y=128..1728) ─────────────── */
  g.fillStyle="#467a4d"; g.fillRect(2976,128,2240,1600);
  tex(2976,128,5216,1728, 400, "#4f8757","#3e6c45", 6,4);
  // Blacktop playground (SW corner of school)
  g.fillStyle="#55517a"; g.fillRect(3200,1080,500,280);
  g.strokeStyle="#cfc6e8"; g.lineWidth=4;
  g.strokeRect(3280,1120,140,140);
  g.beginPath(); g.moveTo(3350,1120); g.lineTo(3350,1260); g.moveTo(3280,1190); g.lineTo(3420,1190); g.stroke();
  // Sandbox (east side of school)
  g.fillStyle="#d9c08c"; g.fillRect(4640,1050,240,110);
  tex(4640,1050,4880,1160, 54, "#cdb27c","#e3cd9d", 5,4);
  // Chalk goal ring
  g.strokeStyle="#ffe9c2"; g.lineWidth=5; g.setLineDash([14,10]);
  g.beginPath(); g.arc(GOAL.x,GOAL.y,GOAL.r,0,7); g.stroke(); g.setLineDash([]);
  // Chalk ball diamond
  g.setLineDash([10,8]); g.lineWidth=3;
  g.strokeRect(3160,380,120,120); g.setLineDash([]);

  /* ── 4. Park (x=3200..5760, y=2048..3648) ───────────────────────── */
  g.fillStyle="#4c7a4f"; g.fillRect(3200,2048,2560,1600);
  tex(3200,2048,5760,3648, 400, "#56885a","#447047", 6,4);
  tex(3200,2048,5760,3648, 30, "#3a6340","#ff9ac1", 3,6);
  // Pond (western park)
  g.fillStyle="#1f4a63"; g.beginPath(); g.ellipse(4000,2600,236,130,0,0,7); g.fill();
  g.fillStyle="#2e6f8e"; g.beginPath(); g.ellipse(4000,2600,218,112,0,0,7); g.fill();
  g.fillStyle="#3f86a8"; g.beginPath(); g.ellipse(3970,2578,134,62,0,0,7); g.fill();
  g.fillStyle="#2e7a4f";
  for(const [lx,ly] of [[3880,2640],[4070,2550],[4020,2660]]){
    g.beginPath(); g.ellipse(lx,ly,16,9,0,0,7); g.fill();
  }
  // Pond paths
  dirt(3990,2740,60,260); dirt(4220,2574,280,60);
  // Community garden (east park)
  g.fillStyle="#6b4a2f"; g.fillRect(4950,3100,280,270);
  for(let ry=3120;ry<3360;ry+=36){
    g.fillStyle="#5a3c24"; g.fillRect(4962,ry,256,12);
    g.fillStyle="#5fae5a";
    for(let px2=4974;px2<5210;px2+=24) g.fillRect(px2,ry+2,6,8);
  }
  // Park tables
  g.fillStyle="#8a7350"; g.fillRect(5100,3240,56,30); g.fillRect(5220,3340,56,30);

  /* ── 5. Shopping district (x=5952..8192, y=2048..3968) ──────────── */
  g.fillStyle="#3f3a60"; g.fillRect(5952,2048,2240,1920);
  g.fillStyle="#cfc6e8";
  for(let x=5990;x<8160;x+=82) g.fillRect(x,2080,6,70);
  for(let i=0;i<7;i++) for(let j=0;j<2;j++){
    g.fillStyle=(i+j)%2?"#1b1430":"#ffe9c2";
    g.fillRect(6200+i*20,3700+j*20,20,20);
  }
  // Shop connector road
  road(4166,3100,1786,140);

  /* ── 6. Neighbourhood hub (x=2816..5376, y=5376..7936) ──────────── */
  g.fillStyle="#4c7a4f"; g.fillRect(2816,5376,2560,2560);
  tex(2816,5376,5376,7936, 500, "#56885a","#447047", 6,4);
  tex(2816,5376,5376,7936, 40, "#3a6340","#ff9ac1", 3,6);
  // Basketball half-court
  g.fillStyle="#55517a"; g.fillRect(4700,5480,260,200);
  g.strokeStyle="#cfc6e8"; g.lineWidth=4;
  g.strokeRect(4704,5484,252,192);
  g.strokeRect(4790,5484,80,70);
  g.beginPath(); g.arc(4830,5554,40,0,Math.PI); g.stroke();

  /* ── 7. Bike paths (connector zones) ────────────────────────────── */
  dirt(4230,1728,60,320);   // school-to-park connector (east of main road)
  dirt(4230,3648,60,1728);  // park-to-neighbourhood connector

  /* ── 8. Roads ────────────────────────────────────────────────────── */
  // Sidewalks flanking main road through neighbourhood
  sidewalk(3998,5376,28,2304); sidewalk(4166,5376,28,2304);
  sidewalk(2816,6212,2560,28); sidewalk(2816,6380,2560,28); // HY1 sides
  sidewalk(2816,6692,2560,28); sidewalk(2816,6860,2560,28); // HY2 sides
  road(RX,1600,140,6080);          // main N-S road y=1600..7680
  road(2816,HY1,2560,140);         // neighbourhood horizontal 1
  road(2816,HY2,2560,140);         // neighbourhood horizontal 2

  /* ── 9. Cul-de-sac (centre 4096,7680) ───────────────────────────── */
  g.fillStyle="#46406b"; g.beginPath(); g.arc(4096,7680,150,0,7); g.fill();
  g.strokeStyle="#353055"; g.lineWidth=5; g.beginPath(); g.arc(4096,7680,148,0,7); g.stroke();
  g.fillStyle="#4c7a4f"; g.beginPath(); g.arc(4096,7680,44,0,7); g.fill();
  g.fillStyle="#ff9ac1"; g.fillRect(4084,7668,5,5); g.fillStyle="#ffd27a"; g.fillRect(4104,7682,5,5);

  /* ── 10. Road markings ───────────────────────────────────────────── */
  g.fillStyle="#8d80b8";
  for(let y=1620;y<7640;y+=64) g.fillRect(RX+66,y,8,28);          // main road dashes
  for(let x=2840;x<5360;x+=64) g.fillRect(x,HY1+66,28,8);         // HY1 dashes
  for(let x=2840;x<5360;x+=64) g.fillRect(x,HY2+66,28,8);         // HY2 dashes
  for(let x=4190;x<5940;x+=64) g.fillRect(x,3166,28,8);            // shop spur dashes
  // Crosswalks at HY1/HY2 + main road intersections
  g.fillStyle="#cfc6e8";
  for(const iy of [HY1,HY2]) for(let i=0;i<6;i++) g.fillRect(RX+10+i*22,iy+40,12,60);
  // Manholes
  for(const [mx,my] of [[3900,3000],[4096,4500],[4096,5900],[4700,6310]]){
    g.fillStyle="#2e294a"; g.beginPath(); g.arc(mx,my,11,0,7); g.fill();
    g.strokeStyle="#55517a"; g.lineWidth=3; g.beginPath(); g.arc(mx,my,7,0,7); g.stroke();
  }
}
