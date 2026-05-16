# Passive Live Memory/Coherence Usefulness Window — Output Boundary v0.38.4

The v0.38 output boundary requires:

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

Handoff items must also preserve `promoteToMemory: false`, `agentConsumedOutput: false`, raw-not-persisted, recommendation-not-authority, and null policy decision.
