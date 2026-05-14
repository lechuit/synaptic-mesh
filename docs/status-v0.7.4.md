# Status v0.7.4 — framework-shaped adapter reviewer runbook

`v0.7.4` adds a human reviewer runbook for the framework-shaped adapter boundary.

Evidence: `test:framework-shaped-adapter-reviewer-runbook` / `frameworkShapedAdapterReviewerRunbook` verifies required phrases, sections, local review commands, and forbidden authority phrases. It also verifies the prior v0.7.x evidence chain: 25 hazard cases, `pipelineRunsForRejectedCases: 0`, `sourceReadsForRejectedCases: 0`, `successOutputsForRejectedCases: 0`, two positive simulated adapter cases, classifier compactAllowed true count: 0, two reproducibility runs, `normalizedOutputMismatches: 0`, `baselineMismatches: 0`, eight drift controls, `unexpectedAccepts: 0`, and `expectedReasonCodeMisses: 0`.

Boundary: human-readable reviewer runbook only, fake local redacted fixtures only, committed record-only evidence only. No real framework integration, SDK import, MCP server/client, LangGraph SDK, A2A runtime, GitHub bot, network, live traffic, resource fetch, tool execution, memory/config write, external publication, approval emission, machine-readable policy decision, agent consumption, block/allow, authorization, or enforcement.
