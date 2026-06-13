import { WORLD, RX, HY1, HY2 } from '../engine/constants.js';
import { bakeCanvas } from '../engine/utils.js';

export let mini = null;
export let MSC = 0;

export function bakeMini(){
  MSC = 150 / WORLD.w;
  const mh = Math.round(WORLD.h * MSC);
  const [c, g] = bakeCanvas(150, mh);
  g.fillStyle = "#2c5232"; g.fillRect(0,0,150,mh);
  const B = (x,y,w,h,col) => {
    g.fillStyle=col;
    g.fillRect(x*MSC, y*MSC, Math.max(1,w*MSC), Math.max(1,h*MSC));
  };
  // Built regions
  B(256,  2048, 2048, 3584, "#0d2614"); // Whispering Woods
  B(4096,  512, 2240, 1600, "#7a4a3e"); // School District
  B(2560, 2304, 2048, 1152, "#3a6040"); // Maple Park
  B(5632, 2560, 2240, 1920, "#4a3a6a"); // Maple Mart District
  B(2560, 3584, 2560, 2560, "#3f5d44"); // Maple Court (neighbourhood)
  // Built non-hub regions
  B(512,   512, 1536, 1280, "#8a6a3e"); // Construction site (built)
  B(6336, 1024, 1024, 1088, "#3a6a3a"); // Athletic fields (built)
  B(6656,  512, 1024,  512, "#4a6a52"); // Water tower overlook (built)
  // Reserved regions (darker/muted so they read as "not yet open")
  B(2560, 6400, 5376, 1536, "#2e7a9e"); // Great Waterfront Lake (built)
  B(256,  5888, 2048, 2048, "#2c5232"); // Meadow reserve (same as base)
  // Pond
  B(3082, 2638,  236,  224, "#2e6f8e");
  // Roads
  B(RX,    512,  140, 5888, "#2a2345"); // main N-S road (extends to lake)
  B(2560, HY1,  2560,  140, "#2a2345"); // HY1
  B(2560, HY2,  2560,  140, "#2a2345"); // HY2
  B(4588, HY1,  1044,  140, "#2a2345"); // shopping connector (HY1 east)
  mini = c;
}
