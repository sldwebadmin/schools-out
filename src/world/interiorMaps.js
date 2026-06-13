// Interior map definitions for player's house and Maple Mart.
// Coordinate system is local to each interior (origin 0,0).
// Walls, exits, and interactables are in interior-local pixels.

import { DAY_NUM, DAY_SEED } from '../engine/constants.js';

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

export const INTERIORS = {
  house: {
    name: "Your House",
    w: 480, h: 360,
    bg: "#4a3828",          // warm wood floor base
    walls: HOUSE_WALLS,
    exits: [
      { x:208, y:330, w:64, h:30, worldTarget:{x:3955, y:5932} },
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
};
