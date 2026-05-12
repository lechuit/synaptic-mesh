# Release ladder to v0.2.0-alpha

This ladder records the intended boundary between the late v0.1.x hardening line and the first alpha canary.

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
