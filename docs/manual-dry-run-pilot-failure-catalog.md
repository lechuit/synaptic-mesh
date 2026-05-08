# Manual dry-run pilot failure catalog

This catalog documents bad manual dry-run pilot inputs that must fail clearly before success evidence is written.

Scope: local/manual/already-redacted inputs only. The catalog is not a live observer, runtime adapter, tool runner, memory/config writer, approval path, blocker, allower, authorization layer, or enforcement mechanism.

## Rule for rejected cases

Rejected cases may produce local reject evidence in the catalog summary only.

Rejected cases must not write normal success evidence:

- no successful `DecisionTrace`
- no normal `LiveShadowObservationResult`
- no scorecard success row
- no runtime/live/tool/memory/config/publication/approval/block/allow/authorization/enforcement effect

## Cases

| Case | Bad input | Expected reason code(s) |
| --- | --- | --- |
| 1 | Bundle without a redaction review record | `REDACTION_REVIEW_RECORD_MISSING` |
| 2 | `rawContentPersisted: true` | `RAW_CONTENT_PERSISTED` |
| 3 | `privatePathsPersisted: true` | `PRIVATE_PATH_PERSISTED` |
| 4 | `secretLikeValuesPersisted: true` | `SECRET_LIKE_VALUE_PERSISTED` |
| 5 | `toolOutputsPersisted: true` | `TOOL_OUTPUT_PERSISTED` |
| 6 | `memoryTextPersisted: true`, `configTextPersisted: true` | `MEMORY_TEXT_PERSISTED`, `CONFIG_TEXT_PERSISTED` |
| 7 | `approvalTextPersisted: true` | `APPROVAL_TEXT_PERSISTED` |
| 8 | URL input path | `URL_INPUT_FORBIDDEN` |
| 9 | Directory input path | `DIRECTORY_INPUT_FORBIDDEN` |
| 10 | Output path outside `evidence/` | `OUTPUT_PATH_OUTSIDE_EVIDENCE` |
| 11 | `mayAllow: true` | `CAPABILITY_ALLOW_FORBIDDEN` |
| 12 | `mayBlock: true` | `CAPABILITY_BLOCK_FORBIDDEN` |
| 13 | `toolExecutionAllowed: true` | `TOOL_EXECUTION_FORBIDDEN` |
| 14 | `memoryWriteAllowed: true`, `configWriteAllowed: true` | `MEMORY_WRITE_FORBIDDEN`, `CONFIG_WRITE_FORBIDDEN` |

## Evidence

Run from `implementation/synaptic-mesh-shadow-v0`:

```bash
npm run test:manual-dry-run-cli-pilot-failure-catalog
```

Expected summary shape:

```json
{
  "pilotFailureCatalog": "pass",
  "failureCases": 14,
  "expectedRejects": 14,
  "unexpectedAccepts": 0,
  "successEvidenceWrittenForRejectedCases": 0,
  "forbiddenEffects": 0,
  "capabilityTrueCount": 0
}
```

Passing this catalog means the CLI fails these bad usages locally and clearly. It does not certify production safety, runtime behavior, live traffic handling, or operational enforcement.
