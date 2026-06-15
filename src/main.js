import { VW, VH, PX, GOAL, DAY_NUM, USE_SHEETS } from './engine/constants.js';
import { tickClock, getClockDisplay, getGameDay, sleep as clockSleep, resetDay, getClockMinutes } from './engine/clock.js';
import { earnMoney, getMoney, snapshotDayBalance, forfeitDayEarnings } from './engine/money.js';
import { grantFriendship, canInteract, getFriendLevelName } from './engine/friends.js';
import { grantTrust, penalizeTrust, getTrustLevelName, getCurfewMinutes } from './engine/trust.js';
import { MAPS } from './world/maps/index.js';
import { buildSheets } from './render/sheet.js';
import { buildTileset } from './world/tilecache.js';
import { buildBuildingSprites } from './render/buildsprites.js';
import { R, RI, clamp } from './engine/utils.js';
import { audio, startMusic, toggleMusic, sfx, iceCreamTruck } from './audio/synth.js';
import { keys, setupKeyboard } from './engine/input.js';
import { walls, canopies, lamps, doors, buildMap } from './world/map.js';
// regionAt removed — banner name comes from section map
import { INTERIORS, resetChores } from './world/interiorMaps.js';
import { startFade, stepFade, drawFade, isFading } from './engine/transition.js';
import { setBounds } from './engine/collision.js';
import { initChunks, drawChunks, evictChunks, setSection } from './world/chunks.js';
import { buildGrid } from './engine/spatialgrid.js';
import { setSectionMini } from './world/minimap.js';
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
let regionName = null, bannerT = 0;
let insideMap = null, interiorNPCs = [], interactText = null;
let doorCooldown = 0, savedDogMode = 'sleep';
let currentSection = 'neighborhood';
let joy = null, sprintHeld = false;
let sleepHoldT = 0;
let activities = [];
let activityHoldT = 0;
let curfewBroken = false; // true after curfew fires this day (prevents double-trigger)
let curfewMsg = null;     // non-null while the curfew-consequence overlay is showing
// Water tower climb state
let towerState = 0, towerT = 0, towerZoom = 0, towerClimbHold = 0;
let vistaSeen = false, vistaText = 0;
const TOWER_LADDER_X = 7220, TOWER_LADDER_Y = 760, TOWER_TOP_Y = 688;

// Oscillating sprinklers — athletic fields hazard (each sweeps an arc, wets player+dog)
const SPRINKLERS = [
  {x:6450, y:1200, a:0.5,  dir:1,  spd:.017, min:-0.3, max:1.3, r:90},
  {x:6622, y:1900, a:2.8,  dir:-1, spd:.021, min:1.8,  max:3.8, r:88},
  {x:7022, y:1102, a:1.8,  dir:1,  spd:.016, min:0.8,  max:2.8, r:86},
  {x:7152, y:1852, a:4.0,  dir:-1, spd:.020, min:3.0,  max:5.0, r:92},
];
// Ball arcing between the two catch-playing kids in the baseball outfield
const catchBall = {phase:0, dir:1, ax:6910, ay:1182, bx:7110, by:1182};

function fit(){
  const s = Math.min(innerWidth / VW, innerHeight / VH);
  cv.style.width  = Math.floor(VW * s) + "px";
  cv.style.height = Math.floor(VH * s) + "px";
}

function tryHop(){
  if(player.hopCd > 0 || player.hop > 0) return;
  player.hop = 18; player.hopCd = 42; sfx.hop();
}

// Talk to the nearest friend NPC within range (overworld or interior). Returns true if handled.
function talkToNearestFriend(){
  if(state !== "run" || isFading() || curfewMsg) return false;
  const candidates = insideMap !== null ? interiorNPCs : npcs;
  for(const n of candidates){
    if(!n.friendKey) continue;
    if(Math.hypot(player.x - n.x, player.y - n.y) < 80){
      const granted = grantFriendship(n.friendKey, 'talk', 3, getGameDay());
      const lvlName = getFriendLevelName(n.friendKey);
      interactText = granted
        ? { txt: n.name, txt2: `${lvlName}  ·  Nice chat!` }
        : { txt: n.name, txt2: `${lvlName}  ·  Already caught up today!` };
      if(granted) sfx.pickup();
      doorCooldown = 90;
      return true;
    }
  }
  return false;
}

function enterInterior(d){
  insideMap = d.target;
  const interior = INTERIORS[insideMap];
  interiorNPCs = interior.npcs.map(n => Object.assign({},n,{
    x:n.wps[0][0], y:n.wps[0][1], i:n.wps.length>1?1:0, anim:0, face:1, dir:2
  }));
  player.x = d.spawnX; player.y = d.spawnY;
  savedDogMode = dog.mode; dog.mode = 'sleep'; // pause dog
  buildGrid(interior.walls);
  setBounds(interior.w, interior.h);
  interactText = null; doorCooldown = 60; activityHoldT = 0;
}

function exitInterior(ex){
  player.x = ex.worldTarget.x; player.y = ex.worldTarget.y;
  dog.mode = savedDogMode;
  insideMap = null; interiorNPCs = []; interactText = null; doorCooldown = 60;
  sleepHoldT = 0; activityHoldT = 0;
  buildGrid(walls); setBounds(MAPS[currentSection].w, MAPS[currentSection].h);
}

function doSleep(){
  clockSleep();
  snapshotDayBalance(); // snapshot balance at start of new day for potential curfew forfeit
  curfewBroken = false;
  sleepHoldT = 0; activityHoldT = 0;
  resetChores();
  for(const ia of activities) if(ia.activity) ia.activity.claimed = false;
  const ex = INTERIORS['house'].exits[0];
  player.x = ex.worldTarget.x; player.y = ex.worldTarget.y;
  dog.mode = savedDogMode;
  insideMap = null; interiorNPCs = []; interactText = null; doorCooldown = 60;
  buildGrid(walls); setBounds(MAPS[currentSection].w, MAPS[currentSection].h);
  regionName = `Day ${getGameDay()} · Good morning!`;
  bannerT = 300;
}

function doCurfewBreak(){
  penalizeTrust(10);
  forfeitDayEarnings();
  clockSleep();
  snapshotDayBalance();
  curfewBroken = false;
  sleepHoldT = 0; activityHoldT = 0;
  resetChores();
  for(const ia of activities) if(ia.activity) ia.activity.claimed = false;
  const ex = INTERIORS['house'].exits[0];
  player.x = ex.worldTarget.x; player.y = ex.worldTarget.y;
  insideMap = null; interiorNPCs = []; interactText = null; doorCooldown = 60;
  buildGrid(walls); setBounds(MAPS[currentSection].w, MAPS[currentSection].h);
  curfewMsg = {
    line1: "You missed curfew.",
    line2: '"We were waiting up for you." — Mom',
    line3: `Trust lost · Day's earnings forfeited · Day ${getGameDay()} begins`,
    line4: "[Space] Continue",
  };
}

function loadSection(key) {
  currentSection = key;
  const map = MAPS[key];
  // Replace global arrays in-place so all module refs stay valid
  walls.length = 0;    walls.push(...map.walls);
  canopies.length = 0; canopies.push(...map.canopies);
  lamps.length = 0;    lamps.push(...map.lamps);
  doors.length = 0;    doors.push(...map.doors.map(d => Object.assign({
    target:null, spawnX:0, spawnY:0, worldReturn:null, txt:''
  }, d)));
  buildGrid(walls);
  setBounds(map.w, map.h);
  setSection(key, map.bakeInto, map.w, map.h);
  initChunks();
  setSectionMini(map.minimapBake(), 150 / map.w);
  if(USE_SHEETS) buildBuildingSprites(walls);
  npcs = map.npcs.map(n => Object.assign({}, n, {
    x:n.wps[0][0], y:n.wps[0][1], i:n.wps.length>1?1:0, anim:0, face:1, dir:2
  }));
  activities = map.activities || [];
  pickups = [];
  for(const [px,py] of map.pickupSpots)
    if(!blocked(px,py,16,true)) pickups.push({t:"pop", x:px, y:py, p:R(0,6)});
  regionName = map.name; bannerT = 240;
}

function resetRun(){
  if(insideMap !== null){
    insideMap = null; interiorNPCs = []; interactText = null;
  }
  doorCooldown = 0;
  resetPlayer();
  resetDog();
  loadSection('neighborhood');
  parts = []; flies = []; sleepHoldT = 0; activityHoldT = 0; curfewBroken = false; curfewMsg = null;
  for(let i=0;i<70;i++) flies.push({x:R(0,MAPS['neighborhood'].w), y:R(0,MAPS['neighborhood'].h), p:R(0,6)});
  time = 0; pops = 0; resetDay();
  towerState = 0; towerT = 0; towerZoom = 0; towerClimbHold = 0; vistaText = 0; vistaSeen = false;
}

function start(){
  audio(); startMusic();
  if(state === "run") return;
  resetRun();
  snapshotDayBalance(); // capture opening balance so curfew forfeit knows what to restore
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
  try { if(typeof localStorage !== 'undefined') localStorage.setItem('schools_best', String(best)); } catch(e){}
  showEndScreen(won, score, best, time, pops, dog.spotted);
  show("hud",false); show(won ? "win" : "gameover", true);
}

function burst(x,y,c){ for(let i=0;i<10;i++) parts.push({x,y,vx:R(-2,2),vy:R(-2.4,-.4),l:RI(14,26),c,s:PX}); }

export function update(){
  frame++;
  stepFade();
  if(state !== "run") return;
  if(curfewMsg) return; // hold on curfew-consequence screen; Space dismisses
  time += 1/60;
  tickClock();
  document.getElementById("scorebox").textContent = `Day ${getGameDay()} · ${getClockDisplay()} · $${getMoney()} · \u{1F366} ${pops}`;
  if(missionT > 0){ missionT--; document.getElementById("mission").style.opacity = missionT > 60 ? 1 : missionT/60; }

  /* player */
  let mx = (keys.KeyD||keys.ArrowRight?1:0) - (keys.KeyA||keys.ArrowLeft?1:0);
  let my = (keys.KeyS||keys.ArrowDown?1:0)  - (keys.KeyW||keys.ArrowUp?1:0);
  if(joy && (Math.abs(joy.dx) > 7 || Math.abs(joy.dy) > 7)){ mx = joy.dx/46; my = joy.dy/46; }
  if(towerState > 0){ mx = 0; my = 0; } // freeze movement while climbing or at top
  if(activityHoldT > 0){ mx = 0; my = 0; } // freeze while performing an activity
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
  if(player.wet > 0){ spd *= 0.65; player.wet--; } // sprinkler slowdown
  player.vx = mx*spd; player.vy = my*spd;
  moveActor(player, player.vx, player.vy, player.hop > 0);
  if(player.hop === 0){ const b = blocked(player.x, player.y, player.r, false); if(b && b.hop) player.hop = 4; }
  if(ml > 0){
    player.anim += spd*.045;
    if(Math.abs(mx) > .2) player.face = mx >= 0 ? 1 : -1;
    if(USE_SHEETS) player.dir = Math.abs(my) > Math.abs(mx) ? (my > 0 ? 0 : 3) : (mx >= 0 ? 2 : 1);
    if(frame % 9 === 0 && player.hop === 0) parts.push({x:player.x-mx*8, y:player.y+8, vx:0, vy:0, l:10, c:"rgba(205,184,160,.5)", s:PX});
  }

  /* ── INTERIOR MODE ─────────────────────────────────────── */
  if(insideMap !== null){
    if(doorCooldown > 0){ doorCooldown--; if(!doorCooldown) interactText = null; }
    // Check exits
    if(!isFading() && doorCooldown <= 0){
      for(const ex of INTERIORS[insideMap].exits){
        if(player.x+player.r > ex.x && player.x-player.r < ex.x+ex.w &&
           player.y+player.r > ex.y && player.y-player.r < ex.y+ex.h){
          startFade(() => exitInterior(ex)); break;
        }
      }
    }
    // Interactable proximity
    if(!doorCooldown) interactText = null;
    let _nearBed = false;
    let _nearActivity = false;
    for(const ia of INTERIORS[insideMap].interactables){
      if(Math.hypot(player.x-ia.x, player.y-ia.y) < ia.r + 14){
        if(ia.sleep && !isFading()){
          _nearBed = true;
          const upHeld = keys.KeyW || keys.ArrowUp;
          if(upHeld){
            sleepHoldT++;
            interactText = {txt:"Your bed", txt2:`Hold ↑ to sleep · Day ${getGameDay()+1} tomorrow`};
            if(sleepHoldT >= 22) startFade(doSleep);
          } else {
            sleepHoldT = Math.max(0, sleepHoldT - 2);
            interactText = {txt:"Your bed", txt2:"Hold ↑ to sleep"};
          }
          break;
        }
        if(ia.activity && !isFading()){
          _nearActivity = true;
          const act = ia.activity;
          if(!act.claimed){
            const upHeld = keys.KeyW || keys.ArrowUp;
            if(upHeld){
              activityHoldT++;
              const pct = Math.min(100, Math.floor(activityHoldT / act.durationFrames * 100));
              interactText = {txt:ia.txt, txt2:`${act.label} · ${pct}%`};
              if(activityHoldT >= act.durationFrames){
                act.claimed = true; earnMoney(act.pay); grantTrust(2);
                sfx.pickup();
                interactText = {txt:ia.txt, txt2:`${act.doneTxt}  · Trust: ${getTrustLevelName()}`};
                activityHoldT = 0;
              }
            } else {
              activityHoldT = Math.max(0, activityHoldT - 2);
              interactText = {txt:ia.txt, txt2:ia.txt2};
            }
          } else {
            activityHoldT = 0;
            interactText = {txt:ia.txt, txt2:'Done for today!'};
          }
          break;
        }
        if(ia.pickup && !ia.claimed){
          let ok = true;
          if(ia._key){
            try {
              if(typeof localStorage !== 'undefined'){
                if(localStorage.getItem(ia._key)) ok = false;
                else localStorage.setItem(ia._key,'1');
              }
            } catch(e){}
          }
          ia.claimed = true;
          if(ok){ pops++; player.stam=Math.min(100,player.stam+26); sfx.pickup(); ia.txt2="Popsicle! +1 🍦"; }
          else { ia.txt2="Already grabbed today's popsicle."; }
        }
        interactText = ia; break;
      }
    }
    if(!_nearBed) sleepHoldT = 0;
    if(!_nearActivity) activityHoldT = 0;
    // Interior NPCs face player; friend NPCs show proximity prompt
    for(const n of interiorNPCs){
      n.anim += .04;
      n.face = player.x >= n.x ? 1 : -1;
      if(USE_SHEETS) n.dir = player.x >= n.x ? 2 : 1;
      if(n.friendKey && !doorCooldown && !interactText && Math.hypot(player.x - n.x, player.y - n.y) < 80){
        const ok = canInteract(n.friendKey, getGameDay());
        interactText = { txt: n.name, txt2: `${getFriendLevelName(n.friendKey)}  ·  ${ok ? '[Space] Chat' : 'Already caught up today!'}` };
      }
    }
    return; // skip overworld logic
  }

  /* region banner — name set by loadSection; count down the timer */
  if(bannerT > 0) bannerT--;

  /* curfew check — fires once when the clock passes curfew time while outside */
  if(!curfewBroken && !isFading() && getClockMinutes() >= getCurfewMinutes()){
    curfewBroken = true;
    startFade(doCurfewBreak);
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
    let dSpd = 3.1 + Math.min(1.5, time * .012);
    if(dog.wet > 0){ dSpd *= 0.65; dog.wet--; } // sprinkler slows dog too
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

  /* sprinklers — oscillate sweep angle, apply wet to player + dog */
  for(const s of SPRINKLERS){
    s.a += s.spd * s.dir;
    if(s.a > s.max){ s.a = s.max; s.dir = -1; }
    else if(s.a < s.min){ s.a = s.min; s.dir = 1; }
    const check = (actor, isPlayer) => {
      const dx = actor.x - s.x, dy = actor.y - s.y;
      const d = Math.hypot(dx, dy);
      if(d < s.r && d > 8){
        let da = Math.atan2(dy, dx) - s.a;
        da = ((da % (Math.PI*2)) + Math.PI*3) % (Math.PI*2) - Math.PI;
        if(Math.abs(da) < 0.42){
          if(isPlayer && !actor.wet) burst(actor.x, actor.y, "rgba(120,200,255,.8)");
          actor.wet = 52;
        }
      }
    };
    check(player, true);
    if(dog.mode === "chase") check(dog, false);
  }
  /* catch ball — arc between two kids in the baseball outfield */
  catchBall.phase += 0.013 * catchBall.dir;
  if(catchBall.phase >= 1){ catchBall.phase = 1; catchBall.dir = -1; }
  else if(catchBall.phase <= 0){ catchBall.phase = 0; catchBall.dir = 1; }

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
  if(frame % 3200 === 1600){
    const tDist = Math.hypot(player.x - 3120, player.y - 6405);
    iceCreamTruck(tDist < 600 ? 0.028 : tDist < 1200 ? 0.018 : 0.012);
  }

  /* door detection (overworld) */
  if(doorCooldown > 0){ doorCooldown--; if(doorCooldown === 0) interactText = null; }
  if(!isFading() && doorCooldown <= 0){
    interactText = null;
    for(const d of doors){
      if(player.x+player.r > d.x && player.x-player.r < d.x+d.w &&
         player.y+player.r > d.y && player.y-player.r < d.y+d.h){
        if(d.target){
          startFade(() => enterInterior(d));
        } else {
          interactText = {txt: d.txt || "Locked.", txt2:"(knock knock)"};
          doorCooldown = 120;
        }
        break;
      }
    }
  }

  /* overworld activities (chores, jobs) */
  let _nearOActivity = false;
  for(const ia of activities){
    if(Math.hypot(player.x-ia.x, player.y-ia.y) < ia.r + 14){
      _nearOActivity = true;
      if(ia.activity && !isFading()){
        const act = ia.activity;
        if(!act.claimed){
          if(keys.KeyW || keys.ArrowUp){
            activityHoldT++;
            const pct = Math.min(100, Math.floor(activityHoldT / act.durationFrames * 100));
            interactText = {txt:ia.txt, txt2:`${act.label} · ${pct}%`};
            if(activityHoldT >= act.durationFrames){
              act.claimed = true; earnMoney(act.pay); grantTrust(2);
              sfx.pickup();
              interactText = {txt:ia.txt, txt2:`${act.doneTxt}  · Trust: ${getTrustLevelName()}`};
              activityHoldT = 0;
            }
          } else {
            activityHoldT = Math.max(0, activityHoldT - 2);
            interactText = {txt:ia.txt, txt2:ia.txt2};
          }
        } else {
          activityHoldT = 0;
          interactText = {txt:ia.txt, txt2:'Done for today!'};
        }
      }
      break;
    }
  }
  if(!_nearOActivity) activityHoldT = 0;

  /* friend NPC proximity — show level + chat prompt; no auto-grant */
  if(!doorCooldown && !activityHoldT){
    for(const n of npcs){
      if(!n.friendKey) continue;
      if(Math.hypot(player.x - n.x, player.y - n.y) < 80){
        const ok = canInteract(n.friendKey, getGameDay());
        interactText = { txt: n.name, txt2: `${getFriendLevelName(n.friendKey)}  ·  ${ok ? '[Space] Chat' : 'Already caught up today!'}` };
        break;
      }
    }
  }

  /* ── section boundary transitions ──────────────────────────── */
  if(!isFading() && doorCooldown <= 0 && insideMap === null){
    for(const t of MAPS[currentSection].transitions){
      if(player.x+player.r > t.x && player.x-player.r < t.x+t.w &&
         player.y+player.r > t.y && player.y-player.r < t.y+t.h){
        interactText = {txt: t.txt || 'Coming Soon!', txt2: t.txt2 || '(not open yet)'};
        doorCooldown = 120;
        break;
      }
    }
  }

  /* ── water tower climb state machine ───────────────────────── */
  const upHeld = keys.KeyW || keys.ArrowUp;
  const dnHeld = keys.KeyS || keys.ArrowDown;
  if(towerState === 0){
    const ld = Math.hypot(player.x - TOWER_LADDER_X, player.y - TOWER_LADDER_Y);
    if(ld < 38){
      if(dog.mode === "chase"){
        interactText = {txt:"Water Tower", txt2:"Too risky while Biscuit's chasing!"};
        towerClimbHold = 0;
      } else if(upHeld){
        towerClimbHold++;
        interactText = {txt:"Water Tower", txt2:"Hold ↑ to climb..."};
        if(towerClimbHold >= 22){ towerState = 1; towerT = 0; towerClimbHold = 0; interactText = null; }
      } else {
        interactText = {txt:"Water Tower", txt2:"Hold ↑ to climb"};
        towerClimbHold = Math.max(0, towerClimbHold - 2);
      }
    } else {
      towerClimbHold = 0;
    }
  } else if(towerState === 1){
    towerT++;
    const t1 = Math.min(1, towerT / 60);
    player.x = TOWER_LADDER_X; player.y = TOWER_LADDER_Y + (TOWER_TOP_Y - TOWER_LADDER_Y) * t1;
    towerZoom = t1;
    if(towerT >= 60) towerState = 2;
  } else if(towerState === 2){
    player.x = TOWER_LADDER_X; player.y = TOWER_TOP_Y;
    towerZoom = 1;
    interactText = {txt:"Water Tower Overlook", txt2:"Hold ↓ to climb down"};
    if(!vistaSeen){ vistaSeen = true; vistaText = 300; }
    if(vistaText > 0) vistaText--;
    if(dnHeld){ towerState = 3; towerT = 0; }
  } else if(towerState === 3){
    towerT++;
    const t3 = Math.min(1, towerT / 60);
    player.x = TOWER_LADDER_X; player.y = TOWER_TOP_Y + (TOWER_LADDER_Y - TOWER_TOP_Y) * t3;
    towerZoom = 1 - t3;
    if(towerT >= 60){ towerState = 0; towerZoom = 0; }
  }

  document.getElementById("dogfill").style.transform = "scaleX(" +
    (dog.mode === "sleep" ? 0 : clamp(1 - (ddRaw-26)/520, 0, 1)) + ")";
  document.getElementById("stamfill").style.transform = "scaleX(" + (player.stam/100) + ")";
}

export function draw(){
  /* ── INTERIOR PATH ─────────────────────────────────────────────── */
  if(insideMap !== null){
    const interior = INTERIORS[insideMap];
    const iox = Math.floor((VW - interior.w) / 2);
    const ioy = Math.floor((VH - interior.h) / 2);
    cam.x = -iox; cam.y = -ioy;

    // Letterbox bars outside the interior bounds
    ctx.fillStyle = "#0a0812";
    if(ioy > 0){ ctx.fillRect(0, 0, VW, ioy); ctx.fillRect(0, VH - ioy, VW, ioy); }
    if(iox > 0){ ctx.fillRect(0, 0, iox, VH); ctx.fillRect(VW - iox, 0, iox, VH); }

    // Floor — solid base + light grid lines (planks for house, tiles for mart)
    ctx.fillStyle = interior.bg;
    ctx.fillRect(iox, ioy, interior.w, interior.h);
    ctx.fillStyle = "rgba(0,0,0,0.07)";
    const ls = interior.name === "Your House" ? 24 : 32;
    for(let lx = iox; lx < iox + interior.w; lx += ls) ctx.fillRect(lx, ioy, 2, interior.h);
    for(let ly = ioy; ly < ioy + interior.h; ly += ls) ctx.fillRect(iox, ly, interior.w, 2);

    drawShadows(interior.walls);

    // Exit door strip (gold, at bottom of exit rect)
    for(const ex of interior.exits){
      ctx.fillStyle = "rgba(255,196,77,.45)";
      ctx.fillRect(snap(ex.x - cam.x), snap(ex.y + ex.h - 6 - cam.y), ex.w, 6);
    }

    // Interactable pulse rings
    for(const ia of interior.interactables){
      const pulse = .5 + .3 * Math.sin(frame * .1);
      ctx.beginPath();
      ctx.arc(snap(ia.x - cam.x), snap(ia.y - cam.y), 8 + Math.sin(frame * .1) * 2, 0, 7);
      ctx.strokeStyle = `rgba(255,196,77,${pulse})`;
      ctx.lineWidth = PX;
      ctx.stroke();
    }

    // Y-sorted entities (interior walls + NPCs + player)
    const ients = [];
    for(const w of interior.walls) ients.push({y: w.y + w.h, f: () => drawWall(w, frame)});
    for(const n of interiorNPCs) ients.push({y: n.y, f: () => drawNPC(n, frame)});
    ients.push({y: player.y + 1, f: () => drawPlayer(player, frame)});
    ients.sort((a,b) => a.y - b.y);
    for(const e of ients) e.f();

    drawDuskWash();
    drawSpeechBubbles(interiorNPCs, player, frame);
    if(interactText) _drawInteractOverlay(interactText);
    drawFade(ctx, VW, VH);
    return;
  }

  /* ── OVERWORLD PATH ────────────────────────────────────────────── */
  // Tower zoom: towerZoom 0→1 pulls camera back 28% at peak (scale 1.0→0.72)
  const vZoom = 1 - towerZoom * 0.28;
  const effW = VW / vZoom, effH = VH / vZoom;
  const _sm = MAPS[currentSection];
  cam.x = clamp(player.x - effW/2, 0, Math.max(0, _sm.w - effW));
  cam.y = clamp(player.y - effH/2 - towerZoom * 60, 0, Math.max(0, _sm.h - effH));

  ctx.save();
  if(towerZoom > 0.001) ctx.scale(vZoom, vZoom);
  drawChunks(ctx, cam.x, cam.y);
  evictChunks(cam.x, cam.y);

  /* lake foam shimmer (water edge y≈6490, x=2560..7936) */
  if(inView(2560, 6465, 5376, 40)){
    for(let i=0;i<9;i++){
      const sx = 2700 + Math.sin(frame*.018 + i*2.1)*2200;
      ctx.fillStyle = "rgba(255,255,255," + (.06 + .05*Math.sin(frame*.04+i)) + ")";
      ctx.fillRect(snap(sx-cam.x), snap(6488-cam.y), 32, PX);
    }
  }

  /* pond shimmer (park pond: centre 3200,2750) */
  if(inView(2964, 2620, 472, 260)){
    for(let i=0;i<7;i++){
      const sx = 3200 + Math.sin(frame*.02 + i*1.7)*160*Math.cos(i);
      const sy = 2750 + Math.cos(frame*.017 + i*2.3)*78*Math.sin(i*1.3);
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
  // Catch ball — arcs between two kids in the baseball outfield
  if(inView(catchBall.ax - 20, catchBall.ay - 50, (catchBall.bx - catchBall.ax) + 40, 70)){
    const t = catchBall.phase;
    const cx = catchBall.ax + (catchBall.bx - catchBall.ax) * t;
    const gY = catchBall.ay + (catchBall.by - catchBall.ay) * t;
    const arcY = gY - Math.sin(t * Math.PI) * 40; // arc peaks north
    const sh = 1 - Math.sin(t * Math.PI);         // shadow shrinks at peak
    ents.push({y: gY, f: () => {
      // shadow (on ground)
      ctx.fillStyle = `rgba(0,0,0,${(0.28 * sh).toFixed(2)})`;
      ctx.beginPath(); ctx.arc(snap(cx-cam.x), snap(gY-cam.y), Math.max(2, (6*sh)|0), 0, 7); ctx.fill();
      // ball (arc position)
      ctx.fillStyle = "#d49a50";
      ctx.beginPath(); ctx.arc(snap(cx-cam.x), snap(arcY-cam.y), 5, 0, 7); ctx.fill();
      ctx.strokeStyle = "#a06030"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(snap(cx-cam.x), snap(arcY-cam.y), 5, 0, 7); ctx.stroke();
      ctx.strokeStyle = "#cc4444"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(snap(cx-cam.x), snap(arcY-cam.y), 3, 0.3, 1.1); ctx.stroke();
      ctx.beginPath(); ctx.arc(snap(cx-cam.x), snap(arcY-cam.y), 3, Math.PI+.3, Math.PI+1.1); ctx.stroke();
    }});
  }
  ents.sort((a,b) => a.y - b.y);
  for(const e of ents) e.f();

  /* sprinkler spray — drawn after entities so mist overlays the scene */
  for(const s of SPRINKLERS){
    if(!inView(s.x - 110, s.y - 110, 220, 220)) continue;
    for(let i = 0; i < 14; i++){
      const t = ((frame * 0.06 + i / 14) % 1);
      const ang = s.a + (i / 14 - 0.5) * 0.78;
      const dist = t * s.r;
      const wx = s.x + Math.cos(ang) * dist;
      const wy = s.y + Math.sin(ang) * dist;
      const alpha = (0.48 * t * (1 - t * 0.55)).toFixed(2);
      ctx.fillStyle = `rgba(120,200,255,${alpha})`;
      ctx.fillRect(snap(wx - cam.x), snap(wy - cam.y), PX + 1, PX + 1);
    }
    // Sprinkler head
    ctx.fillStyle = "#6a7a70";
    ctx.fillRect(snap(s.x - 3 - cam.x), snap(s.y - 3 - cam.y), 6, 6);
  }

  drawCanopies(canopies, frame);
  drawFireflies(flies, frame);
  drawLamps(lamps);
  drawSpeechBubbles(npcs, player, frame);
  ctx.restore(); // end world-space scale transform (tower zoom)
  drawDuskWash();
  drawMinimap(player, dog);
  drawBiscuitArrow(dog, state);

  if(interactText) _drawInteractOverlay(interactText);

  /* water tower vista — one-time flavor text on first visit to the top */
  if(vistaText > 0 && !isFading()){
    const va = vistaText > 260 ? (300-vistaText)/40 : vistaText > 40 ? 1 : vistaText/40;
    ctx.save();
    ctx.globalAlpha = va;
    ctx.fillStyle = "rgba(27,20,48,0.80)";
    ctx.fillRect(VW/2-246, VH*0.80, 492, 36);
    ctx.globalAlpha = va;
    ctx.fillStyle = "#ffe9c2";
    ctx.font = "italic 11px monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText('"You can see your whole summer from here."', VW/2, VH*0.80+18);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.restore();
  }

  /* region name banner (ALttP-style fade) */
  if(bannerT > 0 && regionName){
    const alpha = bannerT > 200 ? (240-bannerT)/40 : bannerT > 40 ? 1 : bannerT/40;
    ctx.save();
    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = '#1b1430';
    ctx.fillRect(VW/2-150, VH*0.2, 300, 40);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffe9c2';
    ctx.font = '900 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(regionName, VW/2, VH*0.2+20);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  drawFade(ctx, VW, VH);
  if(curfewMsg) _drawCurfewOverlay();
}

function _drawCurfewOverlay(){
  const cx = VW / 2, cy = VH / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.94)';
  ctx.fillRect(0, 0, VW, VH);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff6b57'; ctx.font = 'bold 16px monospace';
  ctx.fillText(curfewMsg.line1, cx, cy - 48);
  ctx.fillStyle = '#ffe9c2'; ctx.font = '12px monospace';
  ctx.fillText(curfewMsg.line2, cx, cy - 18);
  ctx.fillStyle = '#ffc44d'; ctx.font = '11px monospace';
  ctx.fillText(curfewMsg.line3, cx, cy + 14);
  ctx.fillStyle = 'rgba(255,233,194,0.55)'; ctx.font = '11px monospace';
  ctx.fillText(curfewMsg.line4, cx, cy + 50);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

function _drawInteractOverlay(ia){
  const bw = 290, bh = ia.txt2 ? 56 : 34;
  const bx = VW/2 - bw/2, by = VH * 0.72;
  ctx.save();
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = '#1b1430';
  ctx.fillRect(bx, by, bw, bh);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffc44d';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ia.txt, VW/2, by + 14);
  if(ia.txt2){
    ctx.fillStyle = '#ffe9c2';
    ctx.font = '11px monospace';
    ctx.fillText(ia.txt2, VW/2, by + 38);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

export function init(){
  cv = document.getElementById("game");
  ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  fit();
  addEventListener("resize", fit);

  document.getElementById("daylabel").textContent = "Day " + getGameDay() + " · Maple Court";

  initDraw(ctx, cam);

  if(USE_SHEETS){ buildSheets(); buildTileset(); }
  buildMap(); resetRun();

  setupKeyboard(
    () => {
      if(curfewMsg){ curfewMsg = null; return; }
      if(state === "title") start(); else if(state === "run") talkToNearestFriend() || tryHop();
    },
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

  document.getElementById("btnHop").addEventListener("pointerdown", e => { e.preventDefault(); if(curfewMsg){ curfewMsg = null; return; } if(state==="run") talkToNearestFriend() || tryHop(); else start(); });
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
export const getInsideMap = () => insideMap;
export const getDoorCooldown = () => doorCooldown;
export const getActivityHoldT = () => activityHoldT;
export function startRun(){ start(); }
export function stepFrame(){ update(); draw(); }
