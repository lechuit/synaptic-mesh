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
- source #0 record #0: # Synaptic Mesh v0.39.5
- source #0 record #1: This is the public review release `v0.39.5`. Current v0.39.5 status is narrower than live runtime and crosses the next safe barrier after v0.38: **passive live memory/coherence stale/contradiction invalidation window**.
- source #0 record #2: The v0.39 ladder is disabled-by-default, operator-run one-shot, local-only, passive/read-only, bounded to the pinned completed v0.38.5 passive live memory/coherence usefulness window artifact, redacted-before-persist, human-readable report
- source #0 record #3: Pinned v0.39.5 evidence: `invalidationWindowStatus: PASSIVE_LIVE_MEMORY_COHERENCE_INVALIDATION_WINDOW_COMPLETE`, `invalidationWindowCount: 1`, `candidateSignalCount: 5`, `validCarryForwardCount: 3`, `staleSignalCount: 1`, `contradictionSign
- source #1 record #0: # Release Notes — Synaptic Mesh v0.39.5
- source #1 record #1: ## Summary
- source #1 record #2: `v0.39.5` adds a **passive live memory/coherence stale/contradiction invalidation window** over the completed pinned v0.38.5 usefulness window artifact. It measures whether passive handoff can preserve current useful signals while invalidat
- source #1 record #3: ## Evidence
- source #2 record #0: # Release Candidate — Synaptic Mesh v0.39.5
- source #2 record #1: Target: `v0.39.5`
