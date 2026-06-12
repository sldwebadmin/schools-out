import { existsSync } from 'fs';

/* ── DOM / canvas stubs ──────────────────────────────────────────── */
const noop = () => {};
const mockCtx = {
  imageSmoothingEnabled: false,
  fillStyle: '', strokeStyle: '', font: '', textBaseline: '',
  lineWidth: 1, globalAlpha: 1,
  fillRect: noop, strokeRect: noop, clearRect: noop,
  beginPath: noop, arc: noop, ellipse: noop, moveTo: noop, lineTo: noop,
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
const { init, startRun, stepFrame, keys, player, dog, getState } =
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

  // Phase 1: run north-east toward goal area (30 sec)
  keys.KeyW = true;
  keys.KeyD = true;
  for(let i = 0; i < 1800; i++) stepFrame();

  // Phase 2: sprint for 5 sec
  keys.ShiftLeft = true;
  for(let i = 0; i < 300; i++) stepFrame();
  keys.ShiftLeft = false;

  // Phase 3: teleport near NAPS[0] {x:2450, y:1950} to wake Biscuit (10 sec)
  // Place player 200px west — within the 240px wake radius
  player.x = 2250; player.y = 1950;
  keys.KeyA = true; keys.KeyW = false; keys.KeyD = false; // run west (away from dog)
  for(let i = 0; i < 600; i++) stepFrame();
  keys.KeyA = false;

  // Phase 4: continue north toward goal if still running (45 sec)
  player.x = 1950; player.y = 1200;
  keys.KeyW = true; keys.KeyD = false;
  for(let i = 0; i < 2700; i++) stepFrame();

  console.log(`Dog mode: ${dog.mode}, state: ${getState()}, player: (${player.x|0},${player.y|0})`);
  console.log('Gameplay simulation: 5400 frames completed without runtime error');

} catch(e) {
  errors.push('Runtime error: ' + e.message + '\n' + (e.stack || ''));
}

/* ── Module file structure ───────────────────────────────────────── */
const required = [
  'index.html', 'styles.css', 'src/main.js',
  'src/engine/constants.js', 'src/engine/utils.js',
  'src/engine/collision.js', 'src/engine/input.js',
  'src/audio/synth.js',
  'src/world/map.js', 'src/world/bake.js', 'src/world/minimap.js',
  'src/entities/npcs.js', 'src/entities/pickups.js',
  'src/entities/player.js', 'src/entities/dog.js',
  'src/render/draw.js', 'src/render/props.js',
  'src/render/sprites.js', 'src/render/lighting.js',
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
