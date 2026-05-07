# Framework Adapter Matrix v0

Status: draft / contract-only / not runtime-ready

## Purpose

This matrix describes how Synaptic Mesh receiver-side authority receipts could map into common agent framework shapes without claiming a real runtime integration.

The goal is to make portability review concrete:

- where a compact authority receipt would live;
- where the receiver obtains expected source identity;
- where the proposed action/tool call is classified;
- what must fail closed;
- what is explicitly out of scope.

## Boundary

This document is **not**:

- a framework adapter;
- a runtime hook;
- an enforcement layer;
- production/canary/L2+ approval;
- a claim that any listed framework currently supports Synaptic Mesh.

It is a contract map for review.

## Common receiver contract

Every framework-shaped adapter must map its local packet/message/state into this receiver contract:

```json
{
  "receipt": "SRC=...; SRCPATH=...; SRCDIGEST=...; ...",
  "expectedSource": {
    "sourceArtifactId": "...",
    "sourceArtifactPath": "...",
    "sourceDigest": "..."
  },
  "proposedAction": {
    "verb": "write_doc | run_local_test | publish | send_external | ...",
    "target": "...",
    "riskTier": "low_local | sensitive | unknown"
  },
  "receiverFreshnessPolicy": {},
  "sourceFreshnessPolicy": {}
}
```

Receiver rule:

- complete/current/source-matched/local receipt + low-risk local action → `allow_local_shadow`;
- missing receipt/source mismatch/stale/restrictive/ambiguous packet → `fetch_abstain`;
- sensitive or unknown action → `ask_human`.

## Matrix

| Framework shape | Receipt location | Expected source location | Proposed action location | Required fail-closed cases | Status |
|---|---|---|---|---|---|
| Generic packet | `packet.receipt` or `packet.compactReceipt` | `packet.expectedSource` | `packet.proposedAction` | missing receipt, source mismatch, sensitive action | covered by local contract test |
| LangGraph-like state | `nodeState.memoryReceipt` | `nodeState.expectedSource` | `nextToolCall` | missing state receipt, tool publish/send/config/delete, source mismatch | covered by local contract test |
| AutoGen-like message | `message.metadata.compactAuthorityReceipt` | `message.metadata.expectedSource` | `proposedReplyAction` | sender prose claiming safe, missing metadata, external send | covered by local contract test |
| CrewAI-like task context | `task.context.authorityReceipt` | `task.context.expectedSource` | `task.nextAction` | delegated task escalation, tool-side publish/config/delete | proposed contract only |
| Semantic Kernel-like planner state | `plannerState.memory.authorityReceipt` | `plannerState.memory.expectedSource` | `plannedFunctionCall` | function call crosses local boundary, stale source, missing digest | proposed contract only |
| MCP-like tool request | `request.metadata.authorityReceipt` | `request.metadata.expectedSource` | `request.toolCall` | network/file/config/delete tools, server-provided safe labels | proposed contract only |

## Adapter invariants

1. Sender labels are not authority.
2. Framework confidence/prose fields are not authority.
3. The receiver must classify the proposed action independently.
4. The receiver must compare source identity/digest against observed expectations.
5. Missing receipt fields fail closed.
6. Duplicate receipt fields fail closed.
7. Sensitive effects ask a human.
8. Contract tests do not imply runtime integration.

## Next proposed tests

- CrewAI-like delegated task packet contract.
- Semantic Kernel-like planned function call contract.
- MCP-like tool request contract.
- Negative controls where framework metadata says `safe=true` but receipt/action boundaries disagree.
