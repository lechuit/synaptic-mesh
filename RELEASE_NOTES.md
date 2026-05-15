# Release Notes — Synaptic Mesh v0.21.6

## Summary

`v0.21.6` preserves the v0.21.5 positive gate and hotfixes deterministic evidence replay. `v0.21.5` introduced the **positive utility pass-to-human-review** gate. It demonstrates what happens when bounded explicit multisource shadow-read evidence should pass: valid, clean, useful observations are classified as `PASS_TO_HUMAN_REVIEW` with `observationAccepted`, `includedInReport`, and `readyForHumanReview` true.

## Evidence

- `policyDecision: null`
- `authorization: false`
- `enforcement: false`
- `toolExecution: false`
- `agentConsumedOutput: false`
- `externalEffects: false`
- `rawPersisted: false`
- `rawOutput: false`
- `unexpectedPermits: 0`
- positive pass cases with v0.20-style bounded explicit multisource shadow-read evidence
- explicit local sources, valid source/record bounds, sufficient redacted records, clean redaction, and generated human-readable report
- accepted isolated source failure only when the threshold is explicitly set for that run
- negative controls for no records, invalid bounds, excessive source failures, semantic decision/private-token leaks, raw output/persistence, policy decision, agent-consumed output, and forbidden capabilities
- two independent local review notes included; not GitHub UI reviews and not deployment approvals

## Boundary

This is non-authoritative classification-only readiness for human review. It is not a policy allow/block/approve gate, not runtime authority, and not authorization or enforcement.

## Next

The next gate should keep the positive path useful while adding reviewer ergonomics or additional redacted evidence quality checks, still without authorization, enforcement, agent-consumed policy decisions, tool execution, network/resource fetch, external effects, daemon behavior, or raw persistence.

## v0.21.5 — positive utility pass-to-human-review

`v0.21.5` introduces the **positive utility pass-to-human-review** gate. It demonstrates what happens when bounded explicit multisource shadow-read evidence should pass: valid, clean, useful observations are classified as `PASS_TO_HUMAN_REVIEW` with `observationAccepted`, `includedInReport`, and `readyForHumanReview` true.

Evidence boundaries remain: `policyDecision: null`, `authorization: false`, `enforcement: false`, `toolExecution: false`, `agentConsumedOutput: false`, `externalEffects: false`, `rawPersisted: false`, `rawOutput: false`, and `unexpectedPermits: 0`.

Positive pass cases use v0.20-style bounded explicit multisource shadow-read evidence with explicit local sources, valid source/record bounds, sufficient redacted records, clean redaction, and generated human-readable reports. Negative controls reject no records, invalid bounds, excessive source failures, semantic decision/private-token leaks, raw output/persistence, policy decisions, agent-consumed output, and forbidden capabilities.

Two independent local review notes are included; these are not GitHub UI reviews and not deployment approvals.


Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
