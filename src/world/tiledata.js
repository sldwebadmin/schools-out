// Zone classification for the tile system.
// zoneAt(px,py) → zone ID for the 32×32 tile at world-pixel position (px,py).
// Checks mirror the paint order in bake.js: later-painted zones take priority.

import { WORLD, TILE, RX, HY1, HY2 } from '../engine/constants.js';

export const ZONE = {
  MEADOW: 1, FOREST: 2, LAWN: 3, SCHOOL: 4, BLACKTOP: 5,
  SANDBOX: 6, ROAD: 7, SIDEWALK: 8, DIRT: 9, POND: 10,
  GARDEN: 11, COURT: 12, MARKET: 13,
};

// Palette-matched solid color per zone — used by the Tiled tileset image
export const ZONE_COLORS = [
  null,        // 0  (unused — Tiled IDs are 1-based)
  '#4e7d4a',   // 1  MEADOW
  '#26492e',   // 2  FOREST
  '#4c7a4f',   // 3  LAWN
  '#467a4d',   // 4  SCHOOL
  '#55517a',   // 5  BLACKTOP
  '#d9c08c',   // 6  SANDBOX
  '#46406b',   // 7  ROAD
  '#6a5c91',   // 8  SIDEWALK
  '#8a7350',   // 9  DIRT
  '#2e6f8e',   // 10 POND
  '#6b4a2f',   // 11 GARDEN
  '#3a3760',   // 12 COURT
  '#3f3a60',   // 13 MARKET
];

// Returns the zone ID for the tile whose top-left pixel is at (px, py).
// Checks from most-specific (last-painted) to least-specific (base).
export function zoneAt(px, py) {
  // Market plaza
  if(px >= 3480 && px < 3940 && py >= 1640 && py < 1920) return ZONE.MARKET;
  // Basketball court
  if(px >= 2160 && px < 2420 && py >= 2330 && py < 2530) return ZONE.COURT;
  // Community garden
  if(px >= 1420 && px < 1720 && py >= 2340 && py < 2640) return ZONE.GARDEN;
  // Cul-de-sac circle (center 1950,2520 r=150) — use tile centre for test
  const cdx = px + 16 - 1950, cdy = py + 16 - 2520;
  if(cdx*cdx + cdy*cdy < 150*150) return ZONE.ROAD;
  // Dirt paths
  if(px >= 1240 && px < 1800 && py >= 1170 && py < 1230) return ZONE.DIRT;
  if(px >= 1530 && px < 1590 && py >= 1230 && py < 1422) return ZONE.DIRT;
  if(px >= 300  && px < 670  && py >= 1480 && py < 1570) return ZONE.DIRT;
  // Pond ellipse (inner fill: centre 1050,1200  rx=188 ry=108)
  const pex = (px + 16 - 1050) / 188, pey = (py + 16 - 1200) / 108;
  if(pex*pex + pey*pey < 1) return ZONE.POND;
  // Roads (main vertical + two horizontal + east spur)
  if(px >= RX       && px < RX+140   && py >= 940  && py < 2480) return ZONE.ROAD;
  if(px >= 660      && px < 3960     && py >= HY1   && py < HY1+140) return ZONE.ROAD;
  if(px >= 660      && px < 3240     && py >= HY2   && py < HY2+140) return ZONE.ROAD;
  if(px >= 3680     && px < 3820     && py >= 1590  && py < 2440) return ZONE.ROAD;
  // Sidewalks
  if(px >= 660  && px < 3240 && py >= 1422 && py < 1450) return ZONE.SIDEWALK;
  if(px >= 660  && px < 3240 && py >= 1590 && py < 1618) return ZONE.SIDEWALK;
  if(px >= 660  && px < 3240 && py >= 2092 && py < 2120) return ZONE.SIDEWALK;
  if(px >= 660  && px < 3240 && py >= 2260 && py < 2288) return ZONE.SIDEWALK;
  if(px >= 1852 && px < 1880 && py >= 940  && py < 2480) return ZONE.SIDEWALK;
  if(px >= 2020 && px < 2048 && py >= 940  && py < 2480) return ZONE.SIDEWALK;
  // Blacktop / sandbox (within school, checked before school)
  if(px >= 1480 && px < 1900 && py >= 480 && py < 670) return ZONE.BLACKTOP;
  if(px >= 2400 && px < 2640 && py >= 590 && py < 700) return ZONE.SANDBOX;
  // School grounds
  if(px >= 1240 && px < 2860 && py >= 80  && py < 720) return ZONE.SCHOOL;
  // Forest strips (west, greenbelt, east)
  if(px >= 26   && px < 646  && py >= 950  && py < 2960) return ZONE.FOREST;
  if(px >= 660  && px < 3240 && py >= 760  && py < 940)  return ZONE.FOREST;
  if(px >= 3240 && px < 3420 && py >= 950  && py < 2960) return ZONE.FOREST;
  // Neighbourhood lawn
  if(px >= 660  && px < 3240 && py >= 940  && py < 2974) return ZONE.LAWN;
  // Default: wild meadow
  return ZONE.MEADOW;
}

// Build the flat tile-data array (row-major) for a Tiled tilelayer.
export function buildTileLayer() {
  const cols = Math.ceil(WORLD.w / TILE);
  const rows = Math.ceil(WORLD.h / TILE);
  const data = new Array(cols * rows);
  for(let ty = 0; ty < rows; ty++) {
    for(let tx = 0; tx < cols; tx++) {
      data[ty * cols + tx] = zoneAt(tx * TILE, ty * TILE);
    }
  }
  return { data, cols, rows };
}
