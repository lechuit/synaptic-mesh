
# Synaptic Mesh v0.8.5

Status: framework integration readiness public review release `v0.8.5`; go/no-go, candidate design, hazard catalog, dry-run contract, reviewer runbook, and public review package complete; no real framework adapter; **not runtime-ready**; **not production/enforcement-ready**.

Current v0.8.5 status is narrower than the long-term protocol goal: this repository can support public human review of framework-integration readiness evidence. It does not implement a real framework adapter or authorize framework integration.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.8.5
```

## v0.8.x result

Synaptic Mesh has a go/no-go decision, candidate framework adapter design, implementation hazard catalog, dry-run contract, human runbook, and public review package — but still no real framework integration.

## Boundary

This release is for public review packaging, local validation, committed evidence, and human review only. No MCP adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no webhook, no framework runtime, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.8.5 status](docs/status-v0.8.5.md)
- [Framework integration readiness public review package](docs/framework-integration-readiness-public-review-package-v0.8.5.md)
- [Framework adapter reviewer runbook](docs/framework-adapter-reviewer-runbook-v0.8.4.md)
- [Framework adapter dry-run contract](docs/framework-adapter-dry-run-contract-v0.8.3.md)
- [Framework adapter implementation hazard catalog](docs/framework-adapter-implementation-hazard-catalog-v0.8.2.md)
- [First real framework adapter design note](design-notes/first-real-framework-adapter-design-v0.8.1.md)
- [v0.8.0-alpha go/no-go record](docs/framework-integration-go-no-go-v0.8.0-alpha.md)
