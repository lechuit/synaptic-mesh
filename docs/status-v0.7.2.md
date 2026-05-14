# Status v0.7.2 — simulated framework-shaped adapter

`v0.7.2` adds a fake/local/already-redacted simulated framework-shaped adapter.

Evidence: `test:simulated-framework-shaped-adapter` / `simulatedFrameworkShapedAdapter` covers two positive cases (`mcp_like`, `langgraph_like`) and produces two parserEvidence records, two classifier decisions, two DecisionTraces, and two advisory reports as record-only evidence. Classifier compactAllowed true count: 0.

Boundary: simulated adapter only, fake local redacted fixtures only. No real framework integration, SDK import, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, network, live traffic, resource fetch, tool execution, memory/config write, external publication, approval emission, machine-readable policy decision, agent consumption, block/allow, authorization, or enforcement.
