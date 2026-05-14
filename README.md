# Synaptic Mesh v0.9.5

Status: authority confusion phase close public review release `v0.9.5`; local/redacted evidence shows 60/60 baseline false permits, 0/60 Synaptic Mesh false permits, and 60/60 prevented false permits. No runtime, no framework integration, no authority, and no enforcement.

Current v0.9.5 status is narrower than the long-term protocol goal: this repository proves local authority-confusion value and closes the benchmark phase. It does not implement runtime integration or authorize agent action.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.5
```

## v0.9.x result

The Authority Confusion Benchmark phase is complete: across 60 base+adversarial local/redacted cases, the naive baseline false-permits 60, while Synaptic Mesh record-only boundary handling emits 0 false permits.

## Boundary

This release is for local benchmark hardening, committed evidence, and human review only. No MCP adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no webhook, no framework runtime, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.9.5 status](docs/status-v0.9.5.md)
- [Authority confusion phase close](docs/authority-confusion-phase-close-v0.9.5.md)
- [Authority confusion adversarial hardening](docs/authority-confusion-adversarial-hardening-v0.9.4.md)
- [Authority confusion public demo package](docs/authority-confusion-public-demo-v0.9.3.md)
