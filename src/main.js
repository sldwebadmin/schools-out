(() => {
"use strict";
/* ================= constants ================= */
const VW = 960, VH = 540, PX = 3;
const WORLD = { w: 4000, h: 3000 };
/* regions:
   - NORTH (y<940):  Maple Elementary district, beyond the greenbelt tree line
   - WEST  (x<660):  Whispering Woods
   - EAST  (x>3240): Maple Mart shopping district, beyond its own tree line
   - CENTER:         the neighborhood — your street dead-ends at your house, bottom center */
const RX = 1880;                                  // your street (vertical road), width 140
const HY1 = 1450, HY2 = 2120;                     // neighborhood cross streets, height 140
const GOAL  = { x:2520, y:650, r:70 };            // playground flag at the school
const SPAWN = { x:1950, y:2592 };                 // your front walk, bottom of the street
const NAPS  = [ {x:2450,y:1950}, {x:1250,y:1390}, {x:2300,y:1604} ];

const cv = document.getElementById("game");
const ctx = cv.getContext("2d");
ctx.imageSmoothingEnabled = false;

function fit(){
  const s = Math.min(innerWidth / VW, innerHeight / VH);
  cv.style.width  = Math.floor(VW * s) + "px";
  cv.style.height = Math.floor(VH * s) + "px";
}
addEventListener("resize", fit); fit();

/* ================= audio ================= */
let AC = null;
function audio(){ if(!AC){ try{ AC = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(AC && AC.state === "suspended") AC.resume(); }
function tone(f, d, type="square", v=.08, slide=0){
  if(!AC) return;
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f+slide), t+d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t+d);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t+d);
}
let master = null, musicTimer = null, noteT = 0, stepI = 0, musicOn = true;
const BASS = [110, 110, 98, 98, 87.31, 87.31, 98, 98];
const ARP  = [440, 523.25, 659.25, 523.25, 392, 493.88, 587.33, 493.88,
              349.23, 440, 523.25, 440, 392, 493.88, 587.33, 493.88];
function note(f, t, d, type, v){
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t+d);
  o.connect(g).connect(master); o.start(t); o.stop(t+d);
}
function schedule(){
  if(!AC || !master) return;
  while(noteT < AC.currentTime + .3){
    const st = stepI;
    if(st % 2 === 0) note(BASS[(st/2) % 8], noteT, .42, "triangle", .045);
    note(ARP[st % 16], noteT, .2, "square", .02);
    if(st % 16 === 0) note(220, noteT, 2.2, "sine", .028);
    if(st % 16 === 8) note(261.63, noteT, 1.6, "sine", .02);
    noteT += .22; stepI++;
  }
}
function cicadas(){
  const len = 2 * AC.sampleRate, buf = AC.createBuffer(1, len, AC.sampleRate);
  const d = buf.getChannelData(0);
  for(let i = 0; i < len; i++) d[i] = Math.random()*2 - 1;
  const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = AC.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 4300; bp.Q.value = 9;
  const g = AC.createGain(); g.gain.value = .011;
  const lfo = AC.createOscillator(); lfo.frequency.value = 12;
  const lg = AC.createGain(); lg.gain.value = .007;
  lfo.connect(lg); lg.connect(g.gain);
  src.connect(bp); bp.connect(g); g.connect(master);
  src.start(); lfo.start();
}
function iceCreamTruck(){
  if(!AC || !master) return;
  const m = [659.25, 659.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25];
  m.forEach((f, i) => note(f, AC.currentTime + .24*i, .22, "square", .012));
}
function startMusic(){
  if(!AC || musicTimer) return;
  master = AC.createGain(); master.gain.value = musicOn ? .55 : 0; master.connect(AC.destination);
  cicadas();
  noteT = AC.currentTime + .1; stepI = 0;
  musicTimer = setInterval(schedule, 90);
}
function toggleMusic(){ musicOn = !musicOn; if(master) master.gain.value = musicOn ? .55 : 0; }
const sfx = {
  hop:    () => tone(320,.16,"square",.07,300),
  pickup: () => { tone(740,.08,"square",.07); setTimeout(()=>tone(1100,.1,"square",.07),70); },
  bike:   () => { tone(420,.1,"sawtooth",.08); setTimeout(()=>tone(640,.1,"sawtooth",.08),80); setTimeout(()=>tone(900,.16,"sawtooth",.08),160); },
  bark:   () => { tone(180,.07,"sawtooth",.1,60); setTimeout(()=>tone(160,.08,"sawtooth",.1,40),110); },
  alert:  () => tone(520,.2,"square",.1,180),
  caught: () => tone(160,.7,"sawtooth",.12,-120),
  win:    () => { [523.25,659.25,783.99,1046.5].forEach((f,i)=>setTimeout(()=>tone(f,.22,"square",.08),i*140)); },
};

/* ================= helpers ================= */
const R  = (a,b) => a + Math.random()*(b-a);
const RI = (a,b) => Math.floor(R(a, b+1));
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const _today = new Date();
const DAY_SEED = _today.getFullYear()*10000 + (_today.getMonth()+1)*100 + _today.getDate();
const DAY_NUM  = Math.floor((_today - new Date(_today.getFullYear(),0,0)) / 864e5);
document.getElementById("daylabel").textContent = "Summer Day " + DAY_NUM + " · Maple Court";
function snap(v){ return Math.round(v / PX) * PX; }
let cam = { x:0, y:0 };
function rectW(c, x, y, w, h){
  ctx.fillStyle = c;
  ctx.fillRect(snap(x - cam.x), snap(y - cam.y), Math.max(PX, snap(w)), Math.max(PX, snap(h)));
}
function inView(x, y, w, h, m=140){
  return x + w > cam.x - m && x < cam.x + VW + m && y + h > cam.y - m && y < cam.y + VH + m;
}
function bakeCanvas(w, h){
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
  return [c, g];
}

/* ================= map construction helpers ================= */
let walls = [], canopies = [], lamps = [], flies = [];
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

/* ================= the overworld ================= */
function buildMap(){
  walls = []; canopies = []; lamps = [];
  // world border hedge
  addWall(0,0,WORLD.w,26,"hedge"); addWall(0,WORLD.h-26,WORLD.w,26,"hedge");
  addWall(0,0,26,WORLD.h,"hedge"); addWall(WORLD.w-26,0,26,WORLD.h,"hedge");

  /* ---- NORTH DISTRICT: Maple Elementary (its own region past the greenbelt) ---- */
  fence(1280, 100, 1580, true, []);
  fence(1280, 690, 1580, true, [[600, 150]]);                 // south gate, aligned with your street
  fence(1280, 100, 590, false, [[260, 90]]);                  // west gate
  fence(2850, 100, 590, false, []);
  addWall(1480, 140, 760, 300, "school");
  addWall(2520, 560, 8, 8, "flag", {ghost:true});
  addWall(2400, 520, 8, 8, "swing", {ghost:true});
  addWall(2660, 540, 8, 8, "slide", {ghost:true});
  addWall(2080, 640, 46, 12, "rack", {hop:true});
  addWall(1830, 705, 12, 14, "sign", {ghost:true, txt:"MAPLE ELEMENTARY", txt2:"playground out back"});
  addTree(1340, 560, 50);
  // meadow trees flanking the district
  addTree(760, 300, 60); addTree(960, 540, 52); addTree(520, 170, 56);
  addTree(2980, 280, 60); addTree(3140, 520, 52); addTree(3380, 200, 58); addTree(3700, 420, 62);
  addTree(3640, 760, 54); addTree(3880, 980, 56);

  /* ---- GREENBELT: tree line between the school district and the neighborhood ---- */
  addWall(660, 800, 1220, 110, "hedge");                      // gap 1880–2020 = your street
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
    if(tx > 290 && ty > 1440 && ty < 1620) continue;          // dirt path corridor
    if(tx > 150 && tx < 430 && ty > 1260 && ty < 1610) continue; // clearing
    addTree(tx, ty, 46 + sf()*24);
  }
  addWall(566, 1500, 12, 14, "sign", {ghost:true, txt:"WHISPERING WOODS", txt2:"trails coming soon"});

  /* ---- EAST TREE LINE + MAPLE MART DISTRICT ---- */
  addWall(3280, 950, 110, 500, "hedge");                      // gap at HY1 = road to the Mart
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
  // park (NW block)
  addWall(860, 1090, 380, 220, "pond", {noshadow:true});
  addWall(1380, 1100, 56, 30, "table", {hop:true});
  addWall(1500, 1250, 56, 30, "table", {hop:true});
  addWall(1786, 1190, 12, 14, "sign", {ghost:true, txt:"MAPLE PARK", txt2:""});
  addTree(740, 1000, 54); addTree(1640, 1020, 58);
  // NE residential
  yard(2080, 980, 500, 440, "#6b4a76", {tree:true, mailbox:true});
  yard(2640, 980, 500, 440, "#5c6f9e", {mailbox:true});
  // west residential (two blocks)
  yard(760, 1640, 490, 430, "#7a5560", {tree:true, mailbox:true});
  yard(1310, 1640, 490, 430, "#4f6b5e", {mailbox:true});
  yard(820, 2300, 520, 430, "#56406f", {tree:true, mailbox:true});
  // community garden (SW)
  addWall(1560, 2400, 10, 10, "scare", {ghost:true});
  addWall(1430, 2330, 12, 14, "sign", {ghost:true, txt:"COMMUNITY GARDEN", txt2:""});
  // Biscuit's house (east of your street, on your way out)
  fence(2080, 1640, 740, true, [[300, 100]]);
  fence(2080, 2060, 740, true, []);
  fence(2080, 1640, 430, false, [[190, 76]]);
  fence(2810, 1640, 430, false, [[190, 76]]);
  addWall(2330, 1700, 260, 180, "house", {hue:"#8a6f3e", trim:"#ffe9c2"});
  addWall(2500, 1930, 60, 50, "doghouse", {ghost:true});
  addWall(2400, 1648, 12, 14, "sign", {ghost:true, txt:"BEWARE OF DOG", txt2:"(his name is Biscuit)"});
  addTree(2920, 1700, 56); addTree(3060, 1920, 52);
  // SE residential + basketball court props
  yard(2480, 2300, 520, 430, "#7a5560", {mailbox:true});
  addWall(2290, 2336, 8, 8, "hoop", {ghost:true});
  addTree(3080, 2400, 56);
  /* YOUR HOUSE — bottom center, where the street dead-ends */
  yard(1640, 2560, 640, 380, "#2e8f8a", {player:true, trim:"#ffc44d", mailbox:true, frontGapAt:265, tree:true});

  /* streetlamps */
  const LP = [[1860,1150],[2040,1900],[1860,2330],[2090,2520],
              [1100,1430],[1700,1610],[2600,1430],[3100,1610],[3700,1430],
              [1000,2100],[1700,2280],[2600,2100],[3100,2280],
              [1850,880],[2050,880]];
  for(const [lx,ly] of LP) lamps.push({x:lx, y:ly});
}

/* ================= baked ground ================= */
let ground = null, mini = null, MSC = 0;
function bakeGround(){
  const [c, g] = bakeCanvas(WORLD.w, WORLD.h);
  const rnd = mulberry32(DAY_SEED);
  /* wild meadow base across the whole overworld */
  g.fillStyle = "#4e7d4a"; g.fillRect(0,0,WORLD.w,WORLD.h);
  for(let i=0;i<9000;i++){ g.fillStyle = rnd()<.5 ? "#588a55" : "#446e42"; g.fillRect((rnd()*WORLD.w)|0, (rnd()*WORLD.h)|0, 6, 4); }
  for(let i=0;i<700;i++){
    const fx = rnd()*WORLD.w, fy = rnd()*WORLD.h;
    if(rnd()<.75){ g.fillStyle = "#3a6340"; g.fillRect(fx, fy, 3, 7); }
    else { g.fillStyle = ["#ff9ac1","#ffd27a","#cdb8ff"][(rnd()*3)|0]; g.fillRect(fx, fy, 5, 5); }
  }
  /* forest floors: west woods, greenbelt, east tree line */
  function floor(x,y,w,h){
    g.fillStyle = "rgba(18,42,26,.5)"; g.fillRect(x,y,w,h);
    for(let i=0;i<(w*h)/2600;i++){ g.fillStyle = rnd()<.5 ? "#26492e" : "#1d3b25"; g.fillRect(x+rnd()*w, y+rnd()*h, 7, 5); }
  }
  floor(26, 950, 620, 2010); floor(660, 760, 2580, 180); floor(3240, 950, 180, 2010);
  /* neighborhood lawn (tidier green) */
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
  g.fillStyle = "#55517a"; g.fillRect(1480, 480, 420, 190);            // blacktop
  g.strokeStyle = "#cfc6e8"; g.lineWidth = 4;
  g.strokeRect(1560, 510, 140, 140);
  g.beginPath(); g.moveTo(1630,510); g.lineTo(1630,650); g.moveTo(1560,580); g.lineTo(1700,580); g.stroke();
  g.fillStyle = "#d9c08c"; g.fillRect(2400, 590, 240, 110);            // sandbox
  for(let i=0;i<54;i++){ g.fillStyle = rnd()<.5 ? "#cdb27c" : "#e3cd9d"; g.fillRect(2400+rnd()*234, 590+rnd()*104, 5, 4); }
  g.strokeStyle = "#ffe9c2"; g.lineWidth = 5; g.setLineDash([14,10]);  // chalk goal ring
  g.beginPath(); g.arc(GOAL.x, GOAL.y, GOAL.r, 0, 7); g.stroke(); g.setLineDash([]);
  g.setLineDash([10,8]); g.lineWidth = 3;                              // chalk ball diamond
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
  sidewalk(660, 1422, 2580, 28); sidewalk(660, 1590, 2580, 28);        // HY1 walks (in town)
  sidewalk(660, 2092, 2580, 28); sidewalk(660, 2260, 2580, 28);        // HY2 walks
  sidewalk(1852, 940, 28, 1540); sidewalk(2020, 940, 28, 1540);        // your street walks
  road(RX, 940, 140, 1540);                                            // your street
  road(660, HY1, 3300, 140);                                           // east road runs to the Mart
  road(660, HY2, 2580, 140);
  road(3680, 1590, 140, 850);                                          // Mart-district street (future race blocks)
  /* cul-de-sac where your street ends */
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
  dirt(300, 1480, 370, 90);                                            // path into the woods
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
  /* market plaza: parking + race start */
  g.fillStyle = "#3f3a60"; g.fillRect(3480, 1640, 460, 280);
  g.fillStyle = "#cfc6e8";
  for(let x=3520; x<3920; x+=82) g.fillRect(x, 1660, 6, 70);
  for(let i=0;i<7;i++) for(let j=0;j<2;j++){
    g.fillStyle = (i+j)%2 ? "#1b1430" : "#ffe9c2";
    g.fillRect(3680+i*20, 2000+j*20, 20, 20);
  }
  ground = c;
}
function bakeMini(){
  MSC = 150 / WORLD.w;
  const mh = Math.round(WORLD.h * MSC);
  const [c, g] = bakeCanvas(150, mh);
  g.fillStyle = "#2c5232"; g.fillRect(0,0,150,mh);                     // meadow
  const B = (x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x*MSC, y*MSC, Math.max(1,w*MSC), Math.max(1,h*MSC)); };
  B(26,950,620,2010,"#15331c");          // woods
  B(660,760,2580,180,"#15331c");         // greenbelt
  B(3240,950,180,2010,"#15331c");        // east tree line
  B(1240,80,1620,640,"#7a4a3e");         // school district
  B(660,940,2580,2034,"#3f5d44");        // neighborhood
  B(860,1090,380,220,"#2e6f8e");         // pond
  B(3420,1100,560,1340,"#5d4a7a");       // market district
  B(RX,940,140,1540,"#2a2345");          // roads
  B(660,HY1,3300,140,"#2a2345");
  B(660,HY2,2580,140,"#2a2345");
  B(3680,1590,140,850,"#2a2345");
  mini = c;
}

/* ================= collision ================= */
function blocked(x, y, r, ignoreHop){
  for(const w of walls){
    if(w.ghost) continue;
    if(ignoreHop && w.hop) continue;
    const nx = clamp(x, w.x, w.x+w.w), ny = clamp(y, w.y, w.y+w.h);
    if((x-nx)*(x-nx) + (y-ny)*(y-ny) < r*r) return w;
  }
  return null;
}
function hitCR(a, w){
  const nx = clamp(a.x, w.x, w.x+w.w), ny = clamp(a.y, w.y, w.y+w.h);
  return (a.x-nx)*(a.x-nx) + (a.y-ny)*(a.y-ny) < a.r*a.r;
}
function moveActor(a, dx, dy, ignoreHop){
  a.x = clamp(a.x + dx, 34, WORLD.w-34);
  for(const w of walls){
    if(w.ghost || (ignoreHop && w.hop)) continue;
    if(hitCR(a, w)){ a.x = dx > 0 ? w.x - a.r : w.x + w.w + a.r; }
  }
  a.y = clamp(a.y + dy, 34, WORLD.h-34);
  for(const w of walls){
    if(w.ghost || (ignoreHop && w.hop)) continue;
    if(hitCR(a, w)){ a.y = dy > 0 ? w.y - a.r : w.y + w.h + a.r; }
  }
}

/* ================= state, NPCs, mission ================= */
let state = "title", frame = 0, time = 0, pops = 0, best = 0, missionT = 0;
const player = { x:SPAWN.x, y:SPAWN.y, r:12, vx:0, vy:0, face:1, anim:0, hop:0, hopCd:0, stam:100, boost:0 };
const dog = { x:0, y:0, r:12, face:1, anim:0, hop:0, crouch:0, stuck:0, mode:"sleep", alert:0, spotted:false };
let pickups = [], parts = [], npcs = [];
const POP_SPOTS = [
  [1950,1300],[1950,1755],[1950,2350],[1700,1520],[2500,1520],[3000,1520],[3640,1520],
  [1300,2190],[2250,2190],[2900,2190],[1420,1190],[700,1520],[1620,560],[2300,650],
  [3700,1700],[2300,2440],[1560,2500],[3750,2300]
];
const BIKE_SPOTS = [[1830,1620],[3560,1700]];
function makeNPCs(){
  npcs = [
    { kind:"walk", wps:[[730,1615],[1825,1615],[1825,2095],[730,2095]], spd:1.0, shirt:"#7fb069", hair:"#2b2118" },
    { kind:"walk", wps:[[2050,955],[3165,955],[3165,1445],[2050,1445]], spd:.9, shirt:"#b07f9e", hair:"#4a3322" },
    { kind:"walk", wps:[[3470,1630],[3920,1630],[3920,1860],[3470,1860]], spd:.8, shirt:"#6f8eb0", hair:"#1b1430" },
    { kind:"bike", wps:[[700,1520],[3900,1520]], pp:true, spd:2.6, shirt:"#ff8f57", hair:"#2b2118" },
    { kind:"bike", wps:[[1950,1000],[1950,2430]], pp:true, spd:2.3, shirt:"#57b8ff", hair:"#4a3322" },
    { kind:"kid", wps:[[1380,1170]], spd:0, shirt:"#ffd27a", hair:"#1b1430", lines:["Biscuit got loose again!","We're hitting the playground later!"] },
    { kind:"kid", wps:[[1560,1320]], spd:0, shirt:"#9ad17f", hair:"#4a3322", lines:["E-bike race Saturday by the Mart!","The pond is FULL of frogs."] },
    { kind:"kid", wps:[[2350,640]], spd:0, shirt:"#ff9ac1", hair:"#2b2118", lines:["You crossed the whole neighborhood?!","Tag — you're it!","Swings are the best."] },
    { kind:"kid", wps:[[2280,2400]], spd:0, shirt:"#a78bdb", hair:"#1b1430", lines:["First to 11 wins.","Hoops, then popsicles?"] },
    { kind:"kid", wps:[[3620,1660]], spd:0, shirt:"#7fd8cf", hair:"#4a3322", lines:["Mom's grabbing popsicles!","Maple Mart has the good freezer."] },
  ];
  for(const n of npcs){ n.x = n.wps[0][0]; n.y = n.wps[0][1]; n.i = n.wps.length > 1 ? 1 : 0; n.anim = R(0,6); n.face = 1; }
}
function resetRun(){
  Object.assign(player, { x:SPAWN.x, y:SPAWN.y, vx:0, vy:0, hop:0, hopCd:0, stam:100, boost:0, face:1 });
  const nap = NAPS[DAY_SEED % NAPS.length];
  Object.assign(dog, { x:nap.x, y:nap.y, hop:0, crouch:0, stuck:0, mode:"sleep", alert:0, spotted:false, anim:0 });
  pickups = []; parts = [];
  for(const [px2,py2] of POP_SPOTS) if(!blocked(px2,py2,16,false)) pickups.push({t:"pop", x:px2, y:py2, p:R(0,6)});
  for(const [bx,by] of BIKE_SPOTS) if(!blocked(bx,by,16,false)) pickups.push({t:"bike", x:bx, y:by, p:0});
  makeNPCs();
  flies = [];
  for(let i=0;i<70;i++) flies.push({x:R(0,WORLD.w), y:R(0,WORLD.h), p:R(0,6)});
  time = 0; pops = 0;
}
function show(id,on){ document.getElementById(id).classList.toggle("hidden", !on); }
function start(){
  audio(); startMusic();
  if(state === "run") return;
  resetRun();
  state = "run"; missionT = 280;
  show("title",false); show("gameover",false); show("win",false); show("hud",true);
}
function endRun(won){
  state = won ? "win" : "over";
  if(won) sfx.win(); else sfx.caught();
  const score = won
    ? Math.max(0, 800 - Math.floor(time)*4) + pops*10 + (dog.spotted ? 0 : 200)
    : Math.floor(time) + pops*5;
  best = Math.max(best, score);
  const tail = Math.floor(time) + "s · \u{1F366} " + pops + (won && !dog.spotted ? " · NEVER WOKE HIM +200" : "");
  if(won){
    document.getElementById("winscore").textContent = score + " PTS";
    document.getElementById("winstat").textContent = "BEST " + best + " · " + tail;
  } else {
    document.getElementById("finalscore").textContent = score + " PTS";
    document.getElementById("beststat").textContent = "BEST " + best + " · " + tail;
  }
  show("hud",false); show(won ? "win" : "gameover", true);
}

/* ================= input ================= */
const keys = {};
let sprintHeld = false;
addEventListener("keydown", e => {
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
  if(e.repeat) return;
  keys[e.code] = true;
  if(e.code === "Space"){ state === "run" ? tryHop() : start(); }
  if(e.code === "KeyM") toggleMusic();
});
addEventListener("keyup", e => keys[e.code] = false);
function tryHop(){
  if(player.hopCd > 0 || player.hop > 0) return;
  player.hop = 18; player.hopCd = 42; sfx.hop();
}
let joy = null;
cv.addEventListener("pointerdown", e => {
  if(state !== "run"){ start(); return; }
  joy = { id:e.pointerId, ox:e.clientX, oy:e.clientY, dx:0, dy:0 };
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener("pointermove", e => {
  if(joy && e.pointerId === joy.id){
    joy.dx = e.clientX - joy.ox; joy.dy = e.clientY - joy.oy;
    const m = Math.hypot(joy.dx, joy.dy);
    if(m > 46){ joy.dx *= 46/m; joy.dy *= 46/m; }
  }
});
const endJoy = e => { if(joy && e.pointerId === joy.id) joy = null; };
cv.addEventListener("pointerup", endJoy); cv.addEventListener("pointercancel", endJoy);
document.getElementById("btnHop").addEventListener("pointerdown", e => { e.preventDefault(); state==="run" ? tryHop() : start(); });
const bS = document.getElementById("btnSprint");
bS.addEventListener("pointerdown", e => { e.preventDefault(); sprintHeld = true; bS.classList.add("on"); });
const sOff = () => { sprintHeld = false; bS.classList.remove("on"); };
bS.addEventListener("pointerup", sOff); bS.addEventListener("pointercancel", sOff); bS.addEventListener("pointerleave", sOff);

/* ================= update ================= */
function update(){
  frame++;
  if(state !== "run") return;
  time += 1/60;
  if(missionT > 0){ missionT--; document.getElementById("mission").style.opacity = missionT > 60 ? 1 : missionT/60; }

  /* player */
  let mx = (keys.KeyD||keys.ArrowRight?1:0) - (keys.KeyA||keys.ArrowLeft?1:0);
  let my = (keys.KeyS||keys.ArrowDown?1:0)  - (keys.KeyW||keys.ArrowUp?1:0);
  if(joy && (Math.abs(joy.dx) > 7 || Math.abs(joy.dy) > 7)){ mx = joy.dx/46; my = joy.dy/46; }
  const ml = Math.hypot(mx, my);
  if(ml > 1){ mx/=ml; my/=ml; }
  const sprinting = (keys.ShiftLeft||keys.ShiftRight||sprintHeld) && player.stam > 0 && ml > 0;
  let spd = 3.0;
  if(sprinting){ spd = 4.15; player.stam = Math.max(0, player.stam - .42); }
  else player.stam = Math.min(100, player.stam + .16);
  if(player.boost > 0){
    spd = 5.2; player.boost--;
    if(frame%3===0 && ml>0) parts.push({x:player.x-mx*14, y:player.y, vx:-mx*2, vy:-my*2, l:14, c:"rgba(46,196,182,.8)", s:PX*2});
  }
  if(player.hop > 0){ player.hop--; spd *= 1.25; }
  if(player.hopCd > 0) player.hopCd--;
  player.vx = mx*spd; player.vy = my*spd;
  moveActor(player, player.vx, player.vy, player.hop > 0);
  if(player.hop === 0){ const b = blocked(player.x, player.y, player.r, false); if(b && b.hop) player.hop = 4; }
  if(ml > 0){
    player.anim += spd*.045;
    if(Math.abs(mx) > .2) player.face = mx >= 0 ? 1 : -1;
    if(frame % 9 === 0 && player.hop === 0) parts.push({x:player.x-mx*8, y:player.y+8, vx:0, vy:0, l:10, c:"rgba(205,184,160,.5)", s:PX});
  }

  /* goal check */
  if((player.x-GOAL.x)**2 + (player.y-GOAL.y)**2 < GOAL.r*GOAL.r) return endRun(true);

  /* Biscuit */
  const ddRaw = Math.hypot(dog.x-player.x, dog.y-player.y);
  if(dog.mode === "sleep"){
    if(ddRaw < 240){ dog.mode = "alert"; dog.alert = 44; dog.spotted = true; sfx.alert(); sfx.bark();
      document.getElementById("doglabel").firstChild.textContent = "Biscuit · !!!"; }
  } else if(dog.mode === "alert"){
    dog.alert--;
    if(dog.alert <= 0){ dog.mode = "chase"; document.getElementById("doglabel").firstChild.textContent = "Biscuit"; }
  } else {
    const dSpd = 3.1 + Math.min(1.5, time * .012);
    let tx = player.x + player.vx*14 - dog.x, ty = player.y + player.vy*14 - dog.y;
    const tl = Math.hypot(tx, ty) || 1; tx/=tl; ty/=tl;
    if(dog.crouch > 0){
      dog.crouch--;
      if(dog.crouch === 0){ dog.hop = 16; sfx.hop(); }
    } else {
      const ox = dog.x, oy = dog.y;
      if(dog.hop > 0) dog.hop--;
      moveActor(dog, tx*dSpd, ty*dSpd, dog.hop > 0);
      if(dog.hop === 0){ const b = blocked(dog.x, dog.y, dog.r, false); if(b && b.hop) dog.hop = 4; }
      const moved = Math.hypot(dog.x-ox, dog.y-oy);
      if(moved < dSpd*.3) dog.stuck++; else dog.stuck = Math.max(0, dog.stuck-2);
      if(dog.stuck > 36){ dog.stuck = 0; dog.crouch = 22; }
      dog.anim += dSpd*.05;
      if(Math.abs(tx) > .2) dog.face = tx >= 0 ? 1 : -1;
    }
    if(ddRaw < 140 && frame % 75 === 0) sfx.bark();
    if(ddRaw < player.r + dog.r + 2) return endRun(false);
  }

  /* NPC patrols */
  for(const n of npcs){
    if(n.spd > 0){
      const [wx, wy] = n.wps[n.i];
      let dx = wx - n.x, dy = wy - n.y;
      const d = Math.hypot(dx, dy);
      if(d < 6){
        n.i++;
        if(n.i >= n.wps.length){ if(n.pp){ n.wps.reverse(); n.i = 1; } else n.i = 0; }
      } else {
        dx /= d; dy /= d;
        n.x += dx*n.spd; n.y += dy*n.spd;
        n.anim += n.spd*.06;
        if(Math.abs(dx) > .2) n.face = dx >= 0 ? 1 : -1;
      }
    } else {
      n.anim += .04;
      n.face = player.x >= n.x ? 1 : -1;
    }
  }

  /* pickups */
  for(const p of pickups){
    p.p += .1;
    const dx = p.x-player.x, dy = p.y-player.y;
    if(dx*dx + dy*dy < 28*28){
      p.dead = true;
      if(p.t === "pop"){ pops++; player.stam = Math.min(100, player.stam+26); sfx.pickup(); burst(p.x,p.y,"#ffc44d"); }
      else { player.boost = 280; sfx.bike(); burst(p.x,p.y,"#2ec4b6"); }
    }
  }
  pickups = pickups.filter(p => !p.dead);

  for(const q of parts){ q.x += q.vx; q.y += q.vy; q.l--; }
  parts = parts.filter(q => q.l > 0);
  for(const f of flies){ f.p += .03; f.x += Math.sin(f.p)*.4; }
  if(frame % 3200 === 1600) iceCreamTruck();

  const mm = Math.floor(time/60), ss = String(Math.floor(time%60)).padStart(2,"0");
  document.getElementById("scorebox").textContent = mm + ":" + ss + " · \u{1F366} " + pops;
  document.getElementById("dogfill").style.transform = "scaleX(" +
    (dog.mode === "sleep" ? 0 : clamp(1 - (ddRaw-26)/520, 0, 1)) + ")";
  document.getElementById("stamfill").style.transform = "scaleX(" + (player.stam/100) + ")";
}
function burst(x,y,c){ for(let i=0;i<10;i++) parts.push({x,y,vx:R(-2,2),vy:R(-2.4,-.4),l:RI(14,26),c,s:PX}); }
/* ================= drawing ================= */
function draw(){
  cam.x = clamp(player.x - VW/2, 0, WORLD.w - VW);
  cam.y = clamp(player.y - VH/2, 0, WORLD.h - VH);

  ctx.drawImage(ground, cam.x, cam.y, VW, VH, 0, 0, VW, VH);

  /* pond shimmer */
  if(inView(840, 1060, 420, 280)){
    for(let i=0;i<7;i++){
      const sx = 1050 + Math.sin(frame*.02 + i*1.7)*160*Math.cos(i);
      const sy = 1200 + Math.cos(frame*.017 + i*2.3)*78*Math.sin(i*1.3);
      ctx.fillStyle = "rgba(255,220,150," + (.10 + .08*Math.sin(frame*.05+i)) + ")";
      ctx.fillRect(snap(sx-cam.x), snap(sy-cam.y), 16, PX);
    }
  }
  /* pulsing goal ring */
  if(inView(GOAL.x-90, GOAL.y-90, 180, 180)){
    ctx.strokeStyle = "rgba(255,196,77," + (.5 + .3*Math.sin(frame*.08)) + ")";
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(GOAL.x-cam.x, GOAL.y-cam.y, GOAL.r + Math.sin(frame*.08)*5, 0, 7); ctx.stroke();
  }

  /* long golden-hour shadows */
  ctx.fillStyle = "rgba(20,12,45,.32)";
  for(const w of walls){
    if(w.ghost || w.noshadow || !inView(w.x,w.y,w.w,w.h)) continue;
    const lift = (w.type==="house"||w.type==="school"||w.type==="market") ? 30 : w.type==="tree" ? 8 : 10;
    ctx.fillRect(snap(w.x-cam.x+16), snap(w.y-cam.y+10), snap(w.w), snap(w.h+lift));
  }

  for(const p of pickups){ if(inView(p.x-22,p.y-32,46,54)) (p.t==="pop" ? drawPop : drawBikePk)(p); }
  for(const q of parts){ ctx.fillStyle = q.c; ctx.fillRect(snap(q.x-cam.x), snap(q.y-cam.y), q.s, q.s); }

  /* y-sorted world */
  const ents = [];
  for(const w of walls) if(inView(w.x,w.y,w.w,w.h)) ents.push({y: w.y + w.h, f: () => drawWall(w)});
  for(const n of npcs) if(inView(n.x-26,n.y-50,52,60)) ents.push({y: n.y, f: () => drawNPC(n)});
  ents.push({y: player.y + 1, f: drawPlayer});
  if(inView(dog.x-34,dog.y-44,68,64)) ents.push({y: dog.y, f: drawDog});
  ents.sort((a,b) => a.y - b.y);
  for(const e of ents) e.f();

  /* canopies above the action */
  for(const c of canopies){
    if(!inView(c.x-c.r, c.y-c.r, c.r*2, c.r*2)) continue;
    const x = c.x - cam.x, y = c.y - cam.y, sway = Math.sin(frame*.02 + c.x)*2;
    ctx.fillStyle = "#142e1b"; ctx.beginPath(); ctx.arc(x+sway, y+3, c.r+3, 0, 7); ctx.fill();   // outline
    ctx.globalAlpha = .95;
    ctx.fillStyle = "#1d4527"; ctx.beginPath(); ctx.arc(x+sway, y, c.r, 0, 7); ctx.fill();
    ctx.fillStyle = "#2a5d35"; ctx.beginPath(); ctx.arc(x+sway-c.r*.25, y-c.r*.22, c.r*.62, 0, 7); ctx.fill();
    ctx.fillStyle = "#3a7a45"; ctx.beginPath(); ctx.arc(x+sway-c.r*.35, y-c.r*.35, c.r*.3, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }

  for(const f of flies){
    if(!inView(f.x,f.y,4,4)) continue;
    const tw = .35 + .65*Math.abs(Math.sin(f.p*1.7));
    ctx.fillStyle = "rgba(255,230,140," + tw + ")";
    ctx.fillRect(snap(f.x-cam.x), snap(f.y-cam.y + Math.sin(f.p*2)*5), PX, PX);
  }
  for(const L of lamps){
    if(!inView(L.x-90, L.y-140, 180, 240)) continue;
    const x = L.x - cam.x, y = L.y - cam.y;
    const g = ctx.createRadialGradient(x, y, 4, x, y, 86);
    g.addColorStop(0, "rgba(255,215,130,.34)"); g.addColorStop(1, "rgba(255,215,130,0)");
    ctx.fillStyle = g; ctx.fillRect(x-86, y-86, 172, 172);
    rectW("#1b1430", L.x-3, L.y-44, 7, 44);
    rectW("#ffe9c2", L.x-6, L.y-52, 13, 9);
  }

  /* dusk wash + vignette */
  let g = ctx.createLinearGradient(0,0,0,VH);
  g.addColorStop(0,"rgba(45,22,90,.30)"); g.addColorStop(.55,"rgba(255,140,80,.10)"); g.addColorStop(1,"rgba(25,12,50,.34)");
  ctx.fillStyle = g; ctx.fillRect(0,0,VW,VH);
  g = ctx.createRadialGradient(VW/2,VH/2,VH*.42,VW/2,VH/2,VH*.85);
  g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(8,5,20,.55)");
  ctx.fillStyle = g; ctx.fillRect(0,0,VW,VH);

  /* speech bubbles (after lighting so they stay readable) */
  for(const n of npcs){
    if(n.kind !== "kid" || !n.lines) continue;
    const d = Math.hypot(n.x-player.x, n.y-player.y);
    if(d > 150 || !inView(n.x-120, n.y-90, 240, 100)) continue;
    const line = n.lines[Math.floor(frame/260) % n.lines.length];
    const bw = line.length*6.6 + 18, bx = clamp(n.x-cam.x - bw/2, 6, VW-bw-6), by = n.y-cam.y - 74;
    ctx.fillStyle = "rgba(20,14,40,.85)"; ctx.fillRect(bx, by, bw, 24);
    ctx.strokeStyle = "rgba(255,196,77,.8)"; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, 24);
    ctx.fillStyle = "#ffe9c2"; ctx.font = "700 11px monospace"; ctx.textBaseline = "middle";
    ctx.fillText(line, bx+9, by+13);
  }

  /* minimap */
  if(mini){
    const mx0 = 12, my0 = VH - mini.height - 12;
    ctx.fillStyle = "rgba(20,14,40,.65)"; ctx.fillRect(mx0-4, my0-4, mini.width+8, mini.height+8);
    ctx.drawImage(mini, mx0, my0);
    ctx.strokeStyle = "rgba(255,196,77,.7)"; ctx.lineWidth = 2;
    ctx.strokeRect(mx0-4, my0-4, mini.width+8, mini.height+8);
    ctx.fillStyle = "#ffe9c2"; ctx.fillRect(mx0 + GOAL.x*MSC - 2, my0 + GOAL.y*MSC - 2, 5, 5);  // goal
    ctx.fillStyle = "#ffc44d"; ctx.fillRect(mx0 + player.x*MSC - 2, my0 + player.y*MSC - 2, 5, 5);
    if(dog.mode !== "sleep"){ ctx.fillStyle = "#ff6b57"; ctx.fillRect(mx0 + dog.x*MSC - 2, my0 + dog.y*MSC - 2, 5, 5); }
  }

  /* off-screen Biscuit arrow once he's awake */
  if(state === "run" && dog.mode === "chase"){
    const sx = dog.x - cam.x, sy = dog.y - cam.y;
    if(sx < -10 || sx > VW+10 || sy < -10 || sy > VH+10){
      const ax = clamp(sx, 26, VW-26), ay = clamp(sy, 26, VH-26);
      const ang = Math.atan2(sy-ay, sx-ax);
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang);
      ctx.fillStyle = "#ff6b57";
      ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-8,-9); ctx.lineTo(-8,9); ctx.fill();
      ctx.restore();
    }
  }
}
/* ---- buildings & props ---- */
function outline(x, y, w, h){
  ctx.strokeStyle = "#16102b"; ctx.lineWidth = PX;
  ctx.strokeRect(snap(x-cam.x), snap(y-cam.y), snap(w), snap(h));
}
function drawWall(w){
  const T = w.type;
  if(T === "house"){
    const FW = 48;
    rectW(w.hue, w.x, w.y + w.h - FW, w.w, FW);
    ctx.fillStyle = "rgba(0,0,0,.14)";                                  // siding lines
    for(let sy = w.y+w.h-FW+9; sy < w.y+w.h; sy += 9) ctx.fillRect(snap(w.x-cam.x), snap(sy-cam.y), snap(w.w), 2);
    rectW("#2a2147", w.x-8, w.y-16, w.w+16, w.h - FW + 16);             // roof
    ctx.fillStyle = "rgba(255,255,255,.06)";                            // shingle rows
    for(let sy = w.y-8; sy < w.y+w.h-FW-8; sy += 11) ctx.fillRect(snap(w.x-8-cam.x), snap(sy-cam.y), snap(w.w+16), 2);
    rectW("#3a2f5c", w.x-8, w.y-16, w.w+16, 9);
    rectW("#241d40", w.x-8, w.y + w.h - FW - 8, w.w+16, 8);
    const doorC = w.player ? "#ffc44d" : "#3a2719";
    rectW(doorC, w.x + w.w*.18, w.y+w.h-34, 20, 34);
    rectW("#1b1430", w.x + w.w*.18 + 14, w.y+w.h-19, PX, PX);           // knob
    rectW("#6a5c91", w.x + w.w*.18 - 5, w.y+w.h-2, 30, 6);              // step
    const wx = w.x + w.w*.58, wy = w.y + w.h - 36;
    const lx = wx - cam.x, ly = wy - cam.y;
    const g = ctx.createRadialGradient(lx+10,ly+10,2,lx+10,ly+10,42);
    g.addColorStop(0,"rgba(255,200,110,.45)"); g.addColorStop(1,"rgba(255,200,110,0)");
    ctx.fillStyle = g; ctx.fillRect(lx-30,ly-30,84,84);
    rectW("#ffd27a", wx, wy, 22, 22); rectW(w.trim, wx-2, wy-2, 26, 3); rectW("#a86f3e", wx+9, wy, 4, 22);
    rectW("#ffd27a", w.x + w.w*.78, wy, 16, 22);
    rectW("#241d40", w.x + w.w*.72, w.y-28, 14, 16);                    // chimney
    if(w.player){ rectW("#2ec4b6", w.x + w.w*.18 - 5, w.y+w.h+4, 30, 5); } // welcome mat
    outline(w.x-8, w.y-16, w.w+16, w.h+16);
  }
  else if(T === "school"){
    const FW = 60;
    rectW("#a85546", w.x, w.y + w.h - FW, w.w, FW);                      // brick face
    ctx.fillStyle = "rgba(0,0,0,.12)";
    for(let sy = w.y+w.h-FW+8; sy < w.y+w.h; sy += 8) ctx.fillRect(snap(w.x-cam.x), snap(sy-cam.y), snap(w.w), 2);
    rectW("#7a3d33", w.x-10, w.y-14, w.w+20, w.h-FW+14);                 // flat roof
    rectW("#8f4a3e", w.x-10, w.y-14, w.w+20, 10);
    for(let i=0;i<6;i++){                                                // window row
      const wx = w.x + 50 + i*110;
      rectW("#ffe9c2", wx-3, w.y+w.h-50, 30, 26);
      rectW("#ffd27a", wx, w.y+w.h-47, 24, 20);
    }
    rectW("#ffe9c2", w.x + w.w/2 - 34, w.y+w.h-46, 68, 46);              // entry trim
    rectW("#3a2719", w.x + w.w/2 - 26, w.y+w.h-40, 24, 40);              // double doors
    rectW("#3a2719", w.x + w.w/2 + 2,  w.y+w.h-40, 24, 40);
    ctx.fillStyle = "#ffe9c2"; ctx.font = "900 15px monospace"; ctx.textBaseline = "alphabetic";
    ctx.fillText("MAPLE ELEMENTARY", snap(w.x + w.w/2 - 78 - cam.x), snap(w.y + w.h - 58 - cam.y));
    outline(w.x-10, w.y-14, w.w+20, w.h+14);
  }
  else if(T === "market"){
    const FW = 56;
    rectW("#5d4a7a", w.x, w.y + w.h - FW, w.w, FW);
    rectW("#473a6e", w.x-8, w.y-12, w.w+16, w.h-FW+12);
    for(let i=0;i<8;i++){                                                // awning stripes
      rectW(i%2 ? "#ff6b57" : "#ffe9c2", w.x + 20 + i*72, w.y+w.h-FW-6, 72, 12);
    }
    rectW("#ffd27a", w.x+30, w.y+w.h-42, w.w*.36, 34);                   // glowing storefront
    rectW("#ffe9c2", w.x+30, w.y+w.h-42, w.w*.36, 4);
    rectW("#3a2719", w.x + w.w*.62, w.y+w.h-40, 26, 40);
    ctx.fillStyle = "#ffc44d"; ctx.font = "900 17px monospace";
    ctx.fillText("MAPLE MART", snap(w.x + w.w/2 - 48 - cam.x), snap(w.y + 8 - cam.y));
    outline(w.x-8, w.y-12, w.w+16, w.h+12);
  }
  else if(T === "fence"){
    const horiz = w.w >= w.h;
    if(horiz){
      rectW("#d9cdb8", w.x, w.y-15, w.w, 5); rectW("#d9cdb8", w.x, w.y-4, w.w, 5);     // white picket rails
      for(let x = w.x; x < w.x+w.w-6; x += 14){
        rectW("#bdb09a", x+1, w.y-21, 8, 28);                                          // picket shadow side
        rectW("#efe5d2", x, w.y-23, 8, 28); rectW("#fff7e8", x, w.y-23, 8, 4);
      }
    } else {
      for(let y = w.y; y < w.y+w.h-6; y += 14){
        rectW("#bdb09a", w.x+1, y-15, 9, 22);
        rectW("#efe5d2", w.x, y-17, 9, 22); rectW("#fff7e8", w.x, y-17, 9, 4);
      }
    }
  }
  else if(T === "tree"){
    rectW("#3a2719", w.x+2, w.y-8, 16, 30);
    rectW("#4a3322", w.x+4, w.y-8, 8, 30); rectW("#5d432f", w.x+5, w.y-8, 3, 30);
  }
  else if(T === "trash"){
    rectW("#4a6b75", w.x, w.y-14, w.w, w.h+14); rectW("#39555e", w.x+6, w.y-14, 5, w.h+14);
    rectW("#6d99a6", w.x+2, w.y-12, 3, w.h+10);
    rectW("#5d8693", w.x-3, w.y-20, w.w+6, 7);
  }
  else if(T === "hedge"){
    rectW("#234a2b", w.x, w.y-8, w.w, w.h+8); rectW("#2e5d36", w.x, w.y-8, w.w, 8);
    ctx.fillStyle = "#3a7a45";
    for(let i=0;i<w.w*w.h/900;i++) ctx.fillRect(snap(w.x+((i*37)%w.w)-cam.x), snap(w.y-6+((i*53)%(w.h+4))-cam.y), PX, PX);
  }
  else if(T === "pond"){ /* baked into the ground */ }
  else if(T === "table"){
    rectW("#8a5730", w.x, w.y-12, w.w, 8); rectW("#a86f3e", w.x-6, w.y-22, w.w+12, 10);
    rectW("#8a5730", w.x+4, w.y-12, 6, 14); rectW("#8a5730", w.x+w.w-10, w.y-12, 6, 14);
  }
  else if(T === "cart"){
    rectW("#9aa7c9", w.x, w.y-14, w.w, 14); rectW("#7d8ab0", w.x+3, w.y-11, w.w-6, 8);
    rectW("#1b1430", w.x+2, w.y+2, 6, 6); rectW("#1b1430", w.x+w.w-8, w.y+2, 6, 6);
  }
  else if(T === "mailbox"){
    rectW("#4a3322", w.x+3, w.y-18, 4, 22);
    rectW("#ff6b57", w.x-3, w.y-26, 16, 10); rectW("#ffc44d", w.x+11, w.y-29, 3, 6);
  }
  else if(T === "sign"){
    rectW("#4a3322", w.x+4, w.y-20, 5, 24);
    const tw = Math.max(w.txt.length, (w.txt2||"").length) * 6.2 + 14;
    rectW("#1b1430", w.x+6 - tw/2 - 2, w.y-46, tw+4, w.txt2 ? 28 : 18);
    rectW("#e8d9b8", w.x+6 - tw/2, w.y-44, tw, w.txt2 ? 24 : 14);
    ctx.fillStyle = "#1b1430"; ctx.font = "700 9px monospace"; ctx.textBaseline = "alphabetic";
    ctx.fillText(w.txt, snap(w.x+6-cam.x) - tw/2 + 5, snap(w.y-34-cam.y));
    if(w.txt2){ ctx.fillStyle = "#5d4a3a"; ctx.fillText(w.txt2, snap(w.x+6-cam.x) - tw/2 + 5, snap(w.y-24-cam.y)); }
  }
  else if(T === "doghouse"){
    rectW("#a86f3e", w.x, w.y-20, w.w, w.h+20);
    rectW("#8a5730", w.x-5, w.y-34, w.w+10, 16);
    rectW("#1b1430", w.x+w.w/2-10, w.y-4, 20, 24);
    ctx.fillStyle = "#ffe9c2"; ctx.font = "700 9px monospace";
    ctx.fillText("BISCUIT", snap(w.x+w.w/2-20-cam.x), snap(w.y-24-cam.y));
  }
  else if(T === "swing"){
    rectW("#8a5730", w.x-46, w.y-66, 8, 66); rectW("#8a5730", w.x+46, w.y-66, 8, 66);
    rectW("#a86f3e", w.x-50, w.y-72, 108, 8);
    for(const off of [-22, 16]){
      const sw = Math.sin(frame*.05 + off)*6;
      rectW("#d9cdb8", w.x+off+sw, w.y-64, 2, 44); rectW("#d9cdb8", w.x+off+12+sw, w.y-64, 2, 44);
      rectW("#ff6b57", w.x+off-2+sw, w.y-20, 18, 6);
    }
  }
  else if(T === "slide"){
    rectW("#8a5730", w.x+30, w.y-52, 8, 52);
    for(let i=0;i<4;i++) rectW("#a86f3e", w.x+26, w.y-44+i*11, 16, 4);
    ctx.fillStyle = "#2ec4b6";
    ctx.beginPath();
    ctx.moveTo(snap(w.x+34-cam.x), snap(w.y-52-cam.y));
    ctx.lineTo(snap(w.x-26-cam.x), snap(w.y+4-cam.y));
    ctx.lineTo(snap(w.x-2-cam.x), snap(w.y+4-cam.y));
    ctx.lineTo(snap(w.x+46-cam.x), snap(w.y-52-cam.y));
    ctx.fill();
    rectW("#7fd8cf", w.x+34, w.y-52, 12, 4);
  }
  else if(T === "flag"){
    rectW("#d9cdb8", w.x, w.y-78, 5, 82);
    const wave = Math.sin(frame*.08)*3;
    rectW("#ffc44d", w.x+5, w.y-76+wave, 26, 14);
    rectW("#ff6b57", w.x+5, w.y-76+wave, 26, 5);
  }
  else if(T === "rack"){
    rectW("#9aa7c9", w.x, w.y-16, w.w, 5);
    for(let i=0;i<4;i++) rectW("#7d8ab0", w.x+2+i*12, w.y-14, 4, 16);
  }
  else if(T === "hoop"){
    rectW("#3f3a60", w.x+2, w.y-64, 6, 68);
    rectW("#ffe9c2", w.x-12, w.y-86, 34, 24);
    rectW("#ff6b57", w.x-9, w.y-79, 28, 3);
    rectW("#ff8f57", w.x-7, w.y-62, 24, 4);
    rectW("rgba(255,233,194,.7)", w.x-5, w.y-58, 2, 10); rectW("rgba(255,233,194,.7)", w.x+13, w.y-58, 2, 10);
    rectW("rgba(255,233,194,.7)", w.x-1, w.y-56, 2, 8);  rectW("rgba(255,233,194,.7)", w.x+9, w.y-56, 2, 8);
  }
  else if(T === "scare"){
    rectW("#8a5730", w.x+3, w.y-44, 4, 48);
    rectW("#8a5730", w.x-10, w.y-34, 30, 4);
    rectW("#a86f3e", w.x-4, w.y-30, 18, 16);
    rectW("#d9c08c", w.x-1, w.y-44, 12, 12);
    rectW("#8a6f3e", w.x-3, w.y-48, 16, 6);
    rectW("#1b1430", w.x+2, w.y-40, 2, 2); rectW("#1b1430", w.x+7, w.y-40, 2, 2);
  }
  else if(T === "cone"){
    rectW("#ff8f57", w.x, w.y-12, w.w, w.h+12);
    rectW("#ffe9c2", w.x, w.y-7, w.w, 4);
    rectW("#e06a3a", w.x-3, w.y+w.h-3, w.w+6, 4);
  }
}
/* ---- pickups ---- */
function drawPop(p){
  const y = p.y + Math.sin(p.p)*4;
  ctx.fillStyle = "rgba(255,196,77,.16)";
  ctx.fillRect(snap(p.x-13-cam.x), snap(y-26-cam.y), 30, 36);
  rectW("rgba(0,0,0,.25)", p.x-7, p.y+8, 16, 5);
  rectW("#ff6b57", p.x-7, y-22, 15, 18); rectW("#ffb3a6", p.x-7, y-22, 6, 18);
  rectW("#d9b98c", p.x-2, y-4, 5, 9);
}
function drawBikePk(p){
  const y = p.y + Math.sin(frame*.08)*3;
  ctx.fillStyle = "rgba(46,196,182,.18)";
  ctx.fillRect(snap(p.x-26-cam.x), snap(y-30-cam.y), 56, 46);
  rectW("rgba(0,0,0,.25)", p.x-18, p.y+9, 38, 5);
  rectW("#1b1430", p.x-18, y-8, 13, 13); rectW("#1b1430", p.x+7, y-8, 13, 13);
  rectW("#2ec4b6", p.x-12, y-13, 26, 6); rectW("#2ec4b6", p.x+2, y-22, 5, 11);
  rectW("#ffc44d", p.x-15, y-19, 8, 5);  rectW("#ffc44d", p.x+4, y-25, 10, 4);
}
/* ---- people ---- */
function drawBody(x, y, face, anim, shirt, hair, opts={}){
  const step = Math.sin(anim*6) > 0, skin = opts.skin || "#e8a87c";
  rectW("#16102b", x-12, y-47, 25, 50);                                  // outline silhouette
  if(opts.moving === false){
    rectW(skin, x-9, y-6, 7, 12); rectW(skin, x+3, y-6, 7, 12);
  } else if(step){ rectW(skin, x-9, y-8, 7, 14); rectW(skin, x+3, y-4, 7, 10); }
  else           { rectW(skin, x-9, y-4, 7, 10); rectW(skin, x+3, y-8, 7, 14); }
  rectW("#fff7e8", x-10, y+4, 9, 5); rectW("#fff7e8", x+2, y+4, 9, 5);
  rectW(opts.pants || "#2e6f8e", x-10, y-16, 21, 10);
  rectW(shirt, x-10, y-32, 21, 17);
  rectW("rgba(0,0,0,.15)", x-10, y-18, 21, 3);
  if(opts.pack) rectW("#ffc44d", x - face*15, y-30, 8, 14);
  rectW(skin, x + face*10, y-30 + (step?2:-2), 6, 11);
  rectW(skin, x-6, y-45, 15, 14);
  rectW(hair, x-7, y-49, 17, 8);
  rectW(hair, x - face*7, y-44, 4, 8);
  rectW("#1b1430", x + face*4, y-41, PX, PX);
}
function drawPlayer(){
  const lift = player.hop > 0 ? Math.sin((18-player.hop)/18*Math.PI)*16 : 0;
  const sh = player.hop > 0 ? .6 : 1;
  rectW("rgba(0,0,0,.3)", player.x-9*sh, player.y+6, 19*sh, 6);
  drawBody(player.x, player.y - lift, player.face, player.anim, "#ff6b57", "#5a3a25", {pack:true});
  if(player.boost > 0 && frame%6 < 3) rectW("rgba(46,196,182,.6)", player.x-12, player.y-lift-54, 26, 3);
}
function drawNPC(n){
  rectW("rgba(0,0,0,.28)", n.x-9, n.y+6, 19, 6);
  if(n.kind === "bike"){
    const y = n.y;
    rectW("#16102b", n.x-22, y-12, 46, 18);
    rectW("#1b1430", n.x-18, y-6, 14, 14); rectW("#1b1430", n.x+6, y-6, 14, 14);
    rectW("#ffe9c2", n.x-15, y-3, 8, 8);  rectW("#ffe9c2", n.x+9, y-3, 8, 8);
    rectW(n.shirt, n.x-12, y-12, 26, 6);
    drawBody(n.x, y - 10 + Math.sin(n.anim*3)*1.5, n.face, 0, n.shirt, n.hair, {moving:false, pants:"#3f3a60"});
    rectW("#ffe9c2", n.x-7, y-60, 17, 7);                                // helmet
  } else {
    const bob = n.kind === "kid" ? Math.sin(n.anim*2.4)*1.5 : 0;
    drawBody(n.x, n.y + bob, n.face, n.anim, n.shirt, n.hair, {moving: n.spd > 0});
  }
}
function drawDog(){
  const x = dog.x;
  if(dog.mode === "sleep"){
    rectW("rgba(0,0,0,.3)", x-15, dog.y+4, 31, 6);
    rectW("#16102b", x-17, dog.y-16, 36, 22);
    rectW("#96632f", x-15, dog.y-14, 32, 18);                            // curled up
    rectW("#7a4e2a", x+8, dog.y-18, 12, 10);
    rectW("#7a4e2a", x-14, dog.y-16, 8, 6);
    ctx.fillStyle = "#cdb8ff"; ctx.font = "700 12px monospace";
    ctx.fillText("z", snap(x+18-cam.x), snap(dog.y-26-cam.y - (frame%60)/6));
    return;
  }
  const lift = dog.hop > 0 ? Math.sin((16-dog.hop)/16*Math.PI)*14 : 0;
  const y = dog.y - lift;
  const step = Math.sin(dog.anim*6) > 0;
  rectW("rgba(0,0,0,.3)", x-13, dog.y+6, 27, 6);
  if(dog.mode === "alert" || dog.crouch > 0){
    rectW("#16102b", x-16, y-12, 34, 16);
    rectW("#96632f", x-14, y-10, 30, 12);
    rectW("#96632f", x + dog.face*8, y-16, 14, 12);
    rectW("#1b1430", x + dog.face*16, y-13, PX, PX);
    if(frame % 14 < 7){ ctx.fillStyle = "#ffc44d"; ctx.font = "900 18px monospace"; ctx.fillText("!", snap(x-cam.x + dog.face*22), snap(y-22-cam.y)); }
    return;
  }
  rectW("#16102b", x-16, y-29, 36, 32);                                  // outline
  if(step){ rectW("#7a4e2a", x-11, y-2, 6, 9); rectW("#7a4e2a", x+6, y-4, 6, 11); }
  else    { rectW("#7a4e2a", x-11, y-4, 6, 11); rectW("#7a4e2a", x+6, y-2, 6, 9); }
  rectW("#96632f", x-14, y-18, 30, 15);
  rectW("#ab7438", x-14, y-18, 30, 4);
  rectW("#96632f", x + dog.face*9, y-27, 15, 14);
  rectW("#7a4e2a", x + dog.face*9, y-32, 6, 8);
  rectW("#7a4e2a", x + dog.face*16, y-31, 6, 7);
  rectW("#1b1430", x + dog.face*17, y-23, PX, PX);
  rectW("#5a3a25", x + dog.face*20, y-19, 5, 5);
  rectW("#7a4e2a", x - dog.face*16, y-22 + (step?0:3), 7, 7);
  rectW("#ff6b57", x + dog.face*7, y-16, 4, 6);
}

/* ================= boot ================= */
buildMap(); bakeGround(); bakeMini(); resetRun();
function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();
})();
