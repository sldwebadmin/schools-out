let AC = null;

export function audio(){
  if(!AC){ try{ AC = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} }
  if(AC && AC.state === "suspended") AC.resume();
}

export function tone(f, d, type="square", v=.08, slide=0){
  if(!AC) return;
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f+slide), t+d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t+d);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t+d);
}

let master = null, musicTimer = null, noteT = 0, stepI = 0;
export let musicOn = true;

const BASS = [110, 110, 98, 98, 87.31, 87.31, 98, 98];
const ARP  = [440, 523.25, 659.25, 523.25, 392, 493.88, 587.33, 493.88,
              349.23, 440, 523.25, 440, 392, 493.88, 587.33, 493.88];

function note(f, t, d, type, v){
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t+d);
  o.connect(g).connect(master); o.start(t); o.stop(t+d);
}

function schedule(){
  if(!AC || !master) return;
  while(noteT < AC.currentTime + .3){
    const st = stepI;
    if(st % 2 === 0) note(BASS[(st/2) % 8], noteT, .42, "triangle", .045);
    note(ARP[st % 16], noteT, .2, "square", .02);
    if(st % 16 === 0) note(220, noteT, 2.2, "sine", .028);
    if(st % 16 === 8) note(261.63, noteT, 1.6, "sine", .02);
    noteT += .22; stepI++;
  }
}

function cicadas(){
  const len = 2 * AC.sampleRate, buf = AC.createBuffer(1, len, AC.sampleRate);
  const d = buf.getChannelData(0);
  for(let i = 0; i < len; i++) d[i] = Math.random()*2 - 1;
  const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = AC.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 4300; bp.Q.value = 9;
  const g = AC.createGain(); g.gain.value = .011;
  const lfo = AC.createOscillator(); lfo.frequency.value = 12;
  const lg = AC.createGain(); lg.gain.value = .007;
  lfo.connect(lg); lg.connect(g.gain);
  src.connect(bp); bp.connect(g); g.connect(master);
  src.start(); lfo.start();
}

export function iceCreamTruck(){
  if(!AC || !master) return;
  const m = [659.25, 659.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25];
  m.forEach((f, i) => note(f, AC.currentTime + .24*i, .22, "square", .012));
}

export function startMusic(){
  if(!AC || musicTimer) return;
  master = AC.createGain(); master.gain.value = musicOn ? .55 : 0; master.connect(AC.destination);
  cicadas();
  noteT = AC.currentTime + .1; stepI = 0;
  musicTimer = setInterval(schedule, 90);
}

export function toggleMusic(){
  musicOn = !musicOn;
  if(master) master.gain.value = musicOn ? .55 : 0;
}

export const sfx = {
  hop:    () => tone(320,.16,"square",.07,300),
  pickup: () => { tone(740,.08,"square",.07); setTimeout(()=>tone(1100,.1,"square",.07),70); },
  bike:   () => { tone(420,.1,"sawtooth",.08); setTimeout(()=>tone(640,.1,"sawtooth",.08),80); setTimeout(()=>tone(900,.16,"sawtooth",.08),160); },
  bark:   () => { tone(180,.07,"sawtooth",.1,60); setTimeout(()=>tone(160,.08,"sawtooth",.1,40),110); },
  alert:  () => tone(520,.2,"square",.1,180),
  caught: () => tone(160,.7,"sawtooth",.12,-120),
  win:    () => { [523.25,659.25,783.99,1046.5].forEach((f,i)=>setTimeout(()=>tone(f,.22,"square",.08),i*140)); },
};
