# Robo Breakers v0.6 — Gameplay Specification

This is the working specification based on the current v0.6 planning decisions. Items marked **Confirm before implementation** are intentionally not filled in with guesses.

## 1. Combat frames

The design calls for four distinct combat frames with different statistics and tactical identities.

- **Scout** — visual concept approved.
- **Striker** — visual concept approved.
- **Juggernaut** — visual concept approved.
- **Vanguard** — visual concept still in progress.

### Required frame data

Before implementation, define a single authoritative frame-data table containing each frame's:
- Health / durability.
- Movement capability.
- Attack strength and/or range.
- Shield or defensive capability.
- Energy / Overcharge interactions.
- Any frame-specific passive or limitation.

**Confirm before implementation:** exact numeric stats and which properties differ by frame. The current planning summary confirms that frame statistics were discussed/approved but does not preserve their exact values. Do not infer numbers from the names or illustrations.

### Selection and color schemes

- Players should be able to select a combat frame before the match begins.
- Eight color schemes per frame are planned.
- Selection and chosen colors must be stored in the authoritative player/match state and reflected consistently for every client.
- Color choice is cosmetic unless the design explicitly approves a gameplay effect.
- Keep the rendering layer independent from frame rules so final concept art can replace interim silhouettes without changing combat logic.

**Confirm before implementation:** whether colors are global palettes or eight palettes unique to each frame, whether duplicates are allowed in a lobby, and when a player may change frame/color.

## 2. Energy, Overcharge, and Overdrive

The planned system includes a **Shared Overcharge Gauge**, **Overdrive Mode**, and **System Cooldown**.

- The gauge is a gameplay resource, not merely a visual meter.
- Overdrive must have a clearly defined activation rule, cost, duration/effect, and end condition.
- Cooldown rules must specify which system enters cooldown, how long it lasts, and whether cooldown is measured in rounds or another unit.
- The server must validate resource availability and resolve simultaneous activations deterministically.

**Confirm before implementation:** gauge ownership (per robot, team, or match-wide), gain/spend rules, Overdrive effects by frame, activation timing, duration, cooldown length, and what happens when multiple players attempt an activation at once.

## 3. Pilot Pressure

Pilot Pressure is an approved planned combat system.

The implementation spec must define:
- What events add or remove pressure.
- Whether pressure is tracked per pilot/robot or globally.
- Thresholds and their gameplay consequences.
- Whether pressure decays and when.
- UI feedback that explains current pressure and its consequences.

**Confirm before implementation:** exact triggers, thresholds, decay, and effects. Do not introduce hidden penalties without clear UI feedback.

## 4. Close-quarters combat (CQC)

CQC includes a dedicated **CQC Phase** and **Power Struggle**.

The rules must explicitly define:
- What causes two robots to enter CQC.
- Which phase begins and what commands remain available.
- How a Power Struggle is initiated and resolved.
- Whether frame stats, energy, Overdrive, pressure, rear attacks, or dodge affect the result.
- How CQC ends and how the arena position is updated.

**Confirm before implementation:** trigger distance/conditions, resolution formula, ties, escape rules, and interactions with shields and other actions.

## 5. Rear attacks and knockback

Rear attacks and knockback are planned rules.

The spec must define:
- How facing/direction is represented.
- What counts as attacking from behind.
- Whether rear attacks receive bonus damage or another effect.
- Knockback distance, collision behavior, arena-edge behavior, and interaction with CQC.
- The order in which movement, facing, attacks, knockback, and damage resolve in a simultaneous round.

**Confirm before implementation:** exact bonus/effect and knockback rules. All outcomes must be deterministic on the authoritative game engine.

## 6. Player-controlled dodging

Dodging is planned as a player-controlled action.

Before coding, define:
- How a dodge is selected and aimed.
- Whether it consumes a turn, energy, or a cooldown.
- Which attacks/effects it can evade.
- How simultaneous movement and dodge positions are resolved.
- Whether dodge differs by frame or during Overdrive/CQC.

**Confirm before implementation:** dodge timing, distance, cost, cooldown, invulnerability/evasion window, and collision rules. Dodge should not be added as a free extra action unless that is explicitly approved.

## 7. Dynamic arena sizing

Dynamic arena sizing is approved as a planned feature.

The design must specify:
- When and why the arena changes size.
- Minimum and maximum dimensions.
- Whether resizing happens between rounds or during resolution.
- How robots in cells that become unavailable are handled.
- Whether hazards or boundaries change with the arena.
- How all clients receive the updated arena state.

**Confirm before implementation:** resize triggers, limits, schedule, and edge-case handling. The current game uses a 5×5 arena; preserve that behavior as the baseline until the new rule is implemented and tested.

## 8. Movement and collision handling

Movement/collision behavior is still under discussion and must be settled before dependent systems are implemented.

Decisions required:
- Whether two robots can attempt to occupy the same cell.
- Whether swaps and crossing paths are legal.
- What happens when several robots target the same cell.
- How blocked movement interacts with knockback, dodge, and arena resizing.
- Whether movement resolves before attacks, and how ties are broken.
- How invalid moves are communicated to the player.

## 9. Resolution and multiplayer invariants

- Players choose commands secretly; other players must not see an opponent's locked command before the reveal/resolution phase.
- The server is authoritative for validation, resource spending, positions, damage, cooldowns, and final outcomes.
- Simultaneous choices must be resolved using one documented deterministic order.
- A client must not be able to replace a locked command or submit duplicate actions to gain an advantage.
- Every client must converge on the same state after each round.
- Disconnect/reconnect, leaving, rematch, and host transfer must not corrupt a round.

## 10. Rule-freeze checklist

Do not start implementing a mechanic until its dependent decisions are recorded:

- [ ] Exact numeric statistics for all four frames.
- [ ] Frame selection timing and duplicate-frame policy.
- [ ] Eight-palette behavior and palette uniqueness policy.
- [ ] Shared Overcharge Gauge ownership, gain, and spend rules.
- [ ] Overdrive activation, effects, duration, and termination.
- [ ] System cooldown triggers and timing.
- [ ] Pilot Pressure triggers, thresholds, decay, and effects.
- [ ] CQC trigger, phases, Power Struggle formula, tie and escape rules.
- [ ] Facing and rear-attack rules.
- [ ] Knockback distance, collisions, and edge behavior.
- [ ] Dodge timing, cost, distance, and evasion rules.
- [ ] Arena resize triggers, dimensions, and displaced-robot handling.
- [ ] Movement, collision, swap, and contested-cell rules.
- [ ] Canonical order of operations for simultaneous resolution.
