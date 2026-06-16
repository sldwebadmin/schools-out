// Maple Court (Neighborhood) — sketch-based starter neighborhood.
// Local coords: 0,0 = top-left of this section.
// Section size: 2560 × 2560 px.

import { CHUNK_W, DAY_SEED } from '../../engine/constants.js';
import { mulberry32, bakeCanvas } from '../../engine/utils.js';
import { ZONE } from '../tiledata.js';
import { drawTiledGround, drawAutotileEdges } from '../tilerender.js';

const W = 2560;
const H = 2560;

// Roads
const MAIN_NS_X = 1250, MAIN_NS_W = 72;
const MAIN_EW_Y = 1185, MAIN_EW_H = 72;

const TOP_EW_Y = 505, TOP_EW_H = 52;
const LEFT_MID_EW_Y = 1650, LEFT_MID_EW_H = 44;
const LEFT_LOW_EW_Y = 2050, LEFT_LOW_EW_H = 44;

const RIGHT_TOP_EW_Y = 585, RIGHT_TOP_EW_H = 44;

const LEFT_SIDEWALK_W = 16;
const SIDEWALK = 18;

function R(x, y, w, h) {
  return { x, y, w, h };
}

const ROADS = [
  R(MAIN_NS_X, 0, MAIN_NS_W, H),
  R(0, MAIN_EW_Y, W, MAIN_EW_H),

  // Upper-left neighborhood road under apartment/parking rows
  R(0, TOP_EW_Y, MAIN_NS_X, TOP_EW_H),

  // Left-side dense residential rows
  R(0, LEFT_MID_EW_Y, MAIN_NS_X, LEFT_MID_EW_H),
  R(0, LEFT_LOW_EW_Y, MAIN_NS_X, LEFT_LOW_EW_H),

  // Upper-right subdivision road
  R(MAIN_NS_X, RIGHT_TOP_EW_Y, W - MAIN_NS_X, RIGHT_TOP_EW_H),
];

function inRect(lx, ly, r) {
  return lx >= r.x && lx < r.x + r.w && ly >= r.y && ly < r.y + r.h;
}

function nearRect(lx, ly, r, pad) {
  return lx >= r.x - pad && lx < r.x + r.w + pad && ly >= r.y - pad && ly < r.y + r.h + pad;
}

function zoneAt(lx, ly) {
  for (const r of ROADS) if (inRect(lx, ly, r)) return ZONE.ROAD;
  for (const r of ROADS) if (nearRect(lx, ly, r, SIDEWALK)) return ZONE.SIDEWALK;
  return ZONE.LAWN;
}

function bakeInto(g, lx0, ly0) {
  const rnd = mulberry32(DAY_SEED ^ ((lx0 * 997 + ly0 * 1009) >>> 0));

  function tex(rx0, ry0, rx1, ry1, n, c1, c2, dw, dh) {
    const ix0 = Math.max(lx0, rx0), ix1 = Math.min(lx0 + CHUNK_W, rx1);
    const iy0 = Math.max(ly0, ry0), iy1 = Math.min(ly0 + CHUNK_W, ry1);
    if (ix0 >= ix1 || iy0 >= iy1) return;
    const iw = ix1 - ix0, ih = iy1 - iy0;
    for (let i = 0; i < n; i++) {
      g.fillStyle = rnd() < .5 ? c1 : c2;
      g.fillRect(ix0 + (rnd() * iw) | 0, iy0 + (rnd() * ih) | 0, dw, dh);
    }
  }

  function road(x, y, w, h) {
    g.fillStyle = '#343056';
    g.fillRect(x, y, w, h);
    tex(x, y, x + w, y + h, Math.max(1, (w * h / 1400) | 0), '#3d3863', '#2d294d', 5, 5);
    g.fillStyle = '#24203f';
    if (w >= h) {
      g.fillRect(x, y, w, 4);
      g.fillRect(x, y + h - 4, w, 4);
    } else {
      g.fillRect(x, y, 4, h);
      g.fillRect(x + w - 4, y, 4, h);
    }
  }

  function sidewalk(x, y, w, h) {
    g.fillStyle = '#8f8f94';
    g.fillRect(x, y, w, h);
    g.fillStyle = '#74747a';
    if (w >= h) for (let sx = x; sx < x + w; sx += 44) g.fillRect(sx, y, 2, h);
    else for (let sy = y; sy < y + h; sy += 44) g.fillRect(x, sy, w, 2);
  }

  function parking(x, y, w, h, label = 'Parking Lot') {
    g.fillStyle = '#73bdd9';
    g.fillRect(x, y, w, h);
    g.strokeStyle = '#1b1430';
    g.lineWidth = 3;
    g.strokeRect(x, y, w, h);

    const spots = Math.max(2, Math.floor(w / 90));
    g.strokeStyle = '#19566f';
    g.lineWidth = 2;
    for (let i = 1; i < spots; i++) {
      const sx = x + (w / spots) * i;
      g.beginPath();
      g.moveTo(sx, y);
      g.lineTo(sx, y + h - 36);
      g.stroke();
    }

    g.fillStyle = '#0d536e';
    g.fillRect(x, y + h - 38, w, 38);
    labelText(label, x + w / 2, y + h - 14, 24);
  }

  function labelText(txt, cx, cy, size = 18, color = '#fff') {
    g.fillStyle = color;
    g.font = `${size}px sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const lines = String(txt).split('\n');
    const lineH = size + 4;
    for (let i = 0; i < lines.length; i++) {
      g.fillText(lines[i], cx, cy + (i - (lines.length - 1) / 2) * lineH);
    }
  }

  function lot(x, y, w, h) {
    g.fillStyle = '#315c39';
    g.fillRect(x, y, w, h);
    g.strokeStyle = '#24442b';
    g.lineWidth = 2;
    g.strokeRect(x, y, w, h);
  }

  function building(x, y, w, h, label = '', color = '#7cc6e3') {
    g.fillStyle = color;
    g.fillRect(x, y, w, h);
    g.strokeStyle = '#11122a';
    g.lineWidth = 3;
    g.strokeRect(x, y, w, h);
    if (label) labelText(label, x + w / 2, y + h / 2, Math.min(26, Math.max(14, w / 7)), '#11122a');
  }

  function park(x, y, w, h, label) {
    g.fillStyle = '#8bd34b';
    g.fillRect(x, y, w, h);
    g.strokeStyle = '#10290f';
    g.lineWidth = 3;
    g.strokeRect(x, y, w, h);
    labelText(label, x + w / 2, y + h / 2, 24);
  }

  drawTiledGround(g, lx0, ly0, zoneAt);

  // Sidewalks first
  for (const r of ROADS) {
    sidewalk(r.x - SIDEWALK, r.y - SIDEWALK, r.w + SIDEWALK * 2, SIDEWALK);
    sidewalk(r.x - SIDEWALK, r.y + r.h, r.w + SIDEWALK * 2, SIDEWALK);
    sidewalk(r.x - SIDEWALK, r.y, SIDEWALK, r.h);
    sidewalk(r.x + r.w, r.y, SIDEWALK, r.h);
  }

  // Roads
  for (const r of ROADS) road(r.x, r.y, r.w, r.h);

  // Road center dashes
  g.fillStyle = '#8077aa';
  for (let y = 10; y < H; y += 72) g.fillRect(MAIN_NS_X + MAIN_NS_W / 2 - 4, y, 8, 34);
  for (let x = 10; x < W; x += 72) g.fillRect(x, MAIN_EW_Y + MAIN_EW_H / 2 - 4, 34, 8);
  for (let x = 10; x < MAIN_NS_X; x += 72) {
    g.fillRect(x, TOP_EW_Y + TOP_EW_H / 2 - 4, 34, 8);
    g.fillRect(x, LEFT_MID_EW_Y + LEFT_MID_EW_H / 2 - 4, 34, 8);
    g.fillRect(x, LEFT_LOW_EW_Y + LEFT_LOW_EW_H / 2 - 4, 34, 8);
  }
  for (let x = MAIN_NS_X + 10; x < W; x += 72) {
    g.fillRect(x, RIGHT_TOP_EW_Y + RIGHT_TOP_EW_H / 2 - 4, 34, 8);
  }

  // Top-left apartment / parking district
  parking(40, 70, 455, 245);
  park(535, 100, 210, 190, 'Park');
  parking(790, 70, 455, 245);

  parking(40, 680, 455, 245);
  park(535, 710, 210, 175, 'Playground');
  parking(790, 675, 455, 245);

  // Upper-right houses
  const topRightY1 = 165, topRightY2 = 735;
  for (const x of [1415, 1665, 1915, 2165, 2410]) {
    lot(x - 18, 115, 205, 250);
    building(x, topRightY1, 185, 205);
    g.fillStyle = '#144f6a';
    g.fillRect(x + 125, topRightY1 + 205, 24, 44); // driveway
  }

  building(1415, topRightY2, 185, 210, 'Chief\nof\nPolice');
  for (const x of [1665, 1915, 2165, 2410]) {
    lot(x - 18, 685, 205, 295);
    building(x, topRightY2, 185, 210);
  }

  // Dense lower-left neighborhood
  const row1Y = 1310;
  building(35, row1Y, 185, 190, 'Creepy\nHouse');
  for (const x of [245, 455, 665, 875, 1085]) building(x, row1Y, 185, 190);

  const row2Y = 1725;
  for (const x of [35, 245, 455, 665, 875, 1085]) {
    building(x, row2Y, 185, 190, x === 875 ? 'School\nPrincipal' : '');
  }

  const row3Y = 2135;
  for (const x of [35, 245, 455, 665, 875, 1085]) {
    building(x, row3Y, 185, 190, x === 1085 ? 'Friend' : '');
  }

  // Player house near current house-return coordinates
  building(1285, 2180, 230, 200, 'Your\nHouse', '#8ecae6');

  // Open right-side larger lots / mayor area
  for (const [x, y, w, h, label] of [
    [1400, 1325, 300, 205, ''],
    [1840, 1325, 300, 205, ''],
    [2280, 1325, 300, 205, ''],
    [1410, 1835, 300, 205, ''],
    [1845, 1835, 300, 205, 'Mayor’s\nHouse'],
    [2285, 1835, 300, 205, ''],
  ]) {
    lot(x - 20, y - 20, w + 40, h + 40);
    building(x, y, w, h, label);
  }

  // Simple tree / yard accents
  for (const [tx, ty] of [
    [525, 330], [760, 330], [525, 920], [760, 920],
    [1350, 120], [1580, 460], [2000, 455], [2390, 455],
    [132, 1550], [520, 1550], [980, 1550],
    [1420, 2110], [1780, 2110], [2220, 2110],
  ]) {
    g.fillStyle = '#2f7d45';
    g.beginPath();
    g.arc(tx, ty, 22, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1f5c32';
    g.beginPath();
    g.arc(tx - 8, ty + 4, 14, 0, Math.PI * 2);
    g.fill();
  }

  drawAutotileEdges(g, lx0, ly0, zoneAt);
}

function minimapBake() {
  const SC = 150 / 2560;
  const [c, g] = bakeCanvas(150, 150);

  const B = (x, y, w, h, col) => {
    g.fillStyle = col;
    g.fillRect(x * SC, y * SC, Math.max(1, w * SC), Math.max(1, h * SC));
  };

  g.fillStyle = '#3f5d44';
  g.fillRect(0, 0, 150, 150);

  for (const r of ROADS) B(r.x, r.y, r.w, r.h, '#2a2345');

  // Simple building/minimap blocks
  const miniBuildings = [
    [40, 70, 455, 245], [535, 100, 210, 190], [790, 70, 455, 245],
    [40, 680, 455, 245], [535, 710, 210, 175], [790, 675, 455, 245],
    [1415, 165, 185, 205], [1665, 165, 185, 205], [1915, 165, 185, 205], [2165, 165, 185, 205], [2410, 165, 185, 205],
    [1415, 735, 185, 210], [1665, 735, 185, 210], [1915, 735, 185, 210], [2165, 735, 185, 210], [2410, 735, 185, 210],
    [35, 1310, 185, 190], [245, 1310, 185, 190], [455, 1310, 185, 190], [665, 1310, 185, 190], [875, 1310, 185, 190], [1085, 1310, 185, 190],
    [35, 1725, 185, 190], [245, 1725, 185, 190], [455, 1725, 185, 190], [665, 1725, 185, 190], [875, 1725, 185, 190], [1085, 1725, 185, 190],
    [35, 2135, 185, 190], [245, 2135, 185, 190], [455, 2135, 185, 190], [665, 2135, 185, 190], [875, 2135, 185, 190], [1085, 2135, 185, 190],
    [1285, 2180, 230, 200],
    [1400, 1325, 300, 205], [1840, 1325, 300, 205], [2280, 1325, 300, 205],
    [1410, 1835, 300, 205], [1845, 1835, 300, 205], [2285, 1835, 300, 205],
  ];

  for (const b of miniBuildings) B(b[0], b[1], b[2], b[3], '#78c3df');

  // Player start marker
  g.fillStyle = '#ffc44d';
  g.beginPath();
  g.arc(1395 * SC, 2348 * SC, 3, 0, Math.PI * 2);
  g.fill();

  return c;
}

function makeHouseDoor(x, y, txt = 'Nobody home right now.') {
  return {
    x: x + 70,
    y: y + 190,
    w: 50,
    h: 22,
    worldReturn: { x: x + 95, y: y + 220 },
    txt,
  };
}

export const neighborhood = {
  key: 'neighborhood',
  name: 'Maple Court',
  w: W,
  h: H,
  status: 'open',

  zoneAt,
  bakeInto,
  minimapBake,

  walls: [
    // Player house / named houses
    { x:1285, y:2180, w:230, h:200, type:'house', txt:'Your House' },
    { x:35, y:1310, w:185, h:190, type:'house', txt:'Creepy House' },
    { x:875, y:1725, w:185, h:190, type:'house', txt:'School Principal' },
    { x:1415, y:735, w:185, h:210, type:'house', txt:'Chief of Police' },
    { x:1845, y:1835, w:300, h:205, type:'house', txt:'Mayor’s House' },

    // Parks are hop/ghost-ish boundaries; not full blockers
    { x:535, y:100, w:210, h:190, type:'park', ghost:true, noshadow:true, txt:'Park' },
    { x:535, y:710, w:210, h:175, type:'park', ghost:true, noshadow:true, txt:'Playground' },

    // Upper-right houses
    ...[1415,1665,1915,2165,2410].map(x => ({ x, y:165, w:185, h:205, type:'house' })),
    ...[1665,1915,2165,2410].map(x => ({ x, y:735, w:185, h:210, type:'house' })),

    // Dense left houses
    ...[245,455,665,875,1085].map(x => ({ x, y:1310, w:185, h:190, type:'house' })),
    ...[35,245,455,665,1085].map(x => ({ x, y:1725, w:185, h:190, type:'house' })),
    ...[35,245,455,665,875,1085].map(x => ({ x, y:2135, w:185, h:190, type:'house' })),

    // Open right-side large houses
    ...[
      [1400,1325,300,205],
      [1840,1325,300,205],
      [2280,1325,300,205],
      [1410,1835,300,205],
      [2285,1835,300,205],
    ].map(([x,y,w,h]) => ({ x, y, w, h, type:'house' })),
  ],

  canopies: [],

  lamps: [
    { x:1240, y:1175 }, { x:1335, y:1175 }, { x:1240, y:1270 }, { x:1335, y:1270 },
    { x:1240, y:500 }, { x:1335, y:590 },
    { x:1240, y:1640 }, { x:1240, y:2040 },
    { x:400, y:1180 }, { x:820, y:1180 }, { x:1700, y:1180 }, { x:2200, y:1180 },
  ],

  doors: [
    // Player house interior
    {
      x:1370, y:2372, w:64, h:22,
      target:'house',
      spawnX:240,
      spawnY:200,
      worldReturn:{ x:1395, y:2348 },
      txt:'Home sweet home.',
    },

    // Flavor doors
    makeHouseDoor(35, 1310, 'This house gives you the creeps.'),
    makeHouseDoor(875, 1725, 'The principal lives here. Better behave.'),
    makeHouseDoor(1415, 735, 'Chief of Police — maybe don’t cause trouble nearby.'),
    makeHouseDoor(1845, 1835, 'The mayor’s house. Fancy lawn.'),
    makeHouseDoor(1085, 2135, 'Your friend is probably outside somewhere.'),
  ],

  transitions: [
    { x:0, y:0, w:2560, h:32, status:'locked', txt:'School District', txt2:'Coming soon!' },
    { x:0, y:2528, w:2560, h:32, status:'locked', txt:'Lake / Fun Park', txt2:'Coming soon!' },
    { x:2528, y:0, w:32, h:2560, status:'locked', txt:'Shopping Center', txt2:'Coming soon!' },
    { x:0, y:0, w:32, h:2560, status:'locked', txt:'Whispering Woods', txt2:'Coming soon!' },
  ],

  npcs: [],

  pickupSpots: [
    [620, 220],
    [620, 805],
    [1450, 460],
    [2100, 460],
    [135, 1450],
    [960, 1850],
    [1460, 2260],
    [1980, 1940],
  ],

  activities: [],
};
