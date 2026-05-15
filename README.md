# Synaptic Mesh v0.13.5

This is the public review release `v0.13.5`. Current v0.13.5 status is narrower than integration: local harness only, fake/read-only, already-redacted fixtures, and human review evidence.

The ladder from v0.10.x through v0.13.x matures the authority-confusion benchmark, replays existing real-redacted fixtures, performs integration preflight without integration, and closes with a first local adapter harness. The next runtime/integration step unauthorized unless Señor Gabriel explicitly approves it later.

Boundaries: no runtime integration, no real framework adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot/webhook, no network/resource fetch/live traffic, no tool execution, no watcher/daemon, no memory/config writes, no agent-consumed output, no machine-readable policy decision, and no approval/block/allow/authorization/enforcement.

Final evidence: totalHarnessCases: 6; negativeControls: 8; reproducibilityRuns: 2; mismatches: 0; unexpectedPermits: 0; local harness only; fake/read-only.
