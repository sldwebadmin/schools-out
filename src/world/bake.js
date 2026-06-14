// Ground drawing logic — called per-chunk by chunks.js.
// bakeGroundInto(g, wx0, wy0) draws the full world in world coordinates;
// the caller sets up clip + translate so only the chunk region is visible.
// wx0, wy0: chunk's world-space origin, used for chunk-local texture PRNG.

import { WORLD, GOAL, RX, HY1, HY2, CHUNK_W, DAY_SEED, USE_SHEETS } from '../engine/constants.js';
import { mulberry32 } from '../engine/utils.js';
import { drawTiledGround, drawAutotileEdges } from './tilerender.js';

export function bakeGroundInto(g, wx0, wy0) {
  const W = WORLD.w, H = WORLD.h;
  const rnd = mulberry32(DAY_SEED ^ ((wx0 * 997 + wy0 * 1009) >>> 0));

  // ── shared helpers (close over g / rnd) ─────────────────────────────
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

  if(USE_SHEETS){
    // ── Tiled base: all zone areas get pixel-art tile textures ─────────
    drawTiledGround(g, wx0, wy0);

    // ── Overlay pass: detail content only (no zone base-fills) ─────────
    // Construction details (concrete pads, mud tracks, access road)
    g.fillStyle="#9a9090"; g.fillRect(888,590,344,336);
    tex(888,590,1232,926, 50, "#8a8080","#a0a0a8", 10,8);
    g.fillStyle="#9a9090"; g.fillRect(1448,840,296,316);
    tex(1448,840,1744,1156, 35, "#8a8080","#a0a0a8", 10,8);
    g.fillStyle="#4a3420"; g.fillRect(540,720,240,46);
    tex(540,720,780,766, 18, "#3a2818","#5a4030", 8,4);
    g.fillStyle="#4a3420"; g.fillRect(580,640,240,86);
    tex(580,640,820,726, 22, "#3a2818","#5a4030", 8,4);
    dirt(2048,1760,2400,56); // access road (not in zoneAt → tiles show meadow; override)

    // Park: pond + garden rows + tables
    g.fillStyle="#1f4a63"; g.beginPath(); g.ellipse(3200,2750,236,130,0,0,7); g.fill();
    g.fillStyle="#2e6f8e"; g.beginPath(); g.ellipse(3200,2750,218,112,0,0,7); g.fill();
    g.fillStyle="#3f86a8"; g.beginPath(); g.ellipse(3170,2728,134,62,0,0,7); g.fill();
    g.fillStyle="#2e7a4f";
    for(const [lx,ly] of [[3070,2790],[3260,2700],[3210,2810]]){
      g.beginPath(); g.ellipse(lx,ly,16,9,0,0,7); g.fill();
    }
    dirt(3190,2890,60,260); dirt(3370,2680,80,240);
    g.fillStyle="#6b4a2f"; g.fillRect(4054,3132,280,270);
    for(let ry=3152;ry<3392;ry+=36){
      g.fillStyle="#5a3c24"; g.fillRect(4066,ry,256,12);
      g.fillStyle="#5fae5a";
      for(let px2=4078;px2<4302;px2+=24) g.fillRect(px2,ry+2,6,8);
    }
    g.fillStyle="#8a7350"; g.fillRect(3900,3200,56,30); g.fillRect(4020,3300,56,30);

    // School: blacktop court lines + sandbox + chalk marks
    g.fillStyle="#55517a"; g.fillRect(4320,1440,500,280); // blacktop fill (not tile-matched)
    g.strokeStyle="#cfc6e8"; g.lineWidth=4;
    g.strokeRect(4400,1480,140,140);
    g.beginPath(); g.moveTo(4470,1480); g.lineTo(4470,1620);
    g.moveTo(4400,1550); g.lineTo(4540,1550); g.stroke();
    g.fillStyle="#d9c08c"; g.fillRect(5760,1170,240,110); // sandbox fill
    tex(5760,1170,6000,1280, 54, "#cdb27c","#e3cd9d", 5,4);
    g.strokeStyle="#ffe9c2"; g.lineWidth=5; g.setLineDash([14,10]);
    g.beginPath(); g.arc(GOAL.x,GOAL.y,GOAL.r,0,7); g.stroke(); g.setLineDash([]);
    g.setLineDash([10,8]); g.lineWidth=3;
    g.strokeRect(4340,620,120,120); g.setLineDash([]);

    // Athletic fields: mow stripes + all field markings
    g.fillStyle="rgba(0,0,0,.07)";
    for(let sy=1024; sy<2112; sy+=62){
      if(Math.floor((sy-1024)/62)%2===0) g.fillRect(6336,sy,524,62);
    }
    g.strokeStyle="rgba(255,255,255,.8)"; g.lineWidth=4; g.setLineDash([]);
    g.strokeRect(6372,1062,454,998);
    g.beginPath(); g.moveTo(6372,1561); g.lineTo(6826,1561); g.stroke();
    g.beginPath(); g.arc(6599,1561,62,0,7); g.stroke();
    g.strokeRect(6452,1062,296,88);
    g.strokeRect(6452,1972,296,88);
    g.lineWidth=2;
    g.strokeRect(6502,1062,196,48);
    g.strokeRect(6502,2012,196,48);
    g.beginPath(); g.arc(6372,1062,16,0,Math.PI/2); g.stroke();
    g.beginPath(); g.arc(6826,1062,16,Math.PI/2,Math.PI); g.stroke();
    g.beginPath(); g.arc(6372,2060,16,-Math.PI/2,0); g.stroke();
    g.beginPath(); g.arc(6826,2060,16,Math.PI,Math.PI*1.5); g.stroke();
    g.fillStyle="rgba(255,255,255,.7)"; g.beginPath(); g.arc(6599,1561,5,0,7); g.fill();
    tex(6880,1062,7340,1190, 52, "#8a5030","#6a3a20", 7,5);
    tex(7252,1190,7340,1680, 32, "#8a5030","#6a3a20", 7,5);
    tex(6880,1640,7340,1700, 28, "#8a5030","#6a3a20", 7,5);
    g.fillStyle="#9a5a38";
    g.beginPath();
    g.moveTo(7060,1566); g.lineTo(7168,1452); g.lineTo(7060,1338); g.lineTo(6952,1452);
    g.closePath(); g.fill();
    tex(6952,1338,7168,1566, 60, "#8a5030","#a06040", 5,4);
    g.fillStyle="#b07050"; g.beginPath(); g.arc(7060,1452,18,0,7); g.fill();
    g.strokeStyle="rgba(255,255,255,.85)"; g.lineWidth=4; g.setLineDash([]);
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(7168,1452); g.stroke();
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(6952,1452); g.stroke();
    g.strokeStyle="rgba(255,255,255,.45)"; g.lineWidth=2; g.setLineDash([18,12]);
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(7218,1696); g.stroke();
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(6902,1696); g.stroke();
    g.setLineDash([]);
    g.fillStyle="#ffe9c2";
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(7074,1556); g.lineTo(7074,1543); g.lineTo(7046,1543); g.lineTo(7046,1556); g.closePath(); g.fill();
    g.fillRect(7162,1444,13,14); g.fillRect(7053,1331,13,13); g.fillRect(6945,1444,13,14);
    g.strokeStyle="rgba(255,255,255,.55)"; g.lineWidth=2; g.setLineDash([5,4]);
    g.strokeRect(7025,1551,22,34); g.strokeRect(7063,1551,22,34);
    g.setLineDash([]);
    g.fillStyle="#9a9090"; g.fillRect(7278,1062,62,458);
    tex(7278,1062,7340,1520, 26, "#888888","#a0a0a8", 8,6);
    g.fillStyle="#7a8a90"; g.fillRect(6862,1952,42,42);
    for(const [sx,sy] of [[6450,1200],[6622,1900],[7022,1102],[7152,1852]]){
      g.fillStyle="#668066"; g.beginPath(); g.arc(sx,sy,7,0,7); g.fill();
      g.fillStyle="#4a604a"; g.beginPath(); g.arc(sx,sy,4,0,7); g.fill();
    }
    g.lineWidth=1;

    // Water Tower: stone platform + dirt paths
    g.fillStyle="#8a8070"; g.fillRect(7100,630,240,210);
    tex(7100,630,7340,840, 50, "#787060","#9a9080", 8,6);
    dirt(7040,840,200,90); dirt(7000,910,180,90); dirt(6960,980,180,80);

    // Shopping: arcade column markers + checker accent + connector road
    g.fillStyle="#cfc6e8";
    for(let x=5670;x<7840;x+=82) g.fillRect(x,2590,6,70);
    for(let i=0;i<7;i++) for(let j=0;j<2;j++){
      g.fillStyle=(i+j)%2?"#1b1430":"#ffe9c2";
      g.fillRect(5880+i*20,4200+j*20,20,20);
    }
    road(4588,HY1,1044,140);

    // Neighbourhood: basketball court lines only (fill from COURT zone tiles)
    g.strokeStyle="#cfc6e8"; g.lineWidth=4;
    g.strokeRect(4704,3704,252,192);
    g.strokeRect(4790,3704,80,70);
    g.beginPath(); g.arc(4830,3774,40,0,Math.PI); g.stroke();

    // Lake: boardwalk planks (sand + water covered by zone tiles)
    g.fillStyle="#a86f3e"; g.fillRect(2560,6450,5376,40);
    g.fillStyle="#8a5730";
    for(let bx=2560;bx<7936;bx+=4) g.fillRect(bx,6450,3,40);
    g.fillStyle="#7a4e28"; g.fillRect(2560,6450,5376,4); g.fillRect(2560,6486,5376,4);

    // Dirt bike paths (most not in zoneAt → override tiles)
    dirt(2304,2900,256,60);
    dirt(4490,2112,60,192);
    dirt(2560,2900,1860,50);
    dirt(1380,2900,924,50);
    dirt(1380,2900,50,200);
    dirt(1100,3060,340,50);
    dirt(700,3500,40,2060);
    dirt(500,5540,260,50);

    // Sidewalks + main roads + cul-de-sac + road markings (procedural on tiles)
    sidewalk(4420,3584,28,2816);
    sidewalk(4588,3584,28,2816);
    sidewalk(2560,HY1-28,2560,28); sidewalk(2560,HY1+140,2560,28);
    sidewalk(2560,HY2-28,2560,28); sidewalk(2560,HY2+140,2560,28);
    road(RX,2112,140,4288);
    road(2560,HY1,2560,140);
    road(2560,HY2,2560,140);
    g.fillStyle="#46406b"; g.beginPath(); g.arc(4518,5888,150,0,7); g.fill();
    g.strokeStyle="#353055"; g.lineWidth=5; g.beginPath(); g.arc(4518,5888,148,0,7); g.stroke();
    g.fillStyle="#4c7a4f"; g.beginPath(); g.arc(4518,5888,44,0,7); g.fill();
    g.fillStyle="#ff9ac1"; g.fillRect(4506,5876,5,5); g.fillStyle="#ffd27a"; g.fillRect(4526,5890,5,5);
    g.fillStyle="#8d80b8";
    for(let y=2116;y<6380;y+=64) g.fillRect(RX+66,y,8,28);
    for(let x=2584;x<5104;x+=64) g.fillRect(x,HY1+66,28,8);
    for(let x=2584;x<5104;x+=64) g.fillRect(x,HY2+66,28,8);
    for(let x=4612;x<5616;x+=64) g.fillRect(x,HY1+66,28,8);
    g.fillStyle="#cfc6e8";
    for(const iy of [HY1,HY2]) for(let i=0;i<6;i++) g.fillRect(RX+10+i*22,iy+40,12,60);
    for(const [mx,my] of [[3100,3100],[4518,4200],[4518,5000],[4518,5600]]){
      g.fillStyle="#2e294a"; g.beginPath(); g.arc(mx,my,11,0,7); g.fill();
      g.strokeStyle="#55517a"; g.lineWidth=3; g.beginPath(); g.arc(mx,my,7,0,7); g.stroke();
    }

    // Re-draw LAWN edge/corner tiles on top of road+sidewalk overlays so the
    // ME grass transition sprites are never buried by procedural fills.
    drawAutotileEdges(g, wx0, wy0);

  } else {
    // ── Full procedural renderer (original, unchanged) ─────────────────

    /* ── 1. Wild meadow base ─────────────────────────────────────────── */
    g.fillStyle="#4e7d4a"; g.fillRect(0,0,W,H);
    tex(wx0,wy0,wx0+CHUNK_W,wy0+CHUNK_W, 750, "#588a55","#446e42", 6,4);
    tex(wx0,wy0,wx0+CHUNK_W,wy0+CHUNK_W, 40, "#3a6340","#3a6340", 3,7);
    for(let i=0;i<20;i++){
      g.fillStyle=["#ff9ac1","#ffd27a","#cdb8ff"][(rnd()*3)|0];
      g.fillRect(wx0+(rnd()*CHUNK_W)|0, wy0+(rnd()*CHUNK_W)|0, 5,5);
    }

    /* ── 2. Construction site (512..2048, 512..1792) — built ────── */
    g.fillStyle="#7a6a50"; g.fillRect(512,512,1536,1280);
    tex(512,512,2048,1792, 400, "#6b5a3e","#8a7a58", 8,5);
    tex(512,512,2048,1792, 100, "#9a8a6a","#5a4a2e", 12,8);
    g.fillStyle="#9a9090"; g.fillRect(888,590,344,336);
    tex(888,590,1232,926, 50, "#8a8080","#a0a0a8", 10,8);
    g.fillStyle="#9a9090"; g.fillRect(1448,840,296,316);
    tex(1448,840,1744,1156, 35, "#8a8080","#a0a0a8", 10,8);
    g.fillStyle="#4a3420"; g.fillRect(540,720,240,46);
    tex(540,720,780,766, 18, "#3a2818","#5a4030", 8,4);
    g.fillStyle="#4a3420"; g.fillRect(580,640,240,86);
    tex(580,640,820,726, 22, "#3a2818","#5a4030", 8,4);
    dirt(2048,1760,2400,56);

    /* ── 3. Whispering Woods (256..2304, 2048..5632) ───────────────── */
    g.fillStyle="rgba(18,42,26,.55)"; g.fillRect(256,2048,2048,3584);
    tex(256,2048,2304,5632, 600, "#26492e","#1d3b25", 7,5);
    g.fillStyle="#4c7a4f"; g.fillRect(900,3060,500,440);
    tex(900,3060,1400,3500, 80, "#56885a","#447047", 6,4);

    /* ── 4. Park (2560..4608, 2304..3456) ───────────────────────────── */
    g.fillStyle="#4c7a4f"; g.fillRect(2560,2304,2048,1152);
    tex(2560,2304,4608,3456, 400, "#56885a","#447047", 6,4);
    tex(2560,2304,4608,3456, 30, "#3a6340","#ff9ac1", 3,6);
    g.fillStyle="#1f4a63"; g.beginPath(); g.ellipse(3200,2750,236,130,0,0,7); g.fill();
    g.fillStyle="#2e6f8e"; g.beginPath(); g.ellipse(3200,2750,218,112,0,0,7); g.fill();
    g.fillStyle="#3f86a8"; g.beginPath(); g.ellipse(3170,2728,134,62,0,0,7); g.fill();
    g.fillStyle="#2e7a4f";
    for(const [lx,ly] of [[3070,2790],[3260,2700],[3210,2810]]){
      g.beginPath(); g.ellipse(lx,ly,16,9,0,0,7); g.fill();
    }
    dirt(3190,2890,60,260); dirt(3370,2680,80,240);
    g.fillStyle="#6b4a2f"; g.fillRect(4054,3132,280,270);
    for(let ry=3152;ry<3392;ry+=36){
      g.fillStyle="#5a3c24"; g.fillRect(4066,ry,256,12);
      g.fillStyle="#5fae5a";
      for(let px2=4078;px2<4302;px2+=24) g.fillRect(px2,ry+2,6,8);
    }
    g.fillStyle="#8a7350"; g.fillRect(3900,3200,56,30); g.fillRect(4020,3300,56,30);

    /* ── 5. School district (4096..6336, 512..2112) ──────────────────── */
    g.fillStyle="#467a4d"; g.fillRect(4096,512,2240,1600);
    tex(4096,512,6336,2112, 400, "#4f8757","#3e6c45", 6,4);
    g.fillStyle="#55517a"; g.fillRect(4320,1440,500,280);
    g.strokeStyle="#cfc6e8"; g.lineWidth=4;
    g.strokeRect(4400,1480,140,140);
    g.beginPath(); g.moveTo(4470,1480); g.lineTo(4470,1620);
    g.moveTo(4400,1550); g.lineTo(4540,1550); g.stroke();
    g.fillStyle="#d9c08c"; g.fillRect(5760,1170,240,110);
    tex(5760,1170,6000,1280, 54, "#cdb27c","#e3cd9d", 5,4);
    g.strokeStyle="#ffe9c2"; g.lineWidth=5; g.setLineDash([14,10]);
    g.beginPath(); g.arc(GOAL.x,GOAL.y,GOAL.r,0,7); g.stroke(); g.setLineDash([]);
    g.setLineDash([10,8]); g.lineWidth=3;
    g.strokeRect(4340,620,120,120); g.setLineDash([]);

    /* ── 6. Athletic fields (6336..7360, 1024..2112) — built ─────── */
    g.fillStyle="#4c7a4f"; g.fillRect(6336,1024,1024,1088);
    tex(6336,1024,7360,2112, 300, "#56885a","#447047", 6,4);
    g.fillStyle="rgba(0,0,0,.07)";
    for(let sy=1024; sy<2112; sy+=62){
      if(Math.floor((sy-1024)/62)%2===0) g.fillRect(6336,sy,524,62);
    }
    g.strokeStyle="rgba(255,255,255,.8)"; g.lineWidth=4; g.setLineDash([]);
    g.strokeRect(6372,1062,454,998);
    g.beginPath(); g.moveTo(6372,1561); g.lineTo(6826,1561); g.stroke();
    g.beginPath(); g.arc(6599,1561,62,0,7); g.stroke();
    g.strokeRect(6452,1062,296,88);
    g.strokeRect(6452,1972,296,88);
    g.lineWidth=2;
    g.strokeRect(6502,1062,196,48);
    g.strokeRect(6502,2012,196,48);
    g.beginPath(); g.arc(6372,1062,16,0,Math.PI/2); g.stroke();
    g.beginPath(); g.arc(6826,1062,16,Math.PI/2,Math.PI); g.stroke();
    g.beginPath(); g.arc(6372,2060,16,-Math.PI/2,0); g.stroke();
    g.beginPath(); g.arc(6826,2060,16,Math.PI,Math.PI*1.5); g.stroke();
    g.fillStyle="rgba(255,255,255,.7)"; g.beginPath(); g.arc(6599,1561,5,0,7); g.fill();
    tex(6880,1062,7340,1190, 52, "#8a5030","#6a3a20", 7,5);
    tex(7252,1190,7340,1680, 32, "#8a5030","#6a3a20", 7,5);
    tex(6880,1640,7340,1700, 28, "#8a5030","#6a3a20", 7,5);
    g.fillStyle="#9a5a38";
    g.beginPath();
    g.moveTo(7060,1566); g.lineTo(7168,1452); g.lineTo(7060,1338); g.lineTo(6952,1452);
    g.closePath(); g.fill();
    tex(6952,1338,7168,1566, 60, "#8a5030","#a06040", 5,4);
    g.fillStyle="#b07050"; g.beginPath(); g.arc(7060,1452,18,0,7); g.fill();
    g.strokeStyle="rgba(255,255,255,.85)"; g.lineWidth=4; g.setLineDash([]);
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(7168,1452); g.stroke();
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(6952,1452); g.stroke();
    g.strokeStyle="rgba(255,255,255,.45)"; g.lineWidth=2; g.setLineDash([18,12]);
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(7218,1696); g.stroke();
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(6902,1696); g.stroke();
    g.setLineDash([]);
    g.fillStyle="#ffe9c2";
    g.beginPath(); g.moveTo(7060,1566); g.lineTo(7074,1556); g.lineTo(7074,1543); g.lineTo(7046,1543); g.lineTo(7046,1556); g.closePath(); g.fill();
    g.fillRect(7162,1444,13,14); g.fillRect(7053,1331,13,13); g.fillRect(6945,1444,13,14);
    g.strokeStyle="rgba(255,255,255,.55)"; g.lineWidth=2; g.setLineDash([5,4]);
    g.strokeRect(7025,1551,22,34); g.strokeRect(7063,1551,22,34);
    g.setLineDash([]);
    g.fillStyle="#9a9090"; g.fillRect(7278,1062,62,458);
    tex(7278,1062,7340,1520, 26, "#888888","#a0a0a8", 8,6);
    g.fillStyle="#7a8a90"; g.fillRect(6862,1952,42,42);
    for(const [sx,sy] of [[6450,1200],[6622,1900],[7022,1102],[7152,1852]]){
      g.fillStyle="#668066"; g.beginPath(); g.arc(sx,sy,7,0,7); g.fill();
      g.fillStyle="#4a604a"; g.beginPath(); g.arc(sx,sy,4,0,7); g.fill();
    }
    g.lineWidth=1;

    /* ── 6c. Water Tower Overlook (6656..7680, 512..1024) — built ─── */
    g.fillStyle="#3d6035"; g.fillRect(6656,512,1024,512);
    tex(6656,512,7680,1024, 280, "#47703e","#354d2c", 6,4);
    tex(6656,512,7680,1024, 80, "#5a5545","#48443a", 12,9);
    g.fillStyle="#8a8070"; g.fillRect(7100,630,240,210);
    tex(7100,630,7340,840, 50, "#787060","#9a9080", 8,6);
    dirt(7040,840,200,90); dirt(7000,910,180,90); dirt(6960,980,180,80);

    /* ── 7. Shopping district (5632..7872, 2560..4480) ──────────────── */
    g.fillStyle="#3f3a60"; g.fillRect(5632,2560,2240,1920);
    g.fillStyle="#cfc6e8";
    for(let x=5670;x<7840;x+=82) g.fillRect(x,2590,6,70);
    for(let i=0;i<7;i++) for(let j=0;j<2;j++){
      g.fillStyle=(i+j)%2?"#1b1430":"#ffe9c2";
      g.fillRect(5880+i*20,4200+j*20,20,20);
    }
    road(4588,HY1,1044,140);

    /* ── 8. Neighbourhood hub (2560..5120, 3584..6144) ──────────────── */
    g.fillStyle="#4c7a4f"; g.fillRect(2560,3584,2560,2560);
    tex(2560,3584,5120,6144, 500, "#56885a","#447047", 6,4);
    tex(2560,3584,5120,6144, 40, "#3a6340","#ff9ac1", 3,6);
    g.fillStyle="#55517a"; g.fillRect(4700,3700,260,200);
    g.strokeStyle="#cfc6e8"; g.lineWidth=4;
    g.strokeRect(4704,3704,252,192);
    g.strokeRect(4790,3704,80,70);
    g.beginPath(); g.arc(4830,3774,40,0,Math.PI); g.stroke();

    /* ── 9. Great Waterfront Lake (2560..7936, 6400..7936) — built ── */
    g.fillStyle="#d9c08c"; g.fillRect(2560,6400,5376,50);
    tex(2560,6400,7936,6450, 80, "#cdb27c","#e3cd9d", 6,4);
    g.fillStyle="#a86f3e"; g.fillRect(2560,6450,5376,40);
    g.fillStyle="#8a5730";
    for(let bx=2560;bx<7936;bx+=4) g.fillRect(bx,6450,3,40);
    g.fillStyle="#7a4e28"; g.fillRect(2560,6450,5376,4); g.fillRect(2560,6486,5376,4);
    g.fillStyle="#1f4a63"; g.fillRect(2560,6490,5376,1446);
    tex(2560,6490,7936,7936, 300, "#24567a","#183c5a", 12,6);

    /* ── 10. Dirt bike paths ─────────────────────────────────────────── */
    dirt(2304,2900,256,60);
    dirt(4490,2112,60,192);
    dirt(2560,2900,1860,50);
    dirt(1380,2900,924,50);
    dirt(1380,2900,50,200);
    dirt(1100,3060,340,50);
    dirt(700,3500,40,2060);
    dirt(500,5540,260,50);

    /* ── 11. Sidewalks ───────────────────────────────────────────────── */
    sidewalk(4420,3584,28,2816);
    sidewalk(4588,3584,28,2816);
    sidewalk(2560,HY1-28,2560,28); sidewalk(2560,HY1+140,2560,28);
    sidewalk(2560,HY2-28,2560,28); sidewalk(2560,HY2+140,2560,28);

    /* ── 12. Roads ───────────────────────────────────────────────────── */
    road(RX,2112,140,4288);
    road(2560,HY1,2560,140);
    road(2560,HY2,2560,140);

    /* ── 13. Cul-de-sac (centre 4518,5888) ──────────────────────────── */
    g.fillStyle="#46406b"; g.beginPath(); g.arc(4518,5888,150,0,7); g.fill();
    g.strokeStyle="#353055"; g.lineWidth=5; g.beginPath(); g.arc(4518,5888,148,0,7); g.stroke();
    g.fillStyle="#4c7a4f"; g.beginPath(); g.arc(4518,5888,44,0,7); g.fill();
    g.fillStyle="#ff9ac1"; g.fillRect(4506,5876,5,5); g.fillStyle="#ffd27a"; g.fillRect(4526,5890,5,5);

    /* ── 14. Road markings ───────────────────────────────────────────── */
    g.fillStyle="#8d80b8";
    for(let y=2116;y<6380;y+=64) g.fillRect(RX+66,y,8,28);
    for(let x=2584;x<5104;x+=64) g.fillRect(x,HY1+66,28,8);
    for(let x=2584;x<5104;x+=64) g.fillRect(x,HY2+66,28,8);
    for(let x=4612;x<5616;x+=64) g.fillRect(x,HY1+66,28,8);
    g.fillStyle="#cfc6e8";
    for(const iy of [HY1,HY2]) for(let i=0;i<6;i++) g.fillRect(RX+10+i*22,iy+40,12,60);
    for(const [mx,my] of [[3100,3100],[4518,4200],[4518,5000],[4518,5600]]){
      g.fillStyle="#2e294a"; g.beginPath(); g.arc(mx,my,11,0,7); g.fill();
      g.strokeStyle="#55517a"; g.lineWidth=3; g.beginPath(); g.arc(mx,my,7,0,7); g.stroke();
    }
  }
}
