export const keys = {};

export function setupKeyboard(onSpace, onKeyM){
  addEventListener("keydown", e => {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
    if(e.repeat) return;
    keys[e.code] = true;
    if(e.code === "Space") onSpace();
    if(e.code === "KeyM") onKeyM();
  });
  addEventListener("keyup", e => keys[e.code] = false);
}
