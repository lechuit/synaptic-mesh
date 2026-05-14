# Synaptic Mesh v0.9.0

Status: authority confusion benchmark spec public review release `v0.9.0`; local/redacted benchmark fixture complete; no runtime, no framework integration, no authority, and no enforcement.

Current v0.9.0 status is narrower than the long-term protocol goal: this repository can support public human review of a benchmark spec for distinguishing context from permission. It does not implement runtime integration or authorize agent action.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.0
```

## v0.9.x objective

Demonstrate concrete value: a naive agent baseline should confuse context/evidence with permission on the benchmark, while Synaptic Mesh should abstain, degrade, or reject without adding runtime authority.

## Boundary

This release is for local benchmark specification, committed evidence, and human review only. No MCP adapter, no MCP server/client, no LangGraph SDK, no A2A runtime, no GitHub bot, no webhook, no framework runtime, no network call, no SDK import, no resource fetch, no live traffic, no watcher/daemon, no tools, no memory/config writes, no external publication automation, no approval path, no machine-readable policy, no automatic agent consumption, no block/allow, no authorization, no enforcement.

## Docs

- [v0.9.0 status](docs/status-v0.9.0.md)
- [Authority confusion benchmark spec](docs/authority-confusion-benchmark-spec-v0.9.0.md)
- [v0.8.5 framework integration readiness package](docs/framework-integration-readiness-public-review-package-v0.8.5.md)
