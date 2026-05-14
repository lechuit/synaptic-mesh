# Synaptic Mesh v0.5.0-alpha status snapshot

Status: first read-only local-file adapter alpha. Manual, local, one explicit already-redacted input file only, record-only evidence, no effects. Not runtime-ready; not production/enforcement-ready.

## Included adapter gates

- `test:read-only-local-file-adapter-schema`
  - validates input/result schema shapes;
  - requires `sourceAlreadyRedacted: true`, a reviewed `redactionReviewRecord`, and `rawContentPersisted: false`;
  - keeps result fields record-only and non-authoritative.
- `test:read-only-local-file-adapter`
  - validates the minimal adapter skeleton;
  - reads one explicit already-redacted local file;
  - verifies source digest;
  - produces parser evidence, classifier decision digest, DecisionTrace, advisory report, and record-only local evidence;
  - does not return or persist raw classifier decisions.
- `test:read-only-local-file-adapter-negative-controls`
  - covers the 17 v0.4.8 hazard cases;
  - rejects raw input, URL/network input, directory/glob/traversal/symlink input, output escape, agent-consumed/machine-policy output, tool/memory/config/publication attempts, approval/block/allow attempts, authorization, and enforcement;
  - verifies negative cases reject before source reads.
- `test:read-only-local-file-adapter-canary`
  - validates one positive canary path through the existing local evidence pipeline;
  - keeps forbidden effects and capability flags at zero.
- `test:read-only-local-file-adapter-canary-runbook`
  - verifies the human runbook includes the required English/Spanish boundary phrases;
  - verifies explicit dependencies on PR #3 negative controls and PR #4 positive canary;
  - verifies release-check for `v0.5.0-alpha` is a PR #6/final-release gate, not a PR #5 runbook gate.

## Expected v0.5.0-alpha evidence

Schema/skeleton:

```json
{
  "readOnlyLocalFileAdapterSchema": "pass",
  "readOnlyLocalFileAdapter": "pass",
  "sourceAlreadyRedacted": true,
  "redactionReviewRecordPresent": true,
  "rawContentPersisted": false,
  "recordOnly": true,
  "rawClassifierDecisionPersisted": false
}
```

Negative controls:

```json
{
  "readOnlyLocalFileAdapterNegativeControls": "pass",
  "negativeCases": 17,
  "unexpectedAccepts": 0,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0,
  "sourceFilesRead": 0,
  "networkPrimitiveFindings": 0,
  "rawClassifierLeakFindings": 0
}
```

Positive canary:

```json
{
  "readOnlyLocalFileAdapterCanary": "pass",
  "positiveCases": 1,
  "sourceFilesRead": 1,
  "recordOnly": true,
  "parserEvidenceProduced": true,
  "classifierDecisionProduced": true,
  "decisionTraceProduced": true,
  "advisoryReportProduced": true,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0
}
```

Runbook:

```json
{
  "readOnlyLocalFileAdapterCanaryRunbook": "pass",
  "dependsOnNegativeControls": true,
  "dependsOnPositiveCanary": true,
  "releaseCheckDeferredToPr6": true,
  "missingRequiredPhrases": 0,
  "forbiddenPhraseFindings": 0,
  "recordOnly": true,
  "runtimeIntegrated": false,
  "authorizationImplemented": false,
  "enforcementImplemented": false
}
```

## Boundary

The v0.5.0-alpha package is a local read-only adapter alpha only.

Not included:

- generalized adapter behavior;
- MCP, A2A, LangGraph, GitHub bot, framework SDK, watcher, or daemon;
- directory scan, glob, traversal, symlink escape, URL input, or network input;
- live traffic/log/session reads;
- raw unredacted input processing or persistence;
- runtime/tool execution;
- memory/config writes;
- external publication;
- agent-instruction writes or automatic agent consumption;
- machine-readable policy decisions;
- approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement;
- production, safety-certification, or L2+ operational claims.

A passing adapter canary is evidence of local read-only boundary preservation, not runtime authorization.

Un canary pass del adapter prueba preservación local de frontera read-only; no autoriza runtime.

## Local validation

From repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-schema
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-negative-controls
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-canary
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:read-only-local-file-adapter-canary-runbook
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.5.0-alpha
```
