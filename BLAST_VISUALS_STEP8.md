# Robo Breakers v0.6 - Step 8: Blast Visual Polish

Apply to: `feature/combat-visual-polish-v06` (from merged PR #9 `main`).

## What's new
- Each authoritative, resolved BLAST shows a short signature-colored projectile streak along its server-recorded path.
- Impacts produce a flash and floating `-N HP` number based on the actual server's calculated damage, or `BLOCK` for a shield and `MISS` for an empty shot.
- Existing EXECUTE announcement clears early to reveal the arena animation.
- Playback uses round/timestamp identity and elapsed-time CSS offset so the 700 ms network polling cannot replay or restart shots.
- The final knockout shot can finish its effect before the victory screen.
- The 5x5, 6x6, and 7x7 arena rows use the actual server-selected board size.

## Preserved behavior
- All HP, armor, damage, dodge-energy, shields, hacks, round resolution, server persistence, lobby, and multiplayer mechanics are unchanged.
- The only engine difference is a `damage` number added to each resolved BLAST `lastTurn.visuals` item. No damage math was edited.
- The four approved Chibi art assets, machine equipment, and Frame Selection artwork are untouched.
- Reduced-motion accessibility setting hides the fast visual effects; the combat log remains available.

## Windows / GitHub Desktop
1. Ensure Current Branch is `feature/combat-visual-polish-v06` and there are no uncommitted changes.
2. Extract the Step 8 ZIP with **Extract All**.
3. Open the extracted `changes` folder and copy everything INSIDE it.
4. GitHub Desktop: Repository > Show in Explorer. Paste into the `robo-breakers` repository root, replacing existing files.
5. Verify the modified files appear in GitHub Desktop, and paths DO NOT start `changes/`.
6. Commit with summary `Add multiplayer Blast projectiles and damage numbers` and Push/Publish branch.
7. Create a pull request targeting `main`. On its Netlify Deploy Preview, open two browsers and fire blasts; verify impacts, HP, shield blocks, misses, final KO, and the other four machine colors. Do not merge until approved.

## Local verification performed
- `npm run build`: passes.
- `npm test`: 54 tests passed, including six new FX-specific tests.
- `npm run test:e2e`: full two-player match and rematch passed.
- Live Netlify visuals must be checked by the user in the deploy preview.
