// Ground drawing logic — called per-chunk by chunks.js.
// bakeGroundInto(g, wx0, wy0) draws the full world in world coordinates;
// the caller sets up clip + translate so only the chunk region is visible.
// wx0, wy0: chunk's world-space origin, used for chunk-local texture PRNG.

import { WORLD, GOAL, RX, HY1, HY2, CHUNK_W, DAY_SEED } from '../engine/constants.js';
import { mulberry32 } from '../engine/utils.js';

export function bakeGroundInto(g, wx0, wy0) {
  const W = WORLD.w, H = WORLD.h;
  const rnd = mulberry32(DAY_SEED ^ ((wx0 * 997 + wy0 * 1009) >>> 0));

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
  tex(wx0,wy0,wx0+CHUNK_W,wy0+CHUNK_W, 750, "#588a55","#446e42", 6,4);
  tex(wx0,wy0,wx0+CHUNK_W,wy0+CHUNK_W, 40, "#3a6340","#3a6340", 3,7);
  for(let i=0;i<20;i++){
    g.fillStyle=["#ff9ac1","#ffd27a","#cdb8ff"][(rnd()*3)|0];
    g.fillRect(wx0+(rnd()*CHUNK_W)|0, wy0+(rnd()*CHUNK_W)|0, 5,5);
  }

  /* ── 2. Construction site (512..2048, 512..1792) — reserved ────── */
  g.fillStyle="#7a6a50"; g.fillRect(512,512,1536,1280);
  tex(512,512,2048,1792, 400, "#6b5a3e","#8a7a58", 8,5);
  // Gravel patches
  tex(512,512,2048,1792, 100, "#9a8a6a","#5a4a2e", 12,8);

  /* ── 3. Whispering Woods (256..2304, 2048..5632) ───────────────── */
  g.fillStyle="rgba(18,42,26,.55)"; g.fillRect(256,2048,2048,3584);
  tex(256,2048,2304,5632, 600, "#26492e","#1d3b25", 7,5);
  // Treehouse village clearing (lighter grass inside woods)
  g.fillStyle="#4c7a4f"; g.fillRect(900,3060,500,440);
  tex(900,3060,1400,3500, 80, "#56885a","#447047", 6,4);

  /* ── 4. Park (2560..4608, 2304..3456) ───────────────────────────── */
  g.fillStyle="#4c7a4f"; g.fillRect(2560,2304,2048,1152);
  tex(2560,2304,4608,3456, 400, "#56885a","#447047", 6,4);
  tex(2560,2304,4608,3456, 30, "#3a6340","#ff9ac1", 3,6);
  // Pond (centre 3200,2750)
  g.fillStyle="#1f4a63"; g.beginPath(); g.ellipse(3200,2750,236,130,0,0,7); g.fill();
  g.fillStyle="#2e6f8e"; g.beginPath(); g.ellipse(3200,2750,218,112,0,0,7); g.fill();
  g.fillStyle="#3f86a8"; g.beginPath(); g.ellipse(3170,2728,134,62,0,0,7); g.fill();
  g.fillStyle="#2e7a4f";
  for(const [lx,ly] of [[3070,2790],[3260,2700],[3210,2810]]){
    g.beginPath(); g.ellipse(lx,ly,16,9,0,0,7); g.fill();
  }
  // Pond paths
  dirt(3190,2890,60,260); dirt(3220,2724,280,60);
  // Community garden (east park)
  g.fillStyle="#6b4a2f"; g.fillRect(4054,3132,280,270);
  for(let ry=3152;ry<3392;ry+=36){
    g.fillStyle="#5a3c24"; g.fillRect(4066,ry,256,12);
    g.fillStyle="#5fae5a";
    for(let px2=4078;px2<4302;px2+=24) g.fillRect(px2,ry+2,6,8);
  }
  // Park tables
  g.fillStyle="#8a7350"; g.fillRect(3900,3200,56,30); g.fillRect(4020,3300,56,30);

  /* ── 5. School district (4096..6336, 512..2112) ──────────────────── */
  g.fillStyle="#467a4d"; g.fillRect(4096,512,2240,1600);
  tex(4096,512,6336,2112, 400, "#4f8757","#3e6c45", 6,4);
  // Blacktop playground (SW of school south)
  g.fillStyle="#55517a"; g.fillRect(4320,1200,500,280);
  g.strokeStyle="#cfc6e8"; g.lineWidth=4;
  g.strokeRect(4400,1240,140,140);
  g.beginPath(); g.moveTo(4470,1240); g.lineTo(4470,1380);
  g.moveTo(4400,1310); g.lineTo(4540,1310); g.stroke();
  // Sandbox
  g.fillStyle="#d9c08c"; g.fillRect(5760,1170,240,110);
  tex(5760,1170,6000,1280, 54, "#cdb27c","#e3cd9d", 5,4);
  // Chalk goal ring
  g.strokeStyle="#ffe9c2"; g.lineWidth=5; g.setLineDash([14,10]);
  g.beginPath(); g.arc(GOAL.x,GOAL.y,GOAL.r,0,7); g.stroke(); g.setLineDash([]);
  // Chalk ball diamond
  g.setLineDash([10,8]); g.lineWidth=3;
  g.strokeRect(4340,620,120,120); g.setLineDash([]);

  /* ── 6. Athletic fields (6336..7360, 1024..2112) — reserved ─────── */
  g.fillStyle="#4c7a4f"; g.fillRect(6336,1024,1024,1088);
  tex(6336,1024,7360,2112, 200, "#56885a","#447047", 6,4);
  // Field lines
  g.strokeStyle="rgba(255,255,255,.25)"; g.lineWidth=3; g.setLineDash([]);
  g.strokeRect(6400,1060,900,960);
  g.beginPath(); g.moveTo(6400,1540); g.lineTo(7300,1540); g.stroke();

  /* ── 7. Shopping district (5632..7872, 2560..4480) ──────────────── */
  g.fillStyle="#3f3a60"; g.fillRect(5632,2560,2240,1920);
  g.fillStyle="#cfc6e8";
  for(let x=5670;x<7840;x+=82) g.fillRect(x,2590,6,70);
  for(let i=0;i<7;i++) for(let j=0;j<2;j++){
    g.fillStyle=(i+j)%2?"#1b1430":"#ffe9c2";
    g.fillRect(5880+i*20,4200+j*20,20,20);
  }
  // Shopping connector road (HY1 east extension into shopping)
  road(4588,HY1,1044,140);

  /* ── 8. Neighbourhood hub (2560..5120, 3584..6144) ──────────────── */
  g.fillStyle="#4c7a4f"; g.fillRect(2560,3584,2560,2560);
  tex(2560,3584,5120,6144, 500, "#56885a","#447047", 6,4);
  tex(2560,3584,5120,6144, 40, "#3a6340","#ff9ac1", 3,6);
  // Basketball half-court (east of main road)
  g.fillStyle="#55517a"; g.fillRect(4700,3700,260,200);
  g.strokeStyle="#cfc6e8"; g.lineWidth=4;
  g.strokeRect(4704,3704,252,192);
  g.strokeRect(4790,3704,80,70);
  g.beginPath(); g.arc(4830,3774,40,0,Math.PI); g.stroke();

  /* ── 9. Great Waterfront Lake (2560..7936, 6400..7936) — built ── */
  // Sand strip (y=6400..6450)
  g.fillStyle="#d9c08c"; g.fillRect(2560,6400,5376,50);
  tex(2560,6400,7936,6450, 80, "#cdb27c","#e3cd9d", 6,4);
  // Boardwalk planks (y=6450..6490)
  g.fillStyle="#a86f3e"; g.fillRect(2560,6450,5376,40);
  g.fillStyle="#8a5730";
  for(let bx=2560;bx<7936;bx+=4) g.fillRect(bx,6450,3,40);
  g.fillStyle="#7a4e28"; g.fillRect(2560,6450,5376,4); g.fillRect(2560,6486,5376,4);
  // Water (y=6490..7936)
  g.fillStyle="#1f4a63"; g.fillRect(2560,6490,5376,1446);
  tex(2560,6490,7936,7936, 300, "#24567a","#183c5a", 12,6);

  /* ── 10. Dirt bike paths ─────────────────────────────────────────── */
  // Woods east edge → park west edge
  dirt(2304,2900,256,60);
  // Park north → school south connector
  dirt(4490,2112,60,192);
  // Treehouse trail: main road (x=4420) west through park then woods to clearing
  dirt(2560,2900,1860,50);   // through park x=2560..4420, y=2900..2950
  // Inside woods: east entry continuing west to clearing
  dirt(1380,2900,924,50);
  dirt(1380,2900,50,200);    // south spur to clearing
  dirt(1100,3060,340,50);    // west connector into clearing
  // Hidden south trail (narrow, rewards exploration from south woods/meadow)
  dirt(700,3500,40,2060);    // y=3500..5560, x=700..740
  dirt(500,5540,260,50);     // east-west connector at south end

  /* ── 11. Sidewalks ───────────────────────────────────────────────── */
  sidewalk(4420,3584,28,2816);  // main road left side through neighbourhood + lake approach
  sidewalk(4588,3584,28,2816);  // main road right side
  sidewalk(2560,HY1-28,2560,28); sidewalk(2560,HY1+140,2560,28); // HY1 flanks
  sidewalk(2560,HY2-28,2560,28); sidewalk(2560,HY2+140,2560,28); // HY2 flanks

  /* ── 12. Roads ───────────────────────────────────────────────────── */
  road(RX,512,140,5888);               // main N-S road y=512..6400
  road(2560,HY1,2560,140);             // neighbourhood horizontal 1
  road(2560,HY2,2560,140);             // neighbourhood horizontal 2

  /* ── 13. Cul-de-sac (centre 4518,5888) ──────────────────────────── */
  g.fillStyle="#46406b"; g.beginPath(); g.arc(4518,5888,150,0,7); g.fill();
  g.strokeStyle="#353055"; g.lineWidth=5; g.beginPath(); g.arc(4518,5888,148,0,7); g.stroke();
  g.fillStyle="#4c7a4f"; g.beginPath(); g.arc(4518,5888,44,0,7); g.fill();
  g.fillStyle="#ff9ac1"; g.fillRect(4506,5876,5,5); g.fillStyle="#ffd27a"; g.fillRect(4526,5890,5,5);

  /* ── 14. Road markings ───────────────────────────────────────────── */
  g.fillStyle="#8d80b8";
  for(let y=532;y<6380;y+=64) g.fillRect(RX+66,y,8,28);            // main road dashes
  for(let x=2584;x<5104;x+=64) g.fillRect(x,HY1+66,28,8);          // HY1 dashes
  for(let x=2584;x<5104;x+=64) g.fillRect(x,HY2+66,28,8);          // HY2 dashes
  for(let x=4612;x<5616;x+=64) g.fillRect(x,HY1+66,28,8);          // connector dashes
  // Crosswalks
  g.fillStyle="#cfc6e8";
  for(const iy of [HY1,HY2]) for(let i=0;i<6;i++) g.fillRect(RX+10+i*22,iy+40,12,60);
  // Manholes
  for(const [mx,my] of [[3100,3100],[4518,4200],[4518,5000],[4518,5600]]){
    g.fillStyle="#2e294a"; g.beginPath(); g.arc(mx,my,11,0,7); g.fill();
    g.strokeStyle="#55517a"; g.lineWidth=3; g.beginPath(); g.arc(mx,my,7,0,7); g.stroke();
  }
}
