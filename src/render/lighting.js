import { VW, VH, PX, GOAL } from '../engine/constants.js';
import { snap, rectW, inView, getCtx, getCam } from './draw.js';
import { mini, MSC } from '../world/minimap.js';
import { getFriendLevel } from '../engine/friends.js';

export function drawShadows(walls){
  const ctx = getCtx(), cam = getCam();
  ctx.fillStyle = "rgba(20,12,45,.32)";
  for(const w of walls){
    if(w.ghost || w.noshadow || !inView(w.x,w.y,w.w,w.h)) continue;
    const lift = (w.type==="house"||w.type==="school"||w.type==="market") ? 30 : w.type==="tree" ? 8 : 10;
    ctx.fillRect(snap(w.x-cam.x+16), snap(w.y-cam.y+10), snap(w.w), snap(w.h+lift));
  }
}

export function drawCanopies(canopies, frame){
  const ctx = getCtx(), cam = getCam();
  for(const c of canopies){
    if(!inView(c.x-c.r, c.y-c.r, c.r*2, c.r*2)) continue;
    const x = c.x - cam.x, y = c.y - cam.y, sway = 0; // no sway — static trunks must match canopy position
    ctx.fillStyle = "#142e1b"; ctx.beginPath(); ctx.arc(x+sway, y+3, c.r+3, 0, 7); ctx.fill();
    ctx.globalAlpha = .95;
    ctx.fillStyle = "#1d4527"; ctx.beginPath(); ctx.arc(x+sway, y, c.r, 0, 7); ctx.fill();
    ctx.fillStyle = "#2a5d35"; ctx.beginPath(); ctx.arc(x+sway-c.r*.25, y-c.r*.22, c.r*.62, 0, 7); ctx.fill();
    ctx.fillStyle = "#3a7a45"; ctx.beginPath(); ctx.arc(x+sway-c.r*.35, y-c.r*.35, c.r*.3, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

export function drawFireflies(flies, frame){
  const ctx = getCtx(), cam = getCam();
  for(const f of flies){
    if(!inView(f.x,f.y,4,4)) continue;
    const tw = .35 + .65*Math.abs(Math.sin(f.p*1.7));
    ctx.fillStyle = "rgba(255,230,140," + tw + ")";
    ctx.fillRect(snap(f.x-cam.x), snap(f.y-cam.y + Math.sin(f.p*2)*5), PX, PX);
  }
}

export function drawLamps(lamps){
  const ctx = getCtx(), cam = getCam();
  for(const L of lamps){
    if(!inView(L.x-90, L.y-140, 180, 240)) continue;
    const x = L.x - cam.x, y = L.y - cam.y;
    const g = ctx.createRadialGradient(x, y, 4, x, y, 86);
    g.addColorStop(0, "rgba(255,215,130,.34)"); g.addColorStop(1, "rgba(255,215,130,0)");
    ctx.fillStyle = g; ctx.fillRect(x-86, y-86, 172, 172);
    rectW("#1b1430", L.x-3, L.y-44, 7, 44);
    rectW("#ffe9c2", L.x-6, L.y-52, 13, 9);
  }
}

export function drawDuskWash(){
  const ctx = getCtx();
  let g = ctx.createLinearGradient(0,0,0,VH);
  g.addColorStop(0,"rgba(45,22,90,.30)"); g.addColorStop(.55,"rgba(255,140,80,.10)"); g.addColorStop(1,"rgba(25,12,50,.34)");
  ctx.fillStyle = g; ctx.fillRect(0,0,VW,VH);
  g = ctx.createRadialGradient(VW/2,VH/2,VH*.42,VW/2,VH/2,VH*.85);
  g.addColorStop(0,"rgba(0,0,0,0)"); g.addColorStop(1,"rgba(8,5,20,.55)");
  ctx.fillStyle = g; ctx.fillRect(0,0,VW,VH);
}

export function drawSpeechBubbles(npcs, player, frame){
  const ctx = getCtx(), cam = getCam();
  for(const n of npcs){
    if(n.kind !== "kid") continue;
    const d = Math.hypot(n.x-player.x, n.y-player.y);
    if(d > 150 || !inView(n.x-120, n.y-90, 240, 100)) continue;
    // Friend NPCs use level-appropriate dialogue; others use static lines
    let lines = n.lines;
    if(n.friendKey && n.friendLines){
      const lvl = getFriendLevel(n.friendKey);
      lines = n.friendLines[Math.min(lvl, n.friendLines.length - 1)];
    }
    if(!lines) continue;
    const line = lines[Math.floor(frame/260) % lines.length];
    const bw = line.length*6.6 + 18, bx = Math.max(6, Math.min(n.x-cam.x - bw/2, VW-bw-6)), by = n.y-cam.y - 74;
    ctx.fillStyle = "rgba(20,14,40,.85)"; ctx.fillRect(bx, by, bw, 24);
    ctx.strokeStyle = "rgba(255,196,77,.8)"; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, 24);
    ctx.fillStyle = "#ffe9c2"; ctx.font = "700 11px monospace"; ctx.textBaseline = "middle";
    ctx.fillText(line, bx+9, by+13);
  }
}

export function drawMinimap(player, dog){
  const ctx = getCtx();
  if(!mini) return;
  const mx0 = 12, my0 = VH - mini.height - 12;
  ctx.fillStyle = "rgba(20,14,40,.65)"; ctx.fillRect(mx0-4, my0-4, mini.width+8, mini.height+8);
  ctx.drawImage(mini, mx0, my0);
  ctx.strokeStyle = "rgba(255,196,77,.7)"; ctx.lineWidth = 2;
  ctx.strokeRect(mx0-4, my0-4, mini.width+8, mini.height+8);
  ctx.fillStyle = "#ffe9c2"; ctx.fillRect(mx0 + GOAL.x*MSC - 2, my0 + GOAL.y*MSC - 2, 5, 5);
  ctx.fillStyle = "#ffc44d"; ctx.fillRect(mx0 + player.x*MSC - 2, my0 + player.y*MSC - 2, 5, 5);
  if(dog.mode !== "sleep"){ ctx.fillStyle = "#ff6b57"; ctx.fillRect(mx0 + dog.x*MSC - 2, my0 + dog.y*MSC - 2, 5, 5); }
}

export function drawBiscuitArrow(dog, state){
  const ctx = getCtx(), cam = getCam();
  if(state !== "run" || dog.mode !== "chase") return;
  const sx = dog.x - cam.x, sy = dog.y - cam.y;
  if(sx < -10 || sx > VW+10 || sy < -10 || sy > VH+10){
    const ax = Math.max(26, Math.min(sx, VW-26)), ay = Math.max(26, Math.min(sy, VH-26));
    const ang = Math.atan2(sy-ay, sx-ax);
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang);
    ctx.fillStyle = "#ff6b57";
    ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-8,-9); ctx.lineTo(-8,9); ctx.fill();
    ctx.restore();
  }
}
