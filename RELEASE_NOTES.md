# Release Notes — Synaptic Mesh v0.23.5

## Summary

`v0.23.5` adds a **controlled operator review queue** over the v0.22 observed usefulness/noise scorecard. It converts only true useful `PASS_TO_HUMAN_REVIEW` observations into local human-review prioritization items.

## Evidence

- `queueStatus: READY_FOR_OPERATOR_REVIEW`
- `queueItems: 3`
- `reviewBurden: low`
- `estimatedMinutes: 21`
- `falsePasses: 0`
- `authorityViolations: 0`
- source recommendation `advance` is context only, not authority
- `policyDecision: null`
- `authorization: false`
- `enforcement: false`
- `toolExecution: false`
- `agentConsumedOutput: false`
- `externalEffects: false`
- `rawPersisted: false`
- `rawOutput: false`
- negative controls for malformed scorecards, non-null policy decisions, false passes, authority violations, recommendation-as-authority, forbidden capability flags, raw persisted/output, and external effects
- abstain behavior for `hold` or `degrade` scorecard recommendations

## Boundary

This is local/manual/passive/read-only/one-shot, redacted-evidence-only, human-readable-only, and non-authoritative. It is not a decision queue, not an approval queue, not a policy allow/block/approve gate, not runtime authority, not authorization, and not enforcement.

## Next

The next gate should keep the queue local and human-readable while improving reviewer ergonomics or evidence quality, still without authorization, enforcement, agent-consumed policy decisions, tool execution, network/resource fetch, external effects, daemon behavior, or raw persistence.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
