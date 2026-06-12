export function showEndScreen(won, score, best, time, pops, dogSpotted){
  const tail = Math.floor(time) + "s · \u{1F366} " + pops +
    (won && !dogSpotted ? " · NEVER WOKE HIM +200" : "");
  if(won){
    document.getElementById("winscore").textContent = score + " PTS";
    document.getElementById("winstat").textContent = "BEST " + best + " · " + tail;
  } else {
    document.getElementById("finalscore").textContent = score + " PTS";
    document.getElementById("beststat").textContent = "BEST " + best + " · " + tail;
  }
}
