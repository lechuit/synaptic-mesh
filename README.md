# Synaptic Mesh v0.21.5

This is the public review release `v0.21.5`. Current v0.21.5 status is narrower than live runtime but crosses the next smallest safe barrier after bounded explicit multisource shadow-read: a **positive utility pass-to-human-review** gate.

The v0.21.x ladder is still disabled-by-default, manual/operator-run, local-only, passive/read-only, one-shot, and non-authoritative. It consumes valid v0.20-style bounded explicit multisource shadow-read evidence and may classify clean, useful redacted observations as `PASS_TO_HUMAN_REVIEW` with `observationAccepted`, `includedInReport`, and `readyForHumanReview` set true.

This is not a policy allow/block/approve gate and not runtime authority. Boundaries: `policyDecision: null`, `authorization: false`, `enforcement: false`, `toolExecution: false`, `agentConsumedOutput: false`, `externalEffects: false`, `rawPersisted: false`, `rawOutput: false`, and `unexpectedPermits: 0`.

Positive cases require explicit local sources, valid bounds, sufficient redacted records, clean redaction, bounded source failures, and a generated human-readable report. Negative controls reject no-record packets, invalid bounds, excess source failures, redaction/private-token leaks, raw persistence/output, non-null policy decisions, agent-consumed output, and forbidden capability flags.

## v0.21.5 phase close

Positive utility pass-to-human-review is closed as a local review package. Two independent local review notes are included for branch review context; they are not GitHub reviews and not deployment approvals.

## Carry-forward prior release boundaries

The bounded explicit multisource shadow-read remains the input evidence baseline: max sources 3, max records per source 5, max total records 12, per-source isolation, per-source failure isolation, redaction-before-persist, redacted evidence only, and a human-readable report. No enforcement, authorization, approval/block/allow, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, or external effects.

## Synaptic Mesh v0.21.5 — positive utility pass-to-human-review

The v0.21.5 release crosses the next smallest safe barrier after bounded explicit multisource shadow-read: a **positive utility pass-to-human-review** gate.

The v0.21.x ladder is still disabled-by-default, manual/operator-run, local-only, passive/read-only, one-shot, and non-authoritative. It consumes valid v0.20-style bounded explicit multisource shadow-read evidence and may classify clean, useful redacted observations as `PASS_TO_HUMAN_REVIEW` with `observationAccepted`, `includedInReport`, and `readyForHumanReview` set true.

This is not a policy allow/block/approve gate and not runtime authority. Boundaries: `policyDecision: null`, `authorization: false`, `enforcement: false`, `toolExecution: false`, `agentConsumedOutput: false`, `externalEffects: false`, `rawPersisted: false`, `rawOutput: false`, and `unexpectedPermits: 0`.

Positive cases require explicit local sources, valid bounds, sufficient redacted records, clean redaction, bounded source failures, and a generated human-readable report. Negative controls reject no-record packets, invalid bounds, excess source failures, redaction/private-token leaks, raw persistence/output, non-null policy decisions, agent-consumed output, and forbidden capability flags.

Two independent local review notes are included for branch review context; they are not GitHub reviews and not deployment approvals.


Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
