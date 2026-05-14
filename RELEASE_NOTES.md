# Release Notes — Synaptic Mesh v0.5.1

Status: adapter reproducibility hardening for the read-only local-file adapter. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

This release makes the first real adapter boring in a more testable way: the same explicit already-redacted local file must produce the same normalized evidence, DecisionTrace hash, advisory report hash, and scorecard-style summary across repeated local runs.

## Highlights

- Added `test:read-only-local-file-adapter-reproducibility`.
- Added committed reproducibility evidence for two adapter runs over the same explicit already-redacted source fixture.
- Normalized hashes exclude volatile `generatedAt`, `durationMs`, `runId`, and temporal `adapterRunId`.
- Normalized hashes include input digest, source artifact digest, source artifact content digest, selected route, reason codes, classifier decision digest, DecisionTrace hash, advisory report normalized content, record-only flag, capability flags, and boundary verdicts.
- Wired the reproducibility gate into package scripts and release checks.
- Added `docs/status-v0.5.1.md`.

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

## Conservative release statement

`v0.5.1` proves only that the committed local adapter reproducibility gate passes for one explicit already-redacted local file. It does not add runtime authorization, enforcement, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob, directory traversal, symlink escape, URL input, network calls, live traffic reads, raw input persistence, runtime integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, deletion, retention scheduling, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.1
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not a general adapter.
- Not production/enforcement/L2+ ready.
- The reproducibility gate is evidence of deterministic local record-only output, not runtime authorization.
- Advisory no es authority.
