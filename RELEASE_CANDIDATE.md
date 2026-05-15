# Synaptic Mesh v0.19.5

Status: **live-adapter shadow-read release candidate**. This is not runtime authority, not production/canary/enforcement-ready, and not deployment approval.

## Scope

This release candidate crosses the next smallest safe barrier after `v0.18`: a constrained local adapter shadow-read over one explicit repo-local source.

It adds:

- `live-adapter-shadow-read` source and CLI;
- `repo-local-file-read-adapter-v0` constrained local read adapter;
- bounded window/count ingestion (`maxRecords: 12`);
- real repo-local source requirement for positive evidence;
- redaction-before-persist evidence packets;
- human-readable report evidence;
- negative controls for forbidden capabilities and unsupported/multi adapters;
- reviewer package and two independent local review notes;
- release-check integration for `v0.19.5`.

## Validation expected

From this release-candidate root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.19.5
```

Expected:

- local adapter shadow-read gate: pass;
- constrained local read adapter only;
- `rawPersisted: false`;
- `rawOutput: false`;
- `policyDecision: null`;
- `agentConsumedOutput: false`;
- `unexpectedPermits: 0`;
- all forbidden capability controls remain false/rejected.

## Publication boundary

This archive is a public review package update. Enforcement, authorization, approval/block/allow, runtime/tooling integration, autonomous live mode, watcher/daemon behavior, network/resource fetch, memory/config writes, external effects, production/canary operation, agent-consumed policy decisions, or L2+ operational use remain out of scope and require a separate explicit maintainer decision.

## Review wording

Use “two independent local reviews” for the review evidence. Do not describe them as GitHub UI reviews or deployment approvals.
