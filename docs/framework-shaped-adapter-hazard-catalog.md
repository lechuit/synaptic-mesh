# Framework-shaped adapter hazard catalog v0.7.1

`v0.7.1` records hazards that must reject or downgrade before any simulated framework-shaped pipeline is allowed to run.

The catalog protects the `v0.7.0-alpha` boundary from being quietly converted into real framework integration.

## Covered hazards

The gate covers 25 negative cases, including MCP server/client enablement, LangGraph SDK claims, A2A runtime, GitHub bot/webhook, network/resource fetch, tool calls/results, memory/config writes, external publication, approval, block/allow, authorization, enforcement, machine-readable policy, agent-consumed instructions, advisory consumed by agent, live traffic, watcher/daemon, directory discovery, glob input, and raw input acceptance.

## Invariant

Rejected hazard cases must not run simulated pipeline.

Hard metrics:

- `pipelineRunsForRejectedCases: 0`
- `sourceReadsForRejectedCases: 0`
- `successOutputsForRejectedCases: 0`

## Gate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-shaped-adapter-hazard-catalog
```

A pass means the listed hazards are blocked at the local fixture/evidence layer. It does not authorize real framework integration.
