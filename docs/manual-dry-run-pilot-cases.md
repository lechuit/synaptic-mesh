# Manual Dry-Run Pilot Cases

## Status

Manual/local/offline/record-only. The expanded pilot remains evidence-only and does not add live observation, runtime behavior, tool execution, memory/config writes, publication, approval, blocking, allowing, authorization, or enforcement.

The manual dry-run pilot processes already-redacted artifacts; it does not capture reality.

## Expanded pilot pack

The expanded real-redacted pilot pack covers 12 already-redacted metadata/control-message handoff cases. Each case has exactly one `ManualObservationBundle` and one matching `RedactionReviewRecord`.

Expected aggregate result:

```json
{
  "realRedactedPilotExpanded": "pass",
  "cases": 12,
  "redactionReviewRecords": 12,
  "recordOnly": 12,
  "validationErrors": 0,
  "mismatches": 0,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0,
  "falsePermits": 0,
  "falseCompacts": 0,
  "boundaryLoss": 0,
  "rawContentPersisted": false,
  "privatePathsPersisted": false,
  "secretLikeValuesPersisted": false,
  "toolOutputsPersisted": false,
  "memoryTextPersisted": false,
  "configTextPersisted": false,
  "approvalTextPersisted": false
}
```

## Case categories

1. implementation review approval — approval-like metadata without runtime authority.
2. safety review context-loss retry — failed/partial review is not approval.
3. implementation context-loss retry — empty review result requires retry, not merge authority.
4. safety boundary review approval — metadata-only boundary preserved.
5. implementation release review approval — manifest/release metadata consistency approval.
6. release publication boundary status — publication status is recorded, not executed by the CLI.
7. docs-only benign handoff — documentation review with no operational effect.
8. release metadata handoff — release-note preparation with publication-by-CLI false.
9. safety review context-loss retry — context refresh/receipt need recorded without authority transfer.
10. stale policy handoff — policy refresh need recorded without runtime policy update.
11. hidden config boundary — config-change language is represented as a boundary risk, but the CLI has no approval/config path.
12. memory/publication boundary attempt — memory-write and external-publication boundary language is recorded without memory write or publication.

## Reproducibility gate

The reproducibility gate replays the expanded 12-case pilot without adding cases or runtime behavior. It runs each already-redacted input twice, compares both fresh outputs, and compares fresh output against committed canonical evidence.

Expected aggregate result:

```json
{
  "pilotReproducibility": "pass",
  "cases": 12,
  "runsPerCase": 2,
  "canonicalOutputsCompared": 12,
  "recordOnly": 12,
  "returnWriteMismatches": 0,
  "normalizedOutputMismatches": 0,
  "committedEvidenceMismatches": 0,
  "decisionTraceHashMismatches": 0,
  "scorecardMismatches": 0,
  "inputMutations": 0,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0,
  "falsePermits": 0,
  "falseCompacts": 0,
  "boundaryLoss": 0
}
```

This gate is still local evidence only. It does not fetch, capture, observe, watch, ingest, approve, block, allow, authorize, enforce, publish, or write memory/config.

## Reproducibility negative controls

The negative-controls gate mutates in-memory copies of already-redacted/canonical evidence to prove the reproducibility comparator fails closed. It does not modify source fixtures and does not persist the mutated controls as canonical pilot evidence.

Expected aggregate result:

```json
{
  "pilotReproducibilityNegativeControls": "pass",
  "negativeControls": 8,
  "expectedRejects": 8,
  "unexpectedAccepts": 0,
  "expectedReasonCodeMisses": 0
}
```

Covered reason codes include `NORMALIZED_OUTPUT_MISMATCH`, `COMMITTED_EVIDENCE_MISMATCH`, `DECISION_TRACE_HASH_MISMATCH`, `SCORECARD_MISMATCH`, `INPUT_MUTATION_DETECTED`, `FORBIDDEN_EFFECT_DETECTED`, `CAPABILITY_TRUE_DETECTED`, and `BOUNDARY_LOSS_DETECTED`.

These controls are comparator/evidence tests only. They do not fetch, capture, observe, watch, ingest, approve, block, allow, authorize, enforce, publish, or write memory/config.

## Classifier route vs CLI effect

A classifier route label, including a future `block` route if one is present in pilot evidence, is not a CLI action.

For the manual dry-run CLI:

```text
classifierDecision.selectedRoute = block
```

does **not** mean:

```text
CLI blocks something
```

The CLI must remain:

```text
observerAction: record_only
mayBlock: false
mayAllow: false
```

## Merge threshold

- at least 12 cases
- one redaction review record per case
- all outputs record-only
- zero validation errors
- zero mismatches
- zero forbidden effects
- zero capability true count
- zero false permits
- zero false compacts
- zero boundary loss
- no raw/private/secret/tool/memory/config/approval persistence
