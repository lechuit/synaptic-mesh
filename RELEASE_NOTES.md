# Release Notes — Synaptic Mesh v0.5.3

Status: adapter reviewer runbook for the read-only local-file adapter. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

This release makes human review more explicit: reviewers get a runbook for inspecting the first real adapter without treating local evidence as operational permission.

## Highlights

- Added `docs/read-only-local-file-adapter-reviewer-runbook.md`.
- Added `test:read-only-local-file-adapter-reviewer-runbook`.
- Required the central boundary phrase: “A passing local-file adapter run is evidence of local read-only boundary preservation, not runtime authorization.”
- Bound the runbook to existing adapter evidence, negative controls, canary, reproducibility gate, and 30-case failure catalog.
- Wired the reviewer runbook into package scripts, release checks, manifest, README, and `docs/status-v0.5.3.md`.

## Expected v0.5.3 evidence

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

## Conservative release statement

`v0.5.3` proves only that the committed human reviewer runbook and its local evidence checks pass. It does not add runtime authorization, enforcement, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob input, network input, live traffic, multiple-file auto-discovery, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, MemoryAtom, MemoryStore, deletion, retention scheduling, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.3
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not a general adapter.
- Not production/enforcement/L2+ ready.
- The reviewer runbook is human guidance for local evidence review, not runtime authorization.
- Advisory no es authority.
