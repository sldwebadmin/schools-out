import { R } from '../engine/utils.js';

export function makeNPCs(){
  const npcs = [
    // Walk-patrol NPCs
    { kind:"walk", variant:0, wps:[[3000,6450],[3900,6450],[3900,6600],[3000,6600]], spd:1.0, shirt:"#7fb069", hair:"#2b2118" },
    { kind:"walk", variant:1, wps:[[3100,500],[5000,500],[5000,1600],[3100,1600]],   spd:.9,  shirt:"#b07f9e", hair:"#4a3322" },
    { kind:"walk", variant:2, wps:[[6100,2400],[7900,2400],[7900,3800],[6100,3800]], spd:.8,  shirt:"#6f8eb0", hair:"#1b1430" },
    // Bike-patrol NPCs
    { kind:"bike", variant:0, wps:[[4096,2100],[4096,5300]], pp:true, spd:2.6, shirt:"#ff8f57", hair:"#2b2118" },
    { kind:"bike", variant:1, wps:[[2816,6310],[5376,6310]], pp:true, spd:2.3, shirt:"#57b8ff", hair:"#4a3322" },
    // Stationary kids
    { kind:"kid", variant:0, wps:[[4000,2420]], spd:0, shirt:"#ffd27a", hair:"#1b1430",
      lines:["Biscuit got loose again!","The pond's full of frogs!"] },
    { kind:"kid", variant:1, wps:[[5200,3000]], spd:0, shirt:"#9ad17f", hair:"#4a3322",
      lines:["E-bike race Saturday!","The garden is ready to harvest."] },
    { kind:"kid", variant:1, wps:[[3600,1200]], spd:0, shirt:"#ff9ac1", hair:"#2b2118",
      lines:["Tag — you're it!","Swings are the best.","Go Bulldogs!"] },
    { kind:"kid", variant:2, wps:[[4800,5620]], spd:0, shirt:"#a78bdb", hair:"#1b1430",
      lines:["First to 11 wins.","Hoops, then popsicles?"] },
    { kind:"kid", variant:2, wps:[[6500,2500]], spd:0, shirt:"#7fd8cf", hair:"#4a3322",
      lines:["Mom's grabbing popsicles!","Maple Mart has the good freezer."] },
  ];
  for(const n of npcs){
    n.x=n.wps[0][0]; n.y=n.wps[0][1];
    n.i=n.wps.length>1?1:0; n.anim=R(0,6); n.face=1; n.dir=2;
  }
  return npcs;
}
