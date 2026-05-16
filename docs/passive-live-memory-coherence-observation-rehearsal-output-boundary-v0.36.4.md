# Passive Live Memory/Coherence Observation Rehearsal — Output Boundary v0.36.4

The v0.36 output boundary requires:

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

Observation items must also preserve `promoteToMemory: false`, `agentConsumedOutput: false`, raw-not-persisted, recommendation-not-authority, and null policy decision.

Output-boundary validation also rejects persisted `reportMarkdown` authority/raw-source token poisoning (for example approval, raw persistence, source text, memory write, or runtime authority token payloads).
