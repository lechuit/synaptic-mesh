# Release Notes — Synaptic Mesh v0.4.5

Status: read-only adapter boundary public review package. Manual, local, explicit/redacted input only, record-only, no effects. Not runtime-ready; not production/enforcement-ready.

## Why this release

After the v0.3.x advisory public review package, v0.4.5 closes a design-first phase for a read-only adapter boundary. The goal is deliberately narrow: demonstrate that an adapter-shaped boundary can produce human-reviewable evidence without becoming a source of action.

Guide phrase:

> Antes de conectar Synaptic Mesh a un framework, demostrar que un adapter no puede convertirse en fuente de acción.

## Highlights since v0.3.5

- Added v0.4.0-alpha read-only adapter boundary contracts.
- Added v0.4.1 misuse/failure catalog with `unexpectedAccepts: 0`.
- Added v0.4.2 reproducibility/drift gate for stable adapter-shaped evidence.
- Added v0.4.3 reviewer runbook for human boundary review.
- Added v0.4.4 simulated read-only adapter evidence, still fake/local/redacted only.
- Added v0.4.5 public review package and status snapshot.
- Added `test:read-only-adapter-public-review-package` to validate the v0.4.x package and forbidden-effect boundary.
- Wired the new gate into local `check` and `release:check` validation.

## Expected v0.4.5 evidence

```json
{
  "readOnlyAdapterBoundaryDesignFirstPackage": "pass",
  "v040AlphaBoundarySpec": "pass",
  "v041MisuseFailureCatalog": "pass",
  "v042ReproducibilityDriftGate": "pass",
  "v043ReviewerRunbook": "pass",
  "v044SimulatedReadOnlyAdapter": "pass",
  "realAdapterAuthorized": false,
  "frameworkIntegrationAuthorized": false,
  "liveTrafficAuthorized": false,
  "toolExecution": false,
  "memoryWrite": false,
  "configWrite": false,
  "externalPublication": false,
  "approvalEmission": false,
  "machineReadablePolicyDecision": false,
  "agentConsumed": false,
  "mayBlock": false,
  "mayAllow": false,
  "enforcement": false
}
```

## Conservative release statement

`v0.4.5` proves only that local human-readable read-only adapter boundary checks pass against committed docs/evidence. It does not add a real adapter, MCP, LangGraph, GitHub bot, watcher, daemon, live traffic reads, raw input persistence, runtime integration, tool execution, memory/config writes, external publication, publication automation, agent-instruction writes, automatic agent consumption, machine-readable policy decisions, approval paths, blocking, allowing, authorization, deletion, retention scheduler, or enforcement.

## Validation snapshot

Expected validation command:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.4.5
```

## Operational non-release status

- Not runtime/tooling integrated.
- Not live-monitoring integrated.
- Not a real adapter.
- Not production/enforcement/L2+ ready.
- The adapter-boundary package remains review evidence, not an action source. Advisory no es authority.
- Do not start `v0.5.0-alpha` or any real adapter without explicit human approval.
