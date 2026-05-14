# Release Notes — Synaptic Mesh v0.5.0-alpha

Status: first read-only local-file adapter alpha. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.4.8 completed the pre-implementation hazard catalog, v0.5.0-alpha adds the first minimal adapter alpha and the gates needed to keep it boring.

The adapter does not decide authority. It only orchestrates the existing local evidence pipeline for one explicit already-redacted local file.

## Highlights since v0.4.8

- Added read-only local-file adapter input/result schema gates.
- Added the minimal read-only local-file adapter skeleton.
- Added negative controls for the 17 v0.4.8 hazard cases.
- Added a one-case positive adapter canary.
- Added the read-only local-file adapter canary runbook.
- Wired schema, adapter, negative-control, canary, and runbook gates into local validation and release checks.
- Added `docs/status-v0.5.0-alpha.md`.

## Expected v0.5.0-alpha evidence

```json
{
  "readOnlyLocalFileAdapterCanary": "pass",
  "positiveCases": 1,
  "sourceFilesRead": 1,
  "recordOnly": true,
  "parserEvidenceProduced": true,
  "classifierDecisionProduced": true,
  "decisionTraceProduced": true,
  "advisoryReportProduced": true,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0
}
```

Negative controls remain green:

```json
{
  "readOnlyLocalFileAdapterNegativeControls": "pass",
  "negativeCases": 17,
  "unexpectedAccepts": 0,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0,
  "sourceFilesRead": 0
}
```

## Conservative release statement

`v0.5.0-alpha` proves only that the committed local adapter schema, skeleton, negative controls, positive canary, runbook, and release metadata checks pass. It does not add runtime authorization, enforcement, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob, directory traversal, symlink escape, URL input, network calls, live traffic reads, raw input persistence, runtime integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduling, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.0-alpha
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not a general adapter.
- Not production/enforcement/L2+ ready.
- The adapter canary is evidence of local read-only boundary preservation, not runtime authorization.
- Advisory no es authority.
