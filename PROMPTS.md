# PROMPTS.md — Copy-Paste Prompts for Claude Code

Run one phase per session. Start Claude Code **inside your project folder** (the folder containing these files). Paste the prompt, then mostly say "yes" — Claude Code will ask before doing anything consequential. Don't start a phase until the previous one's checkpoint passed.

---

## Phase 0 — Scaffold the project and get the game running

> Read MIGRATION_BRIEF.md and CLAUDE.md in this folder. Set up a Vite vanilla-JavaScript project here per the brief's §3 structure. Port `schools-out-overworld.html` into it with **zero behavior changes**: move the CSS to styles.css, the HTML shell to index.html, and the entire script into src/main.js for now (we'll split it next phase). Then start the dev server and tell me the local URL so I can play it and confirm nothing changed. Also create a .gitignore and initialize git with an initial commit. Explain anything you install and why, in plain language.

**Checkpoint:** the game plays at the local URL exactly like the original file.

## Phase 1 — GitHub + automatic public demo

> Publish this project to GitHub and set up automatic deployment so every push gives me a public, playable URL. Use the GitHub CLI (`gh`) — if it isn't installed or I'm not logged in, walk me through it step by step, telling me exactly what to type and what I'll see. Create a public repo named `schools-out`, add a GitHub Actions workflow that builds with Vite and deploys to GitHub Pages on every push to main, push everything, then give me the live URL. Confirm the game plays there, including on a phone.

**Checkpoint:** you can open the URL on your phone and play.

## Phase 2 — Split into modules + automated tests

> Refactor src/main.js into the module structure from MIGRATION_BRIEF.md §3 with zero behavior change. Then create tests/headless.js: a Node smoke test that stubs the DOM/canvas, simulates ~90 seconds of gameplay (movement, sprinting, fence hops, waking the dog, the chase), and fails on any runtime error; wire it to `npm test`. Run test + build, commit in small steps, push, and confirm the live URL still plays identically.

**Checkpoint:** game unchanged; `npm test` passes.

## Phase 3 — Sprite-sheet characters (the big visual upgrade)

> Replace the procedural rectangle characters with real sprite-sheet rendering. Build a sprite system that draws from sheets at our 3px pixel grid with the outline pass kept. Needed: player + 3 NPC palette variants + Biscuit, each with 4-direction, 4-frame walk cycles, plus Biscuit's sleep/alert/chase poses. Source CC0 16-bit-style sheets (Kenney.nl or itch.io CC0 packs) and recolor them to our palette tokens, or generate clean placeholder sheets programmatically if sourcing is awkward — your call, but record every asset's source and license in assets/CREDITS.md. Keep the old renderer behind a USE_SHEETS flag as fallback. Show me before/after at the dev URL before pushing.

**Checkpoint:** characters visibly better, palette intact, CREDITS.md filled in.

## Phase 4 — Tile map editable in Tiled

> Convert the baked ground and wall layout into a tile set + a Tiled JSON map (mapeditor.org), preserving the current world exactly. The game should load the map from JSON. Then write TILED_GUIDE.md teaching me, a non-developer, how to install Tiled, open the map, move a tree, save, and see it in the game. Verify round-tripping works before pushing.

**Checkpoint:** you move one object in Tiled and see it in-game.

## Phase 5 — E-Bike Grand Prix (mode 2)

> Read DESIGN_DOC.md §4.2 and build the E-Bike Grand Prix as a second mode: checkpoint race starting at the market-district start line, 2–3 rival AI riders, drift feel, battery boost management, 3 laps, results screen with best times. Add a mode-select to the title screen. Reuse the existing camera/collision/renderer — no engine changes. Keep Dog Days Dash untouched (tests must still pass).

## Phase 6 — Installable on phones (PWA)

> Make the game an installable PWA: manifest with proper icons, service worker for offline play, and an in-game settings panel (music/SFX volume, button size). Test the install flow on mobile and write me one-paragraph instructions for installing it from the live URL.

---

## Everyday prompt patterns

- Tuning: "Biscuit catches me too fast in the open — slow his ramp a touch and tell me which number you changed."
- Content: "Add a kid NPC outside the school with two new lines about summer reading."
- Diagnosis: "The game stutters on my phone near the park — profile it and fix the biggest cost."
- Safety net: "Something broke — show me what changed in the last commit and undo it." (Git makes everything reversible; this is your panic button.)
- Understanding: "Explain how the dog's chase AI works like I'm new to code."

## Habits that keep you safe

1. One phase per session; play the checkpoint before continuing.
2. Let Claude Code commit often — small commits are your undo history.
3. If a session goes sideways, don't wrestle it: ask it to revert to the last good commit and start a fresh session.
4. The live URL is your review tool. If it plays right, it is right.
