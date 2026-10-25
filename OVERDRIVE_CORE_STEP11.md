# Robo Breakers v0.6 — Step 11: Overdrive Core (preview only)

## Prerequisite

This patch is based on Step 10, which includes all visual upgrades through Shield, Hack, and Overcharge. **Merge PR #12 into `main` and pull `main` before applying this package to `feature/overdrive-core-v06`.** Do not merge this step before checking the new Netlify preview.

## Overdrive core rules — proposed for playtesting

- **Cost:** 3 energy.
- **Activation:** select OVERDRIVE (7), then Lock In Command. It uses your full command for that round. The engine deducts 3 energy at resolution, not on selection.
- **Duration:** 3 complete subsequent rounds. The activation round does **not** count. E.g., activate in round 3 -> show 3R for round 4, 2R for round 5, 1R for round 6; effect ends after round 6 resolves.
- **No stacking or reactivation while active.** The command is disabled when energy is insufficient or Overdrive is active. Server validates both conditions.
- **Display:** Gold status/glow on the mini-frame, a remaining-rounds badge (OD 3R, OD 2R, OD 1R), pilot HUD status, an activation pulse, and an expiration notice. All users see server-authoritative round status; live stats are not client-simulated.
- **Safety:** Starting a new match, rematch, or returning to lobby resets Overdrive. Energy and the Dodge blocked-move cost are unchanged. Overcharge still adds +1 energy; it is not Overdrive.
- **NOT YET INCLUDED:** Frame-specific Overdrive movement bonuses (Astra 3 squares / Aurora 2), Juggernaut Fortress Armor mode, Phoenix special benefits, Aurora Aegis Bit deployment, melee/CQC. These require a separate approved gameplay patch. Existing frame stats, armor, and Blast damage do not change during this foundation test.

## Install on Windows / GitHub Desktop

1. Confirm Step 10 / PR #12 is merged into `main`; switch to `main`, Fetch origin and Pull origin; ensure **No local changes**.
2. Create or switch to `feature/overdrive-core-v06` made from that updated `main`.
3. Extract the ZIP via **Extract All**. Open `changes` and copy its **contents** (not the `changes` directory) into the `robo-breakers` repository root.
4. Replace existing files when prompted. GitHub Desktop should show **10 changed files**, no paths starting with `changes/`.
5. Stop before committing and send a screenshot for verification.
6. After committing, pushing, and opening the next Netlify Deploy Preview, test two players gathering 3 energy, activating Overdrive, watching 3R -> 2R -> 1R -> expire, and verifying attempts without enough energy are disabled. Also check HP, Dodge, Phoenix beam, and normal multiplayer sync.
7. Only merge the pull request after actual multiplayer testing and all GitHub checks pass.

## Local verification

- `npm test`: **78/78 passed** (69 prior tests + 9 Overdrive-core tests).
- `npm run build`: **passed**.
- `npm run test:e2e`: **passed**, two-player full match and rematch.
- Real browser Netlify visual test: **not yet performed**.

## Files changed

- `game-engine.mjs`, `src/game-engine.mjs` — server-authoritative Overdrive command, cost, duration and lifecycle.
- `app.js`, `public/app.js`, `dist/app.js` — command button, hotkey `7`, player and HUD status, activation/expiry visuals.
- `style.css`, `public/style.css`, `dist/style.css` — gold status/Overdrive animation and mobile-friendly styles.
- `test/overdrive-core.test.mjs` — nine new automated tests.
- This documentation file.
