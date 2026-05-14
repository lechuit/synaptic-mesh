# Release Notes — Synaptic Mesh v0.9.3

Status: authority confusion public demo package. Local/redacted evidence only. Human review only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Packages the v0.9.x benchmark, naive baseline, and Synaptic Mesh comparison into a public-review demo.
- Shows before: 12 false permits.
- Shows after: 0 false permits.
- Shows 12/12 prevented false permits and 100% false permit reduction in local record-only evidence.
- Keeps the package human-review-only; no permit, authorization, block/allow, or enforcement path is added.

## Conservative release statement

`v0.9.3` does not add adapter code, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, SDK import, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication automation, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.9.3
```
