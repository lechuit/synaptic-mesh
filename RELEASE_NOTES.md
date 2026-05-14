# Release Notes — Synaptic Mesh v0.6.5

Status: batch public review package closing v0.6.x. Manual, local, read-only, explicit already-redacted file batch only, digest-bound, max five inputs, record-only evidence. Not runtime-ready; not production/enforcement-ready.

## Highlights

- Added batch negative controls for forbidden discovery, glob, watcher, daemon, network/live traffic, traversal, URL/absolute paths, extra properties, unredacted flags, and over-limit batches.
- Added a manual read-only local-file batch adapter canary over three explicit already-redacted files.
- Added deterministic batch reproducibility gate.
- Added failure-isolation checks for digest mismatch and missing files.
- Added v0.6.5 public review package and status docs.

## Conservative release statement

`v0.6.5` closes the v0.6.x batch-readiness review package. It does not add runtime authorization, framework integration, watcher/daemon behavior, network input, live traffic, tool execution, memory/config writes, external publication, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, retention scheduling, deletion, or enforcement.

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.6.5
```
