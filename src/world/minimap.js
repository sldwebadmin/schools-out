import { WORLD, RX, HY1, HY2 } from '../engine/constants.js';
import { bakeCanvas } from '../engine/utils.js';

export let mini = null;
export let MSC = 0;

export function bakeMini(){
  MSC = 150 / WORLD.w; // ≈0.01831 — world is square so mh = 150 too
  const mh = Math.round(WORLD.h * MSC);
  const [c, g] = bakeCanvas(150, mh);
  g.fillStyle = "#2c5232"; g.fillRect(0,0,150,mh);
  const B = (x,y,w,h,col) => {
    g.fillStyle=col;
    g.fillRect(x*MSC, y*MSC, Math.max(1,w*MSC), Math.max(1,h*MSC));
  };
  B(0,    2048, 3200, 2560, "#0d2614"); // Whispering Woods
  B(2976, 128,  2240, 1600, "#7a4a3e"); // School District
  B(3200, 2048, 2560, 1600, "#3a6040"); // Maple Park
  B(5952, 2048, 2240, 1920, "#4a3a6a"); // Maple Mart
  B(2816, 5376, 2560, 2560, "#3f5d44"); // Maple Court (neighbourhood)
  B(3764, 2470, 472,  260,  "#2e6f8e"); // Park pond
  B(RX,   1600, 140,  6080, "#2a2345"); // main N-S road
  B(2816, HY1,  2560, 140,  "#2a2345"); // HY1
  B(2816, HY2,  2560, 140,  "#2a2345"); // HY2
  B(4166, 3100, 1786, 140,  "#2a2345"); // shop spur
  mini = c;
}
