# Synaptic Mesh v0.28.5

This is the public review release `v0.28.5`. Current v0.28.5 status is narrower than live runtime and crosses the next safe barrier after the v0.27 repeatability scorecard: **passive memory recall usefulness probe**.

The v0.28 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to explicit redacted passive observation artifacts plus explicit recall need cards, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.28.5 evidence: `probeStatus: MEMORY_RECALL_USEFULNESS_PROBE_COMPLETE`, `cardCount: 4`, `evidenceCount: 5`, `sourceArtifactCount: 1`, `source-anchor digest verified`, `usefulRecallRatio: 0.75`, `contradictionSurfacingRatio: 1`, `staleNegativeMarkedRatio: 1`, `sourceBoundMatchRatio: 1`, `irrelevantMatchRatio: 0`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `policyDecision: null`, and `human-readable report only`.

The probe asks whether passive evidence helps recover AI-continuity memory: decisions, project rules, contradictions, source-bound evidence, and stale negative context. Source-bound now means each matched item verifies a redacted source anchor and digest against an explicit source artifact, not just declared metadata. The recommendation is only a human review signal to continue observation; it is not authorization or enforcement.

## v0.28.5 phase close

Passive memory recall usefulness probe is prepared as a local review package. It demonstrates source-bound recall usefulness over four human-authored need cards without adding authority, effects, daemon/watchers, autonomous runtime, raw output, memory writes, or agent-consumed policy decisions.

## Carry-forward prior release boundaries

The v0.27 passive observation repeatability scorecard remains the upstream signal source: `scorecardStatus: REPEATABILITY_SCORECARD_COMPLETE`, completed windows: 3, degraded windows: 1, usefulOutcomeRatio: 1, repeatabilityRatio: 1, recommendation-not-authority, and `policyDecision: null`.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
