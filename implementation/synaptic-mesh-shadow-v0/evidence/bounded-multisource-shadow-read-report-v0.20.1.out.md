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
- source #0 record #0: # Synaptic Mesh v0.26.5
- source #0 record #1: This is the public review release `v0.26.5`. Current v0.26.5 status is narrower than live runtime and crosses the next safe barrier after the v0.25 value scorecard: **passive observation window**.
- source #0 record #2: The v0.26 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to explicit repo-local sources and 3 queue/outcome items, local manual outcome fixtures only, redaction-before-persist, redacted evidence
- source #0 record #3: Pinned v0.26.5 evidence: `windowStatus: OBSERVATION_WINDOW_COMPLETE`, `stage chain: 6`, `value scorecard: VALUE_SCORECARD_COMPLETE`, `recommendation: HOLD_FOR_MORE_EVIDENCE`, `recommendationIsAuthority: false`, `policyDecision: null`, `reda
- source #1 record #0: # Release Notes — Synaptic Mesh v0.26.5
- source #1 record #1: ## Summary
- source #1 record #2: `v0.26.5` adds **passive observation window** over existing safe local stages. It runs one bounded operator-started observation loop from explicit repo-local sources through positive pass, review queue, manual local outcomes, and value scor
- source #1 record #3: ## Evidence
- source #2 record #0: # Release Candidate — Synaptic Mesh v0.23.5
- source #2 record #1: Target: `v0.23.5`
