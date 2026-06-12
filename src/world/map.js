import { WORLD, RX, HY1, HY2 } from '../engine/constants.js';
import { mulberry32 } from '../engine/utils.js';

export const walls = [];
export const canopies = [];
export const lamps = [];

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

export function buildMap(){
  walls.length=0; canopies.length=0; lamps.length=0;

  // World border hedge
  addWall(0,0,WORLD.w,26,"hedge"); addWall(0,WORLD.h-26,WORLD.w,26,"hedge");
  addWall(0,0,26,WORLD.h,"hedge"); addWall(WORLD.w-26,0,26,WORLD.h,"hedge");

  /* ══════════════════════════════════════════════════════
     SCHOOL DISTRICT  x=2976..5216, y=128..1728
  ══════════════════════════════════════════════════════ */
  // Perimeter fence (south gap lets road and players through)
  fence(3000,148,2192,true,[]);                      // north
  fence(3000,1700,2192,true,[[980,180]]);             // south — gate at centre for main road
  fence(3000,148,1552,false,[[400,90]]);              // west side
  fence(5192,148,1552,false,[]);                      // east side
  // Buildings
  addWall(3200,200,1600,500,"school");               // main building
  addWall(5000,200,180,480,"school");                // science wing
  addWall(3200,800,800,240,"school");                // south gym
  // Props
  addWall(4088,510,8,8,"flag",{ghost:true});
  addWall(1480+1680,640+40,46,12,"rack",{hop:true});  // = 3160,680
  addWall(3160,680,46,12,"rack",{hop:true});
  addWall(3400,1180,8,8,"swing",{ghost:true});
  addWall(3620,1150,8,8,"slide",{ghost:true});
  addWall(4040,1710,12,14,"sign",{ghost:true,txt:"MAPLE ELEMENTARY",txt2:"Go Bulldogs!"});
  // Trees outside fence
  addTree(2860,240,56); addTree(2760,580,60); addTree(2820,940,52);
  addTree(5280,200,56); addTree(5440,600,60); addTree(5320,980,52);
  addTree(3100,1740,54); addTree(4500,1740,54);
  // Lamps inside campus
  lamps.push({x:4096,y:700}); lamps.push({x:4096,y:1400});
  lamps.push({x:3400,y:700}); lamps.push({x:4800,y:700});

  /* ══════════════════════════════════════════════════════
     WHISPERING WOODS  x=0..3200, y=2048..4608
  ══════════════════════════════════════════════════════ */
  const sf=mulberry32(99);
  for(let i=0;i<28;i++){
    const tx=26+sf()*3150, ty=2060+sf()*2520;
    // Skip the main road corridor and park entrance
    if(tx>3900&&tx<4300) continue;
    addTree(tx,ty,46+sf()*24);
  }
  addWall(300,2120,12,14,"sign",{ghost:true,txt:"WHISPERING WOODS",txt2:"stay on the trail"});
  // Lamp at woods entrance
  lamps.push({x:320,y:2200}); lamps.push({x:320,y:3800});

  /* ══════════════════════════════════════════════════════
     MAPLE PARK  x=3200..5760, y=2048..3648
  ══════════════════════════════════════════════════════ */
  addWall(860+2550,1090+1000,380,220,"pond",{noshadow:true}); // = 3410,2090 — visual pond wall
  addWall(3410,2090,380,220,"pond",{noshadow:true});
  addWall(5100,3240,56,30,"table",{hop:true});
  addWall(5220,3340,56,30,"table",{hop:true});
  addWall(3400,2060,12,14,"sign",{ghost:true,txt:"MAPLE PARK",txt2:""});
  addWall(5000,3108,10,10,"scare",{ghost:true});
  addWall(4952,3100,12,14,"sign",{ghost:true,txt:"COMMUNITY GARDEN",txt2:""});
  // Trees around pond and park
  addTree(3380,2480,58); addTree(3600,2800,54); addTree(3400,3200,56);
  addTree(5500,2200,52); addTree(5600,3500,56); addTree(4600,3500,52);
  lamps.push({x:4000,y:2200}); lamps.push({x:5200,y:3400});

  /* ══════════════════════════════════════════════════════
     MAPLE MART (SHOPPING)  x=5952..8192, y=2048..3968
  ══════════════════════════════════════════════════════ */
  addWall(6050,2200,1800,600,"market");              // main market building
  addWall(7900,2200,250,800,"market");               // east wing
  addWall(6050,3000,500,400,"market");               // south storefront
  addWall(6700,1800,26,20,"cart",{hop:true});
  addWall(6760,1840,26,20,"cart",{hop:true});
  addWall(6600,3860,10,10,"cone",{ghost:true});
  addWall(7800,3860,10,10,"cone",{ghost:true});
  addWall(6620,3930,12,14,"sign",{ghost:true,txt:"MAPLE MART DISTRICT",txt2:"open daily 8am–8pm"});
  addWall(7000,2100,12,14,"sign",{ghost:true,txt:"E-BIKE GRAND PRIX",txt2:"saturday · starts here"});
  addTree(6020,3700,56); addTree(8100,2600,60); addTree(7600,3600,52);
  lamps.push({x:6200,y:2200}); lamps.push({x:7000,y:3500}); lamps.push({x:7800,y:2600});

  /* ══════════════════════════════════════════════════════
     MAPLE COURT (NEIGHBOURHOOD)  x=2816..5376, y=5376..7936
  ══════════════════════════════════════════════════════ */
  // NW house (north of HY1, west of main road)
  yard(2900,5430,520,480,"#6b4a76",{tree:true,mailbox:true});
  // NE house (north of HY1, east of main road)
  yard(4350,5430,520,480,"#5c6f9e",{mailbox:true});
  // SE between streets (east of main road, between HY1 and HY2)
  yard(4350,6430,460,240,"#4f6b5e",{mailbox:true});
  // SW between streets — BISCUIT'S YARD
  fence(3100,6390,760,true,[[300,100]]);
  fence(3100,6700,760,true,[]);
  fence(3100,6390,310,false,[[140,76]]);
  fence(3860,6390,310,false,[[140,76]]);
  addWall(3300,6450,260,180,"house",{hue:"#8a6f3e",trim:"#ffe9c2"});
  addWall(3670,6530,60,50,"doghouse",{ghost:true});
  addWall(3200,6400,12,14,"sign",{ghost:true,txt:"BEWARE OF DOG",txt2:"(his name is Biscuit)"});
  addTree(3920,6450,56); addTree(4020,6620,50);
  // South-west house (south of HY2)
  yard(2900,7050,520,420,"#56406f",{tree:true,mailbox:true});
  // South-east house (south of HY2)
  yard(4350,7050,520,420,"#7a5560",{mailbox:true});
  // Player's house (west of cul-de-sac)
  yard(3500,7420,440,360,"#2e8f8a",{player:true,trim:"#ffc44d",mailbox:true,frontGapAt:170,tree:true});
  // Basketball court hoop prop
  addWall(4825,5484,8,8,"hoop",{ghost:true});

  // Neighbourhood trees
  addTree(2820,6000,52); addTree(5300,6000,54);
  addTree(2820,7300,54); addTree(5300,7300,52);

  // Streetlamps — main road alternating sides through neighbourhood
  for(let y=5550;y<7600;y+=400){
    lamps.push({x: (Math.floor((y-5550)/400)%2===0 ? RX-30 : RX+170), y});
  }
  // Intersection lamps
  lamps.push({x:RX-30,y:HY1-20}); lamps.push({x:RX+170,y:HY1-20});
  lamps.push({x:RX-30,y:HY2-20}); lamps.push({x:RX+170,y:HY2-20});
}
