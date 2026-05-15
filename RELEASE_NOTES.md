# Release Notes — Synaptic Mesh v0.24.5

## Summary

`v0.24.5` adds **operator review outcome capture** over the v0.23 controlled operator review queue. It captures explicit manual operator value feedback as local evidence while remaining non-authoritative and human-readable only.

## Evidence

- `captureStatus: OUTCOME_CAPTURE_COMPLETE`
- `capturedOutcomes: 3`
- `redactionBeforePersist: true`
- `valueFeedbackOnly: true`
- `falseAuthorityLeakage: 0`
- `policyDecision: null`
- `authorization: false`
- `enforcement: false`
- `toolExecution: false`
- `agentConsumedOutput: false`
- `externalEffects: false`
- `rawPersisted: false`
- `rawOutput: false`
- negative controls for malformed queue/outcomes, unsafe labels, authority tokens including camelCase aliases, raw persistence/output, external effects, invalid bounds, mismatched IDs, missing outcomes, and false authority leakage

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to 3 items, redacted-evidence-only, redaction-before-persist, human-readable-only, non-authoritative, and value-feedback-only. It is not a policy artifact, not runtime authority, not authorization, and not enforcement.

## Next

The next gate should keep feedback local and human-readable while improving reviewer ergonomics or evidence quality, still without authorization, enforcement, agent-consumed policy decisions, tool execution, network/resource fetch, external effects, daemon behavior, or raw persistence.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
