# v0.4.8 — Adapter implementation hazard catalog

Status: pre-implementation hazard catalog only
Based on: v0.4.7 first real adapter design note
Scope: expected failure catalog; no adapter implementation

## Decision

Catalog the expected failures that must be rejected before implementing the first real read-only local-file adapter canary.

Do **not** implement the adapter in v0.4.8.

If this catalog remains green, the next possible release may be:

```text
v0.5.0-alpha — first real read-only local-file adapter canary
```

That future canary would still be limited to:

```text
read-only local-file adapter
input: one explicit already-redacted local file
output: evidence record-only
```

## Hazard cases

| id | Hazard | Expected result | Why it must fail |
|---|---|---|---|
| H01 | raw input | reject | first adapter can only accept already-redacted local files |
| H02 | URL input | reject | URL/network input expands source scope and may read live/external data |
| H03 | directory input | reject | directory input can become scan/discovery behavior |
| H04 | glob input | reject | glob can silently expand to multiple files |
| H05 | directory traversal | reject | parent traversal can escape the explicit source boundary |
| H06 | symlink escape | reject | symlink escape can bypass explicit file containment |
| H07 | output outside evidence | reject | adapter output must be evidence record-only in declared evidence path |
| H08 | agent-consumed output | reject | adapter output must remain human review evidence, not instruction |
| H09 | machine-readable policy leak | reject | adapter must not emit runtime policy or permission tokens |
| H10 | tool execution attempt | reject | adapter must not run tools |
| H11 | memory write attempt | reject | adapter must not write or promote memory |
| H12 | config write attempt | reject | adapter must not write config |
| H13 | external publication attempt | reject | adapter must not publish or message externally |
| H14 | approval attempt | reject | adapter must not emit approval tokens or approval decisions |
| H15 | block/allow attempt | reject | adapter must not make block/allow decisions |
| H16 | authorization attempt | reject | adapter must not authorize action |
| H17 | enforcement attempt | reject | adapter must not enforce action |

## Required invariant

Every hazard case must end as rejected or downgraded to inert human-review evidence.

No case may produce:

- runtime behavior;
- adapter implementation;
- MCP/A2A/LangGraph/GitHub bot/framework behavior;
- watcher/daemon behavior;
- directory scan or automatic discovery;
- network call;
- tool execution;
- memory/config write;
- external publication;
- agent instruction;
- machine-readable policy;
- approval;
- block/allow;
- authorization;
- enforcement.

## Pass result

```json
{
  "adapterImplementationHazardCatalog": "pass",
  "releaseLayer": "v0.4.8",
  "basedOnDesignNote": "v0.4.7",
  "implementationAuthorized": false,
  "goToV050AlphaCanaryIfStillGreen": true,
  "hazardCases": 17,
  "rejectedOrDowngraded": 17,
  "unexpectedAccepts": 0,
  "rawInputAllowed": false,
  "urlInputAllowed": false,
  "directoryInputAllowed": false,
  "globAllowed": false,
  "directoryTraversalAllowed": false,
  "symlinkEscapeAllowed": false,
  "outputOutsideEvidenceAllowed": false,
  "agentConsumed": false,
  "machineReadablePolicyDecision": false,
  "toolExecution": false,
  "memoryWrite": false,
  "configWrite": false,
  "externalPublication": false,
  "approvalEmission": false,
  "mayBlock": false,
  "mayAllow": false,
  "authorization": false,
  "enforcement": false
}
```

## Next allowed action

If this catalog passes and review remains green, the next possible step is `v0.5.0-alpha — first real read-only local-file adapter canary`.

That step still requires explicit release review and must stay within: one explicit already-redacted local file input, evidence record-only output, no framework/runtime/effects.
