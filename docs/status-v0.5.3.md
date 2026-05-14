# Synaptic Mesh v0.5.3 — Read-only local-file adapter reviewer runbook

Status: adapter reviewer runbook for the read-only local-file adapter. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Scope

`v0.5.3` adds a human reviewer runbook centered on the first real adapter. The runbook tells reviewers how to inspect the local evidence chain without treating it as operational permission.

A passing local-file adapter run is evidence of local read-only boundary preservation, not runtime authorization.

## Expected evidence

```json
{
  "readOnlyLocalFileAdapterReviewerRunbook": "pass",
  "missingRequiredPhrases": 0,
  "missingRequiredSections": 0,
  "missingCommands": 0,
  "forbiddenPhraseFindings": 0,
  "failureCases": 30,
  "sourceFilesReadForRejectedCases": 0,
  "recordOnly": true
}
```

## Boundary statement

The reviewer runbook is human-readable guidance only. It does not create machine-readable policy, agent-consumed instructions, runtime authorization, approval paths, blocking, allowing, or enforcement.

This release does not add MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob input, network input, live traffic, multiple-file auto-discovery, tool execution, memory writes, config writes, publication automation, approval path, blocking, allowing, runtime enforcement, MemoryAtom, or MemoryStore.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-reviewer-runbook
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.3
```
