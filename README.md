# Synaptic Mesh v0.27.5

This is the public review release `v0.27.5`. Current v0.27.5 status is narrower than live runtime and crosses the next safe barrier after the v0.26 passive observation window: **passive observation repeatability scorecard**.

The v0.27 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to explicit redacted v0.26 passive observation window artifacts, human-readable report only, non-authoritative, and not runtime authority.

Pinned v0.27.5 evidence: `scorecardStatus: REPEATABILITY_SCORECARD_COMPLETE`, `completed windows: 3`, `degraded windows: 1`, `usefulOutcomeRatio: 1`, `repeatabilityRatio: 1`, `boundaryViolationCount: 0`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `policyDecision: null`, and `human-readable report only`.

The scorecard aggregates multiple bounded local/manual/operator-run passive observation windows, including one degraded/noise window, to measure repeatability and useful signal before any stronger live behavior. The recommendation is only a human review signal to continue observation; it is not authorization or enforcement.

## v0.27.5 phase close

Passive observation repeatability scorecard is closed as a local review package. It demonstrates repeatable useful human signal across multiple redacted observation windows without adding authority, effects, daemon/watchers, autonomous runtime, raw output, or agent-consumed policy decisions.

## Carry-forward prior release boundaries

The v0.26 passive observation window remains the upstream artifact source: `windowStatus: OBSERVATION_WINDOW_COMPLETE`, `stage chain: 6`, redacted evidence packet only, human-readable-only, non-authoritative, recommendation-not-authority, and `policyDecision: null`.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
