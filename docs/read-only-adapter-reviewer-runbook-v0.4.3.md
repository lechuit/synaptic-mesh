# v0.4.3 — Read-only adapter reviewer runbook

Status: pass local design/runbook
Scope: human review guide only; no real adapter implementation

## Phase

**Read-only adapter boundary, design-first**

Guide phrase:

> Antes de conectar Synaptic Mesh a un framework, demostrar que un adapter no puede convertirse en fuente de acción.

## What a read-only adapter is

A read-only adapter is a narrow evidence-shaping boundary. It may take an explicit, already-redacted local input and produce human-reviewable evidence records.

Allowed shape:

```text
explicit redacted local input
→ parserEvidence
→ descriptive classifierDecision
→ DecisionTrace
→ human-readable advisory/report package
```

The adapter is a record producer. It is not a runtime actor.

## What a read-only adapter is not

A read-only adapter is not:

- a tool runner;
- a memory writer or memory promotion path;
- a config reader/writer beyond declared local contract files;
- a publisher;
- an approval emitter;
- a block/allow/enforcement engine;
- a policy generator for runtime consumption;
- an instruction source for agents;
- a live traffic watcher;
- a daemon;
- an MCP, LangGraph, GitHub bot, A2A, webhook, or framework integration.

## Review checklist

A reviewer should reject the adapter/package if any answer is not clearly “yes” for the safe side.

### Input boundary

- [ ] Input is one or more explicit local fixtures/files.
- [ ] Input is already redacted.
- [ ] No raw unredacted input is read.
- [ ] No live traffic is read.
- [ ] No implicit channel/session/runtime stream is observed.

### Output boundary

- [ ] Output is evidence-only.
- [ ] Output is human-reviewable.
- [ ] Output has no executable directive.
- [ ] Output has no agent-consumed instruction.
- [ ] Output has no machine-readable policy decision intended for runtime.
- [ ] Output has no approval, block, allow, or enforcement authority.

### Effect boundary

- [ ] No tool execution.
- [ ] No memory write or promotion.
- [ ] No config write.
- [ ] No external publication/message.
- [ ] No delete.
- [ ] No daemon/watcher/background integration.
- [ ] No framework integration.

### Reproducibility boundary

- [ ] Same redacted input yields same evidence shape.
- [ ] Same redacted input yields same DecisionTrace.
- [ ] Same redacted input yields same advisory result.
- [ ] Same redacted input yields same digest.
- [ ] Nondeterministic metadata is stripped/quarantined before digesting.
- [ ] Authority or agent-instruction leaks are rejected, not normalized.

## What `pass` means

`pass` means the reviewed artifact stayed inside the current design boundary:

- it used redacted local evidence only;
- it emitted record-only evidence;
- it did not create tool/memory/config/publication/approval/block/allow/enforcement authority;
- it remained reproducible under the v0.4.2 drift gate;
- negative misuse cases from v0.4.1 had `unexpectedAccepts: 0`.

## What `pass` does not mean

`pass` does **not** mean:

- a real adapter is authorized;
- framework integration is authorized;
- live traffic can be read;
- a tool can be executed;
- memory/config can be written;
- an approval can be emitted;
- a block/allow decision can be emitted;
- runtime enforcement is safe;
- the report can be consumed automatically by agents;
- publication is authorized.

## When to reject an adapter/package

Reject immediately if it:

1. reads raw/unredacted input;
2. reads live traffic without explicit future opt-in and review;
3. writes outside declared evidence artifacts;
4. emits commands, instructions, approvals, block/allow, policy, or enforcement decisions;
5. uses nondeterministic timestamps/IDs in digests;
6. treats source resolution as permission to act;
7. tries to connect to MCP, LangGraph, GitHub, A2A, webhook, watcher, daemon, or runtime;
8. claims that advisory evidence authorizes action;
9. asks to write memory/config or publish externally;
10. requires human decision but proceeds anyway.

## Reviewer verdict template

```json
{
  "readOnlyAdapterReviewerRunbook": "pass",
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

## Decision

v0.4.3 passes as a human reviewer runbook. It is documentation/guidance only and does not authorize a real adapter.

Next allowed local-only step: `v0.4.4 — simulated read-only adapter`, still fake/local/redacted only, to test the adapter-shaped flow:

```text
adapter-shaped input
→ parserEvidence
→ classifierDecision
→ DecisionTrace
→ advisory report
```

## HandoffReceipt

```authority-receipt
receiptId: AR-20260513T1125CL-read-only-adapter-reviewer-runbook-v043
sourceArtifactId: read-only-adapter-reviewer-runbook-v0.4.3
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/read-only-adapter-reviewer-runbook-v0.4.3.md
producedAt: 2026-05-13T11:25:00-04:00
receiverFreshness: current_after_v042_reproducibility_drift_gate_pass
validation: local_markdown_review_checklist_pass
state: v0.4.3_adapter_reviewer_runbook_passed_design_guidance_only
retainedRule: pass_means_record_only_evidence_boundary_not_adapter_or_action_authorization
nextAllowedAction: v0.4.4_simulated_read_only_adapter_fake_local_redacted_only
promotionBoundary: no_real_adapter_no_framework_no_live_traffic_no_tool_execution_no_memory_no_config_no_publication_no_approval_no_block_allow_no_enforcement_no_external_no_delete_no_paused_projects
```
