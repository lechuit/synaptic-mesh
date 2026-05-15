# Synaptic Mesh v0.15.6

This is the public review release `v0.15.6`. Current v0.15.6 status is narrower than live runtime: passive live shadow readiness achieved with output boundary hardening for a local operator-run pilot only.

The v0.15.x ladder defines a disabled-by-default, human-started/manual passive observation source contract over explicit local file/sample streams and local pipe fixtures only. The harness is manual local input path only, with redaction-before-persistence, metadata/hashes for raw input, and no raw private content committed.

Boundaries: no production/live deployment, no autonomous live mode, no network/resource fetch, no SDK/framework adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot/webhook, no watcher/daemon by default, no tool execution, no memory/config writes, no agent-consumed output, no machine-readable policy decision, not runtime authority, no authorization, no external effects, and no approval/block/allow/authorization/enforcement.

Final evidence: passive live shadow readiness achieved; local operator-run pilot only; next step may be v0.16 tiny operator-run pilot; unsafeFlagsRejected: 8; redactionBeforePersistence: true; rawPersisted: false; no enforcement; no tool execution; no authorization; no daemon/watcher by default; no external effects.


## v0.15.6 hardening

Passive live shadow evidence output is restricted to package `evidence/` JSON files or `--stdout`. Path escapes, symlinked parent directories, symlinked output files, and external output paths are rejected before persistence; this preserves the no memory/config writes and no external effects boundary. Decision verbs found in local input are also sanitized before persistence so evidence stays advisory/record-only.
