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
- source #0 record #0: # Synaptic Mesh v0.25.5
- source #0 record #1: This is the public review release `v0.25.5`. Current v0.25.5 status is narrower than live runtime and crosses the next safe barrier after the v0.24 operator review outcome capture: **operator outcome value scorecard**.
- source #0 record #2: The v0.25 ladder is disabled-by-default, manual/operator-run, local-only, passive/read-only, one-shot, bounded to 3 captured outcomes, redacted-evidence-only, human-readable only, non-authoritative, and value-scorecard-only. It consumes exp
- source #0 record #3: Pinned v0.25.5 evidence: `scorecardStatus: VALUE_SCORECARD_COMPLETE`, `usefulOutcomes: 2`, `noiseOutcomes: 1`, `needsMoreEvidence: 0`, `abstainUncertain: 0`, `reviewedItemCount: 3`, `usefulRatio: 0.6667`, `noiseRatio: 0.3333`, `recommendati
- source #1 record #0: # Release Notes — Synaptic Mesh v0.25.5
- source #1 record #1: ## Summary
- source #1 record #2: `v0.25.5` adds **operator outcome value scorecard** over explicit v0.24 captured operator outcomes. It scores whether the controlled review queue appears useful, noisy, or still evidence-poor while remaining non-authoritative and human-read
- source #1 record #3: ## Evidence
- source #2 record #0: # Release Candidate — Synaptic Mesh v0.23.5
- source #2 record #1: Target: `v0.23.5`
