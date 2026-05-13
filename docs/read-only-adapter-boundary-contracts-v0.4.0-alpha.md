# MemoryContract v0.4.x — read-only integration design / boundary contracts

Timestamp: 2026-05-13 08:24 America/Santiago
Status: design phase opened by Señor Gabriel

## Decision

Open a new phase: **v0.4.x — read-only integration design**, still with **no adapter implementation**.

This phase is not another round of advisory hardening by inertia. The goal is to design the integration surface and boundary contracts before any real adapter exists.

## Non-goals

- No real adapter implementation.
- No runtime integration.
- No config changes.
- No memory writes / permanent promotion.
- No canary, enforcement, dashboard, production, publication, external messaging, delete, or paused-project effects.
- No further “advisory hardening” unless a specific real failure appears.

## Design target

Define how a future read-only integration *would* observe and exchange evidence without gaining authority to act.

The design must answer:

1. **Input boundary** — what can be read?
   - local files/artifacts only;
   - explicit source refs/digests where available;
   - no implicit trust in prose, summaries, metadata, or stale receipts.

2. **Output boundary** — what can be emitted?
   - design notes;
   - proposed contracts;
   - read-only evaluation packets;
   - human-readable evidence labels such as would-load, would-not-load, source-needed, or ask-human; these labels are advisory review evidence only and must not be consumed as block/allow/action decisions;
   - no action execution.

3. **Authority boundary** — what does the packet *not* authorize?
   - no adapter behavior;
   - no effect authority;
   - no memory/config/external/publish/delete/canary/enforcement authority;
   - source resolution repairs evidence only, never permission.

4. **Freshness / supersession boundary**
   - current exact digest wins only if still current;
   - stale exact receipts are not reused as authority;
   - damaged transport requires independent trusted source fetch or abstain;
   - old next_actions are marked stale/not-current unless explicitly current; this is descriptive evidence, not blocking authority.

5. **Receiver contract**
   - receiver treats compact rows/receipts as candidates, not commands;
   - receiver review path: mark unsafe evidence as rejected-for-review → mark repairable source-needed → demote stale/low-evidence → keep any safe result as local shadow evidence only; no adapter may fetch, block, allow, authorize, or execute;
   - G/V or scoring fields prioritize only among already-safe candidates.

## First local artifact to design

`read_only_integration_contract_v0.4.md` should specify:

- read-only integration surfaces;
- minimal packet schema;
- receiver decision states;
- forbidden effects;
- failure/abstention classes;
- examples of review-only local-shadow outputs vs forbidden adapter-like behavior;
- validation checklist for the future adapter design review.

## Exit criteria for v0.4.x design phase

The phase can be considered ready for a later implementation discussion only when:

- boundary contracts are explicit enough that a future adapter cannot infer effect authority from source resolution;
- at least one independent local review/checklist says the design remains read-only;
- failure classes include stale, damaged transport, missing source, fake authority, sensitive effect, and paused-project/config/memory escalation;
- next step is framed as “implementation proposal review,” not implementation.

## Current next action

Draft the read-only integration contract and review it against recent receiver/rubric evidence. Keep it paper/local-only.
