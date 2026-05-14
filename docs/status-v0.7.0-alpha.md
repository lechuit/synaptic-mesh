# Status v0.7.0-alpha — framework adapter boundary spec

`v0.7.0-alpha` adds a strict schema for framework-shaped local fixture inputs only.

Evidence: `test:framework-shaped-adapter-boundary-schema` / `frameworkShapedAdapterBoundarySchema` covers two positive shape cases and ten negative controls. The schema is strict (`additionalProperties: false`) and pins all operational capability flags to `false`.

Boundary: framework-shaped only, local redacted fixture only, record-only evidence only. No MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, no network call, resource fetch, live traffic, watcher, daemon, tool call, memory/config write, publication, approval, machine-readable policy, agent consumption, block/allow, no authorization, or no enforcement.
