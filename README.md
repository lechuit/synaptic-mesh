# Synaptic Mesh v0.31.5

This is the public review release `v0.31.5`. Current v0.31.5 status is narrower than live runtime and crosses the next safe barrier after v0.30: **passive source authority conflict scorecard**.

The v0.31 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.30.5 receiver rubric artifact (path and sha256 digest pinned), human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.31.5 evidence: `conflictStatus: PASSIVE_SOURCE_AUTHORITY_CONFLICT_SCORECARD_COMPLETE`, `conflictCaseCount: 4`, `sourceBoundConflictRatio: 1`, `authorityConflictSurfacedRatio: 1`, `newerSourcePreferredRatio: 1`, `contradictionConflictSurfacedRatio: 1`, `staleInvalidationCautionRatio: 1`, `humanReviewOnlyRatio: 1`, `noPromotionWithoutHumanRatio: 1`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, `policyDecision: null`, and `human-readable report only`.

The scorecard asks whether competing memory/source situations can be surfaced safely for a human receiver: source-bound decisions versus unsourced inference, project rules versus generic priors, explicit contradictions, and stale-memory invalidation. These are precedence suggestions for human review only, not memory promotions, agent-consumed instructions, authorization, or enforcement.

## v0.31.5 phase close

Passive source authority conflict scorecard is prepared as a local review package. It demonstrates conflict/precedence surfacing over pinned v0.30.5 receiver items without adding authority, effects, daemon/watchers, autonomous runtime, raw output, memory writes, runtime integration, durable memory promotion, or agent-consumed policy decisions.

## Carry-forward prior release boundaries

The v0.30 passive handoff receiver shadow rubric remains the upstream signal source: `receiverStatus: PASSIVE_HANDOFF_RECEIVER_RUBRIC_COMPLETE`, four receiver items, two include-for-human-context items, one contradiction review item, one stale caution item, one upstream noise item excluded, source-bound/contradiction/stale/no-promotion ratios at 1, recommendation-not-authority, and `policyDecision: null`.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, durable memory promotion, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
