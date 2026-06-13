import { PX } from '../engine/constants.js';
import { snap, rectW, outline, getCtx, getCam } from './draw.js';

export function drawWall(w, frame){
  const ctx = getCtx(), cam = getCam();
  const T = w.type;
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
}
