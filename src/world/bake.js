import { WORLD, GOAL, RX, HY1, HY2, DAY_SEED } from '../engine/constants.js';
import { mulberry32, bakeCanvas } from '../engine/utils.js';

export let ground = null;

export function bakeGround(){
  const [c, g] = bakeCanvas(WORLD.w, WORLD.h);
  const rnd = mulberry32(DAY_SEED);
  /* wild meadow base */
  g.fillStyle = "#4e7d4a"; g.fillRect(0,0,WORLD.w,WORLD.h);
  for(let i=0;i<9000;i++){ g.fillStyle = rnd()<.5 ? "#588a55" : "#446e42"; g.fillRect((rnd()*WORLD.w)|0, (rnd()*WORLD.h)|0, 6, 4); }
  for(let i=0;i<700;i++){
    const fx = rnd()*WORLD.w, fy = rnd()*WORLD.h;
    if(rnd()<.75){ g.fillStyle = "#3a6340"; g.fillRect(fx, fy, 3, 7); }
    else { g.fillStyle = ["#ff9ac1","#ffd27a","#cdb8ff"][(rnd()*3)|0]; g.fillRect(fx, fy, 5, 5); }
  }
  /* forest floors */
  function floor(x,y,w,h){
    g.fillStyle = "rgba(18,42,26,.5)"; g.fillRect(x,y,w,h);
    for(let i=0;i<(w*h)/2600;i++){ g.fillStyle = rnd()<.5 ? "#26492e" : "#1d3b25"; g.fillRect(x+rnd()*w, y+rnd()*h, 7, 5); }
  }
  floor(26, 950, 620, 2010); floor(660, 760, 2580, 180); floor(3240, 950, 180, 2010);
  /* neighborhood lawn */
  g.fillStyle = "#4c7a4f"; g.fillRect(660, 940, 2580, 2034);
  for(let i=0;i<5200;i++){ g.fillStyle = rnd()<.5 ? "#56885a" : "#447047"; g.fillRect(660+(rnd()*2580)|0, 940+(rnd()*2034)|0, 6, 4); }
  for(let i=0;i<240;i++){
    const fx = 660+rnd()*2580, fy = 940+rnd()*2034;
    if(rnd()<.6){ g.fillStyle = "#3a6340"; g.fillRect(fx, fy, 3, 6); }
    else { g.fillStyle = rnd()<.5 ? "#ff9ac1" : "#ffd27a"; g.fillRect(fx, fy, 5, 5); }
  }
  /* school grounds */
  g.fillStyle = "#467a4d"; g.fillRect(1240, 80, 1620, 640);
  for(let i=0;i<900;i++){ g.fillStyle = rnd()<.5 ? "#4f8757" : "#3e6c45"; g.fillRect(1240+rnd()*1620, 80+rnd()*640, 6, 4); }
  g.fillStyle = "#55517a"; g.fillRect(1480, 480, 420, 190);           // blacktop
  g.strokeStyle = "#cfc6e8"; g.lineWidth = 4;
  g.strokeRect(1560, 510, 140, 140);
  g.beginPath(); g.moveTo(1630,510); g.lineTo(1630,650); g.moveTo(1560,580); g.lineTo(1700,580); g.stroke();
  g.fillStyle = "#d9c08c"; g.fillRect(2400, 590, 240, 110);           // sandbox
  for(let i=0;i<54;i++){ g.fillStyle = rnd()<.5 ? "#cdb27c" : "#e3cd9d"; g.fillRect(2400+rnd()*234, 590+rnd()*104, 5, 4); }
  g.strokeStyle = "#ffe9c2"; g.lineWidth = 5; g.setLineDash([14,10]); // chalk goal ring
  g.beginPath(); g.arc(GOAL.x, GOAL.y, GOAL.r, 0, 7); g.stroke(); g.setLineDash([]);
  g.setLineDash([10,8]); g.lineWidth = 3;                             // chalk ball diamond
  g.strokeRect(1330, 280, 120, 120); g.setLineDash([]);
  /* roads with curbs */
  function road(x,y,w,h){
    g.fillStyle = "#46406b"; g.fillRect(x,y,w,h);
    for(let i=0;i<(w*h)/1400;i++){ g.fillStyle = rnd()<.5 ? "#4d4775" : "#403a62"; g.fillRect(x+rnd()*w, y+rnd()*h, 5, 5); }
    g.fillStyle = "#353055";
    if(w >= h){ g.fillRect(x,y,w,5); g.fillRect(x,y+h-5,w,5); }
    else      { g.fillRect(x,y,5,h); g.fillRect(x+w-5,y,5,h); }
  }
  function sidewalk(x,y,w,h){
    g.fillStyle = "#6a5c91"; g.fillRect(x,y,w,h);
    g.fillStyle = "#5d5083";
    if(w >= h) for(let sx=x; sx<x+w; sx+=46) g.fillRect(sx,y,3,h);
    else       for(let sy=y; sy<y+h; sy+=46) g.fillRect(x,sy,w,3);
  }
  sidewalk(660, 1422, 2580, 28); sidewalk(660, 1590, 2580, 28);
  sidewalk(660, 2092, 2580, 28); sidewalk(660, 2260, 2580, 28);
  sidewalk(1852, 940, 28, 1540); sidewalk(2020, 940, 28, 1540);
  road(RX, 940, 140, 1540);
  road(660, HY1, 3300, 140);
  road(660, HY2, 2580, 140);
  road(3680, 1590, 140, 850);
  /* cul-de-sac */
  g.fillStyle = "#46406b"; g.beginPath(); g.arc(1950, 2520, 150, 0, 7); g.fill();
  g.strokeStyle = "#353055"; g.lineWidth = 5; g.beginPath(); g.arc(1950, 2520, 148, 0, 7); g.stroke();
  g.fillStyle = "#4c7a4f"; g.beginPath(); g.arc(1950, 2520, 44, 0, 7); g.fill();
  g.fillStyle = "#ff9ac1"; g.fillRect(1938, 2508, 5, 5); g.fillStyle = "#ffd27a"; g.fillRect(1958, 2522, 5, 5);
  /* dashes, crosswalks, manholes */
  g.fillStyle = "#8d80b8";
  for(let y=960; y<2400; y+=64) g.fillRect(RX+66, y, 8, 28);
  for(let x=700; x<3940; x+=64) g.fillRect(x, HY1+66, 28, 8);
  for(let x=700; x<3200; x+=64) g.fillRect(x, HY2+66, 28, 8);
  for(let y=1620; y<2400; y+=64) g.fillRect(3746, y, 8, 28);
  g.fillStyle = "#cfc6e8";
  for(const iy of [HY1, HY2]) for(let i=0;i<6;i++) g.fillRect(RX+10+i*22, iy+40, 12, 60);
  for(const [mx,my] of [[1500,1520],[2700,2190],[1950,1100],[3520,1520]]){
    g.fillStyle = "#2e294a"; g.beginPath(); g.arc(mx,my,11,0,7); g.fill();
    g.strokeStyle = "#55517a"; g.lineWidth = 3; g.beginPath(); g.arc(mx,my,7,0,7); g.stroke();
  }
  /* park: paths, pond, lily pads */
  function dirt(x,y,w,h){
    g.fillStyle = "#8a7350"; g.fillRect(x,y,w,h);
    g.fillStyle = "#79643f";
    for(let i=0;i<(w*h)/450;i++) g.fillRect(x+rnd()*w, y+rnd()*h, 5, 4);
    g.fillStyle = "#6b5838"; g.fillRect(x,y,w,4); g.fillRect(x,y+h-4,w,4);
  }
  dirt(1240, 1170, 560, 60); dirt(1530, 1230, 60, 192);
  dirt(300, 1480, 370, 90);
  g.fillStyle = "#1f4a63"; g.beginPath(); g.ellipse(1050, 1200, 206, 126, 0, 0, 7); g.fill();
  g.fillStyle = "#2e6f8e"; g.beginPath(); g.ellipse(1050, 1200, 188, 108, 0, 0, 7); g.fill();
  g.fillStyle = "#3f86a8"; g.beginPath(); g.ellipse(1016, 1176, 116, 58, 0, 0, 7); g.fill();
  g.fillStyle = "#2e7a4f";
  for(const [lx,ly] of [[940,1240],[1130,1150],[1080,1260]]){ g.beginPath(); g.ellipse(lx,ly,16,9,0,0,7); g.fill(); }
  g.fillStyle = "#d9c08c"; g.fillRect(900, 1316, 60, 8); g.fillRect(1180, 1086, 50, 8);
  /* community garden */
  g.fillStyle = "#6b4a2f"; g.fillRect(1420, 2340, 300, 300);
  for(let ry=2360; ry<2630; ry+=36){
    g.fillStyle = "#5a3c24"; g.fillRect(1432, ry, 276, 12);
    g.fillStyle = "#5fae5a";
    for(let px2=1444; px2<1700; px2+=24) g.fillRect(px2, ry+2, 6, 8);
  }
  /* basketball half court */
  g.fillStyle = "#55517a"; g.fillRect(2160, 2330, 260, 200);
  g.strokeStyle = "#cfc6e8"; g.lineWidth = 4;
  g.strokeRect(2164, 2334, 252, 192);
  g.strokeRect(2250, 2334, 80, 70);
  g.beginPath(); g.arc(2290, 2404, 40, 0, Math.PI); g.stroke();
  /* market plaza */
  g.fillStyle = "#3f3a60"; g.fillRect(3480, 1640, 460, 280);
  g.fillStyle = "#cfc6e8";
  for(let x=3520; x<3920; x+=82) g.fillRect(x, 1660, 6, 70);
  for(let i=0;i<7;i++) for(let j=0;j<2;j++){
    g.fillStyle = (i+j)%2 ? "#1b1430" : "#ffe9c2";
    g.fillRect(3680+i*20, 2000+j*20, 20, 20);
  }
  ground = c;
}
