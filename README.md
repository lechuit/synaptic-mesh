# Synaptic Mesh v0.25.5

This is the public review release `v0.25.5`. Current v0.25.5 status is narrower than live runtime and crosses the next safe barrier after the v0.24 operator review outcome capture: **operator outcome value scorecard**.

The v0.25 ladder is disabled-by-default, manual/operator-run, local-only, passive/read-only, one-shot, bounded to 3 captured outcomes, redacted-evidence-only, human-readable only, non-authoritative, and value-scorecard-only. It consumes explicit local v0.24 capture artifact(s) and scores whether the review queue appears useful, noisy, or needs more evidence.

Pinned v0.25.5 evidence: `scorecardStatus: VALUE_SCORECARD_COMPLETE`, `usefulOutcomes: 2`, `noiseOutcomes: 1`, `needsMoreEvidence: 0`, `abstainUncertain: 0`, `reviewedItemCount: 3`, `usefulRatio: 0.6667`, `noiseRatio: 0.3333`, `recommendation: ADVANCE_OBSERVATION_ONLY`, `recommendationIsAuthority: false`, `falseAuthorityLeakage: 0`, and negative controls for malformed capture, unsafe labels/tokens including camelCase aliases, boundary keys with true/string/object values, reportMarkdown authority tokens, raw persistence/output, external effects, invalid metrics/ratios, insufficient sample, degrade/hold cases, duplicate/missing outcome IDs, and false recommendation authority leakage.

Recommendations are limited to human-readable non-authoritative queue-value signals: `ADVANCE_OBSERVATION_ONLY`, `HOLD_FOR_MORE_EVIDENCE`, and `DEGRADE_QUEUE_SIGNAL`.

Boundaries: `policyDecision: null`, `authorization: false`, `enforcement: false`, `toolExecution: false`, `agentConsumedOutput: false`, `externalEffects: false`, `rawPersisted: false`, `rawOutput: false`, and `runtimeAuthority: false`.

## v0.25.5 phase close

Operator outcome value scorecard is closed as a local review package. Two independent local review notes are included for branch review context; they are not GitHub reviews and not deployment approvals.

## Carry-forward prior release boundaries

The v0.24 operator review outcome capture remains the input evidence baseline: `captureStatus: OUTCOME_CAPTURE_COMPLETE`, `capturedOutcomes: 3`, redaction-before-persist, value-feedback-only, human-readable-only, non-authoritative, and no raw persistence/output.

No enforcement, authorization, approval/block/allow semantics, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
