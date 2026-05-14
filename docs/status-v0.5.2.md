# Synaptic Mesh v0.5.2 — Read-only local-file adapter failure catalog

Status: adapter failure catalog expansion for the read-only local-file adapter. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Scope

`v0.5.2` expands the first real adapter's boring negative surface from the baseline negative controls into a 30-case failure catalog.

The catalog focuses on rejected/prohibited adapter shapes and evidence-output hazards, including Unicode/bidi and confusable paths, mtime claims, digest mismatch claims, duplicate source-artifact claims, missing/partial redaction review records, oversized-file claims, malformed/wrong-schema claims, symlink source/output cases, path collision, and encoded traversal.

## Expected evidence

```json
{
  "readOnlyLocalFileAdapterFailureCatalog": "pass",
  "failureCases": 30,
  "unexpectedAccepts": 0,
  "sourceFilesReadForRejectedCases": 0,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0
}
```

## Boundary statement

A passing failure catalog is evidence that the listed rejected/prohibited local adapter cases stayed rejected and record-only. It is not runtime authorization.

This release does not add MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob input, network input, live traffic, multiple-file auto-discovery, tool execution, memory writes, config writes, publication automation, approval path, blocking, allowing, runtime enforcement, MemoryAtom, or MemoryStore.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-failure-catalog
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.2
```
