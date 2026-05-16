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
- source #0 record #0: # Synaptic Mesh v0.34.5
- source #0 record #1: This is the public review release `v0.34.5`. Current v0.34.5 status is narrower than live runtime and crosses the next safe barrier after v0.33: **passive hard-case outcome value scorecard**.
- source #0 record #2: The v0.34 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.33.5 hard-case context assembly artifact (path and sha256 digest pinned), human-readable report only, non-auth
- source #0 record #3: Pinned v0.34.5 evidence: `outcomeValueStatus: PASSIVE_HARD_CASE_OUTCOME_VALUE_SCORECARD_COMPLETE`, `outcomeCount: 5`, `usefulOutcomeCount: 3`, `noiseOutcomeCount: 1`, `evidenceGapOutcomeCount: 1`, `usefulOutcomeRatio: 0.6`, `noiseOutcomeRat
- source #1 record #0: # Release Notes — Synaptic Mesh v0.34.5
- source #1 record #1: ## Summary
- source #1 record #2: `v0.34.5` adds **passive hard-case outcome value scorecard** over the completed v0.33.5 hard-case context assembly artifact. It measures whether hard-case context packages are actually useful to a human/shadow receiver versus noisy or under
- source #1 record #3: ## Evidence
- source #2 record #0: # Release Candidate — Synaptic Mesh v0.34.5
- source #2 record #1: Target: `v0.34.5`
