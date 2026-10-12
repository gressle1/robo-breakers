# Robo Breakers v0.6 — Test Plan

This is the planned verification checklist. It does not claim these tests have already been run.

## 1. Regression baseline

- [ ] Create/join a room using a room code.
- [ ] Verify 2–8 players can join and see consistent lobby state.
- [ ] Verify secret simultaneous command selection and reveal timing.
- [ ] Verify MOVE, BLAST, SHIELD, HACK, and OVERCHARGE still work.
- [ ] Verify a locked command cannot be replaced before resolution.
- [ ] Verify leaving an active match, host transfer, rematch, and disconnect behavior.
- [ ] Verify the 5×5 baseline arena remains correct when dynamic sizing is not active.

## 2. Frame selection and stats

- [ ] Each of the four frame IDs is accepted; unknown IDs are rejected safely.
- [ ] Exact frame stats come from one authoritative source.
- [ ] Clients cannot submit modified stats or grant themselves a frame ability.
- [ ] Selection timing and duplicate-frame policy are enforced.
- [ ] Frame choice survives refresh/reconnect and is synchronized to all clients.
- [ ] UI communicates stats and limitations clearly.

## 3. Color schemes

- [ ] All eight approved schemes are selectable under the agreed uniqueness rules.
- [ ] Colors are consistent across all clients and rounds.
- [ ] Color choice does not modify gameplay state unless explicitly specified.
- [ ] Player identity remains distinguishable with all supported combinations.
- [ ] Test desktop, mobile, and common color-contrast cases.

## 4. Arena, movement, and collision

- [ ] Minimum/maximum arena dimensions are enforced.
- [ ] Resizing is synchronized and happens at the documented phase.
- [ ] Robots are not silently lost when arena bounds change.
- [ ] Contested destinations, swaps, crossing paths, and blocked movement follow the frozen rules.
- [ ] Knockback and dodge cannot place robots in invalid cells.
- [ ] Outcomes are deterministic when multiple players target the same cell.

## 5. Energy, Overdrive, cooldown, and pressure

- [ ] Gauge gain/spend is correct at round boundaries.
- [ ] Insufficient resources prevent activation.
- [ ] Duplicate or replayed requests cannot spend/gain resources twice.
- [ ] Overdrive starts and ends at the specified time.
- [ ] Cooldowns start, tick, and expire according to the spec.
- [ ] Pressure triggers, thresholds, and decay match the spec.
- [ ] Concurrent actions produce one authoritative, consistent result.

## 6. CQC, rear attacks, knockback, and dodge

- [ ] CQC begins only under the documented trigger conditions.
- [ ] Power Struggle handles wins, losses, ties, and escape outcomes.
- [ ] Facing and rear-attack calculations work at all directions and edges.
- [ ] Knockback handles blocked cells, boundaries, and multi-robot conflicts.
- [ ] Dodge respects its cost, cooldown, timing, legal destinations, and evade rules.
- [ ] Combined interactions (dodge vs. rear attack, dodge vs. knockback, Overdrive during CQC) have explicit expected outcomes.
- [ ] All outcomes are identical for every client.

## 7. Multiplayer and adversarial cases

- [ ] Test with two separate clients/devices; repeat across separate networks.
- [ ] Test late/duplicate/out-of-order action requests.
- [ ] Test reconnect during lobby, locked-command phase, resolution, and post-round state.
- [ ] Test host leaving during a match and during rematch setup.
- [ ] Test two through eight players with competing movement and combat actions.
- [ ] Verify clients cannot see hidden opponent commands before reveal.
- [ ] Verify a modified client cannot override server-resolved health, energy, position, frame, cooldown, or outcome.

## 8. Release gate

v0.6 should not be called complete until:
- [ ] Automated unit and integration tests pass.
- [ ] End-to-end multiplayer tests pass.
- [ ] Desktop and mobile smoke tests pass.
- [ ] A deployed preview has been tested with separate devices.
- [ ] Known balance issues and unresolved bugs are documented.
- [ ] Release notes describe only features that are actually implemented.
