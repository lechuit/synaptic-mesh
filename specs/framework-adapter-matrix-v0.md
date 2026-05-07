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

| Framework shape | Receipt location | Expected source location | Proposed action location | Required fail-closed examples | Coverage status |
|---|---|---|---|---|---|
| Generic packet | `packet.receipt` or `packet.compactReceipt` | `packet.expectedSource` | `packet.proposedAction` | missing receipt, source mismatch, sensitive action | shape covered; representative fail-closed tests covered |
| LangGraph-like state | `nodeState.memoryReceipt` | `nodeState.expectedSource` | `nextToolCall` | missing state receipt, tool publish/send/config/delete, source mismatch | shape covered; representative fail-closed tests covered |
| AutoGen-like message | `message.metadata.compactAuthorityReceipt` | `message.metadata.expectedSource` | `proposedReplyAction` | sender prose claiming safe, missing metadata, external send | shape covered; representative fail-closed tests covered |
| CrewAI-like task context | `task.context.authorityReceipt` | `task.context.expectedSource` | `task.nextAction` | delegated task escalation, tool-side publish/config/delete | shape covered; representative fail-closed tests covered |
| Semantic Kernel-like planner state | `plannerState.memory.authorityReceipt` | `plannerState.memory.expectedSource` | `plannedFunctionCall` | function call crosses local boundary, stale source, missing digest | shape covered; representative fail-closed tests covered |
| MCP-like tool request | `request.metadata.authorityReceipt` | `request.metadata.expectedSource` | `request.toolCall` | network/file/config/delete tools, server-provided safe labels | shape covered; representative fail-closed tests covered |

## Adapter invariants

1. Sender labels are not authority.
2. Framework confidence/prose fields are not authority.
3. The receiver must classify the proposed action independently.
4. The receiver must compare source identity/digest against observed expectations.
5. Missing receipt fields fail closed.
6. Duplicate receipt fields fail closed.
7. Sensitive effects ask a human.
8. Contract tests do not imply runtime integration.

## Current local contract coverage

`implementation/synaptic-mesh-shadow-v0/tests/receiver-policy-adapter-contracts.mjs` currently exercises all rows above as contract-shaped packet mappings. It covers representative fail-closed cases across the matrix: missing receipts/metadata, duplicate source fields, source mismatch, missing digest, stale receipt, delegated publish/config/delete, external send, sensitive verb aliases, and framework/server prose that claims an action is safe.

The coverage is intentionally contract-level. It does not prove real framework integration or runtime enforcement.

## Next proposed tests

- Add per-framework source-observation mismatch cases using receiver-observed digest/mtime.
- Add duplicate field variants beyond `SRC` (`SCOPE`, `NO`, `ACT`, `SRCDIGEST`) per framework shape.
- Add source-observation mismatch fixtures after real receiver observation formats are clearer.
