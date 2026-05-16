# Passive Live Memory/Coherence Repeatability Scorecard — Output Boundary v0.37.4

The v0.37 output boundary requires:

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

Repeatability items must also preserve `promoteToMemory: false`, `agentConsumedOutput: false`, raw-not-persisted, recommendation-not-authority, and null policy decision. Persisted `reportMarkdown` authority/raw-source token poisoning is rejected.
