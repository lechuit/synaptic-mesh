# Release Notes — Synaptic Mesh v0.4.7

Status: first real adapter design note. Design-only, manual, local, explicit/redacted input only, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After v0.4.6 closed human review of v0.4.5, v0.4.7 records the first possible real adapter design. It is deliberately the most boring adapter shape:

```text
read-only local-file adapter
input: one explicit already-redacted local file
output: evidence record-only
```

This release authorizes design discussion only. It does not authorize implementation.

## Highlights since the previous release

- Added `docs/first-real-adapter-design-note-v0.4.7.md`.
- Added `docs/status-v0.4.7.md`.
- Added `implementation/synaptic-mesh-shadow-v0/tests/first-real-adapter-design-note.mjs`.
- Added fixture/evidence for the v0.4.7 design note.
- Wired the new gate into local `check` and `release:check` validation.

## Expected v0.4.7 evidence

```json
{
  "firstRealAdapterDesignNote": "pass",
  "releaseLayer": "v0.4.7",
  "basedOnHumanReview": "v0.4.6",
  "candidateAdapter": "read_only_local_file_adapter",
  "designOnly": true,
  "implementationAuthorized": false,
  "goToHazardCatalog": true,
  "goToV050AlphaImplementation": false,
  "requiresMaintainerDecisionForImplementation": true,
  "inputLimit": "one_explicit_already_redacted_local_file",
  "outputLimit": "evidence_record_only"
}
```

## Conservative release statement

`v0.4.7` proves only that the design note checks pass against committed docs/evidence. It does not add v0.5.0-alpha implementation, a real adapter, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob, directory traversal, symlink escape, URL input, network call, live traffic reads, raw input persistence, runtime integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.4.7
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not implemented.
- Not production/enforcement/L2+ ready.
- The design note remains review evidence, not an action source. Advisory no es authority.
- Next allowed step: `v0.4.8 — adapter implementation hazard catalog`.
- Do not implement `v0.5.0-alpha` or any real adapter without explicit maintainer approval.
