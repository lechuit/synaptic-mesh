# Bounded Explicit Multisource Shadow-Read Report v0.20.5

- Barrier crossed: bounded explicit multisource shadow-read
- Adapter: repo-local-file-read-adapter-v0
- Operator-run: true; one-shot: true; local-only/read-only/passive-only: true
- Sources: 3 / max 3
- Records read: 10 / total limit 10; per-source limit 4
- Per-source isolation: true; failure isolation: true; isolated failures: 0
- Redacted evidence only: true; rawPersisted: false; rawOutput: false
- policyDecision: null; agentConsumedOutput: false; unexpectedPermits: 0
- Enforcement/authorization/approval/block/allow: false

## Source statuses
- source #0: ok; records=4; rawSourcePathPersisted=false
- source #1: ok; records=4; rawSourcePathPersisted=false
- source #2: ok; records=2; rawSourcePathPersisted=false

## Redacted evidence preview
- source #0 record #0: # Synaptic Mesh v0.22.5
- source #0 record #1: This is the public review release `v0.22.5`. Current v0.22.5 status is narrower than live runtime and crosses the next safe barrier after positive utility pass-to-human-review: an **observed usefulness/noise scorecard**.
- source #0 record #2: The v0.22 ladder is still disabled-by-default, manual/operator-run, local-only, passive/read-only, one-shot, human-readable only, scorecard only, and non-authoritative. It consumes v0.21 positive utility pass gate outputs and measures wheth
- source #0 record #3: Pinned v0.22.5 evidence: `trueUsefulPasses: 3`, `falsePasses: 0`, `usefulRejects: 0`, `missedUsefulPasses: 0`, `noisyRejects: 6`, `noiseRejected: 6`, `falseValueWarnings: 0`, `passPrecision: 1`, `passUsefulness: 1`, `reviewBurdenEstimate: l
- source #1 record #0: # Release Notes — Synaptic Mesh v0.22.5
- source #1 record #1: ## Summary
- source #1 record #2: `v0.22.5` adds an **observed usefulness/noise scorecard** over v0.21 positive utility pass gate outputs. It measures whether `PASS_TO_HUMAN_REVIEW` is useful when mixed with noisy, failing, malformed, forbidden, and borderline cases.
- source #1 record #3: ## Evidence
- source #2 record #0: # Release Candidate — Synaptic Mesh v0.22.5
- source #2 record #1: Target: `v0.22.5`
