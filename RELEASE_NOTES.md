# Release Notes — Synaptic Mesh v0.7.3

Status: simulated framework-shaped adapter reproducibility/drift public review release. Fake/local/already-redacted fixtures only, committed record-only evidence only. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Added a reproducibility/drift gate for the v0.7.2 simulated framework-shaped adapter evidence.
- Reruns the two fake local fixture cases twice and verifies `normalizedOutputMismatches: 0` and `baselineMismatches: 0`.
- Adds eight drift controls covering summary metrics, framework kind ordering, classifier `compactAllowed`, machine-policy flags, agent consumption, authorization/enforcement flags, DecisionTrace boundary verdicts, and boundary token loss.
- Preserves `classifierCompactAllowedTrue: 0` and all operational capability outputs false.

## Conservative release statement

`v0.7.3` does not add MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, webhook, network call, resource fetch, live traffic, watcher/daemon behavior, tool execution, memory/config writes, external publication, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.7.3
```
