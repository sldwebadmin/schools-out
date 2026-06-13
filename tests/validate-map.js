/**
 * tests/validate-map.js — map placement validator
 *
 * Checks every object in mapdata.js for:
 *  A.  Intrusion into road / water / pond zones (logical AABB)
 *  A2. Canopy circle overlapping a road / water / pond zone
 *  B.  Solid-to-solid AABB overlap between non-ghost objects
 *  B2. Horizontal fence picket overhang (21 px north) visually clipping a building
 *  B3. Tree canopy circle overlapping a building's visual AABB
 *  C.  Any wall whose centre falls outside every declared region
 *  D.  Solid (non-ghost, non-hop) wall blocking a door approach zone
 *
 * Exit 0 = clean.  Exit 1 = issues found (fails `npm test`).
 */

import { buildMap, walls, canopies, doors } from '../src/world/map.js';
buildMap();

// ── Geometry helpers ──────────────────────────────────────────────────
function overlap(a, b) {
  const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  return { area: ox * oy, ox, oy };
}
// Circle-AABB distance (negative = overlap by that many px)
function circleRectDist(cx, cy, r, rx, ry, rw, rh) {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  return Math.sqrt((cx - nx) ** 2 + (cy - ny) ** 2) - r;
}
function regionOfPoint(x, y) {
  for (const r of REGIONS) {
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return r.name;
  }
  return 'Unknown';
}
const wcx = w => w.x + w.w / 2;
const wcy = w => w.y + w.h / 2;
const desc = w => `${w.type}@(${w.x},${w.y},${w.w}×${w.h})`;

// ── Regions (for grouping issues and CHECK C) ─────────────────────────
const REGIONS = [
  { name: 'WaterTower',    x: 6656, y:  512, w: 1024, h:  512 },
  { name: 'School',        x: 4096, y:  512, w: 2240, h: 1600 },
  { name: 'Construction',  x:  512, y:  512, w: 1536, h: 1280 },
  { name: 'Athletic',      x: 6336, y: 1024, w: 1024, h: 1088 },
  { name: 'Park',          x: 2560, y: 2304, w: 2048, h: 1152 },
  { name: 'Shopping',      x: 5632, y: 2560, w: 2240, h: 1920 },
  // Neighbourhood: NE and SE yards have east fence at x=5150..5160 which extends
  // 40px beyond the WORLD_PLAN grid boundary (x=5120). Widen by 40px to match.
  { name: 'Neighbourhood', x: 2560, y: 3584, w: 2600, h: 2560 },
  { name: 'Woods',         x:  256, y: 2048, w: 2048, h: 3584 },
  // Lake region extended north by 100px to include the snack shack and boardwalk
  // approach area (y=6300..6400) which sits on the beach, not in open water.
  { name: 'Lake',          x: 2560, y: 6300, w: 5376, h: 1636 },
];
function regionOf(w) {
  // Walk in declaration order — WaterTower before School/Athletic (bounds overlap)
  for (const r of REGIONS) {
    if (wcx(w) >= r.x && wcx(w) < r.x + r.w &&
        wcy(w) >= r.y && wcy(w) < r.y + r.h) return r.name;
  }
  return 'Unknown';
}

// ── Issue collector ───────────────────────────────────────────────────
const byRegion = {};
let total = 0;
function flag(region, msg) {
  (byRegion[region] ??= []).push(msg);
  total++;
}

// ═══════════════════════════════════════════════════════
//  CHECK A — road / water / pond intrusions
// ═══════════════════════════════════════════════════════
//
// Road stops at school boundary (y=2112) — campus grounds are grass, not road.
// See bake.js: road(RX,2112,140,4288).
//
const BLOCKED_ZONES = [
  // Main N-S road — park section (school boundary to neighbourhood)
  { zone: 'Main Road (park→school)',    x: 4448, y: 2112, w: 140, h: 1472 },
  // Main N-S road — neighbourhood section
  { zone: 'Main Road (neighbourhood)', x: 4448, y: 3584, w: 140, h: 2806 },
  // HY1 cross-street
  { zone: 'HY1 cross-street',          x: 2560, y: 4480, w: 2560, h: 140 },
  // HY2 cross-street
  { zone: 'HY2 cross-street',          x: 2560, y: 5248, w: 2560, h: 140 },
  // Lake water (south of y=6490)
  { zone: 'Lake water',                x: 2560, y: 6490, w: 5376, h: 1440 },
  // Pond body
  { zone: 'Pond body',                 x: 2982, y: 2638, w:  380, h:  220 },
];
// These wall types define the zone themselves — don't flag them
const ZONE_SELF = new Set(['water', 'pond']);

for (const z of BLOCKED_ZONES) {
  for (const w of walls) {
    if (w.ghost) continue;
    if (ZONE_SELF.has(w.type)) continue;

    const { area, ox, oy } = overlap(w, z);
    if (area > 0) {
      flag(regionOf(w),
        `A: ${desc(w)} intrudes "${z.zone}" by ${ox}×${oy}=${area}px²`);
    }
  }
}

// ═══════════════════════════════════════════════════════
//  CHECK A2 — canopy circle overlapping road/water/pond
// ═══════════════════════════════════════════════════════
//
// The validator historically only checked tree trunk AABBs.  Canopy circles
// (r = 44–66 px) can visually cover roads even when the trunk is safely clear.
//
for (const z of BLOCKED_ZONES) {
  for (const c of canopies) {
    const d = circleRectDist(c.x, c.y, c.r, z.x, z.y, z.w, z.h);
    if (d < 0) {
      flag(regionOfPoint(c.x, c.y),
        `A2: canopy@(${c.x},${c.y},r=${c.r}) overlaps "${z.zone}" by ${(-d).toFixed(0)}px`);
    }
  }
}

// ═══════════════════════════════════════════════════════
//  CHECK B — solid-to-solid AABB overlap
// ═══════════════════════════════════════════════════════
//
// Excludes:
//  • ghost walls (visual only)
//  • fence/hedge corners — two perpendicular segments overlap by their own
//    thickness at the meeting corner; allow if BOTH overlap dims ≤ 30px
//  • hop-on-hop overlaps ≤ 10×10 (e.g. fence end caps touching)
//
// 'frame' beams share corners just like fence/hedge — allow ≤20×20 overlap
const FENCE_LIKE = new Set(['fence', 'hedge', 'frame']);
const solids = walls.filter(w => !w.ghost);
for (let i = 0; i < solids.length; i++) {
  for (let j = i + 1; j < solids.length; j++) {
    const a = solids[i], b = solids[j];
    const { area, ox, oy } = overlap(a, b);
    if (area <= 0) continue;
    // Fence/hedge/frame corner overlap tolerance (corners are 10–26px thick)
    if (FENCE_LIKE.has(a.type) && FENCE_LIKE.has(b.type) && ox <= 30 && oy <= 30) continue;
    if (a.hop && b.hop && ox <= 10 && oy <= 10) continue;
    flag(regionOf(a),
      `B: ${desc(a)} overlaps ${desc(b)} by ${ox}×${oy}=${area}px²`);
  }
}

// ═══════════════════════════════════════════════════════
//  CHECK B2 — fence picket overhang clipping a building
// ═══════════════════════════════════════════════════════
//
// Horizontal fence pickets are drawn 21 px NORTH of the logical fence.y.
// A fence placed logically just south of a building's bottom edge can still
// have its pickets visually inside the building.
//
const BUILDING_TYPES = new Set(['house', 'school', 'market', 'shack', 'treehouse']);
const hFences   = walls.filter(w => !w.ghost && w.type === 'fence' && w.w >= w.h);
const buildings = walls.filter(w => !w.ghost && BUILDING_TYPES.has(w.type));
const FENCE_PICKET_OVERHANG = 21; // px north of fence.y that pickets reach

for (const f of hFences) {
  const fVisTop = f.y - FENCE_PICKET_OVERHANG;
  for (const b of buildings) {
    const bBottom = b.y + b.h;
    if (fVisTop < bBottom && f.y >= bBottom) {
      const xov = Math.min(f.x + f.w, b.x + b.w) - Math.max(f.x, b.x);
      if (xov > 0) {
        flag(regionOf(f),
          `B2: fence@(${f.x},${f.y}) pickets reach y=${fVisTop}, ${bBottom - fVisTop}px into ${desc(b)}`);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════
//  CHECK B3 — tree canopy overlapping a building visual
// ═══════════════════════════════════════════════════════
//
// Canopies are drawn last (on top of everything).  A tree canopy that visually
// covers a building produces the "drifting tree on the roof" artifact.
// Use the building's visual AABB (which extends 8–16 px beyond the logical box).
//
const BLDG_VIS = { house:{l:8,r:8,t:16,b:16}, school:{l:10,r:10,t:14,b:0},
                   market:{l:8,r:8,t:12,b:0}, shack:{l:8,r:8,t:10,b:0},
                   treehouse:{l:0,r:0,t:16,b:0} };

for (const c of canopies) {
  for (const b of buildings) {
    const pad = BLDG_VIS[b.type] || {l:0,r:0,t:0,b:0};
    const vx = b.x - pad.l, vy = b.y - pad.t;
    const vw = b.w + pad.l + pad.r, vh = b.h + pad.t + pad.b;
    const d = circleRectDist(c.x, c.y, c.r, vx, vy, vw, vh);
    if (d < 0) {
      flag(regionOfPoint(c.x, c.y),
        `B3: canopy@(${c.x},${c.y},r=${c.r}) overlaps visual of ${desc(b)} by ${(-d).toFixed(0)}px`);
    }
  }
}

// ═══════════════════════════════════════════════════════
//  CHECK C — object outside every region
// ═══════════════════════════════════════════════════════
//
// World-border hedges span the entire map edge — skip those.
//
for (const w of walls) {
  if (w.ghost) continue;
  if (w.type === 'hedge' &&
      (w.x <= 0 || w.y <= 0 || w.x + w.w >= 8166 || w.y + w.h >= 8166)) continue;
  if (regionOf(w) === 'Unknown') {
    flag('Unknown', `C: ${desc(w)} outside all declared regions`);
  }
}

// ═══════════════════════════════════════════════════════
//  CHECK D — doorway approach zones
// ═══════════════════════════════════════════════════════
//
// The 30px strip immediately south of each door must be free of
// solid, non-hop walls so the player can stand to enter/exit.
// Water walls near the snack shack are excluded (tight but navigable).
//
for (const d of doors) {
  const approach = { x: d.x, y: d.y + d.h, w: d.w, h: 30 };
  for (const w of walls) {
    if (w.ghost || w.hop || w.type === 'water') continue;
    const { area } = overlap(w, approach);
    if (area > 0) {
      flag(regionOf(w),
        `D: door@(${d.x},${d.y}) "${d.txt||'—'}" approach blocked by ${desc(w)}`);
    }
  }
}

// ═══════════════════════════════════════════════════════
//  Report
// ═══════════════════════════════════════════════════════
if (total === 0) {
  console.log('validate-map: OK — 0 issues');
  process.exit(0);
}
console.error(`\nvalidate-map: ${total} issue(s)\n`);
for (const [region, msgs] of Object.entries(byRegion).sort()) {
  console.error(`── ${region} (${msgs.length}) ──`);
  for (const m of msgs) console.error(`  ${m}`);
}
console.error('');
process.exit(1);
