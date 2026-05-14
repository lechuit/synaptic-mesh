# Synaptic Mesh status — v0.6.0-alpha

Status: explicit batch manifest schema alpha. Manual, local, manifest only, no batch execution yet, schema-only, explicit already-redacted file list only, record-only evidence, no batch adapter behavior.

## Scope

`v0.6.0-alpha` defines the manifest contract for a future explicit batch adapter without implementing the adapter. The goal is to allow review of the batch shape before any behavior expands beyond one file.

## Added gate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-batch-manifest-schema
```

Expected evidence:

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
  "adapterRuntimeChanged": false,
  "authorization": false,
  "enforcement": false
}
```

## Boundary statement

A passing batch manifest schema gate is evidence that the batch contract is narrow and explicit, not authorization to process multiple files.

This release is manifest only, no batch execution yet. It does not add batch adapter implementation, framework integration, runtime authorization, enforcement, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob input, network input, live traffic, multiple-file auto-discovery, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, MemoryAtom, MemoryStore, deletion, retention scheduling, or enforcement.

## Release check

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.6.0-alpha
```

## v0.6.x roadmap

- `v0.6.0-alpha` — batch manifest schema.
- `v0.6.1` — batch negative controls.
- `v0.6.2` — batch adapter canary.
- `v0.6.3` — batch reproducibility gate.
- `v0.6.4` — batch failure isolation.
- `v0.6.5` — batch public review package.

Each step must preserve the same conservative boundary unless explicitly reviewed otherwise: no directory discovery, no glob input, no watcher/daemon, no network/live traffic, no tool execution, no memory/config writes, no approval/block/allow path, no authorization, and no enforcement.
