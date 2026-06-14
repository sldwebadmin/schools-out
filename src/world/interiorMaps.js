// Interior map definitions for player's house, Maple Mart, and Snack Shack.
// Coordinate system is local to each interior (origin 0,0).
// Walls, exits, and interactables are in interior-local pixels.

import { DAY_NUM, DAY_SEED } from '../engine/constants.js';

const CHALLENGES = [
  "Collect 5 popsicles on a run",
  "Reach the school in under 2 minutes",
  "Outrun Biscuit without being spotted",
];
const _todayChallenge = CHALLENGES[DAY_SEED % CHALLENGES.length];
let _tbest = 0;
try { if(typeof localStorage !== 'undefined') _tbest = parseInt(localStorage.getItem('schools_best') || '0') || 0; } catch(e){}

function W(x,y,w,h,type='hedge',o={}){
  return Object.assign({x,y,w,h,type,hop:false,ghost:false},o);
}

// ── PLAYER'S HOUSE (480×360) ─────────────────────────────────────────
// Layout: bedroom in north half, kitchen(west)+living(east) in south half
// Exit: gap in south wall at x=208..272

const HOUSE_WALLS = [
  // Border — north, east, west solid; south has door gap
  W(0,0,480,20),
  W(0,0,20,360),
  W(460,0,20,360),
  W(0,340,208,20), W(272,340,208,20),   // south wall with door gap 208..272
  // Interior partition (bedroom vs living), gap at 200..280
  W(0,160,200,20), W(280,160,180,20),
  // Bedroom furniture (hop-over)
  W(30,30,130,70,'house',{hop:true,hue:'#2e4a8a',trim:'#ffe9c2'}),  // bed
  W(330,30,110,70,'house',{hop:true,hue:'#5a3a20',trim:'#8a6f3e'}), // bookshelf
  W(240,30,60,40,'table',{hop:true}),                                // desk
  // Kitchen furniture
  W(30,185,60,80,'house',{hop:true,hue:'#6a6a6a',trim:'#ffe9c2'}),  // fridge
  W(100,200,100,50,'table',{hop:true}),                              // kitchen table
  // Living room
  W(280,185,150,70,'house',{hop:true,hue:'#3a5a7a',trim:'#ffe9c2'}), // sofa
];

// ── MAPLE MART (640×480) ─────────────────────────────────────────────
// Layout: freezer across north, 3 aisles center, checkout south
// Exit: gap in south wall at x=288..352

const MART_WALLS = [
  // Border
  W(0,0,640,20),
  W(0,0,20,480),
  W(620,0,20,480),
  W(0,460,288,20), W(352,460,288,20),   // south wall with exit gap 288..352
  // Freezer counter across north
  W(20,20,260,50,'market'), W(360,20,260,50,'market'),  // gap at x=280..360
  // Aisle shelves (3 rows, gap in center for passage)
  W(20,140,260,36,'market'), W(380,140,240,36,'market'),
  W(20,220,260,36,'market'), W(380,220,240,36,'market'),
  W(20,300,260,36,'market'), W(380,300,240,36,'market'),
  // Checkout counter
  W(20,380,260,40,'table',{hop:true}), W(360,380,260,40,'table',{hop:true}),
];

// ── TREEHOUSE CLUB HQ (480×300) ──────────────────────────────────────
// Layout: mission board + score board on north wall, open floor, exit south
// Exit: gap in south wall at x=208..272

const TREEHOUSE_WALLS = [
  W(0,0,480,20),
  W(0,0,20,300),
  W(460,0,20,300),
  W(0,280,208,20), W(272,280,208,20),   // south wall with exit gap 208..272
  // Board panels on north wall
  W(30,20,180,30,'market'),             // mission board
  W(250,20,200,30,'market'),            // score board
  // Floor furniture
  W(50,130,60,50,'house',{hop:true,hue:'#ff6b57',trim:'#ffe9c2'}),   // beanbag red
  W(140,130,60,50,'house',{hop:true,hue:'#57b8ff',trim:'#ffe9c2'}),  // beanbag blue
  W(300,120,140,60,'table',{hop:true}),                               // club table
];

// ── SNACK SHACK (320×240) ────────────────────────────────────────────
// Layout: service counter north, open floor, exit south
// Exit: gap in south wall at x=128..192

const SHACK_WALLS = [
  W(0,0,320,20),
  W(0,0,20,240),
  W(300,0,20,240),
  W(0,220,128,20), W(192,220,128,20),   // south wall with exit gap 128..192
  // Service counter
  W(20,50,200,40,'market'),
  // Popsicle cooler (right side of counter)
  W(240,55,50,35,'house',{hop:true,hue:'#3a7a8a',trim:'#ffe9c2'}),
];

export const INTERIORS = {
  treehouse_hq: {
    name: "Treehouse Club HQ",
    w: 480, h: 300,
    bg: "#5a3e28",
    walls: TREEHOUSE_WALLS,
    exits: [
      { x:208, y:270, w:64, h:30, worldTarget:{x:1140, y:3262} },
    ],
    interactables: [
      { x:120, y:35, r:80, txt:"Mission Board", txt2:`Today: ${_todayChallenge}` },
      { x:350, y:35, r:80, txt:"Score Board",   txt2:_tbest > 0 ? `Best: ${_tbest} pts` : "No score yet — go run!" },
      { x:320, y:150, r:50, txt:"Club Table",   txt2:"Meet here daily at noon." },
    ],
    npcs: [
      { kind:"kid", variant:2, wps:[[240,105]], spd:0,
        shirt:"#a78bdb", hair:"#2b2118",
        lines:["Welcome to the club!","Check the mission board!","We meet every day up here!"] },
    ],
  },
  house: {
    name: "Your House",
    w: 480, h: 360,
    bg: "#4a3828",          // warm wood floor base
    walls: HOUSE_WALLS,
    exits: [
      { x:208, y:330, w:64, h:30, worldTarget:{x:1395, y:2348} }, // neighborhood-local
    ],
    interactables: [
      { x:95,  y:65,  r:52, txt:"Your bed.",           txt2:"Nap later — it's summer!" },
      { x:385, y:65,  r:52, txt:"Bookshelf",           txt2:"‘Summer Reading’ — still blank." },
      { x:60,  y:225, r:46, txt:"Fridge",              txt2:"Leftover pizza. Classic." },
      { x:270, y:50,  r:40, txt:"Desk calendar",       txt2:`Day ${DAY_NUM} of summer break.` },
    ],
    npcs: [],
  },
  mart: {
    name: "Maple Mart",
    w: 640, h: 480,
    bg: "#cfc6e8",          // white-ish tile floor
    walls: MART_WALLS,
    exits: [
      { x:288, y:450, w:64, h:30, worldTarget:{x:6640, y:3355} },
    ],
    interactables: [
      { x:155, y:45,  r:56, txt:"Freezer",             txt2:"Free daily popsicle — take one!", pickup:"pop", _key:`mart_pop_${DAY_SEED}` },
      { x:500, y:45,  r:52, txt:"Bulletin Board",      txt2:"Lost: 1 dog. Answers to Biscuit." },
      { x:320, y:320, r:42, txt:"Cart Return",         txt2:"Courtesy counts." },
    ],
    npcs: [
      { kind:"kid", variant:2, wps:[[320,418]], spd:0,
        shirt:"#ff8f57", hair:"#2b2118",
        lines:["Fresh stock daily!","Try the freezer section!","Have a great summer!"] },
    ],
  },
  snackshack: {
    name: "Snack Shack",
    w: 320, h: 240,
    bg: "#b8966e",
    walls: SHACK_WALLS,
    exits: [
      { x:128, y:210, w:64, h:30, worldTarget:{x:6650, y:6472} },
    ],
    interactables: [
      { x:265, y:72, r:42, txt:"Popsicle Cooler", txt2:"Free daily beach popsicle — take one!", pickup:"pop", _key:`shack_pop_${DAY_SEED}` },
      { x:110, y:70, r:40, txt:"Menu Board",      txt2:"Corn dog · Nachos · Lemonade" },
    ],
    npcs: [
      { kind:"kid", variant:0, wps:[[160,120]], spd:0,
        shirt:"#ffc44d", hair:"#2b2118",
        lines:["Fresh popsicles daily!","Watch out for seagulls.","Stay safe near the water!"] },
    ],
  },
};
