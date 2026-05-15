# Synaptic Mesh v0.23.5

This is the public review release `v0.23.5`. Current v0.23.5 status is narrower than live runtime and crosses the next safe barrier after the v0.22 observed usefulness/noise scorecard: a **controlled operator review queue**.

The v0.23 ladder is disabled-by-default, manual/operator-run, local-only, passive/read-only, one-shot, redacted-evidence-only, human-readable only, and non-authoritative. It consumes the v0.22 scorecard and turns only true useful `PASS_TO_HUMAN_REVIEW` observations into a local human-review prioritization artifact.

Pinned v0.23.5 evidence: `queueStatus: READY_FOR_OPERATOR_REVIEW`, `queueItems: 3`, `reviewBurden: low`, `estimatedMinutes: 21`, `falsePasses: 0`, `authorityViolations: 0`, source recommendation `advance` used as context only, and negative controls for malformed/unsafe scorecards.

This is not a decision queue, not an approval queue, not a policy allow/block/approve gate, and not runtime authority. Boundaries: `policyDecision: null`, `authorization: false`, `enforcement: false`, `toolExecution: false`, `agentConsumedOutput: false`, `externalEffects: false`, `rawPersisted: false`, `rawOutput: false`, and `unexpectedPermits: 0`.

Queue items include priority, rationale, source case id, and redacted summary only. Deterministic ordering puts the explicit-threshold source-failure useful pass first, then the two clean useful valid passes. If the source scorecard recommendation is `hold` or `degrade`, or if false passes/authority violations/malformed fields/forbidden capabilities/raw output/external effects are present, v0.23 abstains or degrades with no queue items.

## v0.23.5 phase close

Controlled operator review queue is closed as a local review package. Two independent local review notes are included for branch review context; they are not GitHub reviews and not deployment approvals.

## Carry-forward prior release boundaries

The v0.22 observed usefulness/noise scorecard remains the input evidence baseline: useful/noisy mixed cases showed `trueUsefulPasses: 3`, `falsePasses: 0`, `noiseRejected: 6`, `falseValueWarnings: 0`, `passPrecision: 1`, and `recommendation: advance`, with recommendation human-readable only and not authority.

No enforcement, authorization, approval/block/allow, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
