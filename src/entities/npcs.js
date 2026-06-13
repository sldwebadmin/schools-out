import { R } from '../engine/utils.js';

export function makeNPCs(){
  const npcs = [
    // Walk-patrol NPCs (one per built region)
    { kind:"walk", variant:0, wps:[[2700,4100],[3500,4100],[3500,4400],[2700,4400]], spd:1.0, shirt:"#7fb069", hair:"#2b2118" },
    { kind:"walk", variant:1, wps:[[4200,700],[6200,700],[6200,1900],[4200,1900]],   spd:.9,  shirt:"#b07f9e", hair:"#4a3322" },
    { kind:"walk", variant:2, wps:[[5800,2700],[7700,2700],[7700,4300],[5800,4300]], spd:.8,  shirt:"#6f8eb0", hair:"#1b1430" },
    // Bike-patrol NPCs
    { kind:"bike", variant:0, wps:[[4518,2300],[4518,5700]], pp:true, spd:2.6, shirt:"#ff8f57", hair:"#2b2118" },
    { kind:"bike", variant:1, wps:[[2560,4550],[5120,4550]], pp:true, spd:2.3, shirt:"#57b8ff", hair:"#4a3322" },
    // Stationary kids
    { kind:"kid", variant:0, wps:[[3200,2650]], spd:0, shirt:"#ffd27a", hair:"#1b1430",
      lines:["Biscuit got loose again!","The pond's full of frogs!"] },
    { kind:"kid", variant:1, wps:[[4100,3200]], spd:0, shirt:"#9ad17f", hair:"#4a3322",
      lines:["E-bike race Saturday!","The garden is ready to harvest."] },
    { kind:"kid", variant:1, wps:[[4800,1100]], spd:0, shirt:"#ff9ac1", hair:"#2b2118",
      lines:["Tag — you're it!","Swings are the best.","Go Bulldogs!"] },
    { kind:"kid", variant:2, wps:[[4720,3800]], spd:0, shirt:"#a78bdb", hair:"#1b1430",
      lines:["First to 11 wins.","Hoops, then popsicles?"] },
    { kind:"kid", variant:2, wps:[[6700,2750]], spd:0, shirt:"#7fd8cf", hair:"#4a3322",
      lines:["Mom's grabbing popsicles!","Maple Mart has the good freezer."] },
  ];
  for(const n of npcs){
    n.x=n.wps[0][0]; n.y=n.wps[0][1];
    n.i=n.wps.length>1?1:0; n.anim=R(0,6); n.face=1; n.dir=2;
  }
  return npcs;
}
