# Synaptic Mesh v0.9.1

Status: authority confusion naive baseline public review release `v0.9.1`; local simulation captures 12/12 false permits from a deliberately naive baseline; no runtime, no framework integration, no authority, and no enforcement.

Current v0.9.1 status is narrower than the long-term protocol goal: this repository can show a reproducible local failure mode where context/evidence is mistaken for permission. It does not implement runtime integration or authorize agent action.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.1
```

## v0.9.x result so far

A naive baseline false-permits all 12 authority-confusion cases. This proves there is a concrete failure for Synaptic Mesh to beat, not just a protocol ceremony.

## Boundary

This release is for local benchmark simulation, committed evidence, and human review only. No MCP adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no webhook, no framework runtime, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.9.1 status](docs/status-v0.9.1.md)
- [Authority confusion naive baseline](docs/authority-confusion-naive-baseline-v0.9.1.md)
- [Authority confusion benchmark spec](docs/authority-confusion-benchmark-spec-v0.9.0.md)
