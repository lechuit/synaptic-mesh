# Local Review Notes — v0.40.5 Passive Live Memory/Coherence Invalidation Repeatability Scorecard

Two independent local reviews approved the staged v0.40.5 package after targeted gates and release checks.

## Review A — APPROVE

Evidence checked:

- `npm run test:passive-live-memory-coherence-invalidation-repeatability-scorecard` passed.
- `npm run verify:manifest` passed.
- `npm run release:check` passed.
- Reviewer package status is `PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_REPEATABILITY_SCORECARD_COMPLETE`.
- Metrics matched expected values: three runs, five candidate signals, fifteen judgements, three stable carry-forward decisions, one stable stale invalidation, one stable contradiction caution.
- Negative controls rejected 44 cases and drift held for more evidence.
- Boundary invariants held: `policyDecision: null`, `agentConsumedOutput: false`, `promoteToMemory: false`, `rawPersisted: false`, `noMemoryWrites: true`, `noRuntimeIntegration: true`, `recommendationIsAuthority: false`.

Required fixes: none.

## Review B — APPROVE

Evidence checked:

- `npm run test:passive-live-memory-coherence-invalidation-repeatability-scorecard` passed.
- `npm run verify:manifest` passed.
- `npm run release:check` passed.
- Path spoofing/traversal, digest pinning, unknown-field smuggling, stale/contradiction drift, and boundary smuggling are covered by negative controls.
- Output artifact preserves non-authoritative boundaries: `policyDecision: null`, `agentConsumedOutput: false`, `recommendationIsAuthority: false`, `promoteToMemory: false`, `rawPersisted: false`, `boundaryViolationCount: 0`.
- Manifest/release-check integration includes the new v0.40.5 suite and required paths.

Required fixes: none.

Non-blocking hardening note: the CLI accepts an optional input path and rejects unpinned paths after read/parse rather than before read. Current behavior remains local/read-only/no-raw-persist and gates passed, but a future layer should pre-check the normalized CLI path before reading to tighten the explicit-artifacts-only boundary.
