# Robo Breakers v0.6 — Step 6: Full-Body Battlefield Sprites (Review Build)

This update starts from the **merged Step 5 Frame Visuals** front end (PR #8). It changes only the visuals used on the 5x5 battlefield, replacing rectangular frame cards with transparent, full-body 2D sprites.

## Approved artwork preserved
- Juggernaut — green/white heavy machine
- Phoenix — red/white Striker
- Astra — electric-blue/white Scout with wing-like thrusters
- Aurora — orange/white Vanguard, shield and rifle; **no detached Aegis Bits in the regular stance** (four remain mounted and only deploy during Overdrive, which is not yet active).

The sprite silhouette pixels were **cut out from the four previously approved reference images**, not redrawn. Edge extraction is a first-pass review and may show a few minor background fragments at high zoom; approve the game-scale look first. The full machine artwork remains unchanged in Frame Selection and lobby.

## Code changed
- Only `app.js`, `public/app.js`, and `dist/app.js`: sprite artwork in battle tiles, same name/HP/direction/status markup.
- Only `style.css`, `public/style.css`, and `dist/style.css`: 2D sprite positioning, glow under feet, small move animation, responsive styling.
- Eight identical WebP sprites across `public/assets/frames/` and `dist/assets/frames/` (four unique files mirrored).
- **No changes** to `game-engine.mjs`, `server.mjs`, Netlify functions, locked statistics, player state, network endpoints, or command mechanics.

## Upload safely
1. After PR #8 is merged, switch GitHub Desktop to `main`, Fetch/Pull latest.
2. Create `feature/full-body-sprites-v06` from updated `main`. Confirm selected branch.
3. Extract this ZIP to a fresh folder. Open `changes` and copy **its contents**, not the `changes` folder itself, into GitHub Desktop's `Repository -> Show in Explorer` folder (containing `.git`, `app.js`, `public`, `package.json`). Replace files when Windows asks.
4. GitHub Desktop must show `app.js`, `public/app.js`, `dist/app.js`, `style.css`, and assets under `public/assets/frames`, *not* `changes/...` or `src/app.js`.
5. Commit `Add full-body battlefield sprites from approved frame artwork`, push to GitHub, open a PR against main, and use the Netlify Deploy Preview. **Do not merge before live visual approval**.

## Visual regression checklist
- Check all 4 frame sprites and 2 players on different frames.
- Check 2 players using the same frame: pilot outline/callsign still distinguishes them.
- Confirm shield, hit, Dodge, BLAST, move, out-of-bounds behavior and rematch still work.
- Check PC and small mobile display, including name and HP readability.
- Don't mistake artwork for new gameplay equipment. Any CQC/Overdrive mechanic is still pending.

Review screenshot included outside the `changes` folder as `SPRITE_REVIEW.jpg`.
