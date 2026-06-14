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
const { init, startRun, stepFrame, keys, player, dog, getState, getInsideMap } =
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
  // House door at local (1363,2304,64,22). Stand just south of it.
  startRun(); // reset to overworld
  player.x = 1395; player.y = 2331;
  keys.KeyW = false; keys.KeyS = false; keys.KeyA = false; keys.KeyD = false;
  // Step enough frames for fade-out (30) + swap + fade-in (30) = 60 frames
  for(let i = 0; i < 90; i++) stepFrame();
  if(getInsideMap() !== 'house') errors.push(`Expected insideMap='house' after entering door, got '${getInsideMap()}'`);
  else console.log('Interior enter: OK (house)');

  // Walk south to exit (exit at y=330, player spawns at y=200 inside house 360px tall)
  keys.KeyS = true;
  for(let i = 0; i < 180; i++) stepFrame();
  keys.KeyS = false;
  if(getInsideMap() !== null) errors.push(`Expected insideMap=null after exiting, got '${getInsideMap()}'`);
  else console.log('Interior exit: OK (back on overworld)');

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
  'src/engine/constants.js', 'src/engine/utils.js',
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
