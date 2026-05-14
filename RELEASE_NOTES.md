# Release Notes — Synaptic Mesh v0.5.4

Status: adapter public review package and phase close for the read-only local-file adapter. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

This release closes the first real adapter public review phase without expanding it into runtime or framework integration.

## Highlights

- Added `docs/read-only-local-file-adapter-public-review-package.md`.
- Added `test:read-only-local-file-adapter-public-review-package`.
- Collected adapter implementation evidence, negative controls, canary, reproducibility gate, 30-case failure catalog, and reviewer runbook into one public review package.
- Preserved the public summary that the adapter is implemented but framework/runtime authority remains unauthorized.
- Wired the public review package into package scripts, release checks, manifest, README, and `docs/status-v0.5.4.md`.

## Expected v0.5.4 evidence

```json
{
  "readOnlyLocalFileAdapterPublicReviewPackage": "pass",
  "adapterImplemented": true,
  "frameworkIntegrationAuthorized": false,
  "runtimeAuthorized": false,
  "toolExecution": false,
  "memoryWrite": false,
  "configWrite": false,
  "externalPublication": false,
  "agentConsumed": false,
  "machineReadablePolicyDecision": false,
  "mayBlock": false,
  "mayAllow": false,
  "enforcement": false
}
```

## Conservative release statement

`v0.5.4` closes review of the local adapter evidence. It does not add runtime authorization, enforcement, MCP, A2A, LangGraph, GitHub bot, watcher, daemon, directory scan, glob input, network input, live traffic, multiple-file auto-discovery, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, approval paths, blocking, allowing, authorization, MemoryAtom, MemoryStore, deletion, retention scheduling, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.4
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not a general adapter.
- Not production/enforcement/L2+ ready.
- The public review package closes local evidence review only; it does not authorize the next phase.
- Advisory no es authority.
