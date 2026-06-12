import { PX, USE_SHEETS } from '../engine/constants.js';
import { snap, rectW, getCtx, getCam } from './draw.js';
import {
  getSheets,
  SW, SH, CX, CY,
  DSW, DSH, DCX, DCY,
  DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP,
  DOG_WALK_L, DOG_WALK_R, DOG_SLEEP, DOG_ALERT_L, DOG_ALERT_R,
} from './sheet.js';

// ── rectangle renderer (kept as fallback when USE_SHEETS = false) ─────

function drawBody(x, y, face, anim, shirt, hair, opts={}){
  const step = Math.sin(anim*6) > 0, skin = opts.skin || "#e8a87c";
  rectW("#16102b", x-12, y-47, 25, 50);
  if(opts.moving === false){
    rectW(skin, x-9, y-6, 7, 12); rectW(skin, x+3, y-6, 7, 12);
  } else if(step){ rectW(skin, x-9, y-8, 7, 14); rectW(skin, x+3, y-4, 7, 10); }
  else           { rectW(skin, x-9, y-4, 7, 10); rectW(skin, x+3, y-8, 7, 14); }
  rectW("#fff7e8", x-10, y+4, 9, 5); rectW("#fff7e8", x+2, y+4, 9, 5);
  rectW(opts.pants || "#2e6f8e", x-10, y-16, 21, 10);
  rectW(shirt, x-10, y-32, 21, 17);
  rectW("rgba(0,0,0,.15)", x-10, y-18, 21, 3);
  if(opts.pack) rectW("#ffc44d", x - face*15, y-30, 8, 14);
  rectW(skin, x + face*10, y-30 + (step?2:-2), 6, 11);
  rectW(skin, x-6, y-45, 15, 14);
  rectW(hair, x-7, y-49, 17, 8);
  rectW(hair, x - face*7, y-44, 4, 8);
  rectW("#1b1430", x + face*4, y-41, PX, PX);
}

// ── sprite blit helpers ───────────────────────────────────────────────

// Walk frame index from a float anim counter (4-frame cycle)
function wf(anim){ return Math.floor(anim * 3) % 4; }

function blitChar(ctx, cam, sheet, row, fr, wx, wy, lift){
  ctx.drawImage(
    sheet, fr * SW, row * SH, SW, SH,
    Math.round((wx - cam.x - CX) / 3) * 3,
    Math.round((wy - cam.y - CY - (lift||0)) / 3) * 3,
    SW, SH,
  );
}

function blitDog(ctx, cam, sheet, row, fr, wx, wy, lift){
  ctx.drawImage(
    sheet, fr * DSW, row * DSH, DSW, DSH,
    Math.round((wx - cam.x - DCX) / 3) * 3,
    Math.round((wy - cam.y - DCY - (lift||0)) / 3) * 3,
    DSW, DSH,
  );
}

// ── public draw functions ─────────────────────────────────────────────

export function drawPlayer(player, frame){
  const ctx = getCtx(), cam = getCam();
  const lift = player.hop > 0 ? Math.sin((18-player.hop)/18*Math.PI)*16 : 0;
  const sh = player.hop > 0 ? .6 : 1;
  rectW("rgba(0,0,0,.3)", player.x-9*sh, player.y+6, 19*sh, 6);

  const sheets = USE_SHEETS ? getSheets() : null;
  if(sheets){
    const dir = player.dir ?? DIR_RIGHT;
    blitChar(ctx, cam, sheets.player, dir, wf(player.anim), player.x, player.y, lift);
  } else {
    drawBody(player.x, player.y - lift, player.face, player.anim, "#ff6b57", "#5a3a25", {pack:true});
  }
  if(player.boost > 0 && frame%6 < 3) rectW("rgba(46,196,182,.6)", player.x-12, player.y-lift-54, 26, 3);
}

export function drawNPC(n, frame){
  const ctx = getCtx(), cam = getCam();
  rectW("rgba(0,0,0,.28)", n.x-9, n.y+6, 19, 6);

  if(n.kind === "bike"){
    // bike NPCs keep the rectangle renderer (the bike frame needs drawn too)
    const y = n.y;
    rectW("#16102b", n.x-22, y-12, 46, 18);
    rectW("#1b1430", n.x-18, y-6, 14, 14); rectW("#1b1430", n.x+6, y-6, 14, 14);
    rectW("#ffe9c2", n.x-15, y-3, 8, 8);   rectW("#ffe9c2", n.x+9, y-3, 8, 8);
    rectW(n.shirt, n.x-12, y-12, 26, 6);
    drawBody(n.x, y - 10 + Math.sin(n.anim*3)*1.5, n.face, 0, n.shirt, n.hair, {moving:false, pants:"#3f3a60"});
    rectW("#ffe9c2", n.x-7, y-60, 17, 7);
    return;
  }

  const sheets = USE_SHEETS ? getSheets() : null;
  if(sheets){
    const sheet = sheets['npc' + (n.variant ?? 0)];
    const dir   = n.dir ?? (n.face >= 0 ? DIR_RIGHT : DIR_LEFT);
    const bob   = n.kind === "kid" ? Math.sin(n.anim*2.4)*1.5 : 0;
    blitChar(ctx, cam, sheet, dir, wf(n.anim), n.x, n.y + bob, 0);
  } else {
    const bob = n.kind === "kid" ? Math.sin(n.anim*2.4)*1.5 : 0;
    drawBody(n.x, n.y + bob, n.face, n.anim, n.shirt, n.hair, {moving: n.spd > 0});
  }
}

export function drawDog(dog, frame){
  const ctx = getCtx(), cam = getCam();
  const x = dog.x;

  if(dog.mode === "sleep"){
    rectW("rgba(0,0,0,.3)", x-15, dog.y+4, 31, 6);
    const sheets = USE_SHEETS ? getSheets() : null;
    if(sheets){
      blitDog(ctx, cam, sheets.dog, DOG_SLEEP, 0, dog.x, dog.y, 0);
    } else {
      rectW("#16102b", x-17, dog.y-16, 36, 22);
      rectW("#96632f", x-15, dog.y-14, 32, 18);
      rectW("#7a4e2a", x+8,  dog.y-18, 12, 10);
      rectW("#7a4e2a", x-14, dog.y-16,  8,  6);
    }
    // floating "z" is always drawn over the sprite
    ctx.fillStyle = "#cdb8ff"; ctx.font = "700 12px monospace";
    ctx.fillText("z", snap(x+18-cam.x), snap(dog.y-26-cam.y - (frame%60)/6));
    return;
  }

  const lift = dog.hop > 0 ? Math.sin((16-dog.hop)/16*Math.PI)*14 : 0;
  const y = dog.y - lift;
  rectW("rgba(0,0,0,.3)", x-13, dog.y+6, 27, 6);

  if(dog.mode === "alert" || dog.crouch > 0){
    const sheets = USE_SHEETS ? getSheets() : null;
    if(sheets){
      const row = dog.face >= 0 ? DOG_ALERT_R : DOG_ALERT_L;
      blitDog(ctx, cam, sheets.dog, row, 0, dog.x, dog.y, lift);
    } else {
      rectW("#16102b", x-16, y-12, 34, 16);
      rectW("#96632f", x-14, y-10, 30, 12);
      rectW("#96632f", x + dog.face*8, y-16, 14, 12);
      rectW("#1b1430", x + dog.face*16, y-13, PX, PX);
    }
    // "!" flashes over the sprite regardless of renderer
    if(frame % 14 < 7){
      ctx.fillStyle = "#ffc44d"; ctx.font = "900 18px monospace";
      ctx.fillText("!", snap(x-cam.x + dog.face*22), snap(y-22-cam.y));
    }
    return;
  }

  // chase / walk
  const sheets = USE_SHEETS ? getSheets() : null;
  if(sheets){
    const row = dog.face >= 0 ? DOG_WALK_R : DOG_WALK_L;
    blitDog(ctx, cam, sheets.dog, row, wf(dog.anim), dog.x, dog.y, lift);
  } else {
    const step = Math.sin(dog.anim*6) > 0;
    rectW("#16102b", x-16, y-29, 36, 32);
    if(step){ rectW("#7a4e2a", x-11, y-2, 6, 9); rectW("#7a4e2a", x+6, y-4, 6, 11); }
    else    { rectW("#7a4e2a", x-11, y-4, 6, 11); rectW("#7a4e2a", x+6, y-2, 6, 9); }
    rectW("#96632f", x-14, y-18, 30, 15);
    rectW("#ab7438", x-14, y-18, 30, 4);
    rectW("#96632f", x + dog.face*9,  y-27, 15, 14);
    rectW("#7a4e2a", x + dog.face*9,  y-32,  6,  8);
    rectW("#7a4e2a", x + dog.face*16, y-31,  6,  7);
    rectW("#1b1430", x + dog.face*17, y-23, PX, PX);
    rectW("#5a3a25", x + dog.face*20, y-19,  5,  5);
    rectW("#7a4e2a", x - dog.face*16, y-22 + (step?0:3), 7, 7);
    rectW("#ff6b57", x + dog.face*7,  y-16,  4,  6);
  }
}

export function drawPop(p){
  const ctx = getCtx(), cam = getCam();
  const y = p.y + Math.sin(p.p)*4;
  ctx.fillStyle = "rgba(255,196,77,.16)";
  ctx.fillRect(snap(p.x-13-cam.x), snap(y-26-cam.y), 30, 36);
  rectW("rgba(0,0,0,.25)", p.x-7, p.y+8, 16, 5);
  rectW("#ff6b57", p.x-7, y-22, 15, 18); rectW("#ffb3a6", p.x-7, y-22, 6, 18);
  rectW("#d9b98c", p.x-2, y-4, 5, 9);
}

export function drawBikePk(p, frame){
  const ctx = getCtx(), cam = getCam();
  const y = p.y + Math.sin(frame*.08)*3;
  ctx.fillStyle = "rgba(46,196,182,.18)";
  ctx.fillRect(snap(p.x-26-cam.x), snap(y-30-cam.y), 56, 46);
  rectW("rgba(0,0,0,.25)", p.x-18, p.y+9, 38, 5);
  rectW("#1b1430", p.x-18, y-8, 13, 13); rectW("#1b1430", p.x+7, y-8, 13, 13);
  rectW("#2ec4b6", p.x-12, y-13, 26, 6); rectW("#2ec4b6", p.x+2, y-22, 5, 11);
  rectW("#ffc44d", p.x-15, y-19, 8, 5);  rectW("#ffc44d", p.x+4, y-25, 10, 4);
}
