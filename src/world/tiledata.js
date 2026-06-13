// Zone classification and region lookup for the 8192×8192 world.
// zoneAt(px,py) → zone ID (mirrors bake.js paint order; later-painted wins).
// regionAt(px,py) → region name string or null (used by the banner system).

import { WORLD, TILE, RX, HY1, HY2 } from '../engine/constants.js';

export const ZONE = {
  MEADOW:1, FOREST:2, LAWN:3, SCHOOL:4, BLACKTOP:5,
  SANDBOX:6, ROAD:7, SIDEWALK:8, DIRT:9, POND:10,
  GARDEN:11, COURT:12, MARKET:13, WATER:14, GRAVEL:15,
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
  '#1f4a63',  // 14 WATER (lake)
  '#7a6a50',  // 15 GRAVEL (construction)
];

// regionAt: order matters — more specific regions first (water tower before athletic)
export function regionAt(x, y) {
  if(x>=6656 && x<7680 && y>=512  && y<1536) return 'Water Tower';
  if(x>=6336 && x<7360 && y>=1024 && y<2112) return 'Athletic Fields';
  if(x>=4096 && x<6336 && y>=512  && y<2112) return 'School District';
  if(x>=256  && x<2304 && y>=2048 && y<5632) return 'Whispering Woods';
  if(x>=2560 && x<4608 && y>=2304 && y<3456) return 'Maple Park';
  if(x>=5632 && x<7872 && y>=2560 && y<4480) return 'Maple Mart District';
  if(x>=2560 && x<5120 && y>=3584 && y<6144) return 'Maple Court';
  if(x>=512  && x<2048 && y>=512  && y<1792) return 'Construction Site';
  if(x>=256  && x<2304 && y>=5888 && y<7936) return 'Meadow Reserve';
  if(x>=2560 && x<7936 && y>=6400 && y<7936) return 'Great Waterfront Lake';
  return null;
}

export function zoneAt(px, py) {
  // Water tower (inside school/athletic area)
  if(px>=6656 && px<7680 && py>=512 && py<1536) return ZONE.LAWN;
  // Athletic fields
  if(px>=6336 && px<7360 && py>=1024 && py<2112) return ZONE.LAWN;
  // Great Waterfront Lake (water)
  if(px>=2560 && px<7936 && py>=6480 && py<7936) return ZONE.WATER;
  // Lake sand strip
  if(px>=2560 && px<7936 && py>=6400 && py<6480) return ZONE.SANDBOX;
  // Construction site
  if(px>=512 && px<2048 && py>=512 && py<1792) return ZONE.GRAVEL;
  // Shopping district
  if(px>=5632 && px<7872 && py>=2560 && py<4480) return ZONE.MARKET;
  // Basketball court (neighbourhood)
  if(px>=4700 && px<4960 && py>=3700 && py<3900) return ZONE.COURT;
  // Community garden (park)
  if(px>=4054 && px<4334 && py>=3132 && py<3402) return ZONE.GARDEN;
  // Cul-de-sac circle (centre 4518,5888 r=150)
  const cdx=px+16-4518, cdy=py+16-5888;
  if(cdx*cdx+cdy*cdy < 150*150) return ZONE.ROAD;
  // Pond ellipse (centre 3200,2750 rx=218 ry=112)
  const pex=(px+16-3200)/218, pey=(py+16-2750)/112;
  if(pex*pex+pey*pey < 1) return ZONE.POND;
  // Dirt paths in park
  if(px>=3190&&px<3250&&py>=2890&&py<3150) return ZONE.DIRT;
  if(px>=3220&&px<3500&&py>=2724&&py<2784) return ZONE.DIRT;
  // Dirt bike paths (connector)
  if(px>=2304&&px<2364&&py>=2048&&py<3456) return ZONE.DIRT;
  // Shop connector road (HY1 extended east into shopping)
  if(px>=4588&&px<5632&&py>=HY1&&py<HY1+140) return ZONE.ROAD;
  // Main N-S road
  if(px>=RX&&px<RX+140&&py>=512&&py<5888) return ZONE.ROAD;
  // Neighbourhood horizontal roads
  if(px>=2560&&px<5120&&py>=HY1&&py<HY1+140) return ZONE.ROAD;
  if(px>=2560&&px<5120&&py>=HY2&&py<HY2+140) return ZONE.ROAD;
  // Sidewalks (main road sides through neighbourhood)
  if(px>=4420&&px<4448&&py>=3584&&py<5888) return ZONE.SIDEWALK;
  if(px>=4588&&px<4616&&py>=3584&&py<5888) return ZONE.SIDEWALK;
  if(px>=2560&&px<5120&&py>=HY1-28&&py<HY1) return ZONE.SIDEWALK;
  if(px>=2560&&px<5120&&py>=HY1+140&&py<HY1+168) return ZONE.SIDEWALK;
  if(px>=2560&&px<5120&&py>=HY2-28&&py<HY2) return ZONE.SIDEWALK;
  if(px>=2560&&px<5120&&py>=HY2+140&&py<HY2+168) return ZONE.SIDEWALK;
  // Blacktop and sandbox (inside school SW corner)
  if(px>=4320&&px<4820&&py>=1200&&py<1480) return ZONE.BLACKTOP;
  if(px>=5760&&px<6000&&py>=1170&&py<1280) return ZONE.SANDBOX;
  // School district
  if(px>=4096&&px<6336&&py>=512&&py<2112) return ZONE.SCHOOL;
  // Whispering Woods
  if(px>=256&&px<2304&&py>=2048&&py<5632) return ZONE.FOREST;
  // Park (lawn)
  if(px>=2560&&px<4608&&py>=2304&&py<3456) return ZONE.LAWN;
  // Neighbourhood (lawn)
  if(px>=2560&&px<5120&&py>=3584&&py<6144) return ZONE.LAWN;
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
