# Synaptic Mesh v0.22.5

This is the public review release `v0.22.5`. Current v0.22.5 status is narrower than live runtime and crosses the next safe barrier after positive utility pass-to-human-review: an **observed usefulness/noise scorecard**.

The v0.22 ladder is still disabled-by-default, manual/operator-run, local-only, passive/read-only, one-shot, human-readable only, scorecard only, and non-authoritative. It consumes v0.21 positive utility pass gate outputs and measures whether `PASS_TO_HUMAN_REVIEW` actually helps on mixed valid/noisy/failing cases.

Pinned v0.22.5 evidence: `trueUsefulPasses: 3`, `falsePasses: 0`, `usefulRejects: 0`, `missedUsefulPasses: 0`, `noisyRejects: 6`, `noiseRejected: 6`, `falseValueWarnings: 0`, `passPrecision: 1`, `passUsefulness: 1`, `reviewBurdenEstimate: low`, and `recommendation: advance`.

This is not a policy allow/block/approve gate and not runtime authority. The recommendation is a human-readable review signal only. Boundaries: `policyDecision: null`, `authorization: false`, `enforcement: false`, `toolExecution: false`, `agentConsumedOutput: false`, `externalEffects: false`, `rawPersisted: false`, `rawOutput: false`, and `unexpectedPermits: 0`.

Mixed cases include useful valid passes, noisy but safe rejects, source failure reject/default and allowed-with-explicit-threshold behavior, malformed/forbidden rejects, and borderline insufficient records. Negative controls prove false `PASS_TO_HUMAN_REVIEW` is not allowed for malformed bounds, forbidden aliases/capabilities, or authority-token classifications, and that `recommendation: advance` never becomes authority.

## v0.22.5 phase close

Observed usefulness/noise scorecard is closed as a local review package. Two independent local review notes are included for branch review context; they are not GitHub reviews and not deployment approvals.

## Carry-forward prior release boundaries

The v0.21 positive utility pass-to-human-review gate remains the input evidence baseline: valid v0.20-style bounded explicit multisource shadow-read evidence may classify clean, useful redacted observations as `PASS_TO_HUMAN_REVIEW` with `observationAccepted`, `includedInReport`, and `readyForHumanReview` true.

No enforcement, authorization, approval/block/allow, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, autonomous live mode, watcher/daemon, network/resource fetch, tool execution, memory/config writes, agent-consumed machine-readable policy decisions, raw persistence/output, or external effects.

Compatibility carry-forward: passive live shadow readiness achieved for local operator-run pilot only; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.
