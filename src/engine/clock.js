// Day/time core — section-agnostic.
// 1 real second (60 frames) = 1 in-game minute.
// Day starts at 8:00 AM. Day-parts: Morning / Afternoon / Evening / Night.
// sleep() advances the day counter and resets clock to 8:00 AM.

const FRAMES_PER_MINUTE = 60;
const START_MINS = 8 * 60; // 480 minutes = 8:00 AM

export const DAY_PARTS = [
  { name: 'Morning',   start: 480,  end: 720  }, // 8 AM – 12 PM
  { name: 'Afternoon', start: 720,  end: 1020 }, // 12 PM – 5 PM
  { name: 'Evening',   start: 1020, end: 1260 }, // 5 PM – 9 PM
  { name: 'Night',     start: 1260, end: 1920 }, // 9 PM onward
];

let _gameDay = 1;
let _frames  = 0;

try {
  const s = typeof localStorage !== 'undefined' && localStorage.getItem('schools_day');
  if (s) _gameDay = Math.max(1, parseInt(s) || 1);
} catch(e) {}

export function tickClock() { _frames++; }

export function getClockMinutes() {
  return START_MINS + Math.floor(_frames / FRAMES_PER_MINUTE);
}

export function getClockDisplay() {
  const total = getClockMinutes();
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12  = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function getDayPart() {
  const mins = getClockMinutes();
  for (const p of DAY_PARTS) if (mins >= p.start && mins < p.end) return p;
  return DAY_PARTS[DAY_PARTS.length - 1];
}

export function isNight()    { return getClockMinutes() >= 1260; }
export function getGameDay() { return _gameDay; }

export function sleep() {
  _gameDay++;
  _frames = 0;
  try { if (typeof localStorage !== 'undefined') localStorage.setItem('schools_day', String(_gameDay)); } catch(e) {}
}

// Advance clock by N in-game minutes (used by activities that consume time).
export function advanceClock(minutes) { _frames += minutes * FRAMES_PER_MINUTE; }

// Resets in-game time to morning without changing the day counter.
// Call from resetRun so "play again" resumes the current game day at 8 AM.
export function resetDay() { _frames = 0; }
