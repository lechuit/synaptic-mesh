# Synaptic Mesh v0.16.6

This is the public review release `v0.16.6`. Current v0.16.6 status is narrower than live runtime: tiny operator-run passive pilot readiness only, for one explicit local sample input at a time.

The v0.16.x ladder remains disabled by default, human-started/manual, local-only, and no-effects. The tiny pilot produces stdout or package `evidence/` JSON for human review; it is not agent-consumed output and it is not a machine-readable policy decision.

Boundaries: no production/live deployment, no autonomous live mode, no network/resource fetch, no SDK/framework adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot/webhook, no watcher/daemon, no tool execution, no memory/config writes, no agent-consumed output, no machine-readable policy decision, not runtime authority, no authorization, no external effects, and no approval/block/allow/authorization/enforcement.

Final evidence: tiny operator-run passive pilot readiness; one explicit local sample input at a time; operatorReviewRequired: true; singleSampleOnly: true; packageFixtureInputOnly: true; rawPersisted: false; unexpectedPermits: 0; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects. Next step may be v0.17 limited passive live capture design only if gates and human reviews pass.

Carry-forward boundary from v0.15: passive live shadow readiness achieved for local operator-run pilot only; v0.16 does not expand that into runtime behavior.


## v0.16.6 hardening

Tiny passive pilot input is restricted to one package `fixtures/` `.txt` sample file. External paths, package docs/evidence/metadata, directories, non-text fixtures, symlink input files, and symlink parent escapes are rejected before read.
