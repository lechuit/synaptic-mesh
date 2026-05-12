# Release ladder to v0.3.0-alpha

This ladder records the intended boundary between the late v0.1.x hardening line, the first passive canary releases, and the first advisory-only human-readable report alpha.

## v0.1.18 — decision-counterfactual memory retrieval checklist

Local advisory checklist for retrieved-memory fragments before they affect a decision.

## v0.1.19 — checklist robustness

Reproducibility, failure catalog, and reviewer guide for the decision-counterfactual checklist.

## v0.1.20 — executable redaction/retention gates

Before any live-shaped work, prove that sensitive/raw material is not persisted and retention/deletion scheduler claims stay false.

## v0.1.21 — live input/source boundary contracts

Define what a future live-shaped source tuple must include and what remains forbidden: live reads, raw persistence, runtime, daemons/watchers, memory/config writes, publication automation, approval, blocking/allowing, authorization, deletion, retention scheduling, and enforcement.

## v0.1.22 — passive live-shadow simulator

Simulate the shape of passive `LiveShadowObservation` and `LiveShadowObservationResult` records from committed offline `DecisionTrace` evidence only.

Boundary:

- offline simulator only;
- no live traffic/log/session reads;
- no live observer implementation;
- no daemon/watcher/runtime/adapter integration;
- record-only local evidence;
- no effects.

Executable gate: `test:live-shadow-synthetic-replay`.

## v0.2.0-alpha — first passive live-shadow canary

First canary contract for a manual, local, opt-in, passive live-shadow run over already-redacted local canary packets.

Boundary:

- manual invocation only;
- local only;
- explicit opt-in required;
- already-redacted local canary packets only;
- record-only local evidence output;
- no authorization, blocking, allowing, or enforcement;
- no daemon/watcher/runtime/adapter integration;
- no tool execution, memory/config writes, external publication, approval path, deletion, or retention scheduler.

Executable gate: `test:passive-live-shadow-canary`.

This alpha is still not production-ready, not runtime-integrated, not a live daemon, and not a safety certification.

## v0.2.1 — passive canary reproducibility

Require repeated runs over the same passive canary packet to preserve normalized output, reason set, scorecard, and boundary verdict.

Boundary remains manual, local, opt-in, already-redacted, record-only, and no-effects. A pass is evidence of local passive boundary preservation, not runtime authorization.

Executable gate: `test:passive-live-shadow-canary-reproducibility`.

## v0.2.2 — passive canary operator runbook

Human operator guidance for preparing and reviewing passive canary packets.

Boundary remains documentation-only/manual/local/opt-in/passive/record-only/no-effects. It explains canary packet shape, opt-in verification, writable evidence artifacts, pass/non-pass meaning, and abort conditions without adding runtime behavior.

Document: `docs/passive-live-shadow-canary-runbook.md`.

## v0.2.3 — canary source-boundary stress

Stress malformed source tuple handling, stale digest evidence, missing `sourceMtime`, wrong source lane, and output containment hardening for passive canary packets.

Boundary:

- committed local fixtures only;
- already-redacted local canary packet metadata only;
- record-only local evidence output;
- no live traffic/log/session reads;
- no runtime, daemon, watcher, adapter, or tool integration;
- no memory/config writes, publication, automatic agent consumption, approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement.

Executable gate: `test:passive-live-shadow-canary-source-boundary-stress`.

## v0.2.4 — canary drift scorecard

Score repeated canary packets for route drift, trace drift, and reason-code drift.

Boundary remains local deterministic evidence only. Drift rows must not become runtime authority, automatic gating for agents, approval signals, blocking/allowing decisions, or production safety claims.

## v0.2.5 — expanded passive canary pack

Expand the passive canary pack to roughly 10–20 manual opt-in, already-redacted packets.

Boundary remains manual, local, opt-in, already-redacted, record-only, and no-effects. The pack may improve coverage, but it still does not authorize runtime behavior.

## v0.3.0-alpha — advisory-only human-readable report

First human-readable advisory report over passive canary evidence. Example report language may include:

- `would request_full_receipt`
- `would fetch_source`
- `would reject_sensitive_pressure`

The report must not be consumed automatically by agents. Advisory is not authority.

Boundary:

- human-readable report only;
- no runtime integration;
- no tools;
- no memory/config writes;
- no automatic consumption by agents;
- no approval path;
- no block/allow/authorization/enforcement.
