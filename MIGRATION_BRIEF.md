# School's Out — Migration Brief (Chat Prototype → Claude Code Project)

**Audience:** Claude Code, working with Harry (project owner, not a professional developer — explain decisions plainly, automate everything that can be automated, and never assume he knows a tool).
**Status:** Working prototype complete. This brief defines the migration to a real repository and the roadmap beyond it.

---

## 1. What this project is

School's Out is a browser-first, top-down 2D action game in the HD-2D style (Stardew Valley / Octopath Traveler overworld): a teen's summer in a suburban neighborhood. The shipped prototype, `schools-out-overworld.html`, is a single self-contained file containing the complete first game mode and the full overworld:

- **Overworld** (4000×3000): a central neighborhood hub with the player's house at the bottom of a cul-de-sac street; a school district to the north past a greenbelt tree line; a Maple Mart shopping district to the east past a second tree line; Whispering Woods to the west; wild meadow reserved for future regions. This region structure is deliberate and must be preserved — future content (forest trails, e-bike race blocks, more shops) attaches to existing geography.
- **Mode 1 — Dog Days Dash:** leave home, cross the map, reach the school playground goal. Biscuit the dog naps at one of three daily-seeded spots; waking him (240px radius, telegraphed "!") starts a pursuit (predictive steering, wall-sliding, telegraphed fence-jumps). Systems: sprint stamina, fence hopping (Space), popsicle pickups (score + stamina), e-bike boost pickup, win/lose scoring with a stealth bonus, session best.
- **World life:** patrol NPCs (walkers, bike riders), idle friend kids with speech bubbles, animated props (swings, flag, pond shimmer), streetlamps, fireflies.
- **Presentation:** 3px pixel grid, y-sorted rendering, baked ground layer (offscreen canvas), long SE shadows, dusk wash + vignette, window bloom, minimap, JRPG UI. All audio is WebAudio-synthesized: dusk music loop, cicada ambience, ice-cream truck, SFX.
- **Input:** WASD/arrows + Shift sprint + Space hop; mobile virtual joystick + Hop/Sprint buttons. M toggles music.

## 2. Why migrate

The single-file format hit its ceiling on exactly one axis: **assets**. The next visual jump (true 16-bit Stardew feel) requires real sprite sheets and tile sets, which means a multi-file project, an asset pipeline, version control, live-reload iteration, and automated deployment. Everything else (engine, AI, map structure, audio) ports as-is.

## 3. Target architecture

Vanilla JavaScript + Vite. **No frameworks, no TypeScript, no game engine libraries** — the existing code is dependency-free and Harry needs to be able to read it. Vite provides the dev server, module bundling, and production build only.

```
schools-out/
├── index.html              # shell: canvas + HUD/overlay DOM
├── src/
│   ├── main.js             # boot + game loop
│   ├── engine/             # camera.js, collision.js, input.js, loop.js
│   ├── audio/              # synth.js (music/ambience/sfx — port verbatim)
│   ├── world/              # map.js (region data), bake.js (ground), minimap.js
│   ├── entities/           # player.js, dog.js, npcs.js, pickups.js
│   ├── render/             # draw.js, props.js, sprites.js, lighting.js
│   └── ui/                 # hud.js, overlays.js
├── assets/                 # sprite sheets, tile sets (phase 2+)
├── styles.css
├── tests/headless.js       # node-based smoke test (pattern exists in prototype history)
└── .github/workflows/deploy.yml   # build + publish to GitHub Pages on every push
```

## 4. Phased roadmap (one phase per Claude Code session; finish and verify before moving on)

- **Phase 0 — Scaffold & port.** Vite project; the prototype runs unchanged inside it (paste the `<script>` body into one module first; splitting comes next). DoD: `npm run dev` shows the playable game; `npm run build` succeeds.
- **Phase 1 — Deploy pipeline.** Git repo, GitHub remote, Actions workflow → GitHub Pages. DoD: a public URL anyone (including a phone) can play; every push auto-publishes.
- **Phase 2 — Modularize.** Split into the structure above with zero behavior change. Port the headless test harness into `tests/headless.js` and add `npm test`. DoD: game plays identically; tests pass.
- **Phase 3 — Sprite-sheet renderer.** Replace procedural-rect characters with sheet-based sprites: 4 directions × 4 walk frames for player/NPCs/dog, idle/sleep/alert poses for Biscuit. Source CC0 16-bit assets (Kenney.nl or itch.io CC0 packs) or generate placeholder sheets; keep the procedural renderer behind a flag as fallback. This is the big visual jump. DoD: characters animate from sheets at the established palette; pixel grid preserved.
- **Phase 4 — Tile map + Tiled.** Convert ground bake + walls to a tile set and a [Tiled](https://www.mapeditor.org) JSON map so the overworld becomes visually editable. Preserve current geography exactly. DoD: map loads from JSON; Harry can open it in Tiled, move a tree, and see it in-game.
- **Phase 5 — E-Bike Grand Prix.** Second mode on the existing map: checkpoint race starting at the market-district start line, rival AI riders, drift + battery boost. Reuses camera/collision/renderer untouched.
- **Phase 6 — Polish & PWA.** Manifest + service worker (installable on phones), settings (volume sliders), then evaluate Capacitor wrap for app stores.

## 5. Non-negotiable conventions

1. **Art direction tokens:** ink `#1b1430`, cream `#ffe9c2`, gold `#ffc44d`, coral `#ff6b57`, teal `#2ec4b6`; dusk palette throughout; 3px pixel grid; y-sorted world; outline pass on characters; lighting stack (shadows SE, wash, vignette, bloom) never removed.
2. **Rating E.** Summer-sized stakes only. No violence, no dark themes.
3. **No login, no paid anything, cosmetic-only progression** (per the design doc).
4. **localStorage may now be used** for best scores/settings (the no-localStorage rule was a chat-artifact constraint and does not apply in the repo) — but core play must still work with storage unavailable.
5. **Every change ships green:** `npm test` and `npm run build` pass before any commit; commits are small with plain-English messages.
6. **Explain to Harry** what changed and why in plain language at the end of every session; he reviews the live URL, not diffs.

## 6. Reference documents in this package

- `schools-out-overworld.html` — the complete working prototype (source of truth)
- `DESIGN_DOC.md` — game design prompt v2 (vision, modes, systems)
- `CLAUDE.md` — drop into the repo root; Claude Code reads it automatically every session
- `PROMPTS.md` — copy-paste prompts for each phase
- `SETUP_GUIDE.md` — tools and one-time setup for Harry
