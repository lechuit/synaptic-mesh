# Status v0.7.1 — framework adapter hazard catalog

`v0.7.1` adds a hazard catalog for attempts to turn framework-shaped fixtures into real integration.

Evidence: `test:framework-shaped-adapter-hazard-catalog` / `frameworkAdapterHazardCatalog` covers 25 hazards, rejects or downgrades all 25, keeps `unexpectedAccepts: 0`, and records `pipelineRunsForRejectedCases: 0`, `sourceReadsForRejectedCases: 0`, and `successOutputsForRejectedCases: 0`.

Boundary: hazard catalog only, record-only evidence only. No real framework integration, SDK import, network, resource fetch, tool execution, memory/config write, external publication, approval emission, block/allow, authorization, enforcement, agent consumption, or machine-readable policy decision.
