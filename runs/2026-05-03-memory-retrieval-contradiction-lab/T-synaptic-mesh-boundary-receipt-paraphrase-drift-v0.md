# T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0

Timestamp: 2026-05-06T14:36Z  
Status: `pass` local/shadow

## Question

Can a Synaptic Mesh boundary-coverage receipt survive Markdown/prose paraphrase/copy damage without losing the required fields or weakening fail-closed behavior?

Required fields under test:

- `highBoundaryTotal`
- `retrievedHighBoundary`
- `missingHighBoundaryDigest`
- `coverageDecision`

## Method

The executable fixture simulates receipt transport through eight cases:

1. canonical fenced Markdown;
2. prose paraphrase with changed labels;
3. bullet/copy-damaged spacing;
4. omission of `missingHighBoundaryDigest`;
5. contradictory high-boundary counts;
6. false-complete claim with non-empty missing digest;
7. explicit incomplete/fetch-abstain wording;
8. decision synonym normalization.

The receiver parser is tolerant of benign label drift, but the decision rule is strict:

- missing required field → `fetch_abstain`;
- `retrievedHighBoundary !== highBoundaryTotal` → `fetch_abstain`;
- `missingHighBoundaryDigest !== sha256:none` → `fetch_abstain`;
- `coverageDecision !== allow_local_shadow` → `fetch_abstain`;
- only complete, internally consistent receipt → `allow_local_shadow`.

Validation:

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0.mjs && \
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0.out.json && \
jq -e '.summary.verdict == "pass" and .summary.totalCases == 8 and .summary.passCases == 8 and .summary.allowedCompleteTransports == 4 and .summary.failClosedCases == 4 and .summary.falseCompleteBlocked == 1' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0.out.json
```

## Result

PASS.

| Metric | Value |
|---|---:|
| Total cases | 8 |
| Pass cases | 8 |
| Allowed complete transports | 4 |
| Fail-closed cases | 4 |
| Omissions blocked | 2 |
| Contradictions blocked | 2 |
| False-complete blocked | 1 |

## Finding

Boundary coverage receipts can tolerate benign Markdown/prose/copy-damage only if the receiver normalizes labels while keeping exact field requirements. The safety boundary is the tuple, not the wording.

Critical rule:

> Paraphrase is acceptable only when it preserves all required fields and internal consistency. If a field is missing, softened, contradicted, or replaced by optimistic prose/checksum, fetch/abstain.

## Boundary

Local/shadow L0/L1 only. This does not authorize runtime integration, canary, enforcement, external effects, config changes, deletion, publishing, permanent memory writes, or paused-project actions.

## Next safe block

Document the local pattern as `SynapticMeshBoundaryCoverageReceipt-v0.1.md`, then test source-binding/staleness: ledger id, source path, index digest, receipt freshness, and route-family coverage should prevent source swaps or stale receipts from looking complete.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1436Z-T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0
sourceArtifactId: T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0.md
producedAt: 2026-05-06T14:36:00Z
receiverFreshness: current
registryDigest: sha256:boundary-receipt-paraphrase-drift-8of8-pass-complete4-failclosed4
policyChecksum: sha256:coverage-fields-preserved-or-fetch-abstain-no-prose-authority
lineage: successor_of_T-synaptic-mesh-boundary-coverage-receipt-v0_and_SynapticMeshRetrievalBudgetAbstention-v0.1
validation: existing_node_out_json_jq_passed_and_markdown_recorded
safetyResult: local_shadow_script_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: coverage_receipt_survives_benign_paraphrase_but_fails_closed_on_missing_or_contradictory_fields
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: write_SynapticMeshBoundaryCoverageReceipt_v0_1_markdown_spec_only
```
