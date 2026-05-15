# Synaptic Mesh v0.29.5

This is the public review release `v0.29.5`. Current v0.29.5 status is narrower than live runtime and crosses the next safe barrier after the v0.28 recall probe: **passive memory handoff candidate scorecard**.

The v0.29 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the completed v0.28 redacted recall artifact, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.29.5 evidence: `handoffStatus: MEMORY_HANDOFF_CANDIDATE_SCORECARD_COMPLETE`, `candidateCount: 4`, `carryForwardCandidateCount: 2`, `contradictionCandidateCount: 1`, `staleCautionCandidateCount: 1`, `sourceBoundCandidateRatio: 1`, `contradictionFlagRatio: 1`, `staleCautionRatio: 1`, `noiseSuppressedCount: 1`, `noiseSuppressionRatio: 1`, `humanReviewCandidateRatio: 1`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `agentConsumedOutput: false`, `notRuntimeInstruction: true`, `policyDecision: null`, and `human-readable report only`.

The scorecard asks whether passive recall evidence can become a safe human-review handoff package: what can be carried forward, which contradiction should be surfaced for review, which stale context should be treated as caution rather than fresh instruction, and which noise stays out. These are handoff candidates, not agent-consumed instructions, authorization, or enforcement.

## v0.29.5 phase close

Passive memory handoff candidate scorecard is prepared as a local review package. It demonstrates source-bound, contradiction-aware, stale-aware, noise-suppressing handoff candidates without adding authority, effects, daemon/watchers, autonomous runtime, raw output, memory writes, or agent-consumed policy decisions.

## Carry-forward prior release boundaries

The v0.28 passive memory recall usefulness probe remains the upstream signal source: `probeStatus: MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE`, four cards, five evidence items, one explicit source artifact, source-anchor digest verification, usefulRecallRatio: 0.75, contradictionSurfacingRatio: 1, staleNegativeMarkedRatio: 1, sourceBoundMatchRatio: 1, recommendation-not-authority, and `policyDecision: null`.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
