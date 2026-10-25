# Robo Breakers v0.6 — Step 11d: Locked Frame Movement Speeds

**Approved by the user on October 25, 2026.** This decision **supersedes the Astra two-square setting** in Step 11b. Treat this table as the authoritative movement canon from this update onward.

| Machine | Role | Normal MOVE | MOVE during active Overdrive |
| --- | --- | ---: | ---: |
| Juggernaut | Heavy | 1 | 1 |
| Phoenix | Striker | 1 | 1 |
| Astra | Scout | 1 | **3** |
| Aurora | Vanguard | 1 | 2 |

- A MOVE is **one command**, not one command per tile. Active Overdrive allows movement up to the listed number of squares in a single chosen direction, stopping early at board edges or collisions according to existing rules. Ram/push behavior is unchanged.
- DODGE remains separate: 1-square max and 1 energy cost even when movement is blocked. This speed lock **does not change Dodge**.
- Overdrive activation (3 energy, one command), duration (3 completed rounds after activation), Phoenix rifle boost (currently **provisional** 28 -> 35 base Blast), armor, HP, multiplayer sync, aura colors, and the Step 11c lobby/create-room hotfix all remain unchanged.
- This update does not introduce Aurora's Aegis Bits deployment, Juggernaut Fortress Armor gameplay, or other frame-specific Overdrive abilities.

## Install into existing PR #13 branch

1. In GitHub Desktop stay on `feature/overdrive-core-v06`; leave PR #13 unmerged.
2. Extract this ZIP using **Extract All**; open `changes` and copy only the **contents** into the `robo-breakers` repository root (Repository > Show in Explorer). Replace files.
3. Confirm the expected **8 changed files** and no unwanted nested `changes/` folder.
4. Commit as `Lock Overdrive movement speeds for all four frames`, then **Push origin**. The existing PR #13 / Netlify Preview #13 updates automatically.
5. Wait for the new Netlify deployment to be published and hard-refresh. Test **Create Room**, frame selection and the existing Overdrive rules before merging.

## In-game verification

- [ ] Astra moves 1 square without Overdrive, **3** per clear-row MOVE with active Overdrive, and 1 again after expiration.
- [ ] Aurora moves **2** per MOVE in Overdrive; Juggernaut and Phoenix move **1**.
- [ ] Astra cannot move through unpushable bots or arena walls; occupied tiles resolve according to existing ram rules.
- [ ] Dodge still moves at most 1 tile and costs 1 energy even if blocked.
- [ ] Room creation/reload works after Step 11c hotfix; Phoenix's boosted beam, unique aura colors and turn synchronization still work.

**No merge until the user confirms the updated Preview #13 works.**
