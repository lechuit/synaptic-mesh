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
- source #0 record #0: # Synaptic Mesh v0.49.5
- source #0 record #1: This is the public review release `v0.49.5`. Current v0.49.5 status is narrower than production live runtime, but crosses a real runtime-adjacent barrier after v0.48: **local runtime-context injection rehearsal**.
- source #0 record #2: The v0.49 ladder is opt-in, operator-run one-shot, local-only, rehearsal/read-only, bounded to the pinned completed v0.48.5 runtime context injection dry-run artifact and report, pre-read path pinned, redacted-before-persist, machine-shaped
- source #0 record #3: Pinned v0.49.5 evidence: `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE`, `sourceRuntimeContextCardCount: 5`, `contextCardsConsumedByLocalRehearsalCount: 5`, `injectionEnvelopeCount: 1`, `inject
- source #1 record #0: # Release Notes — Synaptic Mesh v0.49.5
- source #1 record #1: v0.49.5 adds a local runtime-context injection rehearsal on top of published v0.48.5. It pins the v0.48.5 reviewer package and report by path and SHA-256, consumes the v0.48 runtime context cards in a deterministic local adapter harness, an
- source #1 record #2: Pinned evidence: `rehearsalStatus: PASSIVE_LIVE_MEMORY_COHERENCE_RUNTIME_CONTEXT_INJECTION_REHEARSAL_COMPLETE`, `contextCardsConsumedByLocalRehearsalCount: 5`, `injectionEnvelopeCount: 1`, `receiverFacingContextBlockCount: 4`, `allEffectsBl
- source #1 record #3: Boundary: local-only, reversible, read-only, non-authoritative, no production runtime integration, no daemon, no SDK/framework adapter, no MCP/A2A client/server, no network/resource fetch, no tool execution, no memory/config writes, no exte
- source #2 record #0: # Release Candidate — Synaptic Mesh v0.39.5
- source #2 record #1: Target: `v0.39.5`
