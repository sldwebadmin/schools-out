# CLAUDE.md — School's Out

Persistent instructions for Claude Code. Read MIGRATION\_BRIEF.md for full context before structural work.

## Project

Top-down 2D HD-2D-style browser game (Stardew/Octopath overworld feel). Vanilla JS + Vite, HTML5 canvas, no frameworks, no game libraries, no TypeScript. Owner (Harry) is not a professional developer: explain changes in plain language, prefer automation, never leave the repo in a broken state.

## Commands

* `npm run dev` — local dev server (the way Harry plays work-in-progress)
* `npm run build` — production build (must pass before every commit)
* `npm test` — headless smoke test in Node (must pass before every commit)
* Deploy is automatic: pushing to `main` publishes to GitHub Pages via Actions

## Hard rules

1. **Never break the playable build on `main`.** Test + build green before committing. If a change is risky, branch.
2. **Preserve the world geography.** Region layout (neighborhood hub, school N, market E, woods W, meadow reserves) is design canon. New content extends it; refactors don't move it.
3. **Art direction is fixed:** palette tokens ink `#1b1430` / cream `#ffe9c2` / gold `#ffc44d` / coral `#ff6b57` / teal `#2ec4b6`; 3px pixel grid (`image-rendering: pixelated`, snap to grid); y-sorted rendering; character outline pass; dusk lighting stack (SE long shadows, color wash, vignette, window/lamp bloom) stays in.
4. **Rating E.** No violence, weapons, or dark themes. The dog chase is playful peril.
5. **Mobile parity.** Every feature works with the virtual joystick + touch buttons; verify layouts at narrow viewports.
6. **No new runtime dependencies without asking Harry first.** Dev-tooling deps are fine; explain what they're for.
7. **Assets must be license-clean:** CC0 or original only; record source + license for every asset in `assets/CREDITS.md`. Never copy sprites from commercial games (no Stardew/Nintendo rips) — style inspiration only.
8. **Audio stays synthesized** (WebAudio) unless Harry approves audio files; keep volumes subtle; M toggles music.
9. **localStorage allowed** for best scores/settings only; the game must still run if storage throws.

## Conventions

* Small commits, plain-English messages ("Add sprite-sheet walk cycles for NPCs").
* Keep modules in the layout defined in MIGRATION\_BRIEF.md §3; one responsibility per file.
* Data-driven content: walls/pickups/NPCs/dialog as object lists, not hardcoded logic, so new modes reuse systems.
* When a session ends: summarize what changed, what Harry should check at the live URL, and what's next.

## Definition of done (any task)

Playable in browser + on mobile layout, tests green, build green, pushed, live URL verified, summary written for Harry.



Reference: zelda3 (github.com/snesrev/zelda3)



This reverse-engineered ALttP reimplementation may be consulted as an ARCHITECTURE reference only: region/chunk structure, screen and door transitions, interior-map design, camera behavior. Read its README and docs for patterns; do not port its C code. ABSOLUTE RULE: no assets, graphics, maps, sprites, palettes, or audio from zelda3, ALttP, or any Nintendo property may enter this repo in any form — it is all copyrighted, and zelda3 itself ships no assets for exactly that reason. Concepts only, pixels never.

