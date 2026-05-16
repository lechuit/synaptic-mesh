# Synaptic Mesh v0.35.5

This is the public review release `v0.35.5`. Current v0.35.5 status is narrower than live runtime and crosses the next safe barrier after v0.34: **passive hard-case outcome repeatability scorecard**.

The v0.35 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.34.5 hard-case outcome value artifact (path and sha256 digest pinned), human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.35.5 evidence: `repeatabilityStatus: PASSIVE_HARD_CASE_OUTCOME_REPEATABILITY_SCORECARD_COMPLETE`, `repeatabilityRunCount: 3`, `hardCaseCount: 5`, `totalOutcomeJudgementCount: 15`, `stableHardCaseCount: 5`, `unstableHardCaseCount: 0`, `stableUsefulHardCaseCount: 3`, `stableNoiseHardCaseCount: 1`, `stableEvidenceGapHardCaseCount: 1`, `labelAgreementRatio: 1`, `stableHardCaseRatio: 1`, `sourceBoundRepeatabilityRatio: 1`, `humanReviewOnlyRepeatabilityRatio: 1`, `noPromotionWithoutHumanRepeatabilityRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, `policyDecision: null`, and `human-readable report only`.

The scorecard measures whether v0.34 usefulness/noise/evidence-gap labels remain stable across baseline, paraphrased-rationale, and order-invariant repeated receiver passes. This is a repeatability measurement for human review only. It is not memory promotion, agent-consumed instruction, authorization, approval/block/allow, enforcement, or live runtime behavior.

## v0.35.5 phase close

Passive hard-case outcome repeatability scorecard is prepared as a local review package. It measures stability of receiver outcome labels before any live memory/coherence step is considered, while preserving no authority, no effects, no daemon/watchers, no autonomous runtime, no raw output, no memory writes, no runtime integration, no durable memory promotion, and no agent-consumed policy decisions.

## Carry-forward prior release boundaries

The v0.34 passive hard-case outcome value scorecard remains the upstream signal source: `outcomeValueStatus: PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE`, five outcomes, three useful, one noise, one evidence gap, source-bound/human-review-only/minimal-context-only, recommendation-not-authority, and `policyDecision: null`.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
