# Status v0.7.3 — simulated framework-shaped adapter reproducibility/drift

`v0.7.3` adds a local reproducibility/drift gate for the `v0.7.2` simulated framework-shaped adapter evidence.

Evidence: `test:simulated-framework-shaped-adapter-reproducibility` / `simulatedFrameworkAdapterReproducibility` runs two deterministic local reruns, reports `normalizedOutputMismatches: 0`, `baselineMismatches: 0`, and rejects eight drift controls with `unexpectedAccepts: 0` and `expectedReasonCodeMisses: 0`. It preserves the `v0.7.2` evidence metrics: two positive cases, two parserEvidence records, two classifier decisions, two DecisionTraces, two advisory reports, and classifier compactAllowed true count: 0.

Boundary: local reproducibility/drift checking only, fake local redacted fixtures only, committed record-only evidence only. No real framework integration, SDK import, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, network, live traffic, resource fetch, tool execution, memory/config write, external publication, approval emission, machine-readable policy decision, agent consumption, block/allow, authorization, or enforcement.
