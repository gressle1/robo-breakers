# Robo Breakers v0.6 — Step 11c: Lobby/Room Creation Hotfix for PR #13

## Root cause

The Step 11b UI color patch used `${frameColor}` in `playerCard(p,i,r)` without declaring `frameColor` inside that function. When the server successfully created a room, the browser failed rendering the lobby with `ReferenceError: frameColor is not defined`. Reloading a session already associated with a lobby could leave an empty application screen for the same reason.

## Correction

- Define the corresponding machine color locally in `playerCard()`, with the original player palette as fallback when no frame has been selected.
- Keep the corrected per-frame Overdrive colors and the Step 11b gameplay updates for Astra and Phoenix intact.
- Add `test/lobby-render-regression.test.mjs` covering first launch, Create Room, saved-room reload, and frame selection.

## Validation

- Original Step 11b frontend: targeted Create Room, saved-room reload, and frame selection tests reproduced `ReferenceError: frameColor is not defined`.
- Corrected frontend: all four targeted smoke tests pass.
- `npm test`: 93/93 tests pass.
- `npm run build`: passes.
- `npm run test:e2e`: two-player full match and rematch pass.

Browser-based testing against the live Netlify preview still needs to be performed after pushing. The browser test was simulated with the real frontend code and a mocked HTTP API; no live Netlify deployment was accessible from this environment.

## Apply to existing PR #13 (Windows GitHub Desktop)

1. Keep the current development branch `feature/overdrive-core-v06`. **Do not merge**.
2. Extract this ZIP, open `changes`, copy its **contents**, and paste them into your repository root with Replace files.
3. GitHub Desktop should show five changed files (three app.js files, the regression test, and this note).
4. Commit: `Fix blank screen and Create Room lobby crash`.
5. Push origin. This updates the existing PR #13 and its Netlify Deploy Preview.
6. Wait for the new Deploy Preview status to say Published. In both test browsers, do a hard refresh (`Ctrl+Shift+R`).
7. Test: open title, enter a callsign, Create Room, observe room code/lobby, select a frame, reload, then invite a second player. Only after that, retest Astra Overdrive two-tile movement and Phoenix boosted damage.

If it still fails after a Published deploy and hard refresh, capture the browser Developer Tools Console error and Netlify deploy/function errors. Do not merge until fixed.
