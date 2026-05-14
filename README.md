
# Synaptic Mesh v0.8.3

Status: framework adapter dry-run contract public review release `v0.8.3`; framework-like local/redacted packet to local validation to record-only evidence; no real framework adapter; **not runtime-ready**; **not production/enforcement-ready**.

Current v0.8.3 status is narrower than the long-term protocol goal: this repository can define a dry-run contract and validate boundary failures. It does not implement a real framework adapter or authorize framework integration.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.3
```

## v0.8.x roadmap

- `v0.8.0-alpha` — framework integration go/no-go record.
- `v0.8.1` — first real framework adapter design note, no implementation.
- `v0.8.2` — framework adapter implementation hazard catalog.
- `v0.8.3` — framework adapter dry-run contract.
- `v0.8.4` — framework adapter reviewer runbook.
- `v0.8.5` — framework integration readiness public review package.

## Boundary

This release is for dry-run contract validation, local fixtures, committed evidence, and human review only. No MCP adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no webhook, no framework runtime, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.8.3 status](docs/status-v0.8.3.md)
- [Framework adapter dry-run contract](docs/framework-adapter-dry-run-contract-v0.8.3.md)
- [Framework adapter implementation hazard catalog](docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md)
- [First real framework adapter design note](design-notes/first-real-framework-adapter-design-v0.8.1.md)
- [v0.8.0-alpha go/no-go record](docs/framework-integration-go-no-go-v0.8.0-alpha.md)
