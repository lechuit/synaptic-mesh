# Synaptic Mesh v0.18.5

Status: **live-read gate release candidate**. This is not runtime authority, not production/canary/enforcement-ready, and not deployment approval.

## Scope

This release candidate crosses the first live barrier in a controlled way: one-shot live input ingestion/read-only observation from one explicit repo-local source.

It adds:

- `live-read-gate` source and CLI;
- bounded record ingestion (`maxRecords: 12`);
- real repo-local source requirement for positive live-read evidence;
- redaction-before-persist evidence packets;
- negative controls for forbidden capabilities;
- reviewer package and two independent local review notes;
- release-check integration for `v0.18.5`.

## Validation expected

From this release-candidate root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.18.5
```

Expected:

- live input ingestion read gate: pass;
- `rawPersisted: false`;
- `rawOutput: false`;
- `policyDecision: null`;
- `agentConsumedOutput: false`;
- `unexpectedPermits: 0`;
- all forbidden capability controls remain false/rejected.

## Publication boundary

This archive is a public review package update. Enforcement, authorization, approval/block/allow, runtime/tooling integration, autonomous live mode, watcher/daemon behavior, network/resource fetch, memory/config writes, external effects, production/canary operation, or L2+ operational use remain out of scope and require a separate explicit maintainer decision.

## Review wording

Use “two independent local reviews” for the review evidence. Do not describe them as GitHub UI reviews or deployment approvals.
