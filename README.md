# Synaptic Mesh v0.7.3

Status: simulated framework-shaped adapter reproducibility/drift public review release `v0.7.3`; fake/local/already-redacted framework-shaped fixtures only; committed record-only evidence only; **not runtime-ready**; **not production/enforcement-ready**.

Current v0.7.3 status is narrower than the long-term protocol goal: this repository can rerun the v0.7.2 simulated framework-shaped adapter fixtures locally, normalize record-only review evidence, and reject drift controls. It does not implement any real framework adapter or runtime integration.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.7.3
```

## v0.7.x roadmap

- `v0.7.0-alpha` — framework adapter boundary spec.
- `v0.7.1` — framework adapter hazard catalog.
- `v0.7.2` — simulated framework-shaped adapter.
- `v0.7.3` — framework adapter reproducibility/drift gate.
- `v0.7.4` — framework adapter reviewer runbook.
- `v0.7.5` — framework adapter public review package.

## Boundary

This package is for protocol, citation, fixture, adapter-boundary design, schema, local evidence, and reference-implementation review only. No MCP adapter, no LangGraph adapter, no A2A adapter, no GitHub bot, no webhook, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.7.3 status](docs/status-v0.7.3.md)
- [Simulated framework-shaped adapter reproducibility/drift](docs/simulated-framework-shaped-adapter-reproducibility.md)
- [v0.7.2 status](docs/status-v0.7.2.md)
- [Simulated framework-shaped adapter](docs/simulated-framework-shaped-adapter.md)
