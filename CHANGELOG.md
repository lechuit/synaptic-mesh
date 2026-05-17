# Changelog

This file preserves the full release-ladder history of the project from v0.45.5 through v0.52.5. Each entry corresponds to a "ladder rung": a small, fail-closed, local-only barrier crossed during the research phase. The vocabulary here is dense on purpose — every metric was pinned as evidence at the time of release. See `GLOSSARY.md` for term definitions and `ROADMAP.md` for the forward plan.

> **Naming note**: this project was renamed from **Synaptic Mesh** to **Aletheia** in 2026-05, after v0.52.5. The release titles below are preserved verbatim because they refer to artifacts that shipped under the old name; the next release will be the first one to ship as Aletheia. See `ROADMAP.md` § "Naming decision" for the rationale.

Releases are listed newest first.

---

## Unreleased — Aletheia executable memory, dynamics, episodic continuity, and adapter demo

- Added `@aletheia/dynamics`, a deterministic sleep-cycle engine for memory decay, candidate promotion, and unresolved-conflict revisits.
- Dynamics plans transitions by default and applies them only through `MemoryStore.transitionStatus`, preserving the append-only atom model and audit history.
- Candidate promotion requires explicit source-consistent recall evidence plus evidence/authority/stability scores; `confidence` and `consensus` remain metadata, not authority.
- Added tests for fail-closed no-permission behavior, stale deprecation, promotion evidence, trusted-vs-verified decay windows, unresolved conflict handling, sealed/human-required skipping, and deterministic dry-run output.
- Added `SleepCycleRunner`, with SQLite-backed tests for deterministic dry-run reports, explicit apply mode, fail-closed no-permission reports, and logical transition timestamps.
- Extended `MemoryStore.transitionStatus` with an optional deterministic `at` timestamp so sleep-cycle audit history can be replayed from the cycle clock instead of the process clock.
- Documented the reconsolidation blocker: successor atoms need an explicit planner/gate contract before implementation can safely proceed.
- Added `ReconsolidationPlanner`, a planner-only Phase 2.2 surface that drafts candidate successors with `supersedes` lineage and planned deprecation transitions without inserting or mutating memory.
- Added explicit multi-cycle sleep runs: hosts provide each cycle clock/input; Aletheia aggregates deterministic reports without a daemon or hidden scheduler.
- Added `ReconsolidationApplier`, a human-confirmed Phase 2.4 apply path that inserts candidate successors, deprecates superseded atoms through audited status transitions, validates confirmation before mutation, and reports `partial_applied` instead of silently succeeding when a later transition rejects.
- Added `@aletheia/episodic`, a Phase 3.0 projection package for explicit episodic anchors, historical belief snapshots from status history, episode comparisons, and restart self-state reconstruction.
- Extended `@aletheia/episodic` with a visible episode catalog and permission-guarded single-memory timelines for audited status history.
- Added `@aletheia/adapters-anthropic`, a Claude-compatible reference adapter that routes model-drafted memory through `propose()` and calls the model for answers only after `recall()` + `tryAct()` allow local/shadow use.
- Added `pnpm run smoke:core-e2e`, a no-LLM SQLite canary that exercises sealed proposal, verified recall, sensitive action, and safe local action boundaries.

---

## v0.52.5 — bounded no-effect receiver runtime adapter fixture suite

This is the public review release `v0.52.5`. Current v0.52.5 status is narrower than production live runtime, but crosses the next safe barrier after v0.51: **bounded no-effect receiver runtime adapter fixture suite**.

The v0.52 ladder is opt-in, operator-run one-shot, local-only, fixture/read-only, bounded to the pinned completed v0.51.5 receiver runtime invocation shim artifact and report, pre-read path pinned, redacted-before-persist, non-authoritative, rollback/no-persist, and not connected to production runtime.

Pinned v0.52.5 evidence: `suiteStatus: PASSIVE_LIVE_MEMORY_COHERENCE_BOUNDED_NO_EFFECT_RECEIVER_RUNTIME_ADAPTER_FIXTURE_SUITE_COMPLETE`, `fixtureScenarioCount: 5`, `adapterInvocationCount: 5`, `fixturePassCount: 5`, `fixtureFailClosedCount: 1`, `adapterOutputCount: 5`, `effectsBlockedCount: 10`, `sourceBoundOutputRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `forbiddenEffectCount: 0`, `boundaryViolationCount: 0`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, and `notRuntimeInstruction: true`.

The suite invokes a deterministic local no-effect receiver runtime adapter fixture contract over v0.51.5 shim handoff outputs under baseline_handoff, stale_suppression_fixture, contradiction_caution_fixture, noisy_context_suppression_fixture, and malformed_or_boundary_violation_fixture. The malformed/boundary fixture fails closed and blocks effects. It is intentionally not production runtime behavior: no daemon, SDK/framework adapter, MCP/A2A client/server, network/resource fetch, tool execution, memory/config writes, external effects, authorization/enforcement decisions, approval/allow/block decisions, or automatic agent consumption.

## Carry-forward prior release boundaries

The v0.51 local receiver runtime invocation shim rehearsal remains the pinned upstream source: four local shim invocations, four no-effect handoff outputs, one context handoff result, all effects blocked, source-bound ratio 1, and zero boundary violations.

# Synaptic Mesh v0.51.5

This is the public review release `v0.51.5`. Current v0.51.5 status is narrower than production live runtime, but crosses the next safe barrier after v0.50: **local reversible receiver runtime invocation shim rehearsal**.

The v0.51 ladder is opt-in, operator-run one-shot, local-only, rehearsal/read-only, bounded to the pinned completed v0.50.5 receiver/runtime test harness consumption rehearsal artifact and report, pre-read path pinned, redacted-before-persist, non-authoritative, rollback/no-persist, and not connected to production runtime.

Pinned v0.51.5 evidence: `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_INVOCATION_SHIM_REHEARSAL_COMPLETE`, `localShimInvocationCount: 4`, `shimOutputCount: 4`, `contextHandoffResultCount: 1`, `invokedConsumedBlockCount: 4`, `effectsBlockedCount: 10`, `sourceBoundInvocationRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `forbiddenEffectCount: 0`, `boundaryViolationCount: 0`, `operatorApprovalScope: local_receiver_runtime_invocation_shim_rehearsal_only`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, and `notRuntimeInstruction: true`.

The rehearsal invokes a deterministic local receiver runtime invocation shim over the v0.50.5 consumed blocks and prepares a no-effect context handoff result for human review only. It is intentionally not production runtime behavior: no daemon, SDK/framework adapter, MCP/A2A client/server, network/resource fetch, tool execution, memory/config writes, external effects, authorization/enforcement decisions, allow/block decisions, or automatic agent consumption.

## Carry-forward prior release boundaries

The v0.50 local receiver/runtime test harness consumption rehearsal remains the pinned upstream source: four source-bound consumed context blocks, four local parse successes, four non-authoritative consumption decisions, all effects blocked, source-bound ratio 1, and zero boundary violations.

# Synaptic Mesh v0.50.5

This is the public review release `v0.50.5`. Current v0.50.5 status is narrower than production live runtime, but crosses the next safe barrier after v0.49: **local receiver/runtime test harness consumption rehearsal**.

The v0.50 ladder is opt-in, operator-run one-shot, local-only, rehearsal/read-only, bounded to the pinned completed v0.49.5 runtime-context injection rehearsal artifact and report, pre-read path pinned, redacted-before-persist, non-authoritative, rollback/no-persist, and not connected to production runtime.

Pinned v0.50.5 evidence: `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL_COMPLETE`, `sourceReceiverBlockCountConsumedAsLocalTestInput: 4`, `harnessParseSuccessCount: 4`, `consumedContextBlockCount: 4`, `consumptionDecisionCount: 4`, `effectsBlockedCount: 10`, `sourceBoundConsumedBlockRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `forbiddenEffectCount: 0`, `boundaryViolationCount: 0`, `operatorApprovalScope: local_test_harness_rehearsal_only`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, and `notRuntimeInstruction: true`.

The rehearsal parses and consumes the v0.49 receiver-facing blocks as deterministic local receiver/runtime test harness input only. It records non-authoritative consumption decisions and keeps all effects blocked. It is intentionally not production runtime behavior: no daemon, SDK/framework adapter, MCP/A2A client/server, network/resource fetch, tool execution, memory/config writes, external effects, authorization/enforcement decisions, allow/block decisions, or automatic agent consumption.

## Carry-forward prior release boundaries

The v0.49 local runtime-context injection rehearsal remains the pinned upstream source: one machine-shaped adapter rehearsal envelope, four source-bound receiver-facing context blocks, all effects blocked, source-bound ratio 1, and zero boundary violations.

# Synaptic Mesh v0.49.5

This is the public review release `v0.49.5`. Current v0.49.5 status is narrower than production live runtime, but crosses a real runtime-adjacent barrier after v0.48: **local runtime-context injection rehearsal**.

The v0.49 ladder is opt-in, operator-run one-shot, local-only, rehearsal/read-only, bounded to the pinned completed v0.48.5 runtime context injection dry-run artifact and report, pre-read path pinned, redacted-before-persist, machine-shaped adapter rehearsal envelope, non-authoritative, rollback/no-persist, and not connected to production runtime.

Pinned v0.49.5 evidence: `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE`, `sourceRuntimeContextCardCount: 5`, `contextCardsConsumedByLocalRehearsalCount: 5`, `injectionEnvelopeCount: 1`, `injectionEnvelopeContextBlockCount: 4`, `receiverFacingContextBlockCount: 4`, `allEffectsBlockedUntilNextBarrierCount: 10`, `sourceBoundContextCardRatio: 1`, `sourceBoundReceiverBlockRatio: 1`, `forbiddenEffectCount: 0`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_TO_RECEIVER_RUNTIME_TEST_HARNESS_CONSUMPTION_REHEARSAL`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, and `notRuntimeInstruction: true`.

The rehearsal consumes the v0.48 machine-shaped runtime context cards in a deterministic local adapter harness and emits one receiver-facing injection envelope with four source-bound context blocks. It is intentionally not production runtime behavior: no daemon, SDK/framework adapter, MCP/A2A client/server, network/resource fetch, tool execution, memory/config writes, external effects, authorization/enforcement decisions, or automatic agent consumption.

## Carry-forward prior release boundaries

The v0.48 local runtime-adjacent context injection dry-run remains the pinned upstream source: five runtime context cards, four harness-consumable candidates, one stale-suppressed card, every card blocked until the next barrier, source-bound ratio 1, and zero boundary violations.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

# Synaptic Mesh v0.48.5

This is the public review release `v0.48.5`. Current v0.48.5 status is narrower than production live runtime, but crosses a real runtime-adjacent boundary after v0.47: **local runtime-adjacent context injection dry-run**.

The v0.48 ladder is opt-in, operator-run one-shot, local-only, dry-run/read-only, bounded to the pinned completed v0.47.5 repeatability artifact, pre-read path pinned, redacted-before-persist, machine-shaped local dry-run context payload, test-harness-only, non-authoritative, rollback/no-persist, and not connected to production runtime.

Pinned v0.48.5 evidence: `dryRunStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_DRY_RUN_COMPLETE`, `sourceRepeatabilityRunCount: 3`, `sourceStableHandoffItemCount: 5`, `sourceIncludedForLiveContextCount: 4`, `sourceExcludedAsStaleCount: 1`, `sourceContradictionCautionCount: 1`, `runtimeContextCardCount: 5`, `harnessConsumableCandidateCount: 4`, `runtimeBridgeSignalCount: 4`, `runtimeBlockedUntilNextBarrierCount: 5`, `staleSuppressionCarriedForwardCount: 1`, `contradictionCautionCarriedForwardCount: 1`, `harnessConsumablePayloadRatio: 0.8`, `nextBarrierSpecificityRatio: 1`, `sourceBoundCardRatio: 1`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_TO_RUNTIME_ADJACENT_DRY_RUN_OR_LIVE_CONTEXT_INJECTION_REHEARSAL`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, and top-level sentinel kept null.

The dry-run converts stable v0.47 handoff judgements into a machine-shaped local dry-run context payload that a receiver/runtime test harness could consume next: four harness-consumable context candidates, one stale-suppressed card, and every card blocked until the next barrier. This is intentionally not another generic readiness scorecard; it rehearses local agent-context injection shape while still preventing external effects, production runtime integration, config writes, memory writes, authorization/enforcement/approve/block/allow semantics, and network/resource fetch.

## Carry-forward prior release boundaries

The v0.47 repeatability scorecard remains the pinned upstream source: three runs, five stable handoff items, four included for live context, one stale item suppressed, one contradiction caution, receiver usefulness ratio 1, zero boundary violations, recommendation-not-authority, top-level-only and human-readable report only.

No production runtime integration, durable memory promotion, config writes, memory writes, network/resource fetch, tool execution, authorization, approval/block/allow semantics, enforcement, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, raw persistence/output, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

# Synaptic Mesh v0.47.5

This is the public review release `v0.47.5`. Current v0.47.5 status is narrower than live runtime and crosses the next safe barrier after v0.46: **passive live memory/coherence receiver live-context handoff utility repeatability scorecard**.

The v0.47 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.46.5 receiver live-context handoff utility artifact, pre-read path pinned, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.47.5 evidence: `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_REPEATABILITY_SCORECARD_COMPLETE`, `repeatabilityRunCount: 3`, `sourceHandoffWindowCount: 1`, `handoffItemCount: 5`, `totalHandoffUtilityJudgementCount: 15`, `stableHandoffItemCount: 5`, `unstableHandoffItemCount: 0`, `stableIncludedForLiveContextCount: 4`, `stableExcludedAsStaleCount: 1`, `stableContradictionCautionCount: 1`, `stableReceiverUsefulHandoffItemCount: 4`, `stableReceiverNoisyHandoffItemCount: 0`, `rawSignalUsefulnessRatio: 0.6`, `scorecardUsefulnessRatio: 0.6`, `receiverUsefulnessRatio: 1`, `stableHandoffUtilityTreatmentRatio: 1`, `sourceBoundRepeatabilityRatio: 1`, `preReadPathPinned: true`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, and `human-readable report only`.

The repeatability scorecard checks the v0.46 handoffItems / handoffUtilityJudgements under baseline, paraphrased rationale/whyUseful, and reverse-order variants. It keeps all five handoff items stable: four included for live context, one stale item suppressed, and one contradiction preserved as human caution. This is still observation-only: no memory promotion, no agent-consumed instruction, no authorization, no approval/block/allow, no enforcement, and no live runtime behavior.

## Carry-forward prior release boundaries

The v0.46 passive live memory/coherence receiver live-context handoff utility remains the upstream signal source: one handoff window, five handoff items, four included for live context, one stale suppressed, one contradiction caution, receiver usefulness ratio 1, zero boundary violations, recommendation-not-authority, top-level-only and human-readable report only.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

# Synaptic Mesh v0.46.5

This is the public review release `v0.46.5`. Current v0.46.5 status is narrower than live runtime and crosses the next safe barrier after v0.45: **passive live memory/coherence receiver live-context handoff utility**.

The v0.46 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.45.5 receiver usefulness live observation repeatability artifact, pre-read path pinned, stable-signals-only, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.46.5 evidence: `handoffUtilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_LIVE_CONTEXT_HANDOFF_UTILITY_COMPLETE`, `sourceRepeatabilityRunCount: 3`, `sourceStableObservationCount: 5`, `sourceUnstableObservationCount: 0`, `handoffWindowCount: 1`, `handoffItemCount: 5`, `includedForLiveContextCount: 4`, `excludedAsStaleCount: 1`, `contradictionCautionCount: 1`, `receiverUsefulHandoffItemCount: 4`, `receiverNoisyHandoffItemCount: 0`, `rawSignalUsefulHandoffItemCount: 3`, `rawSignalNoisyHandoffItemCount: 2`, `scorecardUsefulHandoffItemCount: 3`, `scorecardNoisyHandoffItemCount: 2`, `receiverUsefulnessRatio: 1`, `rawSignalUsefulnessRatio: 0.6`, `scorecardUsefulnessRatio: 0.6`, `stableSignalCarryForwardRatio: 1`, `sourceBoundHandoffRatio: 1`, `staleSuppressionUsefulRatio: 1`, `contradictionCautionUsefulRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `preReadPathPinned: true`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, and `human-readable report only`.

The handoff utility assembles stable v0.45 observations into bounded human live context: three normal context items, one contradiction caution, and one stale item intentionally suppressed. This is still observation-only: no memory promotion, no agent-consumed instruction, no authorization, no approval/block/allow, no enforcement, and no live runtime behavior.

## Carry-forward prior release boundaries

The v0.45 passive live memory/coherence receiver usefulness live observation repeatability scorecard remains the upstream signal source: three repeatability runs, fifteen judgements, five stable observations, zero unstable observations, receiver usefulness ratio 1, stale suppression and contradiction caution preserved, zero boundary violations, recommendation-not-authority, top-level-only and human-readable report only.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.

# Synaptic Mesh v0.45.5

This is the public review release `v0.45.5`. Current v0.45.5 status is narrower than live runtime and crosses the next safe barrier after v0.44: **passive live memory/coherence receiver usefulness live observation repeatability scorecard**.

The v0.45 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.44.5 receiver usefulness live observation artifact, pre-read path pinned, redacted-before-persist, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.45.5 evidence: `repeatabilityStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RECEIVER_USEFULNESS_LIVE_OBSERVATION_REPEATABILITY_SCORECARD_COMPLETE`, `repeatabilityRunCount: 3`, `sourceLiveObservationWindowCount: 1`, `candidateCount: 5`, `totalLiveObservationJudgementCount: 15`, `stableObservationCount: 5`, `unstableObservationCount: 0`, `stableIncludedForHumanContextCount: 3`, `stableStaleSuppressedObservationCount: 1`, `stableContradictionCautionObservationCount: 1`, `stableReceiverUsefulLiveContextItemCount: 4`, `stableReceiverNoisyLiveContextItemCount: 0`, `stableRawSignalUsefulItemCount: 3`, `stableRawSignalNoisyItemCount: 2`, `stableScorecardUsefulItemCount: 3`, `stableScorecardNoisyItemCount: 2`, `receiverUsefulnessRatio: 1`, `rawSignalUsefulnessRatio: 0.6`, `scorecardUsefulnessRatio: 0.6`, `labelAgreementRatio: 1`, `stableLiveObservationTreatmentRatio: 1`, `receiverUsefulnessRepeatabilityRatio: 1`, `sourceBoundRepeatabilityRatio: 1`, `staleSuppressionRepeatabilityRatio: 1`, `contradictionCautionRepeatabilityRatio: 1`, `agentConsumedOutputFalseRatio: 1`, `preReadPathPinned: true`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, and `human-readable report only`.

The repeatability scorecard repeats the v0.44 live observation under baseline, paraphrased-observation, and reverse-order variants. It keeps all five live observations stable: three included for human context, one stale prior-release anchor suppressed, and one contradiction preserved as human caution. This is still observation-only: no memory promotion, no agent-consumed instruction, no authorization, no approval/block/allow, no enforcement, and no live runtime behavior.

## Carry-forward prior release boundaries

The v0.44 passive live memory/coherence receiver usefulness live observation remains the upstream signal source: four explicit repo-local sources, five source-bound observation items, receiver usefulness ratio 1, stale suppression and contradiction caution preserved, zero boundary violations, recommendation-not-authority, top-level-only and human-readable report only.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
