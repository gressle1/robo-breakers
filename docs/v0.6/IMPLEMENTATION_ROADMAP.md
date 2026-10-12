# Robo Breakers v0.6 — Implementation Roadmap

This roadmap intentionally separates design lock-down from code changes. v0.6 is planning-only until implementation commits and test evidence are added.

## Stage 0 — Protect the baseline and freeze rules

**Goal:** establish a stable starting point and avoid coding from ambiguous notes.

- [ ] Confirm current `main` commit and record the baseline.
- [ ] Keep v0.6 work on a separate branch until reviewed.
- [ ] Complete the rule-freeze checklist in `GAMEPLAY_SPEC.md`.
- [ ] Record the exact frame stats and formulas in a machine-readable authoritative table.
- [ ] Decide movement/collision and the canonical simultaneous-resolution order.

**Exit criteria:** no implementation-blocking rule ambiguity remains for the next stage.

## Stage 1 — Frame data and player selection

- [ ] Add a validated, server-authoritative definition for Scout, Striker, Juggernaut, and Vanguard.
- [ ] Keep gameplay values out of presentation-only code.
- [ ] Add lobby frame selection and serialize the choice in room state.
- [ ] Validate selection changes only at the permitted phase.
- [ ] Add frame-specific UI summaries for stats and strengths/weaknesses.
- [ ] Add automated tests for valid/invalid frame IDs, defaults, reconnects, and lobby state synchronization.

**Exit criteria:** every player has one valid frame and all clients show the same choice; frame data does not change based on client input.

## Stage 2 — Color schemes and visual integration

- [ ] Add the planned eight color schemes per frame.
- [ ] Confirm whether schemes are shared or frame-specific before choosing the data model.
- [ ] Prevent unreadable combinations and preserve player-identifying contrast.
- [ ] Keep color selection cosmetic unless a gameplay effect is explicitly approved.
- [ ] Verify color and frame persist through round changes, reconnects, rematches, and host transfer.
- [ ] Make it possible to replace placeholder silhouettes with approved concept art without changing engine rules.

**Exit criteria:** frame and color selections render consistently on desktop and mobile.

## Stage 3 — Arena and movement foundations

- [ ] Define arena dimensions as explicit authoritative state rather than relying on hard-coded 5×5 assumptions.
- [ ] Implement minimum/maximum arena limits and validated resize events.
- [ ] Finalize contested-cell, swap, crossing-path, blocked movement, and boundary rules.
- [ ] Add deterministic movement resolution and tests for multi-player conflicts.
- [ ] Define how resize affects robots near newly closed edges.
- [ ] Verify every client receives identical arena dimensions and positions.

**Exit criteria:** movement and resizing are deterministic for 2–8 players, including edge cases.

## Stage 4 — Resource systems: Overcharge, Overdrive, cooldown

- [ ] Implement the agreed Shared Overcharge Gauge data model and resource rules.
- [ ] Add server validation for gain, spending, activation, and insufficient resources.
- [ ] Implement Overdrive activation/effects/duration/termination from the frozen spec.
- [ ] Implement System Cooldown with a clearly defined round/tick convention.
- [ ] Add UI for gauge, Overdrive state, and cooldown availability.
- [ ] Test simultaneous activations, duplicate submissions, reconnects, and round boundaries.

**Exit criteria:** resource accounting is consistent and no client can bypass costs or cooldowns.

## Stage 5 — Pilot Pressure

- [ ] Implement the approved pressure triggers and thresholds.
- [ ] Add pressure state to the authoritative engine.
- [ ] Display current pressure and explain any consequence in the UI.
- [ ] Test decay/threshold boundaries and interactions with Overdrive and CQC.

**Exit criteria:** pressure changes only from documented events and resolves identically for every client.

## Stage 6 — CQC, Power Struggle, rear attacks, knockback

- [ ] Add the CQC trigger and phase transitions.
- [ ] Implement the Power Struggle resolution formula and tie/escape behavior.
- [ ] Add facing and rear-attack evaluation.
- [ ] Implement knockback with collision and arena-edge handling.
- [ ] Document and test the order of movement, attack, damage, CQC, and knockback.
- [ ] Add clear UI feedback for CQC start, struggle result, rear hit, and displacement.

**Exit criteria:** CQC and positional combat are deterministic, readable, and covered by regression tests.

## Stage 7 — Dodge

- [ ] Implement dodge as the agreed player-controlled action.
- [ ] Validate costs, cooldown, timing, destination, and legal evasions server-side.
- [ ] Specify dodge interaction with movement, attacks, knockback, CQC, and Overdrive.
- [ ] Add clear feedback when a dodge succeeds, fails, or is blocked.
- [ ] Test adversarial simultaneous action combinations.

**Exit criteria:** dodge adds a meaningful decision without creating ambiguous or exploitable resolution.

## Stage 8 — Balance and release candidate

- [ ] Run unit and integration tests for the full game engine.
- [ ] Run end-to-end tests for room creation, joining, ready state, rounds, leaving, rematch, and host transfer.
- [ ] Test 2-player and high-player-count matches.
- [ ] Test two separate devices and networks against the deployed preview.
- [ ] Review desktop/mobile layout, command clarity, color contrast, and accessibility.
- [ ] Conduct balance playtests across all four frames.
- [ ] Update README, version metadata, and release notes only when the build is genuinely ready.

## Scope guardrails

- Do not remove existing v0.5 commands or multiplayer behaviors without an explicit design decision.
- Do not merge v0.6 into `main` just because the planning docs are complete.
- Do not treat concept-art approval as gameplay implementation.
- Prefer small, reviewable commits with tests for each mechanic.
