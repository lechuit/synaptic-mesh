# Synaptic Mesh v0.5.1 status snapshot

Status: Adapter reproducibility hardening for the read-only local-file adapter. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Included adapter gate

- `test:read-only-local-file-adapter-reproducibility`
  - runs the same explicit already-redacted local file through the adapter twice;
  - excludes volatile `generatedAt`, `durationMs`, `runId`, and temporal `adapterRunId` from normalized hashes;
  - requires the same normalized adapter evidence output;
  - requires the same DecisionTrace hash;
  - requires the same advisory report normalized-content hash;
  - binds input digest, source artifact digest, selected route, reason codes, classifier decision digest, record-only flags, capability flags, and boundary verdicts into the normalized hash.

## Expected v0.5.1 evidence

```json
{
  "readOnlyLocalFileAdapterReproducibility": "pass",
  "runs": 2,
  "positiveCases": 1,
  "normalizedOutputMismatches": 0,
  "decisionTraceHashMismatches": 0,
  "advisoryReportHashMismatches": 0,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0
}
```

## Boundary

The package remains a local read-only adapter review artifact only.

Not included:

- generalized adapter behavior;
- MCP, A2A, LangGraph, GitHub bot, framework SDK, watcher, or daemon;
- directory scan, glob, traversal, symlink escape, URL input, or network input;
- live traffic/log/session reads;
- raw unredacted input processing or persistence;
- runtime/tool execution;
- memory/config writes;
- external publication;
- agent-instruction writes or automatic agent consumption;
- approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement;
- production, safety-certification, or L2+ operational claims.

A passing reproducibility gate is evidence of deterministic local record-only output, not runtime authorization.

## Local validation

From repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-reproducibility
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.1
```
