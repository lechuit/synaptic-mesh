# Synaptic Mesh v0.7.0-alpha

Status: framework adapter boundary spec public review release `v0.7.0-alpha`; framework-shaped local fixture contract only; already-redacted local inputs only; record-only evidence; **not runtime-ready**; **not production/enforcement-ready**.

Current v0.7.0-alpha status is narrower than the long-term protocol goal: this repository now defines how a fake/framework-shaped input can be reduced to a local, already-redacted, no-effects artifact. It does not implement any real framework adapter or runtime integration.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.7.0-alpha
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

- [v0.7.0-alpha status](docs/status-v0.7.0-alpha.md)
- [Framework-shaped adapter boundary](docs/framework-shaped-adapter-boundary.md)
- [Repository structure guide](docs/repo-structure.md)
