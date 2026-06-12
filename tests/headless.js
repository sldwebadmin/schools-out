import { existsSync, readFileSync } from 'fs';

const errors = [];
const check = (cond, msg) => { if (!cond) errors.push(msg); };

check(existsSync('index.html'),    'index.html missing');
check(existsSync('src/main.js'),   'src/main.js missing');
check(existsSync('styles.css'),    'styles.css missing');

const main = readFileSync('src/main.js', 'utf8');
check(main.includes('buildMap'),   'buildMap not found in src/main.js');
check(main.includes('bakeGround'), 'bakeGround not found in src/main.js');
check(main.includes('GOAL'),       'GOAL constant not found in src/main.js');
check(main.includes('WORLD'),      'WORLD constant not found in src/main.js');
check(main.includes('requestAnimationFrame'), 'game loop not found in src/main.js');

const html = readFileSync('index.html', 'utf8');
check(html.includes('id="game"'),           'canvas#game missing from index.html');
check(html.includes('src/main.js'),         'main.js script tag missing from index.html');
check(html.includes('styles.css'),          'styles.css link missing from index.html');
check(!html.includes('<script>') && !html.includes('<style>'), 'inline <script> or <style> found in index.html — should be external');

if (errors.length) {
  console.error('SMOKE TEST FAILED:');
  errors.forEach(e => console.error('  ✗', e));
  process.exit(1);
} else {
  console.log('Smoke test passed — project structure and key identifiers verified.');
}
