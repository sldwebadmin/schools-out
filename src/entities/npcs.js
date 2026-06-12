import { R } from '../engine/utils.js';

export function makeNPCs(){
  const npcs = [
    { kind:"walk", variant:0, wps:[[730,1615],[1825,1615],[1825,2095],[730,2095]], spd:1.0, shirt:"#7fb069", hair:"#2b2118" },
    { kind:"walk", variant:1, wps:[[2050,955],[3165,955],[3165,1445],[2050,1445]], spd:.9, shirt:"#b07f9e", hair:"#4a3322" },
    { kind:"walk", variant:2, wps:[[3470,1630],[3920,1630],[3920,1860],[3470,1860]], spd:.8, shirt:"#6f8eb0", hair:"#1b1430" },
    { kind:"bike", variant:0, wps:[[700,1520],[3900,1520]], pp:true, spd:2.6, shirt:"#ff8f57", hair:"#2b2118" },
    { kind:"bike", variant:1, wps:[[1950,1000],[1950,2430]], pp:true, spd:2.3, shirt:"#57b8ff", hair:"#4a3322" },
    { kind:"kid", variant:0, wps:[[1380,1170]], spd:0, shirt:"#ffd27a", hair:"#1b1430", lines:["Biscuit got loose again!","We're hitting the playground later!"] },
    { kind:"kid", variant:1, wps:[[1560,1320]], spd:0, shirt:"#9ad17f", hair:"#4a3322", lines:["E-bike race Saturday by the Mart!","The pond is FULL of frogs."] },
    { kind:"kid", variant:1, wps:[[2350,640]], spd:0, shirt:"#ff9ac1", hair:"#2b2118", lines:["You crossed the whole neighborhood?!","Tag — you're it!","Swings are the best."] },
    { kind:"kid", variant:2, wps:[[2280,2400]], spd:0, shirt:"#a78bdb", hair:"#1b1430", lines:["First to 11 wins.","Hoops, then popsicles?"] },
    { kind:"kid", variant:2, wps:[[3620,1660]], spd:0, shirt:"#7fd8cf", hair:"#4a3322", lines:["Mom's grabbing popsicles!","Maple Mart has the good freezer."] },
  ];
  for(const n of npcs){ n.x = n.wps[0][0]; n.y = n.wps[0][1]; n.i = n.wps.length > 1 ? 1 : 0; n.anim = R(0,6); n.face = 1; n.dir = 2; }
  return npcs;
}
