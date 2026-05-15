# Release Notes — Synaptic Mesh v0.25.5

## Summary

`v0.25.5` adds **operator outcome value scorecard** over explicit v0.24 captured operator outcomes. It scores whether the controlled review queue appears useful, noisy, or still evidence-poor while remaining non-authoritative and human-readable only.

## Evidence

- `scorecardStatus: VALUE_SCORECARD_COMPLETE`
- `usefulOutcomes: 2`
- `noiseOutcomes: 1`
- `needsMoreEvidence: 0`
- `abstainUncertain: 0`
- `reviewedItemCount: 3`
- `usefulRatio: 0.6667`
- `noiseRatio: 0.3333`
- `recommendation: ADVANCE_OBSERVATION_ONLY`
- `recommendationIsAuthority: false`
- `falseAuthorityLeakage: 0`
- `policyDecision: null`
- `authorization: false`
- `enforcement: false`
- `toolExecution: false`
- `agentConsumedOutput: false`
- `externalEffects: false`
- `rawPersisted: false`
- `rawOutput: false`
- negative controls for malformed capture, unsafe labels/tokens including camelCase aliases, boundary keys with true/string/object values, reportMarkdown authority tokens, raw persistence/output, external effects, invalid metrics/ratios, insufficient sample, degrade/hold cases, duplicate/missing outcome IDs, and false recommendation authority leakage

## Boundary

This is local/manual/passive/read-only/one-shot, bounded to 3 captured outcomes, redacted-evidence-only, human-readable-only, non-authoritative, and value-scorecard-only. It is not a policy artifact, not runtime authority, not authorization, and not enforcement.

## Next

The next gate should keep scoring local and human-readable while improving evidence quality or reviewer ergonomics, still without authorization, enforcement, agent-consumed policy decisions, tool execution, network/resource fetch, external effects, daemon behavior, or raw persistence.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
