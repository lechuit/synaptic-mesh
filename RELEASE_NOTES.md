# Release Notes — Synaptic Mesh v0.5.2

Status: adapter failure catalog expansion for the read-only local-file adapter. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

This release makes the first real adapter more boring under weird rejected inputs: a 30-case failure catalog confirms rejected/prohibited cases remain rejected, do not read source files, and do not gain capability/effect authority.

## Highlights

- Added `test:read-only-local-file-adapter-failure-catalog`.
- Added committed v0.5.2 failure-catalog evidence with exactly 30 rejected cases.
- Covered Unicode/bidi and confusable path variants, mtime claims, digest mismatch claim, duplicate source-artifact claim, missing/partial redaction review records, oversized-file claim, malformed/wrong-schema claims, symlink source/output cases, output collision, and encoded traversal.
- Tightened the adapter's pre-read source binding to the single approved already-redacted file and digest, so digest-mismatch claims reject before source read.
- Preserved the hard invariant: rejected/prohibited cases have `sourceFilesReadForRejectedCases: 0`.
- Wired the failure catalog into package scripts, release checks, manifest, README, and `docs/status-v0.5.2.md`.

## Expected v0.5.2 evidence

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

## Conservative release statement

`v0.5.2` proves only that the committed local adapter failure catalog passes for the listed rejected/prohibited local cases. It does not add runtime authorization, enforcement, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob input, network input, live traffic, multiple-file auto-discovery, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, MemoryAtom, MemoryStore, deletion, retention scheduling, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.2
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not a general adapter.
- Not production/enforcement/L2+ ready.
- The failure catalog is evidence of local rejected-case boundary preservation, not runtime authorization.
- Advisory no es authority.
