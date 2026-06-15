// Global money balance — section-agnostic.
// Persists across days and runs (localStorage). Resets on explicit new-game only.

let _balance = 0;
try {
  const s = typeof localStorage !== 'undefined' && localStorage.getItem('schools_money');
  if (s) _balance = Math.max(0, parseInt(s) || 0);
} catch(e) {}

export function earnMoney(amount) {
  _balance += amount;
  try { if (typeof localStorage !== 'undefined') localStorage.setItem('schools_money', String(_balance)); } catch(e) {}
}

export function getMoney() { return _balance; }
