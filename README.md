# Synaptic Mesh v0.9.2

Status: authority confusion Synaptic Mesh comparison public review release `v0.9.2`; local comparison reduces 12/12 naive false permits to 0/12 Synaptic Mesh false permits; no runtime, no framework integration, no authority, and no enforcement.

Current v0.9.2 status is narrower than the long-term protocol goal: this repository can show a reproducible local before/after comparison for context-is-not-permission failures. It does not implement runtime integration or authorize agent action.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.2
```

## v0.9.x result so far

The naive baseline false-permits all 12 authority-confusion cases. The Synaptic Mesh comparison emits zero permits and zero false permits, preventing all 12 baseline failures in record-only evidence.

## Boundary

This release is for local benchmark comparison, committed evidence, and human review only. No MCP adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no webhook, no framework runtime, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.9.2 status](docs/status-v0.9.2.md)
- [Authority confusion Synaptic Mesh comparison](docs/authority-confusion-synaptic-comparison-v0.9.2.md)
- [Authority confusion naive baseline](docs/authority-confusion-naive-baseline-v0.9.1.md)
- [Authority confusion benchmark spec](docs/authority-confusion-benchmark-spec-v0.9.0.md)
