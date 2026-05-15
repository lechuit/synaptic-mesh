# Synaptic Mesh v0.20.5

Status: **bounded explicit multisource shadow-read release candidate**. This is not runtime authority, not production/canary/enforcement-ready, and not deployment approval.

## Scope

This release candidate crosses the next smallest safe barrier after `v0.19`: multiple explicit repo-local file sources in one bounded operator-run shadow-read through the constrained local read adapter.

It adds:

- `bounded-multisource-shadow-read` source and CLI;
- reuse of `repo-local-file-read-adapter-v0` constrained local read adapter;
- bounded multisource ingestion (`maxSources: 3`, `maxRecordsPerSource: 5`, `maxTotalRecords: 12`);
- real repo-local source requirement for positive evidence;
- per-source isolation and per-source failure isolation;
- redaction-before-persist evidence packets;
- human-readable report evidence;
- negative controls for forbidden capabilities, globs/recursive discovery, implicit sources, outside-repo paths, symlinks, fixture positives, and excess bounds;
- reviewer package and two independent local review notes;
- release-check integration for `v0.20.5`.

## Validation expected

From this release-candidate root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.20.5
```

Expected:

- bounded explicit multisource shadow-read gate: pass;
- constrained local read adapter only;
- multiple explicit repo-local file sources;
- max sources 3;
- max records per source 5;
- max total records 12;
- per-source isolation and per-source failure isolation;
- `rawPersisted: false`;
- `rawOutput: false`;
- `policyDecision: null`;
- `agentConsumedOutput: false`;
- `unexpectedPermits: 0`;
- all forbidden capability controls remain false/rejected.

## Publication boundary

This archive is a public review package update. Enforcement, authorization, approval/block/allow, runtime/tooling integration, autonomous live mode, watcher/daemon behavior, globs/recursive discovery, implicit source discovery, network/resource fetch, memory/config writes, external effects, production/canary operation, agent-consumed policy decisions, or L2+ operational use remain out of scope and require a separate explicit maintainer decision.

## Review wording

Use “two independent local reviews” for the review evidence. Do not describe them as GitHub UI reviews or deployment approvals.
