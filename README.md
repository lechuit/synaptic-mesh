
# Synaptic Mesh v0.8.0-alpha

Status: framework integration go/no-go public review release `v0.8.0-alpha`; design may proceed, implementation remains blocked; committed record-only evidence only; **not runtime-ready**; **not production/enforcement-ready**.

Current v0.8.0-alpha status is narrower than the long-term protocol goal: this repository can record an explicit framework integration go/no-go decision. It does not implement a real framework adapter or authorize framework integration.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.0-alpha
```

## v0.8.x roadmap

- `v0.8.0-alpha` — framework integration go/no-go record.
- `v0.8.1` — first real framework adapter design note, no implementation.
- `v0.8.2` — framework adapter implementation hazard catalog.
- `v0.8.3` — framework adapter dry-run contract.
- `v0.8.4` — framework adapter reviewer runbook.
- `v0.8.5` — framework integration readiness public review package.

## Boundary

This release is for design decision records, schema, fixtures, local validation, committed evidence, and human review only. No MCP adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no webhook, no framework runtime, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.8.0-alpha status](docs/status-v0.8.0-alpha.md)
- [Framework integration go/no-go record](docs/framework-integration-go-no-go-v0.8.0-alpha.md)
- [Repository structure](docs/repo-structure.md)
