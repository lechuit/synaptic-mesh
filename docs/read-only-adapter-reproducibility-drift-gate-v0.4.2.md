# v0.4.2 — Read-only adapter reproducibility / drift gate

Status: pass local design fixture
Scope: design/contract only; no real adapter implementation

## Purpose

Before any simulated or real adapter phase, a read-only adapter-shaped artifact must be reproducible. The same already-redacted local input must produce the same adapter-shaped evidence, `DecisionTrace`, advisory result, and digest.

This gate exists to prevent a read-only adapter from smuggling runtime drift into evidence through timestamps, random IDs, authority-like flags, or agent-consumed instructions.

## Fixture boundary

Input fixture:

- one explicit pre-redacted local fixture;
- no raw unredacted input;
- no live traffic;
- no tool execution;
- no memory/config writes;
- no publication/external effects;
- no approvals, block/allow decisions, enforcement, or agent instructions.

Allowed output remains human-reviewable evidence only:

- `parserEvidence`;
- `classifierDecision` as descriptive evidence, not policy authority;
- `DecisionTrace` as trace, not permission;
- advisory report as human-readable review material.

## Reproducibility rule

```text
same redacted local fixture
→ same parserEvidence
→ same descriptive classifierDecision
→ same DecisionTrace
→ same advisory report
→ same digest
```

Nondeterministic metadata must be stripped or quarantined before digesting. Authority leaks and agent instructions must reject the artifact rather than normalize it.

## Drift cases

| id | Drift attempt | Expected result |
|---|---|---|
| D01 | Add `observedAt` timestamp | quarantine nondeterministic metadata and return to baseline digest |
| D02 | Add random `runId` | quarantine nondeterministic metadata and return to baseline digest |
| D03 | Add runtime-like `decisionTrace.traceId` | replace/remove and return to content digest |
| D04 | Flip `classifierDecision.mayAllow=true` | reject as authority leak |
| D05 | Add `advisoryReport.instruction` telling an agent to proceed | reject as agent-instruction leak |

## Validation run

Timestamp: 2026-05-13 09:50 America/Santiago heartbeat cycle.

Command:

```bash
node --check read-only-adapter-reproducibility-drift-gate-v0.4.2.mjs
node read-only-adapter-reproducibility-drift-gate-v0.4.2.mjs > read-only-adapter-reproducibility-drift-gate-v0.4.2.out.json
```

Result: `pass`.

Measured result:

- repeat runs: 3;
- repeat stable: true;
- baseline digest: `sha256:5c94c5378cbdf0a8d4c283261f13c49ae23fef0420981341b54ddf5889fc091b`;
- drift cases: 5;
- drift cases passed: 5/5;
- unexpected drift accepts: 0;
- `toolExecution=false`;
- `memoryWrite=false`;
- `configWrite=false`;
- `externalPublication=false`;
- `agentConsumed=false`;
- `machineReadablePolicyDecision=false`;
- `mayBlock=false`;
- `mayAllow=false`;
- result digest: `sha256:52bca750568ce7c42a57eb56999fa26565368278aa5e328923874cada2a822f8`.

## Decision

v0.4.2 passes as a local design/contract fixture. The adapter-shaped artifact is reproducible under repeated generation, strips nondeterministic metadata back to the baseline digest, and rejects authority or instruction leaks.

This does **not** authorize a real adapter, framework integration, live traffic, tool execution, memory/config writes, publication, approvals, block/allow decisions, or enforcement.

Next allowed local-only step: `v0.4.3 — Adapter reviewer runbook`, a short human-facing guide explaining what a read-only adapter is, what it is not, how to review boundary compliance, what `pass` means, what `pass` does not mean, and when to reject an adapter.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260513T0950CL-read-only-adapter-reproducibility-drift-gate-v042
sourceArtifactId: read-only-adapter-reproducibility-drift-gate-v0.4.2
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/read-only-adapter-reproducibility-drift-gate-v0.4.2.md
producedAt: 2026-05-13T09:50:00-04:00
receiverFreshness: current_after_v041_failure_catalog_pass
validation: node_check_and_node_run_pass_digest_sha256_52bca750568ce7c42a57eb56999fa26565368278aa5e328923874cada2a822f8
state: v0.4.2_adapter_reproducibility_drift_gate_passed_design_fixture_only; repeat_stable_true; drift_cases_5_passed_5; authority_flags_false
retainedRule: same_redacted_input_must_produce_same_evidence_trace_advisory_and_digest; nondeterministic_metadata_quarantine; authority_or_agent_instruction_leaks_reject
nextAllowedAction: v0.4.3_adapter_reviewer_runbook_design_only
promotionBoundary: no_real_adapter_no_framework_no_live_traffic_no_tool_execution_no_memory_no_config_no_publication_no_approval_no_block_allow_no_enforcement_no_external_no_delete_no_paused_projects
```
