// Spatial hash grid for fast collision queries.
// Walls are indexed by the 64px grid cells they overlap.
// blocked()/moveActor() query only nearby cells instead of scanning all walls.

const CELL = 64; // grid cell size (2 tiles @ 32px)
const grid = new Map(); // packed integer key → [wall, ...]

export function buildGrid(walls) {
  grid.clear();
  for(const w of walls) {
    if(w.ghost) continue; // ghost walls never collide, skip them
    const x0 = Math.floor(w.x / CELL);
    const y0 = Math.floor(w.y / CELL);
    const x1 = Math.floor((w.x + w.w) / CELL);
    const y1 = Math.floor((w.y + w.h) / CELL);
    for(let cx = x0; cx <= x1; cx++) {
      for(let cy = y0; cy <= y1; cy++) {
        const k = cx * 100000 + cy;
        const arr = grid.get(k);
        if(arr) arr.push(w); else grid.set(k, [w]);
      }
    }
  }
}

export function nearbyWalls(x, y, r) {
  const x0 = Math.floor((x - r) / CELL);
  const y0 = Math.floor((y - r) / CELL);
  const x1 = Math.floor((x + r) / CELL);
  const y1 = Math.floor((y + r) / CELL);
  const seen = new Set();
  const result = [];
  for(let cx = x0; cx <= x1; cx++) {
    for(let cy = y0; cy <= y1; cy++) {
      const arr = grid.get(cx * 100000 + cy);
      if(!arr) continue;
      for(const w of arr) {
        if(!seen.has(w)) { seen.add(w); result.push(w); }
      }
    }
  }
  return result;
}
