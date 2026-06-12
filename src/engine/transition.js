// Fade-out → swap → fade-in transition.
// Caller calls startFade(onBlack) then stepFade() every frame.
// drawFade(ctx, w, h) overlays the black veil.

const FADE = 30; // frames for each half (out and in)

let _phase = "none"; // "none" | "out" | "in"
let _alpha = 0;
let _timer = 0;
let _onBlack = null;

export function startFade(onBlack){
  _phase = "out"; _alpha = 0; _timer = 0; _onBlack = onBlack;
}

export function stepFade(){
  if(_phase === "none") return;
  _timer++;
  if(_phase === "out"){
    _alpha = _timer / FADE;
    if(_timer >= FADE){
      _alpha = 1; _phase = "in"; _timer = 0;
      if(_onBlack){ _onBlack(); _onBlack = null; }
    }
  } else {
    _alpha = 1 - _timer / FADE;
    if(_timer >= FADE){ _alpha = 0; _phase = "none"; }
  }
}

export function drawFade(ctx, w, h){
  if(_phase === "none" || _alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = _alpha;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function isFading(){ return _phase !== "none"; }
