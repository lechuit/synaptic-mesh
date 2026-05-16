# Passive Live Memory/Coherence Stale/Contradiction Invalidation Window — Output Boundary v0.39.4

The v0.39 output boundary requires:

- human-readable report only
- `redactedBeforePersist: true`
- `rawPersisted: false`
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `noRuntimeAuthority: true`
- `noMemoryWrites: true`
- `noRuntimeIntegration: true`
- `policyDecision: null`

Candidates and judgements must preserve `promoteToMemory: false`, `agentConsumedOutput: false`, raw-not-persisted, recommendation-not-authority, and null policy decision. Stale signals must invalidate; contradictions must be labeled as caution for human review.
