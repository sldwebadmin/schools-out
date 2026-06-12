export function show(id, on){
  document.getElementById(id).classList.toggle("hidden", !on);
}

export function updateHUD(player, dog, ddRaw, time, pops){
  const mm = Math.floor(time/60), ss = String(Math.floor(time%60)).padStart(2,"0");
  document.getElementById("scorebox").textContent = mm + ":" + ss + " · \u{1F366} " + pops;
  const dogScale = dog.mode === "sleep" ? 0 : Math.max(0, Math.min(1, 1 - (ddRaw-26)/520));
  document.getElementById("dogfill").style.transform = "scaleX(" + dogScale + ")";
  document.getElementById("stamfill").style.transform = "scaleX(" + (player.stam/100) + ")";
}

export function updateMissionFade(missionT, el){
  el.style.opacity = missionT > 60 ? 1 : missionT/60;
}

export function setDogLabel(text){
  document.getElementById("doglabel").firstChild.textContent = text;
}
