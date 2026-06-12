import { WORLD, RX, HY1, HY2 } from '../engine/constants.js';
import { bakeCanvas } from '../engine/utils.js';

export let mini = null;
export let MSC = 0;

export function bakeMini(){
  MSC = 150 / WORLD.w;
  const mh = Math.round(WORLD.h * MSC);
  const [c, g] = bakeCanvas(150, mh);
  g.fillStyle = "#2c5232"; g.fillRect(0,0,150,mh);
  const B = (x,y,w,h,col)=>{ g.fillStyle=col; g.fillRect(x*MSC, y*MSC, Math.max(1,w*MSC), Math.max(1,h*MSC)); };
  B(26,950,620,2010,"#15331c");
  B(660,760,2580,180,"#15331c");
  B(3240,950,180,2010,"#15331c");
  B(1240,80,1620,640,"#7a4a3e");
  B(660,940,2580,2034,"#3f5d44");
  B(860,1090,380,220,"#2e6f8e");
  B(3420,1100,560,1340,"#5d4a7a");
  B(RX,940,140,1540,"#2a2345");
  B(660,HY1,3300,140,"#2a2345");
  B(660,HY2,2580,140,"#2a2345");
  B(3680,1590,140,850,"#2a2345");
  mini = c;
}
