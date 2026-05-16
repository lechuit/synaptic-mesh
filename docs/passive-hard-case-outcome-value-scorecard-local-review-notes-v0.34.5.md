# Local Review Notes v0.34.5

Two independent local reviews were completed before PR. These are local reviews, not GitHub UI reviews. Review focus: whether v0.34 measures receiver-side value of v0.33 hard-case context packages (useful vs noise vs needs more evidence) without converting outcome labels into authority, memory promotion, runtime instructions, or agent-consumed policy decisions.

## Initial Review B2 — BLOCK, fixed

The adversarial review found that `validateHardCaseArtifact()` did not reject unknown fields inside the pinned upstream v0.33 hard-case artifact. A mutated in-memory artifact could keep the expected pinned path and sha256 string while adding smuggled context to:

- `hardCaseArtifact.extraSmuggledContext`
- `hardCaseArtifact.protocol.extraSmuggledProtocol`
- `hardCaseArtifact.hardCases[0].extraSmuggledItem`

Observed before the fix: `PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE`, `ADVANCE_OBSERVATION_ONLY`, and `validationIssues: []`.

Fix applied: v0.34 now enforces explicit allowlists for upstream v0.33 hard-case artifact top-level keys, protocol keys, metrics keys, and hard-case item keys. Negative controls were added for unknown artifact top-level, protocol, metrics, and hard-case item fields.

## Final Review B — BLOCK, fixed

The final adversarial review found a second spoof gap: v0.34 rejected unknown hard-case item fields but did not pin expected values for allowed semantic hard-case fields. A mutated upstream item such as `hardCaseArtifact.hardCases[0].activeRulePreferred = false` could still return complete/advance with no validation issues. The same class applied to allowed fields such as `hardCaseType`, `sourceAssemblyItemId`, `sourceConflictId`, `humanTreatment`, and `outcome`.

Fix applied: v0.34 now pins expected per-hard-case semantic fields for all five upstream v0.33 hard cases, including source assembly item, source conflict id, hard-case type, competing context type, human treatment, outcome, source-bound flags, and per-case boolean signals. Negative controls were added for semantic item spoofing.

## Final2 Review A — APPROVE

The independent review approved the staged diff after the first two blocker fixes.

Validated:

- Unknown upstream v0.33 artifact fields are rejected at top-level, protocol, metrics, and hard-case item levels.
- Allowed semantic hard-case fields are pinned/rejected when mutated, including `activeRulePreferred`, `hardCaseType`, `sourceAssemblyItemId`, `sourceConflictId`, `humanTreatment`, and `outcome`.
- Pinned v0.33.5 artifact path/digest/status/metrics verified, including sha256 `6c291b1800a9fdbf21a2631a8dbfd84f852bc77a612d3a1b33972a9cd78c9dc6`, `PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE`, expected five hard cases, and zero boundary violations.
- Receiver outcome validation, metrics, negative controls, output boundary, docs, manifest paths, and release-check integration are coherent.
- v0.34.5 reviewer evidence is complete with `PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE`, `outcomeCount=5`, `useful=3`, `noise=1`, `evidenceGap=1`, `boundaryViolationCount=0`, `policyDecision=null`.
- `/tmp/v034-release-check-fixed3.log` shows `release:check --target v0.34.5` passing.

## Final2 Review B — BLOCK, fixed

The final adversarial review found a remaining spoof path: `hardCaseArtifact.reportMarkdown` is an allowed upstream artifact field but was excluded from recursive token/boundary scanning and not semantically pinned. Poisoning only the report markdown while keeping canonical caller-supplied path/digest returned complete/advance with no validation issues. The payload did not leak, but the mutated upstream artifact was accepted.

Fix applied: v0.34 now pins the upstream v0.33 `reportMarkdown` by sha256 (`ae729bc3f2a6ba6d14c8b0259c5eb94d3635080b48ce85172b2b0fd9453a3c3f`) and rejects report markdown mutation with `hardCaseArtifact.reportMarkdown_digest_not_expected`. A negative control was added for report-markdown poisoning.

## Final3 Review A — APPROVE

The final independent review approved after all three blocker fixes. It verified:

- Correct branch: `release/v0.34-passive-hard-case-outcome-value-scorecard`.
- Pinned v0.33.5 upstream artifact path/digest/status/metrics, including sha256 `6c291b1800a9fdbf21a2631a8dbfd84f852bc77a612d3a1b33972a9cd78c9dc6`, `PASSIVE_CONTEXT_ASSEMBLY_HARD_CASES_COMPLETE`, five expected hard cases, pinned metrics, and zero boundary violations.
- Report markdown digest pin `ae729bc3f2a6ba6d14c8b0259c5eb94d3635080b48ce85172b2b0fd9453a3c3f`; poisoning now degrades with `reportMarkdown_digest_not_expected`.
- Unknown upstream fields are rejected at artifact top-level, protocol, metrics, and hard-case item levels.
- Allowed semantic hard-case mutations are rejected, including `activeRulePreferred`, `hardCaseType`, `sourceAssemblyItemId`, `humanTreatment`, and `outcome`.
- Receiver outcome validation, metrics, output boundary, docs, manifest, and release-check integration are coherent.
- Negative controls include 49 rejected cases and no authority-token payload leak.
- Reviewer evidence is complete with `PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE`, `outcomeCount=5`, useful/noise/evidenceGap = `3/1/1`, `boundaryViolationCount=0`, and `policyDecision=null`.
- `/tmp/v034-release-check-fixed4.log` shows release check passing.

No blockers found.

## Final3 Review B — APPROVE

The final adversarial review approved after all three blocker fixes. It verified:

- Upstream v0.33 unknown fields in artifact/protocol/metrics/items degrade.
- Semantic hard-case item mutations degrade.
- ReportMarkdown poisoning degrades via pinned digest.
- Wrong artifact/schema/release/status/metrics/path/digest are covered.
- Mutated top/protocol boundary flags degrade.
- Invalid/duplicate/missing receiver outcomes degrade.
- Non-null `policyDecision`, `promoteToMemory`, `agentConsumedOutput`, runtime/tool/network/memory/config/raw/external flags degrade.
- Authority-token rationale leakage degrades and the payload is redacted from output.
- `/tmp/v034-release-check-fixed4.log` shows `status: pass`.

No blocker found.

## Local gates

- `npm run test:passive-hard-case-outcome-value-scorecard` — PASS
- `npm run verify:manifest` — PASS
- `npm run release:check -- --target v0.34.5` — PASS

## Verdict

APPROVE for PR/release as a local/manual/passive/read-only/human-readable/non-authoritative hard-case receiver outcome value scorecard. No enforcement, authorization, approval/block/allow semantics, tool/network/resource fetch, memory/config writes, raw persistence/output, runtime integration, durable memory promotion, external effects, daemon/watchers, autonomous production behavior, or agent-consumed machine-readable policy decisions.
