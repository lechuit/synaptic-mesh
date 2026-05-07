# T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0

Timestamp: 2026-05-06T14:51Z  
Status: `pass` local/shadow

## Question

Does a complete source-bound boundary coverage receipt remain safe when later handoff text contradicts it, marks it obsolete, supplies a newer restrictive receipt, or makes freshness ambiguous?

## Method

A local Node fixture evaluates 10 cases:

1. fresh complete receipt with no later conflict permits local report;
2. later contradiction fails closed;
3. later obsolete marker fails closed;
4. newer restrictive receipt fails closed;
5. freshness expiry after receipt fails closed;
6. ambiguous conflict ordering fails closed;
7. stale receipt fails closed even without later text;
8. source-bound receipt with sensitive action asks human;
9. fresh complete receipt permits local diagnostic;
10. later optimistic prose cannot override a restrictive event.

Decision rule:

- allow only local report/diagnostic with fresh, source-bound, structurally complete receipt and no later conflict;
- fail closed on later contradiction, obsolescence, newer restrictive receipt, freshness expiry, or ambiguous conflict order;
- ask human for sensitive actions regardless of receipt completeness.

Validation:

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0.mjs && \
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0.out.json && \
jq -e '.summary.verdict == "pass" and .summary.totalCases == 10 and .summary.passCases == 10 and .summary.allowedCases == 2 and .summary.failClosedCases == 7 and .summary.askHumanCases == 1 and .summary.unsafeAllows == 0 and .summary.falseRejectsForValidLocal == 0' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0.out.json
```

## Result

PASS.

| Metric | Value |
|---|---:|
| Total cases | 10 |
| Pass cases | 10 |
| Allowed cases | 2 |
| Fail-closed cases | 7 |
| Ask-human cases | 1 |
| Unsafe allows | 0 |
| False rejects for valid local | 0 |

## Finding

A source-bound receipt is not timeless authority. It is valid only within a temporal shadow window:

> A complete source-bound receipt is valid only until later contradiction, obsolescence, newer restrictive receipt, or freshness expiry. If ordering is ambiguous, fail closed.

Optimistic prose after a restrictive event cannot revive permission. Sensitive actions remain human-gated.

## Boundary

Local/shadow L0/L1 only. This does not authorize runtime/tooling integration, config changes, permanent memory writes/promotion, external effects/messages/publication, deletion, paused-project work, canary/enforcement, or L2+ operational use.

## Next safe block

Document a local pattern for temporal precedence / stale-shadow conflict handling in boundary receipts.

Suggested artifact: `SynapticMeshReceiptTemporalPrecedence-v0.1.md`.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1451Z-T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0
sourceArtifactId: T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-receipt-stale-shadow-conflict-v0.md
producedAt: 2026-05-06T14:51:00Z
receiverFreshness: current
registryDigest: sha256:stale-shadow-conflict-10of10-unsafe0-falsereject0
policyChecksum: sha256:complete-receipt-valid-until-later-conflict-obsolete-restrictive-expiry-ambiguous-order-abstain
lineage: successor_of_T-synaptic-mesh-boundary-coverage-receipt-source-binding-v0_and_SynapticMeshBoundaryCoverageReceipt-v0.1
validation: node_check_node_run_jq_passed_and_markdown_recorded
safetyResult: local_shadow_script_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: temporal_precedence_rule_validated_for_complete_source_bound_receipts
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: write_SynapticMeshReceiptTemporalPrecedence_v0_1_markdown_spec_only
```
