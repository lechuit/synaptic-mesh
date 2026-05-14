# Read-only local-file explicit batch manifest

## Status

Manual explicit batch manifest schema for `v0.6.0-alpha`.

This document defines a contract for listing more than one already-redacted local file. It is manifest only, no batch execution yet. It does not implement batch adapter behavior and does not authorize directory discovery, glob input, watcher/daemon behavior, network input, live traffic, runtime authorization, enforcement, or production use.

## Contract claim

The only allowed batch shape is:

`reviewed manifest → explicit list of already-redacted local file paths + sha256 digests + redaction review record IDs → future record-only review evidence`

A passing batch manifest schema gate is evidence that the batch contract is narrow and explicit, not authorization to process multiple files.

## Required manifest shape

```json
{
  "schemaVersion": "read-only-local-file-batch-manifest-v0",
  "batchMode": "manual_explicit_redacted_file_list",
  "explicitInputListOnly": true,
  "directoryDiscovery": false,
  "globAllowed": false,
  "watcherAllowed": false,
  "daemonAllowed": false,
  "networkAllowed": false,
  "liveTrafficAllowed": false,
  "recordOnly": true,
  "maxInputCount": 5,
  "inputs": [
    {
      "sourceFilePath": "implementation/synaptic-mesh-shadow-v0/fixtures/redacted/example.json",
      "sourceArtifactDigest": "sha256:fc594bd17819b1005b813cbb195e9d12195766c4b0b05d020a590180f579cb75",
      "sourceAlreadyRedacted": true,
      "redactionReviewRecordId": "rrr_redacted_example_001"
    }
  ]
}
```

## What pass means

A pass means the schema and fixtures preserve these narrow statements:

- every source is listed explicitly in `inputs`
- `maxInputCount` is present and capped at 5
- every source path must be relative, non-glob, non-URL, non-directory, and traversal-free
- every source carries a `sha256:` digest
- every source declares `sourceAlreadyRedacted: true`
- every source has a redaction review record ID
- duplicate explicit bindings reject
- `directoryDiscovery`, `globAllowed`, `watcherAllowed`, `daemonAllowed`, `networkAllowed`, and `liveTrafficAllowed` are all false
- `recordOnly` is true
- the schema test does not read source files

## What pass does not mean

A pass does not authorize:

- batch adapter implementation
- processing multiple files
- framework integration
- runtime authorization
- runtime enforcement
- MCP, A2A, LangGraph, GitHub bot, webhook, watcher, daemon, or framework SDK integration
- directory scan, glob input, multiple-file auto-discovery, URL input, network input, or live traffic
- tool execution
- memory writes, MemoryAtom, MemoryStore, or memory promotion
- config writes
- external publication or publication automation
- agent instruction writes or automatic agent consumption
- approval path, blocking, allowing, authorization, deletion, retention scheduling, or enforcement
- production readiness, safety certification, or L2+ operational use

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-batch-manifest-schema
```

Release-candidate verification for this phase:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.6.0-alpha
```

## Next phase boundary

The next phase, if any, must be explicitly authorized separately. A schema-only manifest is not permission to connect a batch adapter to agents, frameworks, runtime hooks, watchers, daemons, network sources, memory/config writers, approval paths, block/allow paths, or enforcement paths.
