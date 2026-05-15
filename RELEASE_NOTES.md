# Release Notes — Synaptic Mesh v0.22.5

## Summary

`v0.22.5` adds an **observed usefulness/noise scorecard** over v0.21 positive utility pass gate outputs. It measures whether `PASS_TO_HUMAN_REVIEW` is useful when mixed with noisy, failing, malformed, forbidden, and borderline cases.

## Evidence

- `trueUsefulPasses: 3`
- `falsePasses: 0`
- `usefulRejects: 0`
- `missedUsefulPasses: 0`
- `noisyRejects: 6`
- `noiseRejected: 6`
- `falseValueWarnings: 0`
- `passPrecision: 1`
- `passUsefulness: 1`
- `reviewBurdenEstimate: low`
- `recommendation: advance`
- `policyDecision: null`
- `authorization: false`
- `enforcement: false`
- `toolExecution: false`
- `agentConsumedOutput: false`
- `externalEffects: false`
- `rawPersisted: false`
- `rawOutput: false`
- negative controls for malformed bounds, forbidden aliases/capabilities, and forbidden authority-classification tokens
- source failure default reject plus explicitly-thresholded allowed case
- recommendation boundary proving advance/hold/degrade is not authority

## Boundary

This is local/manual/passive/read-only/one-shot, human-readable-only, scorecard-only, and non-authoritative. It is not a policy allow/block/approve gate, not runtime authority, not authorization, and not enforcement.

## Next

The next gate should keep measuring usefulness while improving reviewer ergonomics or evidence quality, still without authorization, enforcement, agent-consumed policy decisions, tool execution, network/resource fetch, external effects, daemon behavior, or raw persistence.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
