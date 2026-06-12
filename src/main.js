import { VW, VH, PX, WORLD, GOAL, DAY_NUM, USE_SHEETS } from './engine/constants.js';
import { buildSheets } from './render/sheet.js';
import { R, RI, clamp } from './engine/utils.js';
import { audio, startMusic, toggleMusic, sfx, iceCreamTruck } from './audio/synth.js';
import { keys, setupKeyboard } from './engine/input.js';
import { walls, canopies, lamps, buildMap } from './world/map.js';
import { ground, bakeGround } from './world/bake.js';
import { bakeMini } from './world/minimap.js';
import { blocked, moveActor } from './engine/collision.js';
import { makeNPCs } from './entities/npcs.js';
import { POP_SPOTS, BIKE_SPOTS } from './entities/pickups.js';
import { player, resetPlayer } from './entities/player.js';
import { dog, resetDog } from './entities/dog.js';
import { show, setDogLabel } from './ui/hud.js';
import { showEndScreen } from './ui/overlays.js';
import { initDraw, inView, snap } from './render/draw.js';
import { drawWall } from './render/props.js';
import { drawPlayer, drawNPC, drawDog, drawPop, drawBikePk } from './render/sprites.js';
import { drawShadows, drawCanopies, drawFireflies, drawLamps, drawDuskWash, drawSpeechBubbles, drawMinimap, drawBiscuitArrow } from './render/lighting.js';

let cv, ctx;
const cam = { x:0, y:0 };
let state = "title", frame = 0, time = 0, pops = 0, best = 0, missionT = 0;
let pickups = [], parts = [], npcs = [], flies = [];
let joy = null, sprintHeld = false;

function fit(){
  const s = Math.min(innerWidth / VW, innerHeight / VH);
  cv.style.width  = Math.floor(VW * s) + "px";
  cv.style.height = Math.floor(VH * s) + "px";
}

function tryHop(){
  if(player.hopCd > 0 || player.hop > 0) return;
  player.hop = 18; player.hopCd = 42; sfx.hop();
}

function resetRun(){
  resetPlayer();
  resetDog();
  pickups = []; parts = [];
  for(const [px,py] of POP_SPOTS) if(!blocked(px,py,16,false)) pickups.push({t:"pop", x:px, y:py, p:R(0,6)});
  for(const [bx,by] of BIKE_SPOTS) if(!blocked(bx,by,16,false)) pickups.push({t:"bike", x:bx, y:by, p:0});
  npcs = makeNPCs();
  flies = [];
  for(let i=0;i<70;i++) flies.push({x:R(0,WORLD.w), y:R(0,WORLD.h), p:R(0,6)});
  time = 0; pops = 0;
}

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
  showEndScreen(won, score, best, time, pops, dog.spotted);
  show("hud",false); show(won ? "win" : "gameover", true);
}

function burst(x,y,c){ for(let i=0;i<10;i++) parts.push({x,y,vx:R(-2,2),vy:R(-2.4,-.4),l:RI(14,26),c,s:PX}); }

export function update(){
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
    if(USE_SHEETS) player.dir = Math.abs(my) > Math.abs(mx) ? (my > 0 ? 0 : 3) : (mx >= 0 ? 2 : 1);
    if(frame % 9 === 0 && player.hop === 0) parts.push({x:player.x-mx*8, y:player.y+8, vx:0, vy:0, l:10, c:"rgba(205,184,160,.5)", s:PX});
  }

  /* goal check */
  if((player.x-GOAL.x)**2 + (player.y-GOAL.y)**2 < GOAL.r*GOAL.r) return endRun(true);

  /* Biscuit */
  const ddRaw = Math.hypot(dog.x-player.x, dog.y-player.y);
  if(dog.mode === "sleep"){
    if(ddRaw < 240){ dog.mode = "alert"; dog.alert = 44; dog.spotted = true; sfx.alert(); sfx.bark();
      setDogLabel("Biscuit · !!!"); }
  } else if(dog.mode === "alert"){
    dog.alert--;
    if(dog.alert <= 0){ dog.mode = "chase"; setDogLabel("Biscuit"); }
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
        if(USE_SHEETS) n.dir = Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 0 : 3) : (dx >= 0 ? 2 : 1);
      }
    } else {
      n.anim += .04;
      n.face = player.x >= n.x ? 1 : -1;
      if(USE_SHEETS) n.dir = player.x >= n.x ? 2 : 1;
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

export function draw(){
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

  drawShadows(walls);

  for(const p of pickups){
    if(inView(p.x-22,p.y-32,46,54)){
      if(p.t === "pop") drawPop(p); else drawBikePk(p, frame);
    }
  }
  for(const q of parts){ ctx.fillStyle = q.c; ctx.fillRect(snap(q.x-cam.x), snap(q.y-cam.y), q.s, q.s); }

  /* y-sorted world */
  const ents = [];
  for(const w of walls) if(inView(w.x,w.y,w.w,w.h)) ents.push({y: w.y + w.h, f: () => drawWall(w, frame)});
  for(const n of npcs) if(inView(n.x-26,n.y-50,52,60)) ents.push({y: n.y, f: () => drawNPC(n, frame)});
  ents.push({y: player.y + 1, f: () => drawPlayer(player, frame)});
  if(inView(dog.x-34,dog.y-44,68,64)) ents.push({y: dog.y, f: () => drawDog(dog, frame)});
  ents.sort((a,b) => a.y - b.y);
  for(const e of ents) e.f();

  drawCanopies(canopies, frame);
  drawFireflies(flies, frame);
  drawLamps(lamps);
  drawDuskWash();
  drawSpeechBubbles(npcs, player, frame);
  drawMinimap(player, dog);
  drawBiscuitArrow(dog, state);
}

export function init(){
  cv = document.getElementById("game");
  ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  fit();
  addEventListener("resize", fit);

  document.getElementById("daylabel").textContent = "Summer Day " + DAY_NUM + " · Maple Court";

  initDraw(ctx, cam);

  buildMap(); bakeGround(); bakeMini(); resetRun();
  if(USE_SHEETS) buildSheets();

  setupKeyboard(
    () => { state === "run" ? tryHop() : start(); },
    toggleMusic
  );

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
}

// Browser auto-start
if(typeof window !== "undefined"){
  init();
  function loop(){ update(); draw(); requestAnimationFrame(loop); }
  loop();
}

// Test-accessible exports
export { keys, player, dog };
export const getState = () => state;
export function startRun(){ start(); }
export function stepFrame(){ update(); draw(); }
