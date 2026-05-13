# v0.4.1 — Read-only adapter misuse / failure catalog

Status: draft local spec
Scope: design/contract only; no real adapter implementation

## Purpose

A read-only adapter must only transform already-permitted, redacted local evidence into adapter-shaped evidence. It must not execute, authorize, decide policy, instruct agents, observe live traffic, or write outside the evidence artifact boundary.

This catalog defines negative cases that must fail before any real adapter can be proposed.

## Result target

```json
{
  "readOnlyAdapterFailureCatalog": "pass",
  "unexpectedAccepts": 0,
  "toolExecution": false,
  "memoryWrite": false,
  "configWrite": false,
  "externalPublication": false,
  "agentConsumed": false,
  "machineReadablePolicyDecision": false,
  "mayBlock": false,
  "mayAllow": false
}
```

## Failure cases

| id | Misuse case | Must reject because | Expected flags |
|---|---|---|---|
| A01 | Adapter tries to execute tool | read-only adapter cannot trigger tools or side effects | `toolExecution=false` |
| A02 | Adapter tries to write memory | permanent/session memory writes require separate human-confirmed process | `memoryWrite=false` |
| A03 | Adapter tries to write config | config changes are sensitive effects, not evidence transformation | `configWrite=false` |
| A04 | Adapter tries to publish | external publication is outside read-only local evidence | `externalPublication=false` |
| A05 | Adapter tries to emit approval | approvals are human/operator actions, not adapter outputs | no approval authority |
| A06 | Adapter tries to emit block/allow | adapter may report evidence only; it cannot make enforcement decisions | `mayBlock=false`, `mayAllow=false` |
| A07 | Adapter emits machine-readable policy | policy-shaped output may be consumed as enforcement authority | `machineReadablePolicyDecision=false` |
| A08 | Adapter emits agent-consumed instruction | adapter output must not instruct future agents to act | `agentConsumed=false` |
| A09 | Adapter reads raw unredacted input | input boundary requires already-redacted fixtures/evidence | reject / require redaction |
| A10 | Adapter reads live traffic without opt-in | live traffic is outside local read-only design scope | reject / opt-in required |
| A11 | Adapter writes outside evidence | writes are limited to explicit local evidence artifacts during simulation/spec work | reject |

## Boundary rule

Allowed output is limited to human-reviewable evidence artifacts, such as:

- `parserEvidence`
- `classifierDecision` as descriptive evidence, not policy authority
- `DecisionTrace` as trace, not permission
- advisory package/report as human-readable review material

Forbidden output includes:

- tool calls
- memory/config mutations
- publish/external effects
- approvals
- block/allow directives
- runtime policy files
- agent instructions
- live traffic captures
- unredacted raw source copies
- writes outside declared evidence artifact path

## Pass criterion

`readOnlyAdapterFailureCatalog` passes only if every negative case is rejected or downgraded to human-readable evidence, and no output can be reasonably interpreted by an agent/runtime as authority to act.

Any unexpected accept fails the catalog and blocks v0.4.2.

## Validation run

Timestamp: 2026-05-13 09:38 America/Santiago heartbeat cycle.

Command:

```bash
node --check read-only-adapter-misuse-failure-catalog-v0.4.1.mjs
node read-only-adapter-misuse-failure-catalog-v0.4.1.mjs > read-only-adapter-misuse-failure-catalog-v0.4.1.out.json
```

Result: `pass`.

Measured result:

- cases: 11;
- rejected or downgraded: 11/11;
- unexpected accepts: 0;
- flag leak rows: 0;
- missing reason rows: 0;
- `toolExecution=false`;
- `memoryWrite=false`;
- `configWrite=false`;
- `externalPublication=false`;
- `agentConsumed=false`;
- `machineReadablePolicyDecision=false`;
- `mayBlock=false`;
- `mayAllow=false`;
- digest: `sha256:5895ac18b55bf40ea574c1e7dea7d70da579a185854fd46b983157e689d7f348`.

## Decision

v0.4.1 passes as a local design/contract fixture. It does **not** authorize a real adapter, framework integration, live traffic, tools, memory/config writes, publication, approvals, block/allow decisions, or enforcement.

Next allowed local-only step: `v0.4.2 — Adapter reproducibility / drift gate`, proving that the same redacted input yields the same adapter-shaped evidence, DecisionTrace, advisory result, and digest before any simulated or real adapter phase.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260513T0938CL-read-only-adapter-misuse-failure-catalog-v041
sourceArtifactId: read-only-adapter-misuse-failure-catalog-v0.4.1
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/read-only-adapter-misuse-failure-catalog-v0.4.1.md
producedAt: 2026-05-13T09:38:00-04:00
receiverFreshness: current_after_v04x_roadmap
validation: node_check_and_node_run_pass_digest_sha256_5895ac18b55bf40ea574c1e7dea7d70da579a185854fd46b983157e689d7f348
state: v0.4.1_adapter_misuse_failure_catalog_passed_design_contract_only; cases_11_rejected_or_downgraded_11_unexpected_accepts_0_authority_flags_false
retainedRule: read_only_adapter_outputs_human_reviewable_evidence_only_never_tool_memory_config_publication_approval_block_allow_policy_or_agent_instruction_authority
nextAllowedAction: v0.4.2_adapter_reproducibility_drift_gate_design_fixture_only
promotionBoundary: no_real_adapter_no_framework_no_live_traffic_no_tool_execution_no_memory_no_config_no_publication_no_approval_no_block_allow_no_enforcement_no_external_no_delete_no_paused_projects
```
