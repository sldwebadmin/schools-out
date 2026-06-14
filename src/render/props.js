import { PX, USE_SHEETS } from '../engine/constants.js';
import { snap, rectW, outline, getCtx, getCam } from './draw.js';
import { getBuildingSprite } from './buildsprites.js';

export function drawWall(w, frame){
  const ctx = getCtx(), cam = getCam();
  const T = w.type;

  if(USE_SHEETS && !w.ghost){
    const sp = getBuildingSprite(w);
    if(sp){
      ctx.drawImage(sp.canvas, snap(w.x - cam.x + sp.ox), snap(w.y - cam.y + sp.oy));
      return;
    }
  }
  if(T === "house"){
    const FW = 48;
    rectW(w.hue, w.x, w.y + w.h - FW, w.w, FW);
    ctx.fillStyle = "rgba(0,0,0,.14)";
    for(let sy = w.y+w.h-FW+9; sy < w.y+w.h; sy += 9) ctx.fillRect(snap(w.x-cam.x), snap(sy-cam.y), snap(w.w), 2);
    rectW("#2a2147", w.x-8, w.y-16, w.w+16, w.h - FW + 16);
    ctx.fillStyle = "rgba(255,255,255,.06)";
    for(let sy = w.y-8; sy < w.y+w.h-FW-8; sy += 11) ctx.fillRect(snap(w.x-8-cam.x), snap(sy-cam.y), snap(w.w+16), 2);
    rectW("#3a2f5c", w.x-8, w.y-16, w.w+16, 9);
    rectW("#241d40", w.x-8, w.y + w.h - FW - 8, w.w+16, 8);
    const doorC = w.player ? "#ffc44d" : "#3a2719";
    rectW(doorC, w.x + w.w*.18, w.y+w.h-34, 20, 34);
    rectW("#1b1430", w.x + w.w*.18 + 14, w.y+w.h-19, PX, PX);
    rectW("#6a5c91", w.x + w.w*.18 - 5, w.y+w.h-2, 30, 6);
    const wx = w.x + w.w*.58, wy = w.y + w.h - 36;
    const lx = wx - cam.x, ly = wy - cam.y;
    const g = ctx.createRadialGradient(lx+10,ly+10,2,lx+10,ly+10,42);
    g.addColorStop(0,"rgba(255,200,110,.45)"); g.addColorStop(1,"rgba(255,200,110,0)");
    ctx.fillStyle = g; ctx.fillRect(lx-30,ly-30,84,84);
    rectW("#ffd27a", wx, wy, 22, 22); rectW(w.trim, wx-2, wy-2, 26, 3); rectW("#a86f3e", wx+9, wy, 4, 22);
    rectW("#ffd27a", w.x + w.w*.78, wy, 16, 22);
    rectW("#241d40", w.x + w.w*.72, w.y-28, 14, 16);
    if(w.player){ rectW("#2ec4b6", w.x + w.w*.18 - 5, w.y+w.h+4, 30, 5); }
    outline(w.x-8, w.y-16, w.w+16, w.h+16);
  }
  else if(T === "school"){
    const FW = 60;
    rectW("#a85546", w.x, w.y + w.h - FW, w.w, FW);
    ctx.fillStyle = "rgba(0,0,0,.12)";
    for(let sy = w.y+w.h-FW+8; sy < w.y+w.h; sy += 8) ctx.fillRect(snap(w.x-cam.x), snap(sy-cam.y), snap(w.w), 2);
    rectW("#7a3d33", w.x-10, w.y-14, w.w+20, w.h-FW+14);
    rectW("#8f4a3e", w.x-10, w.y-14, w.w+20, 10);
    for(let i=0;i<6;i++){
      const wx = w.x + 50 + i*110;
      rectW("#ffe9c2", wx-3, w.y+w.h-50, 30, 26);
      rectW("#ffd27a", wx, w.y+w.h-47, 24, 20);
    }
    rectW("#ffe9c2", w.x + w.w/2 - 34, w.y+w.h-46, 68, 46);
    rectW("#3a2719", w.x + w.w/2 - 26, w.y+w.h-40, 24, 40);
    rectW("#3a2719", w.x + w.w/2 + 2,  w.y+w.h-40, 24, 40);
    ctx.fillStyle = "#ffe9c2"; ctx.font = "900 15px monospace"; ctx.textBaseline = "alphabetic";
    ctx.fillText("MAPLE ELEMENTARY", snap(w.x + w.w/2 - 78 - cam.x), snap(w.y + w.h - 58 - cam.y));
    outline(w.x-10, w.y-14, w.w+20, w.h+14);
  }
  else if(T === "market"){
    const FW = 56;
    rectW("#5d4a7a", w.x, w.y + w.h - FW, w.w, FW);
    rectW("#473a6e", w.x-8, w.y-12, w.w+16, w.h-FW+12);
    for(let i=0;i<8;i++){
      rectW(i%2 ? "#ff6b57" : "#ffe9c2", w.x + 20 + i*72, w.y+w.h-FW-6, 72, 12);
    }
    rectW("#ffd27a", w.x+30, w.y+w.h-42, w.w*.36, 34);
    rectW("#ffe9c2", w.x+30, w.y+w.h-42, w.w*.36, 4);
    rectW("#3a2719", w.x + w.w*.62, w.y+w.h-40, 26, 40);
    ctx.fillStyle = "#ffc44d"; ctx.font = "900 17px monospace";
    ctx.fillText("MAPLE MART", snap(w.x + w.w/2 - 48 - cam.x), snap(w.y + 8 - cam.y));
    outline(w.x-8, w.y-12, w.w+16, w.h+12);
  }
  else if(T === "fence"){
    const horiz = w.w >= w.h;
    if(horiz){
      rectW("#d9cdb8", w.x, w.y-15, w.w, 5); rectW("#d9cdb8", w.x, w.y-4, w.w, 5);
      for(let x = w.x; x < w.x+w.w-6; x += 14){
        rectW("#bdb09a", x+1, w.y-21, 8, 28);
        rectW("#efe5d2", x, w.y-23, 8, 28); rectW("#fff7e8", x, w.y-23, 8, 4);
      }
    } else {
      for(let y = w.y; y < w.y+w.h-6; y += 14){
        rectW("#bdb09a", w.x+1, y-15, 9, 22);
        rectW("#efe5d2", w.x, y-17, 9, 22); rectW("#fff7e8", w.x, y-17, 9, 4);
      }
    }
  }
  else if(T === "tree"){
    rectW("#3a2719", w.x+2, w.y-8, 16, 30);
    rectW("#4a3322", w.x+4, w.y-8, 8, 30); rectW("#5d432f", w.x+5, w.y-8, 3, 30);
  }
  else if(T === "trash"){
    rectW("#4a6b75", w.x, w.y-14, w.w, w.h+14); rectW("#39555e", w.x+6, w.y-14, 5, w.h+14);
    rectW("#6d99a6", w.x+2, w.y-12, 3, w.h+10);
    rectW("#5d8693", w.x-3, w.y-20, w.w+6, 7);
  }
  else if(T === "hedge"){
    rectW("#234a2b", w.x, w.y-8, w.w, w.h+8); rectW("#2e5d36", w.x, w.y-8, w.w, 8);
    ctx.fillStyle = "#3a7a45";
    for(let i=0;i<w.w*w.h/900;i++) ctx.fillRect(snap(w.x+((i*37)%w.w)-cam.x), snap(w.y-6+((i*53)%(w.h+4))-cam.y), PX, PX);
  }
  else if(T === "pond"){ /* baked into the ground */ }
  else if(T === "table"){
    rectW("#8a5730", w.x, w.y-12, w.w, 8); rectW("#a86f3e", w.x-6, w.y-22, w.w+12, 10);
    rectW("#8a5730", w.x+4, w.y-12, 6, 14); rectW("#8a5730", w.x+w.w-10, w.y-12, 6, 14);
  }
  else if(T === "cart"){
    rectW("#9aa7c9", w.x, w.y-14, w.w, 14); rectW("#7d8ab0", w.x+3, w.y-11, w.w-6, 8);
    rectW("#1b1430", w.x+2, w.y+2, 6, 6); rectW("#1b1430", w.x+w.w-8, w.y+2, 6, 6);
  }
  else if(T === "mailbox"){
    rectW("#4a3322", w.x+3, w.y-18, 4, 22);
    rectW("#ff6b57", w.x-3, w.y-26, 16, 10); rectW("#ffc44d", w.x+11, w.y-29, 3, 6);
  }
  else if(T === "sign"){
    rectW("#4a3322", w.x+4, w.y-20, 5, 24);
    const tw = Math.max(w.txt.length, (w.txt2||"").length) * 6.2 + 14;
    rectW("#1b1430", w.x+6 - tw/2 - 2, w.y-46, tw+4, w.txt2 ? 28 : 18);
    rectW("#e8d9b8", w.x+6 - tw/2, w.y-44, tw, w.txt2 ? 24 : 14);
    ctx.fillStyle = "#1b1430"; ctx.font = "700 9px monospace"; ctx.textBaseline = "alphabetic";
    ctx.fillText(w.txt, snap(w.x+6-cam.x) - tw/2 + 5, snap(w.y-34-cam.y));
    if(w.txt2){ ctx.fillStyle = "#5d4a3a"; ctx.fillText(w.txt2, snap(w.x+6-cam.x) - tw/2 + 5, snap(w.y-24-cam.y)); }
  }
  else if(T === "doghouse"){
    rectW("#a86f3e", w.x, w.y-20, w.w, w.h+20);
    rectW("#8a5730", w.x-5, w.y-34, w.w+10, 16);
    rectW("#1b1430", w.x+w.w/2-10, w.y-4, 20, 24);
    ctx.fillStyle = "#ffe9c2"; ctx.font = "700 9px monospace";
    ctx.fillText("BISCUIT", snap(w.x+w.w/2-20-cam.x), snap(w.y-24-cam.y));
  }
  else if(T === "swing"){
    rectW("#8a5730", w.x-46, w.y-66, 8, 66); rectW("#8a5730", w.x+46, w.y-66, 8, 66);
    rectW("#a86f3e", w.x-50, w.y-72, 108, 8);
    for(const off of [-22, 16]){
      const sw = Math.sin(frame*.05 + off)*6;
      rectW("#d9cdb8", w.x+off+sw, w.y-64, 2, 44); rectW("#d9cdb8", w.x+off+12+sw, w.y-64, 2, 44);
      rectW("#ff6b57", w.x+off-2+sw, w.y-20, 18, 6);
    }
  }
  else if(T === "slide"){
    rectW("#8a5730", w.x+30, w.y-52, 8, 52);
    for(let i=0;i<4;i++) rectW("#a86f3e", w.x+26, w.y-44+i*11, 16, 4);
    ctx.fillStyle = "#2ec4b6";
    ctx.beginPath();
    ctx.moveTo(snap(w.x+34-cam.x), snap(w.y-52-cam.y));
    ctx.lineTo(snap(w.x-26-cam.x), snap(w.y+4-cam.y));
    ctx.lineTo(snap(w.x-2-cam.x), snap(w.y+4-cam.y));
    ctx.lineTo(snap(w.x+46-cam.x), snap(w.y-52-cam.y));
    ctx.fill();
    rectW("#7fd8cf", w.x+34, w.y-52, 12, 4);
  }
  else if(T === "flag"){
    rectW("#d9cdb8", w.x, w.y-78, 5, 82);
    const wave = Math.sin(frame*.08)*3;
    rectW("#ffc44d", w.x+5, w.y-76+wave, 26, 14);
    rectW("#ff6b57", w.x+5, w.y-76+wave, 26, 5);
  }
  else if(T === "rack"){
    rectW("#9aa7c9", w.x, w.y-16, w.w, 5);
    for(let i=0;i<4;i++) rectW("#7d8ab0", w.x+2+i*12, w.y-14, 4, 16);
  }
  else if(T === "hoop"){
    rectW("#3f3a60", w.x+2, w.y-64, 6, 68);
    rectW("#ffe9c2", w.x-12, w.y-86, 34, 24);
    rectW("#ff6b57", w.x-9, w.y-79, 28, 3);
    rectW("#ff8f57", w.x-7, w.y-62, 24, 4);
    rectW("rgba(255,233,194,.7)", w.x-5, w.y-58, 2, 10); rectW("rgba(255,233,194,.7)", w.x+13, w.y-58, 2, 10);
    rectW("rgba(255,233,194,.7)", w.x-1, w.y-56, 2, 8);  rectW("rgba(255,233,194,.7)", w.x+9, w.y-56, 2, 8);
  }
  else if(T === "scare"){
    rectW("#8a5730", w.x+3, w.y-44, 4, 48);
    rectW("#8a5730", w.x-10, w.y-34, 30, 4);
    rectW("#a86f3e", w.x-4, w.y-30, 18, 16);
    rectW("#d9c08c", w.x-1, w.y-44, 12, 12);
    rectW("#8a6f3e", w.x-3, w.y-48, 16, 6);
    rectW("#1b1430", w.x+2, w.y-40, 2, 2); rectW("#1b1430", w.x+7, w.y-40, 2, 2);
  }
  else if(T === "cone"){
    rectW("#ff8f57", w.x, w.y-12, w.w, w.h+12);
    rectW("#ffe9c2", w.x, w.y-7, w.w, 4);
    rectW("#e06a3a", w.x-3, w.y+w.h-3, w.w+6, 4);
  }
  else if(T === "shack"){
    const FW = 42;
    rectW("#c8a870", w.x, w.y + w.h - FW, w.w, FW);
    rectW("#a88050", w.x-8, w.y-10, w.w+16, w.h - FW + 10);
    // Awning stripes
    const sw = (w.w + 16) / 8;
    for(let i = 0; i < 8; i++){
      ctx.fillStyle = i % 2 ? "#ff6b57" : "#ffe9c2";
      ctx.fillRect(snap(w.x - 8 + i * sw - cam.x), snap(w.y - 10 - cam.y), Math.ceil(sw), 12);
    }
    rectW("#3a2719", w.x + w.w * .38, w.y + w.h - 36, 28, 36);
    ctx.fillStyle = "#ffc44d"; ctx.font = "700 11px monospace"; ctx.textBaseline = "alphabetic";
    ctx.fillText("SNACK SHACK", snap(w.x + w.w / 2 - 38 - cam.x), snap(w.y - 2 - cam.y));
    outline(w.x - 8, w.y - 10, w.w + 16, w.h + 10);
  }
  else if(T === "truck"){
    rectW("#ffe9c2", w.x, w.y - 20, w.w, w.h + 20);
    rectW("#ff9ac1", w.x, w.y - 20, w.w, 18);
    rectW("#ffc44d", w.x, w.y - 20, 7, w.h + 20);
    rectW("#2ec4b6", w.x + 10, w.y - 14, 30, 22);
    rectW("#1b1430", w.x + 8,         w.y + w.h - 4, 22, 14);
    rectW("#1b1430", w.x + w.w - 30,  w.y + w.h - 4, 22, 14);
    ctx.fillStyle = "#ff6b57"; ctx.font = "700 9px monospace"; ctx.textBaseline = "alphabetic";
    ctx.fillText("ICE CREAM", snap(w.x + 42 - cam.x), snap(w.y - 5 - cam.y));
    outline(w.x, w.y - 20, w.w, w.h + 20);
  }
  else if(T === "umbrella"){
    const hw = w.w;
    rectW("#8a5730", w.x + hw / 2 - 2, w.y - 28, 4, 32);
    ctx.fillStyle = w.hue || "#ff6b57";
    ctx.beginPath();
    ctx.moveTo(snap(w.x + hw / 2 - cam.x), snap(w.y - 28 - cam.y));
    ctx.lineTo(snap(w.x - cam.x),          snap(w.y - cam.y));
    ctx.lineTo(snap(w.x + hw - cam.x),     snap(w.y - cam.y));
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.28)";
    for(let i = 0; i < 3; i++){
      const sx = w.x + i * (hw / 3);
      ctx.beginPath();
      ctx.moveTo(snap(w.x + hw / 2 - cam.x), snap(w.y - 28 - cam.y));
      ctx.lineTo(snap(sx - cam.x),            snap(w.y - cam.y));
      ctx.lineTo(snap(sx + hw / 6 - cam.x),   snap(w.y - cam.y));
      ctx.fill();
    }
  }
  else if(T === "paddleboat"){
    rectW(w.hue || "#ff8f57", w.x, w.y - 10, w.w, w.h + 10);
    rectW("#ffe9c2", w.x + 4, w.y - 8, w.w - 8, 8);
    rectW("#1b1430", w.x + w.w / 2 - 4, w.y - 22, 8, 14);
    rectW("#a86f3e", w.x + w.w - 14, w.y, 14, w.h);
  }
  else if(T === "dock"){
    rectW("#a86f3e", w.x, w.y, w.w, w.h);
    ctx.fillStyle = "#8a5730";
    for(let dy = 0; dy < w.h; dy += 12) ctx.fillRect(snap(w.x - cam.x), snap(w.y + dy - cam.y), w.w, 3);
    rectW("#6b4020", w.x, w.y, 6, w.h);
    rectW("#6b4020", w.x + w.w - 6, w.y, 6, w.h);
    rectW("#6b4020", w.x, w.y + w.h - 8, w.w, 8);
    rectW("#4a2e12", w.x + 4,        w.y + w.h - 30, 8, 46);
    rectW("#4a2e12", w.x + w.w - 12, w.y + w.h - 30, 8, 46);
  }
  else if(T === "water"){ /* collision barrier only — no render */ }
  else if(T === "treehouse"){
    const gh = Math.floor(w.h * .28);
    const ch = Math.floor(w.h * .35);
    const tx = w.x + Math.floor(w.w * .32), tw = Math.max(12, Math.floor(w.w * .36));
    rectW("#4a3322", tx, w.y + gh + ch, tw, w.h - gh - ch);
    rectW("#3a2719", tx, w.y + gh + ch, Math.floor(tw * .4), w.h - gh - ch);
    ctx.fillStyle = "#2a5530";
    ctx.beginPath(); ctx.ellipse(snap(w.x+w.w/2-cam.x), snap(w.y+gh+ch*.5-cam.y), w.w*.52, ch*.52, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#346640";
    ctx.beginPath(); ctx.ellipse(snap(w.x+w.w/2-cam.x-10), snap(w.y+gh+ch*.38-cam.y), w.w*.38, ch*.36, 0, 0, 7); ctx.fill();
    rectW("#a86f3e", w.x+Math.floor(w.w*.07), w.y+gh-4, Math.floor(w.w*.86), 8);
    rectW("#8a5730", w.x+Math.floor(w.w*.07), w.y+gh-4, Math.floor(w.w*.86), 3);
    rectW("#8a5730", w.x+Math.floor(w.w*.14), w.y, Math.floor(w.w*.72), gh+4);
    rectW("#6b4020", w.x+Math.floor(w.w*.14), w.y+Math.floor(gh*.55), Math.floor(w.w*.72), 3);
    rectW("#2ec4b6", w.x+Math.floor(w.w*.20), w.y+4, Math.floor(w.w*.18), Math.floor(gh*.45));
    rectW("#1b8080", w.x+Math.floor(w.w*.29), w.y+4, 2, Math.floor(gh*.45));
    rectW("#2ec4b6", w.x+Math.floor(w.w*.58), w.y+4, Math.floor(w.w*.18), Math.floor(gh*.45));
    rectW("#1b8080", w.x+Math.floor(w.w*.67), w.y+4, 2, Math.floor(gh*.45));
    rectW("#3a2719", w.x+Math.floor(w.w*.42), w.y+gh-20, Math.floor(w.w*.16), 22);
    rectW("#ffc44d", w.x+Math.floor(w.w*.42)+Math.floor(w.w*.16)-4, w.y+gh-14, 3, 3);
    rectW("#5a3a22", w.x+Math.floor(w.w*.07), w.y-12, Math.floor(w.w*.86), 14);
    rectW("#6b4a2e", w.x+Math.floor(w.w*.03), w.y-16, Math.floor(w.w*.94), 6);
    outline(w.x+Math.floor(w.w*.07), w.y-16, Math.floor(w.w*.86), gh+16);
  }
  else if(T === "bridge"){
    const horiz = w.w >= w.h;
    if(horiz){
      rectW("#9a7040", w.x, w.y, w.w, w.h);
      ctx.fillStyle = "#6b4a20";
      for(let bx=w.x; bx<w.x+w.w; bx+=12) ctx.fillRect(snap(bx-cam.x), snap(w.y-cam.y), 10, w.h);
      rectW("rgba(90,60,28,.9)", w.x, w.y-4, w.w, 3);
      rectW("rgba(90,60,28,.9)", w.x, w.y+w.h+1, w.w, 3);
      rectW("rgba(0,0,0,.18)", w.x+3, w.y+w.h+4, w.w, 5);
    } else {
      rectW("#9a7040", w.x, w.y, w.w, w.h);
      ctx.fillStyle = "#6b4a20";
      for(let by=w.y; by<w.y+w.h; by+=12) ctx.fillRect(snap(w.x-cam.x), snap(by-cam.y), w.w, 10);
      rectW("rgba(90,60,28,.9)", w.x-4, w.y, 3, w.h);
      rectW("rgba(90,60,28,.9)", w.x+w.w+1, w.y, 3, w.h);
      rectW("rgba(0,0,0,.18)", w.x+w.w+4, w.y+3, 5, w.h);
    }
  }
  else if(T === "ladder"){
    rectW("#6b4a20", w.x+4, w.y-28, 3, 32);
    rectW("#6b4a20", w.x+w.w-7, w.y-28, 3, 32);
    ctx.fillStyle = "#8a6535";
    for(let ry=w.y-24; ry<w.y+4; ry+=9) ctx.fillRect(snap(w.x+4-cam.x), snap(ry-cam.y), w.w-8, 3);
  }
  else if(T === "frame"){
    // Construction house frame — individual beam (horiz or vert)
    const sh = Math.min(w.w, w.h); // short dimension = post size
    rectW("rgba(0,0,0,.22)", w.x+3, w.y+4, w.w, w.h);
    rectW("#c8a262", w.x, w.y, w.w, w.h);
    rectW("#d4b070", w.x, w.y, w.w, Math.ceil(w.h/2)); // lighter top half
    rectW("#8a6535", w.x, w.y, sh, sh);                // start post
    rectW("#8a6535", w.x+w.w-sh, w.y+w.h-sh, sh, sh); // end post
    if(w.h > w.w * 1.4){ // tall vertical beam — add diagonal brace
      ctx.strokeStyle = "#a87c40"; ctx.lineWidth = 3; ctx.setLineDash([10,7]);
      ctx.beginPath();
      ctx.moveTo(snap(w.x-cam.x),      snap(w.y+sh-cam.y));
      ctx.lineTo(snap(w.x+w.w-cam.x),  snap(w.y+w.h-sh-cam.y));
      ctx.stroke(); ctx.setLineDash([]);
    }
    outline(w.x, w.y, w.w, w.h);
  }
  else if(T === "scaffold"){
    // Raised metal platform — hop:true, guards popsicle
    rectW("rgba(0,0,0,.28)", w.x+5, w.y+7, w.w, w.h);
    rectW("#7a8090", w.x, w.y, w.w, w.h);
    ctx.fillStyle = "#666e80";
    for(let gx=w.x+8; gx<w.x+w.w; gx+=18) ctx.fillRect(snap(gx-cam.x), snap(w.y-cam.y), 2, w.h);
    for(let gy=w.y+8; gy<w.y+w.h; gy+=18) ctx.fillRect(snap(w.x-cam.x), snap(gy-cam.y), w.w, 2);
    rectW("#ffc44d", w.x, w.y+Math.floor(w.h/2)-3, w.w, 5); // yellow safety stripe
    rectW("#9aa0b0", w.x-3, w.y-4, w.w+6, 5);               // handrail top
    rectW("#9aa0b0", w.x-3, w.y+w.h, w.w+6, 5);             // handrail bottom
    rectW("#5a6070", w.x, w.y+w.h, 8, 10);                   // support leg L
    rectW("#5a6070", w.x+w.w-8, w.y+w.h, 8, 10);             // support leg R
    outline(w.x, w.y, w.w, w.h);
  }
  else if(T === "dozer"){
    // Sleeping bulldozer (top-down) — yellow cab, dark tracks, ZZZ
    const bx = Math.floor(w.w*.2), bw = Math.floor(w.w*.6);
    const tw = Math.floor(w.w*.19);
    rectW("rgba(0,0,0,.22)", w.x+5, w.y+6, w.w, w.h);
    rectW("#a08000", w.x, w.y, tw, w.h);                 // left track
    rectW("#a08000", w.x+w.w-tw, w.y, tw, w.h);          // right track
    ctx.fillStyle = "#7a6000";
    for(let ty=w.y+4; ty<w.y+w.h-4; ty+=14){
      ctx.fillRect(snap(w.x-cam.x), snap(ty-cam.y), tw, 6);
      ctx.fillRect(snap(w.x+w.w-tw-cam.x), snap(ty-cam.y), tw, 6);
    }
    rectW("#e0b800", w.x+bx, w.y, bw, Math.floor(w.h*.8));      // body
    rectW("#c8a000", w.x+bx, w.y+Math.floor(w.h*.25), bw, Math.floor(w.h*.55)); // cab shadow
    rectW("#2ec4b6", w.x+bx+Math.floor(bw*.15), w.y+Math.floor(w.h*.1), Math.floor(bw*.7), Math.floor(w.h*.4)); // windshield
    rectW("#a08000", w.x+Math.floor(bx*.5), w.y+Math.floor(w.h*.75), Math.floor(w.w*.55), Math.floor(w.h*.22)); // blade
    // exhaust pipe
    rectW("#4a4a4a", w.x+bx+Math.floor(bw*.72), w.y-10, 7, 14);
    rectW("#333333", w.x+bx+Math.floor(bw*.72), w.y-10, 7, 5);
    // ZZZ sleeping text
    ctx.fillStyle = "#ffe9c2"; ctx.font = "bold 11px monospace"; ctx.textAlign = "left";
    ctx.fillText("z z z", snap(w.x+bx+Math.floor(bw*.25)-cam.x), snap(w.y-14-cam.y));
    outline(w.x+bx, w.y, bw, Math.floor(w.h*.8));
  }
  else if(T === "mound"){
    // Dirt mound — rounded pile of excavated earth
    rectW("rgba(0,0,0,.18)", w.x+4, w.y+5, w.w, w.h);
    rectW("#8a6535", w.x, w.y+Math.floor(w.h*.3), w.w, Math.floor(w.h*.7));
    rectW("#a07840", w.x+Math.floor(w.w*.08), w.y, Math.floor(w.w*.84), Math.floor(w.h*.75));
    rectW("#b88a50", w.x+Math.floor(w.w*.22), w.y+4, Math.floor(w.w*.5), Math.floor(w.h*.38)); // highlight crest
    ctx.fillStyle = "#6b4a28";
    for(let i=0;i<4;i++) ctx.fillRect(snap(w.x+6+i*Math.floor(w.w/5)-cam.x), snap(w.y+Math.floor(w.h*.52)+i*3-cam.y), Math.floor(w.w/7), 3);
  }
  else if(T === "pipe"){
    // Pipe stack — circular cross-sections viewed from above
    rectW("rgba(0,0,0,.2)", w.x+4, w.y+5, w.w, w.h);
    rectW("#606878", w.x, w.y, w.w, w.h); // tray background
    const pR = Math.min(Math.floor(w.h/2)-3, 22);
    const pCols = Math.max(1, Math.floor(w.w/(pR*2+6)));
    const pRows = Math.max(1, Math.floor(w.h/(pR*2+6)));
    for(let pr=0;pr<pRows;pr++) for(let pc=0;pc<pCols;pc++){
      const px = w.x + 4 + pc*(pR*2+6) + pR;
      const py = w.y + 4 + pr*(pR*2+6) + pR;
      ctx.fillStyle="#9a9aaa"; ctx.beginPath(); ctx.arc(snap(px-cam.x),snap(py-cam.y),pR,0,7); ctx.fill();
      ctx.fillStyle="#5a5a70"; ctx.beginPath(); ctx.arc(snap(px-cam.x),snap(py-cam.y),pR-4,0,7); ctx.fill();
      ctx.fillStyle="rgba(210,230,255,.35)"; ctx.beginPath(); ctx.arc(snap(px-3-cam.x),snap(py-3-cam.y),pR-8,0,7); ctx.fill();
    }
    outline(w.x, w.y, w.w, w.h);
  }
  else if(T === "ramp"){
    // Plywood ramp — angled surface for stunt jumps (hop:true for later race use)
    rectW("rgba(0,0,0,.2)", w.x+4, w.y+5, w.w, w.h);
    const horiz = w.w >= w.h;
    rectW("#a87c40", w.x, w.y, w.w, w.h);
    ctx.fillStyle = "#8a6535";
    if(horiz){
      for(let rx=w.x; rx<w.x+w.w; rx+=20) ctx.fillRect(snap(rx-cam.x), snap(w.y-cam.y), 16, w.h);
      rectW("#6b4020", w.x+w.w-10, w.y, 10, w.h); // raised edge
      rectW("#c8a262", w.x, w.y, 8, w.h);          // low edge
    } else {
      for(let ry=w.y; ry<w.y+w.h; ry+=20) ctx.fillRect(snap(w.x-cam.x), snap(ry-cam.y), w.w, 16);
      rectW("#6b4020", w.x, w.y+w.h-10, w.w, 10);
      rectW("#c8a262", w.x, w.y, w.w, 8);
    }
    rectW("#ffc44d", w.x, w.y, horiz ? w.w : 5, horiz ? 5 : w.h); // yellow warning edge
    outline(w.x, w.y, w.w, w.h);
  }
  else if(T === "bleacher"){
    // Stepped sports seating — rows of benches viewed top-down
    rectW("rgba(0,0,0,.24)", w.x+4, w.y+6, w.w, w.h);
    rectW("#606070", w.x, w.y, w.w, w.h); // structural base
    const rows = Math.max(2, Math.floor(w.h / 20));
    for(let r=0; r<rows; r++){
      const ry = w.y + Math.floor(r * w.h / rows);
      const rh = Math.floor(w.h / rows) - 3;
      const shade = r / rows;
      const cc = Math.floor(110 + shade * 50);
      rectW(`rgb(${cc},${cc},${cc+18})`, w.x+6, ry, w.w-12, rh);
    }
    rectW("#404050", w.x, w.y, 8, w.h); // left support
    rectW("#404050", w.x+w.w-8, w.y, 8, w.h); // right support
    outline(w.x, w.y, w.w, w.h);
  }
  else if(T === "backstop"){
    // Baseball backstop — chain-link fence behind home plate
    rectW("rgba(0,0,0,.2)", w.x+3, w.y+5, w.w, w.h);
    rectW("#707880", w.x, w.y, w.w, 8);        // top rail
    rectW("#707880", w.x, w.y, 6, w.h);        // left post
    rectW("#707880", w.x+w.w-6, w.y, 6, w.h);  // right post
    rectW("#707880", w.x, w.y+w.h-6, w.w, 6);  // bottom rail
    ctx.strokeStyle = "#8a9098"; ctx.lineWidth = 1.5; ctx.setLineDash([]);
    for(let fy=w.y+8; fy<w.y+w.h-6; fy+=8){
      ctx.beginPath();
      ctx.moveTo(snap(w.x+6-cam.x),      snap(fy-cam.y));
      ctx.lineTo(snap(w.x+w.w-6-cam.x),  snap(fy+4-cam.y));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(snap(w.x+6-cam.x),      snap(fy+4-cam.y));
      ctx.lineTo(snap(w.x+w.w-6-cam.x),  snap(fy-cam.y));
      ctx.stroke();
    }
    outline(w.x, w.y, w.w, w.h);
  }
  else if(T === "goal"){
    // Soccer goal — two posts + crossbar + net
    const horiz = w.w >= w.h;
    rectW("rgba(0,0,0,.16)", w.x+3, w.y+3, w.w, w.h);
    if(horiz){
      // Horizontal goal (north/south facing)
      rectW("#e0e0e0", w.x, w.y, 8, w.h);           // left post
      rectW("#e0e0e0", w.x+w.w-8, w.y, 8, w.h);     // right post
      rectW("#e0e0e0", w.x, w.y, w.w, 8);            // crossbar
      ctx.strokeStyle="rgba(200,200,200,.55)"; ctx.lineWidth=1; ctx.setLineDash([]);
      for(let nx=w.x+8; nx<w.x+w.w-8; nx+=13){
        ctx.beginPath(); ctx.moveTo(snap(nx-cam.x),snap(w.y+8-cam.y)); ctx.lineTo(snap(nx-cam.x),snap(w.y+w.h-cam.y)); ctx.stroke();
      }
      for(let ny=w.y+8; ny<w.y+w.h; ny+=11){
        ctx.beginPath(); ctx.moveTo(snap(w.x+8-cam.x),snap(ny-cam.y)); ctx.lineTo(snap(w.x+w.w-8-cam.x),snap(ny-cam.y)); ctx.stroke();
      }
    } else {
      rectW("#e0e0e0", w.x, w.y, w.w+8, 8);
      rectW("#e0e0e0", w.x, w.y, 8, w.h);
      rectW("#e0e0e0", w.x, w.y+w.h-8, w.w+8, 8);
      ctx.strokeStyle="rgba(200,200,200,.55)"; ctx.lineWidth=1; ctx.setLineDash([]);
      for(let nx=w.x+8; nx<w.x+w.w+8; nx+=13){
        ctx.beginPath(); ctx.moveTo(snap(nx-cam.x),snap(w.y+8-cam.y)); ctx.lineTo(snap(nx-cam.x),snap(w.y+w.h-8-cam.y)); ctx.stroke();
      }
      for(let ny=w.y+8; ny<w.y+w.h-8; ny+=11){
        ctx.beginPath(); ctx.moveTo(snap(w.x+8-cam.x),snap(ny-cam.y)); ctx.lineTo(snap(w.x+w.w+8-cam.x),snap(ny-cam.y)); ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    outline(w.x, w.y, w.w, w.h);
  }
  else if(T === "fountain"){
    // Water fountain — small pedestal + basin + water
    rectW("rgba(0,0,0,.2)", w.x+3, w.y+4, w.w, w.h);
    rectW("#6a8a9a", w.x, w.y, w.w, w.h);              // outer casing
    rectW("#7aaac0", w.x+3, w.y+3, w.w-6, w.h-6);      // basin
    rectW("#2ec4b6", w.x+Math.floor(w.w*.28), w.y+Math.floor(w.h*.28), Math.floor(w.w*.44), Math.floor(w.h*.44)); // water surface
    // Ripple
    ctx.strokeStyle="rgba(255,255,255,.5)"; ctx.lineWidth=1; ctx.setLineDash([]);
    const fc = w.x + w.w/2, fy = w.y + w.h/2;
    ctx.beginPath(); ctx.arc(snap(fc-cam.x), snap(fy-cam.y), Math.floor(w.w*.18), 0, 7); ctx.stroke();
    outline(w.x, w.y, w.w, w.h);
  }
  else if(T === "watertower"){
    const cx = w.x + w.w/2, cy = w.y + w.h/2;
    const legY = w.y + w.h, legH = 52;
    // Leg drop shadows
    rectW("rgba(0,0,0,.20)", w.x+22, legY+4, 10, legH);
    rectW("rgba(0,0,0,.20)", w.x+w.w-32, legY+4, 10, legH);
    // Front legs
    rectW("#2e2e44", w.x+20, legY, 10, legH);
    rectW("#2e2e44", w.x+w.w-30, legY, 10, legH);
    // Cross-brace
    ctx.strokeStyle="#252538"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(snap(w.x+20-cam.x),snap(legY-cam.y)); ctx.lineTo(snap(w.x+w.w-30-cam.x),snap(legY+legH-cam.y)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(snap(w.x+w.w-30-cam.x),snap(legY-cam.y)); ctx.lineTo(snap(w.x+20-cam.x),snap(legY+legH-cam.y)); ctx.stroke();
    // Rear legs (slightly narrower)
    rectW("#393952", w.x+38, legY, 7, legH-10);
    rectW("#393952", w.x+w.w-45, legY, 7, legH-10);
    // Tank drop shadow
    rectW("rgba(0,0,0,.26)", w.x+6, w.y+8, w.w, w.h);
    // Tank outer shell
    rectW("#2e2e46", w.x, w.y, w.w, w.h);
    // Catwalk walkway ring
    ctx.strokeStyle="#1a1a2e"; ctx.lineWidth=6;
    ctx.strokeRect(snap(w.x+3-cam.x)+0.5, snap(w.y+3-cam.y)+0.5, w.w-6, w.h-6);
    // Tank top surface (water inside)
    rectW("#38405a", w.x+8, w.y+8, w.w-16, w.h-16);
    // Water shimmer
    ctx.fillStyle="rgba(60,90,150,.38)";
    ctx.fillRect(snap(w.x+10-cam.x), snap(w.y+10-cam.y), w.w-20, w.h-20);
    // Rivets around catwalk
    ctx.fillStyle="#252538";
    for(let i=0;i<12;i++){
      const ang=(i/12)*Math.PI*2;
      const rx=cx+Math.cos(ang)*(w.w/2-5), ry=cy+Math.sin(ang)*(w.h/2-4);
      ctx.fillRect(snap(rx-1.5-cam.x),snap(ry-1.5-cam.y),3,3);
    }
    // Graffiti (spray-paint tags from the older kids)
    ctx.save();
    ctx.font="bold 7px monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillStyle="#ff6b57"; ctx.fillText("WUZ HERE '25", snap(cx-cam.x), snap(cy-11-cam.y));
    ctx.fillStyle="#ffc44d"; ctx.fillText("TIGER RULES", snap(cx-cam.x), snap(cy+1-cam.y));
    ctx.fillStyle="#2ec4b6"; ctx.fillText("SENIORS RULE", snap(cx-cam.x), snap(cy+13-cam.y));
    ctx.restore();
    // Ladder (south face, between front legs)
    const lx1=snap(cx-7-cam.x), lx2=snap(cx+7-cam.x);
    const ly1=snap(w.y+w.h-3-cam.y), ly2=snap(legY+20-cam.y);
    ctx.strokeStyle="#3a3a56"; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(lx1,ly1); ctx.lineTo(lx1,ly2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx2,ly1); ctx.lineTo(lx2,ly2); ctx.stroke();
    ctx.lineWidth=2;
    for(let r=0;r<=4;r++){ const ry=ly1+(ly2-ly1)*(r/4); ctx.beginPath(); ctx.moveTo(lx1,ry); ctx.lineTo(lx2,ry); ctx.stroke(); }
    // Volume highlight (NW corner)
    ctx.fillStyle="rgba(120,160,220,0.10)";
    ctx.beginPath(); ctx.arc(snap(cx-w.w*.18-cam.x),snap(cy-w.h*.18-cam.y),w.w*.2,0,7); ctx.fill();
    outline(w.x, w.y, w.w, w.h);
  }
}
