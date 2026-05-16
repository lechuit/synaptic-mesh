# Passive Hard-Case Outcome Repeatability Scorecard — Output Boundary v0.35.4

The v0.35 output boundary requires:

- human-readable report only
- `recommendationIsAuthority: false`
- `agentConsumedOutput: false`
- `notRuntimeInstruction: true`
- `noRuntimeAuthority: true`
- `noMemoryWrites: true`
- `noRuntimeIntegration: true`
- `rawPersisted: false`
- `policyDecision: null`

Repeatability items must also preserve `promoteToMemory: false`, `agentConsumedOutput: false`, recommendation-not-authority, and null policy decision. Authority-token payloads are detected and redacted.
