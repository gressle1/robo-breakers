# Robo Breakers v0.6 - Step 11b: Overdrive Corrections

Apply this update to the **existing** branch `feature/overdrive-core-v06` for the open PR #13. Do not create a new branch or merge PR #13 until testing is complete.

## Changes

1. **Astra / Scout** moves **up to 2 squares per MOVE command during Overdrive**, instead of 1. Normal movement is still 1. A move checks every intermediate square, stops at an arena wall, and may push one adjacent robot by one square before ending. DODGE remains exactly 1 square and costs 1 energy, including blocked Dodge.
2. **Phoenix / Striker** increases Blast's **base output from 28 to a provisional 35 during active Overdrive** (+25%), *before* defender armor and Dodge reduction. Example: 35 to Astra (0% armor) or 28 to Juggernaut (20% armor). This bonus expires automatically after the third active round. Shield continues to block damage. A boosted shot has a hotter beam core; normal Phoenix rifle visuals remain unique.
3. **Per-frame colored glows** on Overdrive activation, active Chibi art, player HUD and countdown badges: Juggernaut green, Phoenix red, Astra electric blue, Aurora orange. Overcharge remains a separate energy-gain action. Overdrive costs 3 energy, occupies one command, lasts for the next 3 completed rounds.
4. **Aurora / Vanguard** retains the previously specified 2-square MOVE during active Overdrive. Juggernaut and Phoenix stay at 1-square MOVE. Special Aegis Bit deployment and other frame abilities are NOT added here.

## Windows / GitHub Desktop

1. Verify `feature/overdrive-core-v06` is checked out, with Step 11 pushed and PR #13 still open/unmerged.
2. Extract `robo-breakers-overdrive-fixes-step11b-preview13-update.zip` using **Extract All**.
3. Copy only the contents of its `changes` folder into your `robo-breakers` repository root (GitHub Desktop > Repository > Show in Explorer); choose **Replace files**.
4. Confirm the 11 expected paths in GitHub Desktop, none nested under a literal `changes` folder.
5. Commit with summary `Fix Overdrive movement, Phoenix damage, and frame glows` and **Push origin**. Do not create another PR; Netlify Preview #13 should rebuild automatically.
6. Test in at least two browser windows before merging PR #13.

## Suggested Netlify Preview #13 tests

- [ ] Overcharge twice, activate Astra OD (cost 3 energy), then MOVE along a clear row: moves 2 squares. Normal MOVE is 1 after expiration.
- [ ] With Astra OD, move toward a wall or blocker: no jumping over occupied cells or beyond the arena boundary.
- [ ] DODGE still goes 1 square and uses 1 energy, including when blocked.
- [ ] Activate Phoenix OD, fire toward an unshielded target: 35 base damage before armor; baseline after expiration is 28 base.
- [ ] Shield blocks Phoenix's OD Blast; Dodge reduction continues to work.
- [ ] Phoenix keeps its distinctive red rifle beam; its OD variant is brighter.
- [ ] Every active frame glows its own color; Overdrive badge/HUD follows its frame color.
- [ ] Activation, countdown (3R -> 2R -> 1R), synchronized damage, and rematch are unchanged.
- [ ] Verify both browser windows agree; **do not merge until approved**.

## Local verification

`npm test`: 89 tests passed (includes 11 new regression cases)

`npm run build`: passed

`npm run test:e2e`: passed (full two-player match plus rematch)

All changes are based on the Step 11 files; no new dependencies or server APIs were added. The 35 Phoenix base damage value is **provisional** pending the user's balance approval.
