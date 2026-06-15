// Global friendship values — section-agnostic, persists across days.
// Points are hidden from the player; only the level name is shown.
// All friendship gain flows through grantFriendship() so future sources
// (gifts, shared activities) plug in without new code.

const LEVEL_THRESHOLDS = [0, 10, 30, 60, 90];
const LEVEL_NAMES = ['Stranger', 'Acquaintance', 'Casual Friend', 'Close Friend', 'Best Friend'];

// Friendship point totals per NPC key
const _vals = {};
// Last game-day a grant was applied per NPC key — enforces once-per-day cooldown
const _lastDay = {};

try {
  const sv = typeof localStorage !== 'undefined' && localStorage.getItem('schools_friends');
  if (sv) Object.assign(_vals, JSON.parse(sv));
  const sd = typeof localStorage !== 'undefined' && localStorage.getItem('schools_talks');
  if (sd) Object.assign(_lastDay, JSON.parse(sd));
} catch(e) {}

function _saveVals() {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem('schools_friends', JSON.stringify(_vals)); } catch(e) {}
}

function _saveDays() {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem('schools_talks', JSON.stringify(_lastDay)); } catch(e) {}
}

// Primary entry point for all friendship sources: 'talk', 'gift', 'activity', etc.
// Returns true if the grant applied, false if blocked by the once-per-day cooldown.
export function grantFriendship(key, source, amount, currentDay) {
  if (_lastDay[key] === currentDay) return false;
  _vals[key] = Math.min(100, (_vals[key] || 0) + amount);
  _lastDay[key] = currentDay;
  _saveVals();
  _saveDays();
  return true;
}

// True if this NPC has not yet received a friendship grant today.
export function canInteract(key, currentDay) {
  return _lastDay[key] !== currentDay;
}

export function getFriendship(key) { return _vals[key] || 0; }

export function getFriendLevel(key) {
  const v = getFriendship(key);
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--)
    if (v >= LEVEL_THRESHOLDS[i]) return i;
  return 0;
}

export function getFriendLevelName(key) { return LEVEL_NAMES[getFriendLevel(key)]; }
