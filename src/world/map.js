import mapdata from './mapdata.js';

export const walls = [];
export const canopies = [];
export const lamps = [];
export const doors = []; // {x,y,w,h, target:"key"|null, spawnX,spawnY, worldReturn:{x,y}, txt}

export function buildMap(){
  walls.length=0; canopies.length=0; lamps.length=0; doors.length=0;

  for(const w of mapdata.walls){
    walls.push({
      x:w.x, y:w.y, w:w.w, h:w.h, type:w.type,
      hop:     !!w.hop,
      ghost:   !!w.ghost,
      noshadow:!!w.noshadow,
      player:  !!w.player,
      hue:     w.hue  || null,
      trim:    w.trim || null,
      txt:     w.txt  || '',
      txt2:    w.txt2 !== undefined ? w.txt2 : '',
    });
  }

  for(const c of mapdata.canopies){
    canopies.push({ x:c.x, y:c.y, r:c.r });
  }

  for(const L of mapdata.lamps){
    lamps.push({ x:L.x, y:L.y });
  }

  for(const d of mapdata.doors){
    doors.push({
      x:d.x, y:d.y, w:d.w, h:d.h,
      target:      d.target      || null,
      spawnX:      d.spawnX      || 0,
      spawnY:      d.spawnY      || 0,
      worldReturn: d.worldReturn || null,
      txt:         d.txt         || '',
    });
  }
}
