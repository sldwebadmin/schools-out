// Global money balance — section-agnostic.
// Persists across days and runs (localStorage). Resets on explicit new-game only.

let _balance = 0;
let _dayStartBalance = 0; // snapshot at dawn — used to forfeit day's earnings on curfew breach

try {
  const s = typeof localStorage !== 'undefined' && localStorage.getItem('schools_money');
  if (s) _balance = Math.max(0, parseInt(s) || 0);
} catch(e) {}

function _save() {
  try { if (typeof localStorage !== 'undefined') localStorage.setItem('schools_money', String(_balance)); } catch(e) {}
}

export function earnMoney(amount) {
  _balance += amount;
  _save();
}

export function getMoney() { return _balance; }

// Call at the start of each new day to snapshot the opening balance.
export function snapshotDayBalance() { _dayStartBalance = _balance; }

// Restore balance to dawn snapshot — forfeits everything earned today.
export function forfeitDayEarnings() {
  _balance = _dayStartBalance;
  _save();
}
