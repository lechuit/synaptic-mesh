# Real-redacted adversarial coverage gate

Status: offline/local-shadow evidence only. This is not a live observer, runtime integration, adapter, tool authorization path, approval path, blocker/allower, or enforcement mechanism.

## Purpose

The v0.1.10 real-redacted handoff pack proved that the offline replay chain can accept a small set of manually reviewed real-redacted handoffs. This gate adds a harsher follow-on coverage pack: real-redacted/control-message metadata only, with adversarial boundary classes that should never become operational effects.

The gate validates that redacted cases can exercise non-happy-path classifier routes while remaining record-only:

- `request_full_receipt` for incomplete/deep-comparison handoff coverage.
- `request_policy_refresh` for stale release/policy target evidence.
- `ask_human` for human-authorization boundary overclaim, hidden runtime promotion, and external-publication promotion.
- `block` for an explicitly forbidden destructive-effect class.

## Inputs

Fixture: `implementation/synaptic-mesh-shadow-v0/fixtures/real-redacted-adversarial-coverage.json`

The pack contains exactly six manually reviewed cases. Each case persists only:

- redacted metadata labels;
- a `ManualObservationBundle`;
- a `RedactionReviewRecord`;
- expected parser evidence;
- expected classifier decision;
- expected `DecisionTrace`;
- expected record-only `LiveShadowObservation` / `LiveShadowObservationResult`;
- expected scorecard row.

It must not persist raw handoff text, private paths, secrets, tool outputs, memory/config text, approval text, live traffic, runtime logs, or unnecessary private identifiers.

## Gate assertions

The test `implementation/synaptic-mesh-shadow-v0/tests/real-redacted-adversarial-coverage.mjs` checks:

- exactly six adversarial real-redacted/control-message metadata cases;
- route coverage includes `block`, `ask_human`, `request_full_receipt`, and `request_policy_refresh`;
- every schema validates;
- redacted snapshot hashes bind only the redacted summary;
- generated classifier decisions match expected decisions;
- `DecisionTrace`, observation, result, and scorecard artifacts are hash-bound and internally consistent;
- all results remain `record_only`;
- zero false permits, false compacts, boundary loss, forbidden effects, capabilities, memory/config writes, publication, approval path entry, blocking, allowing, authorization, or enforcement;
- negative controls fail if raw content, live observation, runtime use, or approval-path capability is enabled.

## Evidence

Evidence output: `implementation/synaptic-mesh-shadow-v0/evidence/real-redacted-adversarial-coverage.out.json`

Expected summary:

- adversarial real-redacted/control cases: 6;
- route counts: `request_full_receipt: 1`, `request_policy_refresh: 1`, `ask_human: 3`, `block: 1`;
- validation errors: 0;
- false permits: 0;
- false compacts: 0;
- boundary loss: 0;
- forbidden effects detected: 0;
- capability true count: 0.

## Boundary

This gate is intentionally still pre-live. It does not read live traffic/logs/sessions, implement a watcher or daemon, integrate with runtime hosts, execute tools, write memory/config, publish externally, enter approval paths, block/allow, authorize, or enforce anything.
