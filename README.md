# Synaptic Mesh v0.9.3

Status: authority confusion public demo package public review release `v0.9.3`; local/redacted evidence shows before: 12 false permits, after: 0 false permits, with 12/12 prevented false permits. No runtime, no framework integration, no authority, and no enforcement.

Current v0.9.3 status is narrower than the long-term protocol goal: this repository can show a reproducible public-review demo for context-is-not-permission failures. It does not implement runtime integration or authorize agent action.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.3
```

## v0.9.x result

The Authority Confusion Benchmark proves a concrete value claim: a naive agent-like baseline can treat context as permission and false-permit 12/12 cases, while Synaptic Mesh record-only boundary handling reduces false permits to 0/12.

## Boundary

This release is for local benchmark comparison, committed evidence, and human review only. No MCP adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no webhook, no framework runtime, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.9.3 status](docs/status-v0.9.3.md)
- [Authority confusion public demo package](docs/authority-confusion-public-demo-v0.9.3.md)
- [Authority confusion Synaptic Mesh comparison](docs/authority-confusion-synaptic-comparison-v0.9.2.md)
- [Authority confusion naive baseline](docs/authority-confusion-naive-baseline-v0.9.1.md)
- [Authority confusion benchmark spec](docs/authority-confusion-benchmark-spec-v0.9.0.md)
