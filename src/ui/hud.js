export function show(id, on){
  document.getElementById(id).classList.toggle("hidden", !on);
}

export function updateMissionFade(missionT, el){
  el.style.opacity = missionT > 60 ? 1 : missionT/60;
}
