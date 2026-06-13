import { WORLD, RX, HY1, HY2 } from '../engine/constants.js';
import { mulberry32 } from '../engine/utils.js';

export const walls = [];
export const canopies = [];
export const lamps = [];
export const doors = []; // {x,y,w,h, target:"key"|null, spawnX,spawnY, worldReturn:{x,y}, txt}

function addWall(x,y,w,h,type,o={}){ walls.push(Object.assign({x,y,w,h,type,hop:false,ghost:false},o)); }
function addTree(x,y,r){
  addWall(x,y,20,20,"tree");
  canopies.push({x:x+10,y:y+4,r});
}
function fence(x,y,len,horiz,gaps){
  const T=10;
  let segs=[[0,len]];
  for(const [go,gw] of gaps){
    const out=[];
    for(const [s,e] of segs){
      if(go>s&&go<e){ out.push([s,go]); out.push([go+gw,e]); }
      else out.push([s,e]);
    }
    segs=out;
  }
  for(const [s,e] of segs){
    if(e-s<8) continue;
    if(horiz) addWall(x+s,y,e-s,T,"fence",{hop:true});
    else      addWall(x,y+s,T,e-s,"fence",{hop:true});
  }
}
function yard(x,y,w,h,hue,opts={}){
  const frontGapAt = opts.frontGapAt!==undefined ? opts.frontGapAt : w/2-45;
  fence(x,y,w,true,[[frontGapAt,90]]);
  fence(x,y+h-10,w,true,[]);
  fence(x,y,h,false,[[h*.45,76]]);
  fence(x+w-10,y,h,false,[[h*.45,76]]);
  const hw=opts.hw||Math.min(250,w-150), hh=170;
  const hx=x+(w-hw)/2, hy=y+h-hh-90;
  addWall(hx,hy,hw,hh,"house",{hue,trim:opts.trim||"#ffe9c2",player:!!opts.player});
  if(opts.tree) addTree(x+36,y+h-110,52);
  addWall(hx+hw+8,hy+hh-40,24,24,"trash",{hop:true});
  if(opts.mailbox) addWall(x+frontGapAt+98,y-6,10,12,"mailbox",{ghost:true});
}
function door(x,y,w,h,target,spawnX,spawnY,worldReturn,txt=''){
  doors.push({x,y,w,h,target,spawnX,spawnY,worldReturn,txt});
}

export function buildMap(){
  walls.length=0; canopies.length=0; lamps.length=0; doors.length=0;

  // World border hedge
  addWall(0,0,WORLD.w,26,"hedge"); addWall(0,WORLD.h-26,WORLD.w,26,"hedge");
  addWall(0,0,26,WORLD.h,"hedge"); addWall(WORLD.w-26,0,26,WORLD.h,"hedge");

  /* ══════════════════════════════════════════════════════
     SCHOOL DISTRICT  x=4096..6336, y=512..2112
     (built region — relocated from old x=2976..5216, y=128..1728)
  ══════════════════════════════════════════════════════ */
  // Perimeter fence (south gap at gate for main road)
  fence(4120,532,2192,true,[]);                       // north
  fence(4120,2080,2192,true,[[980,180]]);              // south — gate centered
  fence(4120,532,1548,false,[[400,90]]);               // west
  fence(6312,532,1548,false,[]);                       // east
  // Buildings
  addWall(4320,584,1600,500,"school");                // main building
  addWall(6120,584,180,480,"school");                 // science wing
  addWall(4320,1184,800,240,"school");                // south gym
  // Props
  addWall(5208,894,8,8,"flag",{ghost:true});
  addWall(4280,1064,46,12,"rack",{hop:true});
  addWall(4520,1564,8,8,"swing",{ghost:true});
  addWall(4740,1534,8,8,"slide",{ghost:true});
  addWall(5100,2090,12,14,"sign",{ghost:true,txt:"MAPLE ELEMENTARY",txt2:"Go Bulldogs!"});
  // Trees outside fence
  addTree(3980,560,56); addTree(3880,900,60); addTree(3940,1260,52);
  addTree(6400,540,56); addTree(6560,940,60); addTree(6440,1300,52);
  addTree(4320,2100,54); addTree(5700,2100,54);
  // Lamps inside campus
  lamps.push({x:5200,y:900}); lamps.push({x:5200,y:1800});
  lamps.push({x:4600,y:900}); lamps.push({x:5800,y:900});

  /* ══════════════════════════════════════════════════════
     WHISPERING WOODS  x=256..2304, y=2048..5632
  ══════════════════════════════════════════════════════ */
  const sf=mulberry32(99);
  for(let i=0;i<28;i++){
    const tx=256+sf()*2048, ty=2048+sf()*3584;
    addTree(tx,ty,46+sf()*24);
  }
  addWall(300,2140,12,14,"sign",{ghost:true,txt:"WHISPERING WOODS",txt2:"stay on the trail"});
  lamps.push({x:340,y:2220}); lamps.push({x:340,y:3800}); lamps.push({x:340,y:5200});

  /* ── Treehouse Village (clearing x=900..1400, y=3060..3500) ─────── */
  // Three treehouses
  addWall(1070,3040,140,200,"treehouse");  // Club HQ (main, with door)
  addWall(860,3060,110,160,"treehouse");   // Left treehouse
  addWall(1090,3360,110,140,"treehouse");  // South treehouse
  // Rope bridges (ghost:true — walkable, elevated visual only)
  addWall(970,3130,100,20,"bridge",{ghost:true});   // horizontal: left → main
  addWall(1115,3240,24,120,"bridge",{ghost:true});  // vertical: main → south
  // Ladder visual (south face of Club HQ)
  addWall(1108,3220,44,10,"ladder",{ghost:true});
  // Clearing perimeter trees
  addTree(870,3040,44);  addTree(960,3040,48);
  addTree(1260,3040,46); addTree(1350,3040,50);
  addTree(840,3300,46);  addTree(1260,3300,50);
  addTree(860,3480,44);  addTree(1060,3500,46); addTree(1260,3490,48);
  // Signs
  addWall(2272,2912,12,14,"sign",{ghost:true,txt:"TREEHOUSE VILLAGE",txt2:"follow the trail →"});
  addWall(710,5546,12,14,"sign",{ghost:true,txt:"what's up here?",txt2:"a trail goes north..."});
  addWall(710,3510,12,14,"sign",{ghost:true,txt:"nice exploring!",txt2:"back entrance to the village"});
  // Clearing lamps
  lamps.push({x:1000,y:3160}); lamps.push({x:1260,y:3420});

  /* ══════════════════════════════════════════════════════
     MAPLE PARK  x=2560..4608, y=2304..3456
  ══════════════════════════════════════════════════════ */
  addWall(2982,2638,380,220,"pond",{noshadow:true});
  addWall(3900,3200,56,30,"table",{hop:true});
  addWall(4020,3300,56,30,"table",{hop:true});
  addWall(2620,2350,12,14,"sign",{ghost:true,txt:"MAPLE PARK",txt2:""});
  addWall(4000,3132,10,10,"scare",{ghost:true});
  addWall(3960,3120,12,14,"sign",{ghost:true,txt:"COMMUNITY GARDEN",txt2:""});
  // Park trees
  addTree(2600,2700,58); addTree(2780,3000,54); addTree(2600,3200,56);
  addTree(4440,2380,52); addTree(4500,3300,56); addTree(4000,3350,52);
  lamps.push({x:3200,y:2400}); lamps.push({x:4100,y:3300});
  // Treehouse trail markers (along y=2920 from main road west to woods)
  addWall(4390,2912,12,14,"sign",{ghost:true,txt:"TREEHOUSE VILLAGE",txt2:"follow the trail west"});
  lamps.push({x:4380,y:2920}); lamps.push({x:3500,y:2920}); lamps.push({x:2600,y:2920});

  /* ══════════════════════════════════════════════════════
     MAPLE MART (SHOPPING)  x=5632..7872, y=2560..4480
  ══════════════════════════════════════════════════════ */
  addWall(5730,2712,1800,600,"market");               // main market building
  addWall(7560,2712,260,800,"market");                // east wing
  addWall(5730,3512,500,400,"market");                // south storefront
  addWall(6380,2312,26,20,"cart",{hop:true});
  addWall(6440,2352,26,20,"cart",{hop:true});
  addWall(6280,4372,10,10,"cone",{ghost:true});
  addWall(7480,4372,10,10,"cone",{ghost:true});
  addWall(6300,4442,12,14,"sign",{ghost:true,txt:"MAPLE MART DISTRICT",txt2:"open daily 8am–8pm"});
  addWall(6680,2612,12,14,"sign",{ghost:true,txt:"E-BIKE GRAND PRIX",txt2:"saturday · starts here"});
  addTree(5710,4200,56); addTree(7780,3100,60); addTree(7280,4100,52);
  lamps.push({x:5900,y:2750}); lamps.push({x:6700,y:4000}); lamps.push({x:7500,y:3100});

  /* ══════════════════════════════════════════════════════
     MAPLE COURT (NEIGHBOURHOOD)  x=2560..5120, y=3584..6144
     HY1=4480, HY2=5248, main road RX=4448..4588
  ══════════════════════════════════════════════════════ */
  // NW house (north of HY1, west of main road)
  yard(2640,3640,520,480,"#6b4a76",{tree:true,mailbox:true});
  // NE house (north of HY1, east of main road)
  yard(4640,3640,520,480,"#5c6f9e",{mailbox:true});
  // Basketball court hoop prop (NE area)
  addWall(4720,3700+300,8,8,"hoop",{ghost:true});
  // SE between-streets (east of road, between HY1 and HY2)
  yard(4640,4660,460,240,"#4f6b5e",{mailbox:true});
  // SW between-streets — BISCUIT'S YARD
  fence(2900,4640,760,true,[[300,100]]);
  fence(2900,4940,760,true,[]);
  fence(2900,4640,300,false,[[140,76]]);
  fence(3660,4640,300,false,[[140,76]]);
  addWall(3060,4700,260,180,"house",{hue:"#8a6f3e",trim:"#ffe9c2"});
  addWall(3480,4760,60,50,"doghouse",{ghost:true});
  addWall(2940,4650,12,14,"sign",{ghost:true,txt:"BEWARE OF DOG",txt2:"(his name is Biscuit)"});
  addTree(3720,4660,56); addTree(3820,4820,50);
  // South-west house (south of HY2)
  yard(2640,5260,520,420,"#56406f",{tree:true,mailbox:true});
  // South-east house (south of HY2)
  yard(4640,5260,520,420,"#7a5560",{mailbox:true});
  // Player's house (west of cul-de-sac)
  yard(3760,5630,440,360,"#2e8f8a",{player:true,trim:"#ffc44d",mailbox:true,frontGapAt:170,tree:true});

  // Neighbourhood trees
  addTree(2580,4100,52); addTree(5060,4100,54);
  addTree(2580,5500,54); addTree(5060,5500,52);

  // Streetlamps — main road alternating sides through neighbourhood
  for(let y=3700;y<5850;y+=400){
    lamps.push({x: (Math.floor((y-3700)/400)%2===0 ? RX-30 : RX+170), y});
  }
  // Intersection lamps
  lamps.push({x:RX-30,y:HY1-20}); lamps.push({x:RX+170,y:HY1-20});
  lamps.push({x:RX-30,y:HY2-20}); lamps.push({x:RX+170,y:HY2-20});

  /* ══════════════════════════════════════════════════════
     RESERVED REGIONS — teaser signs + physical borders
  ══════════════════════════════════════════════════════ */

  /* ══════════════════════════════════════════════════════
     GREAT WATERFRONT LAKE  x=2560..7936, y=6400..7936
     Sand y=6400..6450, boardwalk y=6450..6490, water y=6490+
  ══════════════════════════════════════════════════════ */
  // Snack shack (east boardwalk, south face at y=6450)
  addWall(6520,6310,260,140,"shack");
  // Water barrier — gap at dock (x=4396..4564)
  addWall(2560,6490,1836,26,"water");
  addWall(4564,6490,3372,26,"water");
  // Dock (walkable, visual only)
  addWall(4396,6490,168,280,"dock",{ghost:true});
  // Paddle boats on dock
  addWall(4410,6560,48,36,"paddleboat",{ghost:true,hue:"#57b8ff"});
  addWall(4492,6630,48,36,"paddleboat",{ghost:true,hue:"#ff8f57"});
  // Beach umbrellas on sand
  addWall(3000,6422,60,4,"umbrella",{ghost:true,hue:"#ff6b57"});
  addWall(3600,6422,60,4,"umbrella",{ghost:true,hue:"#ffc44d"});
  addWall(4800,6422,60,4,"umbrella",{ghost:true,hue:"#2ec4b6"});
  addWall(5300,6422,60,4,"umbrella",{ghost:true,hue:"#ff9ac1"});
  addWall(5900,6422,60,4,"umbrella",{ghost:true,hue:"#9ad17f"});
  // Ice cream truck (north side of sand, near main road)
  addWall(3060,6330,120,80,"truck",{ghost:true});
  // Signs
  addWall(2650,6410,12,14,"sign",{ghost:true,txt:"GREAT WATERFRONT LAKE",txt2:"no swimming beyond the dock"});
  addWall(4396,6462,12,14,"sign",{ghost:true,txt:"DOCK",txt2:"watch your step"});
  // Boardwalk lamps
  lamps.push({x:3100,y:6465}); lamps.push({x:5000,y:6465}); lamps.push({x:6560,y:6465});
  // Trees at east and west lake edges
  addTree(2600,6390,52); addTree(7840,6390,52);

  // Construction site (NW, x=512..2048, y=512..1792)
  addWall(512,512,1536,26,"hedge");   // north
  addWall(512,1766,1536,26,"hedge");  // south
  addWall(512,512,26,1280,"hedge");   // west
  addWall(2022,512,26,1280,"hedge");  // east
  addWall(1150,560,12,14,"sign",{ghost:true,txt:"DANGER",txt2:"CONSTRUCTION ZONE"});
  addWall(1000,900,12,14,"sign",{ghost:true,txt:"KEEP OUT",txt2:"seriously"});

  // Athletic fields (east of school, x=6336..7360, y=1024..2112)
  addWall(6336,1024,12,14,"sign",{ghost:true,txt:"ATHLETIC FIELDS",txt2:"FIELDS UNDER PREP"});

  // Water tower overlook (x=6656..7680, y=512..1536)
  addWall(6700,560,12,14,"sign",{ghost:true,txt:"WATER TOWER",txt2:"CLIMB AT YOUR OWN RISK"});

  // Meadow reserve (x=256..2304, y=5888..7936)
  addWall(300,5950,12,14,"sign",{ghost:true,txt:"MEADOW RESERVE",txt2:"future development"});

  /* ══════════════════════════════════════════════════════
     DOORS
  ══════════════════════════════════════════════════════ */

  // Player's house — yard(3760,5630,440,360): hx=3855, hy=5730, south=5900
  door(3923,5888,64,22,"house",240,200,{x:3955,y:5932});

  // Maple Mart — market building south face y=3312
  door(6598,3300,80,22,"mart",320,340,{x:6640,y:3355});

  // School main building — south face y=1084, locked
  door(5088,1072,100,22,null,0,0,{x:5138,y:1106},"School's out for summer!");

  // School gym — south face y=1424, locked
  door(4688,1412,80,22,null,0,0,{x:4728,y:1444},"Gym's closed for the summer.");

  // NW house — yard(2640,3640,520,480): south=4030
  door(2708,4018,50,22,null,0,0,{x:2733,y:4040},"Nobody home right now.");

  // NE house — yard(4640,3640,520,480): hx=4775, south=4030
  door(4843,4018,50,22,null,0,0,{x:4868,y:4040},"Back in a bit!");

  // SE between-streets — yard(4640,4660,460,240): hx=4745, hy=4640, south=4810
  door(4813,4798,50,22,null,0,0,{x:4838,y:4820},"Shh — baby napping.");

  // SW south house — yard(2640,5260,520,420): south=5590
  door(2708,5578,50,22,null,0,0,{x:2733,y:5600},"Ring the bell?");

  // SE south house — yard(4640,5260,520,420): south=5590
  door(4843,5578,50,22,null,0,0,{x:4868,y:5600},"Gone fishing.");

  // Snack shack — south face y=6450; door bottom y=6460
  door(6618,6438,64,22,"snackshack",160,185,{x:6650,y:6472});

  // Club HQ treehouse — south face y=3240; door bottom y=3247
  door(1100,3225,60,22,"treehouse_hq",240,150,{x:1140,y:3262});
}
