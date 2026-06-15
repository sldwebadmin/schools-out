import { existsSync } from 'fs';

/* ── DOM / canvas stubs ──────────────────────────────────────────── */
const noop = () => {};
const mockCtx = {
  imageSmoothingEnabled: false,
  fillStyle: '', strokeStyle: '', font: '', textBaseline: '',
  lineWidth: 1, globalAlpha: 1,
  fillRect: noop, strokeRect: noop, clearRect: noop,
  beginPath: noop, arc: noop, ellipse: noop, moveTo: noop, lineTo: noop,
  rect: noop, clip: noop,  // needed for chunk clipping
  fill: noop, stroke: noop, closePath: noop,
  drawImage: noop, save: noop, restore: noop, translate: noop, rotate: noop,
  fillText: noop, measureText: () => ({ width: 0 }),
  setLineDash: noop,
  createRadialGradient: () => ({ addColorStop: noop }),
  createLinearGradient: () => ({ addColorStop: noop }),
};

function makeMockEl(){
  const el = {
    classList: { toggle: noop, add: noop, remove: noop },
    style: {}, textContent: '',
    addEventListener: noop, setPointerCapture: noop,
  };
  el.firstChild = el;
  return el;
}

function makeMockCanvas(){
  return {
    width: 0, height: 0, style: {},
    getContext: () => mockCtx,
    setPointerCapture: noop,
    addEventListener: noop,
  };
}

global.document = {
  getElementById: id => id === 'game' ? makeMockCanvas() : makeMockEl(),
  createElement: () => makeMockCanvas(),
};
global.window = {};
global.innerWidth = 1920;
global.innerHeight = 1080;
global.requestAnimationFrame = noop;
global.addEventListener = noop;
global.AudioContext = undefined;
global.webkitAudioContext = undefined;

/* ── Import game (stubs must be set up first) ────────────────────── */
const { init, startRun, stepFrame, keys, player, dog, getState, getInsideMap, getDoorCooldown, getActivityHoldT } =
  await import('../src/main.js');

/* ── Simulate gameplay ───────────────────────────────────────────── */
const errors = [];

try {
  init();

  if(typeof startRun !== 'function') throw new Error('startRun export missing');
  if(typeof stepFrame !== 'function') throw new Error('stepFrame export missing');
  if(typeof keys !== 'object')       throw new Error('keys export missing');
  if(typeof player !== 'object')     throw new Error('player export missing');
  if(typeof dog !== 'object')        throw new Error('dog export missing');

  startRun();

  if(getState() !== 'run') errors.push('State should be "run" after startRun()');

  // Phase 1: run north from SPAWN (4096,7680) through neighbourhood toward park (30 sec)
  keys.KeyW = true;
  keys.KeyD = false;
  for(let i = 0; i < 1800; i++) stepFrame();

  // Phase 2: sprint for 5 sec
  keys.ShiftLeft = true;
  for(let i = 0; i < 300; i++) stepFrame();
  keys.ShiftLeft = false;

  // Phase 3: teleport near NAPS[0] (doghouse, local 920,1176) — 200px west, within 240px wake radius
  player.x = 720; player.y = 1176;
  keys.KeyA = true; keys.KeyW = false; keys.KeyD = false; // run west (away from dog)
  for(let i = 0; i < 600; i++) stepFrame();
  keys.KeyA = false;

  // Phase 4: run around neighborhood (goal is in school section, not reachable yet)
  player.x = 1958; player.y = 500;
  keys.KeyW = true; keys.KeyD = false;
  for(let i = 0; i < 2700; i++) stepFrame();

  console.log(`Dog mode: ${dog.mode}, state: ${getState()}, player: (${player.x|0},${player.y|0})`);
  console.log('Gameplay simulation: 5400 frames completed without runtime error');

  // Phase 5: interior enter/exit cycle
  // House door at local (270,2200,64,22). Stand just south of it.
  startRun(); // reset to overworld — resets doorCooldown to 0
  player.x = 302; player.y = 2228;
  keys.KeyW = false; keys.KeyS = false; keys.KeyA = false; keys.KeyD = false;
  console.log(`Phase 5 start: state=${getState()}, doorCooldown=${getDoorCooldown()}`);
  // Step enough frames for: any leftover doorCooldown (max 120) + fade-out (30) + fade-in (30)
  for(let i = 0; i < 200; i++) stepFrame();
  if(getInsideMap() !== 'house') errors.push(`Expected insideMap='house' after entering door, got '${getInsideMap()}' (doorCooldown was ${getDoorCooldown()})`);
  else console.log('Interior enter: OK (house)');

  // Walk south to exit (exit at y=330, player spawns at y=200 inside house 360px tall)
  keys.KeyS = true;
  for(let i = 0; i < 180; i++) stepFrame();
  keys.KeyS = false;
  if(getInsideMap() !== null) errors.push(`Expected insideMap=null after exiting, got '${getInsideMap()}'`);
  else console.log('Interior exit: OK (back on overworld)');

  // Phase 6: clock system — sleep advances the day counter
  const { getGameDay, sleep: clockSleepFn, getClockDisplay, getDayPart, advanceClock, getClockMinutes } =
    await import('../src/engine/clock.js');
  const dayBefore = getGameDay();
  clockSleepFn();
  if(getGameDay() !== dayBefore + 1)
    errors.push(`sleep() should advance day by 1: ${dayBefore} → ${dayBefore+1}, got ${getGameDay()}`);
  else console.log(`Clock: ${getClockDisplay()}, day-part: ${getDayPart().name}, game day: ${getGameDay()}`);

  // Phase 7: money system — earn API, clock advance, in-game chore
  const { getMoney, earnMoney } = await import('../src/engine/money.js');
  const balBefore = getMoney();
  earnMoney(10);
  if(getMoney() !== balBefore + 10)
    errors.push(`earnMoney(10): expected $${balBefore+10}, got $${getMoney()}`);
  else console.log(`Money API: $${getMoney()} after earn $10`);

  const minBefore = getClockMinutes();
  advanceClock(30);
  if(getClockMinutes() !== minBefore + 30)
    errors.push(`advanceClock(30): expected ${minBefore+30} min, got ${getClockMinutes()}`);
  else console.log(`Clock advance: +30 min, now ${getClockMinutes()} min from midnight`);

  // In-game: enter house, complete Wash Dishes chore (240 frames), verify +$5
  startRun();
  player.x = 302; player.y = 2228;
  keys.KeyW = false; keys.KeyS = false; keys.KeyA = false; keys.KeyD = false;
  for(let i = 0; i < 200; i++) stepFrame(); // enter house (fade 30 + margin 140)
  if(getInsideMap() !== 'house'){
    errors.push(`Phase 7 chore setup: expected inside house, got '${getInsideMap()}'`);
  } else {
    player.x = 150; player.y = 215; // kitchen sink
    const choreMoney = getMoney();
    keys.ArrowUp = true;
    for(let i = 0; i < 260; i++) stepFrame();
    keys.ArrowUp = false;
    console.log(`Chore debug: activityHoldT=${getActivityHoldT()}, player=(${player.x|0},${player.y|0}), money=${getMoney()}`);
    if(getMoney() !== choreMoney + 5)
      errors.push(`Wash dishes: expected +$5, balance $${getMoney()} (was $${choreMoney})`);
    else console.log(`Chore: Wash Dishes done, +$5 (balance: $${getMoney()})`);
  }

  // Phase 8: friendship system — once-per-day cooldown and level thresholds
  const { grantFriendship, canInteract, getFriendship, getFriendLevel, getFriendLevelName } =
    await import('../src/engine/friends.js');

  // First talk: should succeed
  const ok1 = grantFriendship('test_npc', 'talk', 3, 100);
  if(!ok1) errors.push('First talk: expected granted, got blocked');
  if(getFriendship('test_npc') !== 3)
    errors.push(`After first talk: expected 3pts, got ${getFriendship('test_npc')}`);

  // Second talk same day: blocked by cooldown
  const ok2 = grantFriendship('test_npc', 'talk', 3, 100);
  if(ok2) errors.push('Second talk same day: expected blocked, got granted');
  if(getFriendship('test_npc') !== 3)
    errors.push(`After blocked talk: expected still 3pts, got ${getFriendship('test_npc')}`);

  // Next day: should succeed
  const ok3 = grantFriendship('test_npc', 'talk', 3, 101);
  if(!ok3) errors.push('Next-day talk: expected granted, got blocked');
  if(getFriendship('test_npc') !== 6)
    errors.push(`After next-day talk: expected 6pts, got ${getFriendship('test_npc')}`);

  // Level thresholds: push to 10 → Acquaintance, 30 → Casual Friend, 60 → Close Friend, 90 → Best Friend
  grantFriendship('test_npc', 'talk', 100, 102); // caps at 100
  if(getFriendship('test_npc') > 100)
    errors.push(`Friendship cap: expected ≤100, got ${getFriendship('test_npc')}`);
  if(getFriendLevelName('test_npc') !== 'Best Friend')
    errors.push(`Level at 100pts: expected Best Friend, got ${getFriendLevelName('test_npc')}`);

  // canInteract reflects cooldown correctly
  if(!canInteract('fresh_npc', 100)) errors.push('New NPC: expected interactable');
  grantFriendship('fresh_npc', 'talk', 3, 100);
  if(canInteract('fresh_npc', 100)) errors.push('After grant: expected NOT interactable same day');
  if(!canInteract('fresh_npc', 101)) errors.push('Next day: expected interactable again');

  console.log(`Friendship: test_npc=${getFriendship('test_npc')} (${getFriendLevelName('test_npc')}), talk ok1=${ok1} ok2=${ok2} ok3=${ok3}`);

  // Phase 9: trust system — levels, curfew threshold, chore gain, penalty, forfeit
  const { grantTrust, penalizeTrust, getTrust, getTrustLevelName, getCurfewMinutes } =
    await import('../src/engine/trust.js');
  const { snapshotDayBalance, forfeitDayEarnings } = await import('../src/engine/money.js');

  // Starts at 15 → Wary
  if(getTrustLevelName() !== 'Wary')
    errors.push(`Trust init: expected Wary, got ${getTrustLevelName()}`);

  // +15 → 30 → Trusted; curfew extends to 1470
  grantTrust(15);
  if(getTrustLevelName() !== 'Trusted')
    errors.push(`Trust +15: expected Trusted, got ${getTrustLevelName()}`);
  if(getCurfewMinutes() !== 1470)
    errors.push(`Curfew at Trusted: expected 1470, got ${getCurfewMinutes()}`);

  // Penalty -10 → 20 → Wary; curfew back to 1440
  penalizeTrust(10);
  if(getTrustLevelName() !== 'Wary')
    errors.push(`Trust -10: expected Wary, got ${getTrustLevelName()}`);
  if(getCurfewMinutes() !== 1440)
    errors.push(`Curfew at Wary: expected 1440, got ${getCurfewMinutes()}`);

  // Forfeit: earn money then restore to snapshot
  snapshotDayBalance();
  const balSnap = getMoney();
  earnMoney(30);
  forfeitDayEarnings();
  if(getMoney() !== balSnap)
    errors.push(`Forfeit: expected ${balSnap}, got ${getMoney()}`);

  console.log(`Trust: ${getTrustLevelName()} (${getTrust()}pts), curfew=${getCurfewMinutes()}`);

} catch(e) {
  errors.push('Runtime error: ' + e.message + '\n' + (e.stack || ''));
}

/* ── Chunk system assertions ─────────────────────────────────────────── */
try {
  const { getCacheSize, getCachedKeys } = await import('../src/world/chunks.js');
  const sz = getCacheSize();
  if(sz < 1) errors.push('Chunk cache is empty — no chunks were loaded during gameplay');
  if(sz > 12) errors.push(`Chunk cache exceeded limit: ${sz} chunks (max 12)`);
  const keys = getCachedKeys();
  // Verify cache contains only valid "cx,cy" keys
  for(const k of keys){
    if(!/^\d+,\d+$/.test(k)) errors.push(`Invalid chunk key in cache: "${k}"`);
  }
  console.log(`Chunk cache: ${sz} chunks loaded (keys: ${keys.join(' ')})`);
} catch(e) {
  errors.push('Runtime error: ' + e.message + '\n' + (e.stack || ''));
}

/* ── Module file structure ───────────────────────────────────────── */
const required = [
  'index.html', 'styles.css', 'src/main.js',
  'src/engine/constants.js', 'src/engine/utils.js', 'src/engine/clock.js', 'src/engine/money.js', 'src/engine/friends.js', 'src/engine/trust.js',
  'src/engine/collision.js', 'src/engine/input.js',
  'src/engine/spatialgrid.js', 'src/engine/transition.js',
  'src/audio/synth.js',
  'src/world/map.js', 'src/world/bake.js', 'src/world/minimap.js',
  'src/world/maps/neighborhood.js', 'src/world/maps/index.js',
  'src/world/chunks.js', 'src/world/tiledata.js', 'src/world/interiorMaps.js',
  'src/world/tilecache.js', 'src/world/tilerender.js',
  'src/entities/npcs.js', 'src/entities/pickups.js',
  'src/entities/player.js', 'src/entities/dog.js',
  'src/render/draw.js', 'src/render/props.js', 'src/render/buildsprites.js',
  'src/render/sheet.js', 'src/render/sprites.js', 'src/render/lighting.js',
  'src/ui/hud.js', 'src/ui/overlays.js',
];
for(const f of required){
  if(!existsSync(f)) errors.push('Missing file: ' + f);
}

/* ── Results ─────────────────────────────────────────────────────── */
if(errors.length){
  console.error('TEST FAILED:');
  errors.forEach(e => console.error('  ✗', e));
  process.exit(1);
} else {
  console.log('All tests passed.');
}
