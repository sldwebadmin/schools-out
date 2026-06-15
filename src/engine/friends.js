// Global friendship values — section-agnostic, persists across days.
// Values 0–100. Levels: 0 (<5), 1 (5+), 2 (20+), 3 (40+), 4 (60+).

const _vals = {};
try {
  const s = typeof localStorage !== 'undefined' && localStorage.getItem('schools_friends');
  if (s) Object.assign(_vals, JSON.parse(s));
} catch(e) {}

function _save() {
  try {
    if (typeof localStorage !== 'undefined')
      localStorage.setItem('schools_friends', JSON.stringify(_vals));
  } catch(e) {}
}

export function addFriendship(key, amount) {
  _vals[key] = Math.min(100, (_vals[key] || 0) + amount);
  _save();
}

export function getFriendship(key) { return _vals[key] || 0; }

export function getFriendLevel(key) {
  const v = getFriendship(key);
  if (v >= 60) return 4;
  if (v >= 40) return 3;
  if (v >= 20) return 2;
  if (v >= 5)  return 1;
  return 0;
}

export function friendStars(key) {
  const lvl = getFriendLevel(key);
  return '★'.repeat(lvl) + '☆'.repeat(4 - lvl);
}
