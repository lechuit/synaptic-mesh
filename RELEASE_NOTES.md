# Release Notes — Synaptic Mesh v0.6.0-alpha

Status: explicit batch manifest schema alpha for future read-only local-file batch review. Manual, local, manifest only, no batch execution yet, schema-only, explicit already-redacted input list only, record-only evidence, no batch adapter behavior, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

This release starts the v0.6.x effectiveness/batch-readiness track by defining the narrowest possible batch contract before any behavior expands beyond one file.

## Highlights

- Added `schemas/read-only-local-file-batch-manifest.schema.json`.
- Added `implementation/synaptic-mesh-shadow-v0/fixtures/read-only-local-file-batch-manifests.json`.
- Added `test:read-only-local-file-batch-manifest-schema`.
- Added `docs/read-only-local-file-batch-manifest.md` and `docs/status-v0.6.0-alpha.md`.
- Required manual explicit already-redacted file lists with digest-bound inputs and redaction review record IDs.
- Added `maxInputCount` with a hard cap of 5.
- Kept the schema test source-read-free: `sourceFilesReadForSchemaCases: 0`.
- Kept `directoryDiscovery`, `globAllowed`, `watcherAllowed`, `daemonAllowed`, `networkAllowed`, and `liveTrafficAllowed` false.
- Preserved schema-only status: no batch adapter implementation, runtime authorization, authorization, enforcement, or agent consumption.

## Expected v0.6.0-alpha evidence

```json
{
  "readOnlyLocalFileBatchManifestSchema": "pass",
  "releaseLayer": "v0.6.0-alpha",
  "manifestOnly": true,
  "schemaOnly": true,
  "batchAdapterImplemented": false,
  "batchBehaviorAuthorized": false,
  "positiveCases": 2,
  "negativeCases": 8,
  "unexpectedAccepts": 0,
  "unexpectedRejects": 0,
  "sourceFilesReadForSchemaCases": 0,
  "maxInputCount": 5,
  "batchMode": "manual_explicit_redacted_file_list",
  "explicitInputListOnly": true,
  "directoryDiscovery": false,
  "globAllowed": false,
  "watcherAllowed": false,
  "daemonAllowed": false,
  "networkAllowed": false,
  "liveTrafficAllowed": false,
  "recordOnly": true,
  "authorization": false,
  "enforcement": false
}
```

## Conservative release statement

`v0.6.0-alpha` defines a manifest contract only; manifest only, no batch execution yet. It does not add batch adapter behavior, runtime authorization, enforcement, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob input, network input, live traffic, multiple-file auto-discovery, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, MemoryAtom, MemoryStore, deletion, retention scheduling, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.6.0-alpha
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not a batch adapter implementation.
- Not production/enforcement/L2+ ready.
- The manifest schema does not authorize the next phase.
- Advisory no es authority.
