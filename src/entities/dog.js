import { NAPS, DAY_SEED } from '../engine/constants.js';

export const dog = { x:0, y:0, r:12, face:1, anim:0, hop:0, crouch:0, stuck:0, mode:"sleep", alert:0, spotted:false, wet:0 };

export function resetDog(){
  const nap = NAPS[DAY_SEED % NAPS.length];
  Object.assign(dog, { x:nap.x, y:nap.y, hop:0, crouch:0, stuck:0, mode:"sleep", alert:0, spotted:false, anim:0, wet:0 });
}
