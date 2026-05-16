# Local Review Notes v0.33.5

Two final independent local reviews were completed before PR. These are local reviews, not GitHub UI reviews.

## Initial review findings and fixes

### Initial Review B — BLOCK, fixed

The adversarial review found that `validateAssemblyArtifact()` did not enforce critical upstream v0.32 top-level/protocol boundary booleans. Mutating supplied `contextAssemblyArtifact` fields while keeping pinned path/digest metadata could still complete, including examples such as:

- `contextAssemblyArtifact.protocol.localOnly = false`
- `contextAssemblyArtifact.protocol.readOnly = false`
- `contextAssemblyArtifact.protocol.noMemoryWrites = false`
- `contextAssemblyArtifact.protocol.noRuntimeIntegration = false`
- `contextAssemblyArtifact.localOnly = false`
- `contextAssemblyArtifact.readOnly = false`
- `contextAssemblyArtifact.noMemoryWrites = false`
- `contextAssemblyArtifact.noRuntimeIntegration = false`
- `contextAssemblyArtifact.humanReviewOnly = false`

Fix applied: v0.33 now validates expected v0.32 top-level and protocol boundary fields, including disabled-by-default/operator-run/local/passive/read-only/explicit-artifact/human-readable/non-authoritative/no-runtime/no-memory/no-agent-consumption/raw-source boundaries. Negative controls were added for false top-level/protocol boundary flags.

### Fixed Review B — BLOCK, fixed

The follow-up adversarial review found one remaining input-boundary issue: unknown top-level input fields were not rejected. A canonical input plus `unexpectedTopLevel = "benign smuggled context"` could still complete.

Fix applied: v0.33 now rejects unknown top-level input fields via an explicit `INPUT_ALLOWED_KEYS` allowlist. Negative control `unknown-top-level-input-field` was added.

## Final Review A — APPROVE

Focus: final staged diff after both blocker fixes, implementation/tests/evidence/release check, upstream v0.32 boundary pinning, top-level input allowlist, safety boundaries, hard-case usefulness, and release-check pass.

Findings:

- Correct branch: `release/v0.33-passive-context-assembly-hard-cases`; staged diff matches v0.33.5 scope.
- Fix 1 verified: upstream v0.32 artifact top-level and protocol boundary flags are pinned/enforced. Mutating `noRuntimeAuthority` at top or protocol level degrades to `DEGRADED_PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES` with `HOLD_FOR_MORE_EVIDENCE`.
- Fix 2 verified: unknown top-level input fields now degrade/hold with `input.unknown_field:*`.
- Negative controls expanded and passing: 47 rejected controls, no authority-token payload leak.
- Safety boundaries preserved: passive/read-only/local/manual, no runtime authority, no memory promotion/writes, `policyDecision: null`, non-authoritative human-readable report only.
- Hard-case usefulness is covered: five cases, all source-bound, human-review-only, minimal-context-only.
- Release check log `/tmp/v033-release-check-final3.log` shows final `status: pass` for target `v0.33.5`.

No required fixes.

## Final Review B — APPROVE

Focus: adversarial review after both blocker fixes. Tested unexpected top-level input field, upstream top/protocol boundary flags set false, fabricated v0.32 artifact, wrong path/digest/schema/release/status/metrics/items/roles/treatments/sourceBound, authority token leakage, non-null `policyDecision`, agent-consumed output, `promoteToMemory`, and runtime/tool/network/memory/config/raw/external-effect flags.

Findings:

- Release gate `/tmp/v033-release-check-final3.log` reports `status: pass` for target `v0.33.5`.
- Adversarial probes passed for unexpected top-level input fields.
- Pinned path/digest/schema/release/status checks hold.
- Upstream top/protocol boundary flags set false degrade/hold.
- Wrong metrics/items/roles/treatments/sourceBound degrade/hold.
- Authority-token leakage is redacted and not re-emitted.
- Non-null `policyDecision`, `agentConsumedOutput`, `promoteToMemory`, and runtime/tool/network/memory/config/raw/external-effect flags degrade/hold.

No blocker found.

## Local gates

- `npm run test:passive-context-assembly-hard-cases` — PASS
- `npm run verify:manifest` — PASS
- `npm run release:check -- --target v0.33.5` — PASS

## Verdict

APPROVE for PR/release as a local/manual/passive/read-only/human-readable/non-authoritative hard-case context assembly scorecard. No enforcement, authorization, approval/block/allow semantics, tool/network/resource fetch, memory/config writes, raw persistence/output, runtime integration, durable memory promotion, external effects, daemon/watchers, autonomous runtime, or agent-consumed machine-readable policy decisions.
