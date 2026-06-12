import { SPAWN } from '../engine/constants.js';

export const player = { x:SPAWN.x, y:SPAWN.y, r:12, vx:0, vy:0, face:1, anim:0, hop:0, hopCd:0, stam:100, boost:0 };

export function resetPlayer(){
  Object.assign(player, { x:SPAWN.x, y:SPAWN.y, vx:0, vy:0, hop:0, hopCd:0, stam:100, boost:0, face:1 });
}
