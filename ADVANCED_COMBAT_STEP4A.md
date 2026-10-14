ROBO BREAKERS v0.6 — ADVANCED COMBAT STEP 4A

BRANCH-READY TEST PACKAGE: DODGE COMMAND (not yet deployed or merged)

SOURCE BASE: Tested Frame Combat update PR #6 (assumed merged into main).
DO NOT UPLOAD THE ZIP ITSELF INTO GITHUB.

WINDOWS / GITHUB DESKTOP
1. In GitHub Desktop switch to main; Fetch/Pull latest changes after merging PR #6.
2. Create a new branch from that updated main: feature/advanced-combat-v06
3. Extract this ZIP. Open its 'changes' folder.
4. Copy the CONTENTS of changes, not the changes folder, into the root of
   the local robo-breakers repository (the folder containing .git and package.json).
5. In GitHub Desktop, review changed paths. Do not paste into src or dist.
6. Commit: Add directional Dodge prototype and regression tests
7. Publish the branch; create a pull request targeting main without merging.
8. Test its Netlify Deploy Preview with two players; approve the staging rules below
   before merging into main.

ALREADY-APPROVED ELEMENTS USED
- Dodge is a player-controlled action, not a free extra action.
- Directional; costs 1 energy; normally moves 1 square.
- Reduction by frame: Juggernaut 25%, Phoenix 40%, Astra 60%, Aurora 45%.
- Not available during a CQC phase (CQC system is not yet implemented).
- Scout Astra can dodge up to 2 squares during Overdrive, but Overdrive activation
  is not available in this prototype, so all current dodges move one square.

PROPOSED IMPLEMENTATION DETAILS — NEED USER APPROVAL
- Directional Dodge resolves in the movement phase, before BLAST resolution,
  in the existing deterministic order of pilots.
- Attempting Dodge spends one energy even if the destination is blocked.
- Dodge does not push an occupying robot. If blocked, no dodge damage reduction.
- Successful Dodge grants the frame's reduction on any BLAST that still hits during
  that same round, AFTER armor: round(round(base * (1-armor%)) * (1-dodge%)).
- Dodge is not a persistent buff, cannot be used at zero energy, cannot move out of bounds.

STILL NOT IMPLEMENTED
- CQC/Melee, Power Struggle, rear attacks and knockback
- Overdrive activation/duration/cooldown and Overdrive movement/dodge distance
- Pilot Pressure, shared gauge, eight palette choices

VERIFIED LOCALLY: npm test (46/46), node --check and npm run build,
                npm run test:e2e (full local two-player match and rematch).
LIVE NETLIFY MULTIPLAYER NOT YET TESTED. MAIN BRANCH IS NOT MODIFIED.
