# School's Out — Improved Game Design Prompt (v2: Top-Down)

Revision driver: the side-scroller framing was discarded. **School's Out is a top-down (3/4 "overworld") action game** — the perspective Octopath Traveler II actually uses outside of battle. This unlocks the original vision properly: a neighborhood you roam, not a treadmill you survive.

---

## The Prompt

**Build a browser-first top-down 2D action game called "School's Out"** — teens roaming their suburban neighborhood on summer break. Target web (HTML5 canvas, 60fps on mid-range hardware, single-file MVP), responsive with full touch controls so the same build ships as a PWA / wrapped mobile app. No login, no localStorage dependencies for core play.

### 1. Perspective & art direction (the HD-2D overworld, stated precisely)
- **Top-down 3/4 view**: the camera looks down at ~60°, so buildings show a front wall *and* a roof, characters show head-and-shoulders, and everything casts a long golden-hour shadow to the southeast. This is Octopath's overworld camera, not pure bird's-eye.
- Chunky 16-bit sprites on a 3px+ pixel grid, no anti-aliasing; **y-sorted rendering** so actors walk behind houses and fences and under tree canopies.
- Lighting does the "HD" half: dusk color wash (indigo → coral), bloom on lit house windows, warm light pools under streetlamps, fireflies, long soft shadows, vignette. Tree canopies render above the action for depth.
- JRPG-style UI: dark translucent panels, gold borders, letterspaced uppercase.

### 2. Core fantasy
You're 14, it's July, and the whole neighborhood is your map. Yards, streets, alleys, and the woods are one continuous space. Stakes are summer-sized; rating is E.

### 3. The map is the mechanic
The neighborhood is built from **yards enclosed by hoppable fences with gaps, solid houses, trees, and open streets**. Every mode reuses this space. Fences are the signature interaction: players vault them with a hop button; pursuers must find a gap or take time to jump. Routing knowledge *is* skill.

### 4. Game modes (MVP-first, in this order)
1. **Dog Days Dash (MVP — build first):** top-down chase. Biscuit the neighbor's dog hunts you through the blocks with ramping speed and simple pursuit AI (predictive steering, wall-sliding, and a telegraphed fence-jump when blocked so no hiding spot is permanent). You manage a **sprint stamina bar**; popsicles scattered across yards restore stamina and score; a parked **e-bike grants a temporary breakaway**. Run ends when Biscuit catches you. Score = time survived + popsicles. A proximity meter plus an off-screen direction arrow keep the dog readable at all times.
2. **E-Bike Grand Prix (next):** top-down checkpoint racing through the same streets and yard shortcuts — drift, ramps, battery boost management, rival AI riders.
3. **Woods Obstacle Course:** timed top-down gauntlet — creek crossings, log balances, mud that slows you — raced against a ghost of your best run.
4. **The Meetup (hub):** the park becomes the free-roam hub that launches modes, holds the shop, and shows friends' daily scores.

### 5. Systems
- One currency (Popsicle Points) across all modes; **cosmetic-only** progression (bikes, sneakers, backpacks, dog bandanas). No loot boxes — teen audience.
- Daily seeded "Summer Day" layout so friends compare runs on identical maps.
- Difficulty ramps inside a run (dog speed), not via menus.

### 6. Controls
- Desktop: WASD/arrows 8-direction movement, **Shift = sprint (hold)**, **Space = fence hop**.
- Mobile: left-thumb virtual joystick anywhere on screen, right-thumb Hop and Sprint buttons. Everything reachable in landscape with two thumbs.

### 7. Audio
Chiptune-meets-orchestral dusk loop; diegetic summer layer (cicadas, sprinklers, ice-cream truck) and dog barks that intensify with proximity.

### 8. MVP deliverable
One self-contained HTML file: title → top-down dog chase → game-over/retry, with the §1 art treatment, a generated multi-block neighborhood (houses, gapped fences, trees, streets, lamps), working keyboard + touch input, WebAudio SFX, and in-session best score. Architecture note: walls, pickups, and AI behaviors as data-driven object lists so the e-bike race can reuse the map, camera, and collision systems unchanged.

---

## What changed from v1 and why

| v1 (side-scroller) | v2 (top-down) |
|---|---|
| Auto-running lane; obstacles come to you | Free 8-direction roaming; you choose routes through a persistent map |
| Jump/slide reflex skill | Routing, fence-hopping, and stamina management as skill |
| Dog pressure abstracted to a gap meter | A real pursuing agent with steering AI, plus meter + off-screen arrow for readability |
| Parallax layers fake the neighborhood | The neighborhood is an actual navigable space all four modes share |
| Each mode would need its own engine | Camera, collision, map gen, and y-sort renderer built once in the MVP, reused by the race |
