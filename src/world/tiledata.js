// Zone classification and region lookup for the 8192×8192 world.
// zoneAt(px,py) → zone ID (mirrors bake.js paint order; later-painted wins).
// regionAt(px,py) → region name string or null (used by the banner system).

import { WORLD, TILE, RX, HY1, HY2 } from '../engine/constants.js';

export const ZONE = {
  MEADOW:1, FOREST:2, LAWN:3, SCHOOL:4, BLACKTOP:5,
  SANDBOX:6, ROAD:7, SIDEWALK:8, DIRT:9, POND:10,
  GARDEN:11, COURT:12, MARKET:13,
};

export const ZONE_COLORS = [
  null,
  '#4e7d4a',  // 1 MEADOW
  '#26492e',  // 2 FOREST
  '#4c7a4f',  // 3 LAWN
  '#467a4d',  // 4 SCHOOL
  '#55517a',  // 5 BLACKTOP
  '#d9c08c',  // 6 SANDBOX
  '#46406b',  // 7 ROAD
  '#6a5c91',  // 8 SIDEWALK
  '#8a7350',  // 9 DIRT
  '#2e6f8e',  // 10 POND
  '#6b4a2f',  // 11 GARDEN
  '#3a3760',  // 12 COURT
  '#3f3a60',  // 13 MARKET
];

export function regionAt(x, y) {
  if(x>=2976 && x<5216 && y>=128  && y<1728) return 'School District';
  if(x>=0    && x<3200 && y>=2048 && y<4608) return 'Whispering Woods';
  if(x>=3200 && x<5760 && y>=2048 && y<3648) return 'Maple Park';
  if(x>=5952 && x<8192 && y>=2048 && y<3968) return 'Maple Mart';
  if(x>=2816 && x<5376 && y>=5376 && y<7936) return 'Maple Court';
  return null;
}

export function zoneAt(px, py) {
  // Shopping (market interior)
  if(px>=5952 && px<8192 && py>=2048 && py<3968) return ZONE.MARKET;
  // Basketball court (neighbourhood)
  if(px>=4700 && px<4960 && py>=5480 && py<5680) return ZONE.COURT;
  // Community garden (park)
  if(px>=4950 && px<5230 && py>=3100 && py<3370) return ZONE.GARDEN;
  // Cul-de-sac circle (centre 4096,7680 r=150)
  const cdx=px+16-4096, cdy=py+16-7680;
  if(cdx*cdx+cdy*cdy < 150*150) return ZONE.ROAD;
  // Pond ellipse (centre 4000,2600 rx=218 ry=112)
  const pex=(px+16-4000)/218, pey=(py+16-2600)/112;
  if(pex*pex+pey*pey < 1) return ZONE.POND;
  // Dirt paths
  if(px>=3990&&px<4050&&py>=2740&&py<3000) return ZONE.DIRT;
  if(px>=4220&&px<4500&&py>=2574&&py<2634) return ZONE.DIRT;
  if(px>=4230&&px<4290&&py>=1728&&py<2048) return ZONE.DIRT;
  if(px>=4230&&px<4290&&py>=3648&&py<5376) return ZONE.DIRT;
  // Shop spur road (4166..5952, y=3100..3240)
  if(px>=4166&&px<5952&&py>=3100&&py<3240) return ZONE.ROAD;
  // Main N-S road
  if(px>=RX&&px<RX+140&&py>=1600&&py<7680) return ZONE.ROAD;
  // Neighbourhood horizontal roads
  if(px>=2816&&px<5376&&py>=HY1&&py<HY1+140) return ZONE.ROAD;
  if(px>=2816&&px<5376&&py>=HY2&&py<HY2+140) return ZONE.ROAD;
  // Sidewalks (main road sides through neighbourhood)
  if(px>=3998&&px<4026&&py>=5376&&py<7680) return ZONE.SIDEWALK;
  if(px>=4166&&px<4194&&py>=5376&&py<7680) return ZONE.SIDEWALK;
  if(px>=2816&&px<5376&&py>=6212&&py<6240) return ZONE.SIDEWALK;
  if(px>=2816&&px<5376&&py>=6380&&py<6408) return ZONE.SIDEWALK;
  if(px>=2816&&px<5376&&py>=6692&&py<6720) return ZONE.SIDEWALK;
  if(px>=2816&&px<5376&&py>=6860&&py<6888) return ZONE.SIDEWALK;
  // Blacktop and sandbox (inside school)
  if(px>=3200&&px<3700&&py>=1080&&py<1360) return ZONE.BLACKTOP;
  if(px>=4640&&px<4880&&py>=1050&&py<1160) return ZONE.SANDBOX;
  // School district
  if(px>=2976&&px<5216&&py>=128&&py<1728) return ZONE.SCHOOL;
  // Whispering Woods
  if(px>=0&&px<3200&&py>=2048&&py<4608) return ZONE.FOREST;
  // Park and neighbourhood (lawn)
  if(px>=3200&&px<5760&&py>=2048&&py<3648) return ZONE.LAWN;
  if(px>=2816&&px<5376&&py>=5376&&py<7936) return ZONE.LAWN;
  return ZONE.MEADOW;
}

export function buildTileLayer() {
  const cols = Math.ceil(WORLD.w / TILE);
  const rows = Math.ceil(WORLD.h / TILE);
  const data = new Array(cols * rows);
  for(let ty=0;ty<rows;ty++){
    for(let tx=0;tx<cols;tx++){
      data[ty*cols+tx] = zoneAt(tx*TILE, ty*TILE);
    }
  }
  return { data, cols, rows };
}
