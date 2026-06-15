// Global trust value — section-agnostic, persists across days.
// Points are hidden from the player; only the level name is shown.
// Raised by chores and reliability. Lost on curfew breach.
// Curfew time adjusts upward with trust level.

const LEVEL_THRESHOLDS = [0, 10, 30, 60];
const LEVEL_NAMES = ['Distrusted', 'Wary', 'Trusted', 'Respected'];
// Curfew in clock minutes (midnight=1440, 12:30=1470, 1:00 AM=1500)
const CURFEW_MINUTES = [1440, 1440, 1470, 1500];

let _trust = 15; // start Wary; player can see both directions

try {
  const s = typeof localStorage !== 'undefined' && localStorage.getItem('schools_trust');
  if (s !== null) _trust = Math.max(0, Math.min(100, parseInt(s) || 15));
} catch(e) {}

function _save() {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem('schools_trust', String(_trust)); } catch(e) {}
}

export function grantTrust(amount) {
  _trust = Math.min(100, _trust + amount);
  _save();
}

export function penalizeTrust(amount) {
  _trust = Math.max(0, _trust - amount);
  _save();
}

export function getTrust() { return _trust; }

export function getTrustLevel() {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--)
    if (_trust >= LEVEL_THRESHOLDS[i]) return i;
  return 0;
}

export function getTrustLevelName() { return LEVEL_NAMES[getTrustLevel()]; }

export function getCurfewMinutes() { return CURFEW_MINUTES[getTrustLevel()]; }
