export const R  = (a,b) => a + Math.random()*(b-a);
export const RI = (a,b) => Math.floor(R(a, b+1));
export const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

export function mulberry32(a){
  return function(){
    a|=0; a=a+0x6D2B79F5|0;
    let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t;
    return ((t^t>>>14)>>>0)/4294967296;
  };
}

export function bakeCanvas(w, h){
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d"); g.imageSmoothingEnabled = false;
  return [c, g];
}
