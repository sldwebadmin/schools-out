// Headless Chromium smoke test — run AFTER npm run build.
// Serves dist/ via vite preview, loads the page in a real browser, listens
// for 4 seconds, and fails if any uncaught JS exception or console.error fires.
//
// This catches the class of bug that headless Node tests miss: code that
// references a DOM element that doesn't exist in the deployed HTML.
//
// Local first run: npx playwright install chromium
// CI: see deploy.yml — browsers are installed + cached before this step.

import { preview } from 'vite';
import { chromium } from 'playwright';
import { setTimeout as sleep } from 'timers/promises';

const PORT = 4174;
// Must match the base in vite.config.js so we load the correct index.html
const BASE = process.env.GITHUB_ACTIONS ? '/schools-out/' : '/';
const LISTEN_MS = 4000;

async function main() {
  // Serve the built dist/ folder
  const server = await preview({
    preview: { port: PORT, strictPort: true },
    logLevel: 'silent',
  });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];

  // Collect every uncaught exception and console.error
  page.on('pageerror', err => {
    errors.push(`Uncaught: ${err.message}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  await page.goto(`http://localhost:${PORT}${BASE}`, {
    waitUntil: 'networkidle',
    timeout: 15000,
  });

  // Press Space to start the game — this transitions state to "run" and
  // exercises update() / draw() including all DOM element accesses.
  await page.keyboard.press('Space');

  // Let the game loop run in "run" state; this is where null .style crashes fire
  await sleep(LISTEN_MS);

  await browser.close();
  server.httpServer.close();

  if (errors.length) {
    console.error('BROWSER SMOKE FAILED:');
    errors.forEach(e => console.error('  ✗', e));
    process.exit(1);
  }
  console.log(`Browser smoke: OK — 0 JS errors in ${LISTEN_MS / 1000}s of real Chromium`);
}

main().catch(e => {
  console.error('Browser smoke crashed:', e.message);
  process.exit(1);
});
