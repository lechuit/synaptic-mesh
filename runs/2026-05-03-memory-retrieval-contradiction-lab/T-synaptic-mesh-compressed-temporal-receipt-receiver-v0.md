# T-synaptic-mesh-compressed-temporal-receipt-receiver-v0

Timestamp: 2026-05-06T15:21Z  
Status: `pass` local/shadow

## Question

Can an independent receiver use `SynapticMeshCompressedTemporalReceipt-v0.1` without over-trusting compact packets?

## Method

A local Node fixture parses compact temporal receipt packets with the required fields:

```text
CTRID, SRC, PROD, FRESH, SCOPE, PB, NO, LRE, TOK, ACT, RB
```

It evaluates 12 cases:

1. clean local report;
2. clean local diagnostic;
3. missing `LRE` field;
4. restrictive event present;
5. temporal order unknown;
6. stale `PROD` timestamp;
7. fuzzy/non-local source path;
8. incomplete `NO` forbidden-effects field;
9. optimistic-prose repair attempt after restriction;
10. sensitive external action;
11. promotion-like action;
12. unknown action.

Receiver rule:

- allow local shadow only for complete, current, exact-source, local-scope tuple with `LRE=none`, `TOK=true`, complete `NO`, and local-only `ACT`;
- damaged/restrictive/stale packets return `fetch_abstain`;
- sensitive, promotion-like, or unknown actions return `ask_human`;
- optimistic prose/checksum cannot repair missing or restrictive fields.

Validation:

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-receiver-v0.mjs && \
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-receiver-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-receiver-v0.out.json && \
jq -e '.summary.verdict == "pass" and .summary.totalCases == 12 and .summary.passCases == 12 and .summary.allowedCases == 2 and .summary.failClosedCases == 7 and .summary.askHumanCases == 3 and .summary.unsafeAllows == 0 and .summary.falseRejectsForValidLocal == 0' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-receiver-v0.out.json
```

## Result

PASS.

| Metric | Value |
|---|---:|
| Total cases | 12 |
| Pass cases | 12 |
| Allowed cases | 2 |
| Fail-closed cases | 7 |
| Ask-human cases | 3 |
| Unsafe allows | 0 |
| False rejects for valid local | 0 |

## Finding

The compressed temporal receipt can be used by an independent receiver if the receiver treats it as a strict labelled tuple, not as prose authority.

Key rule:

> Independent receivers may allow local shadow only for complete current local temporal tuples; damaged/restrictive/stale packets abstain; sensitive/unknown actions ask human.

The important negative result: compactness did not require trusting summaries. The receiver stayed safe by refusing any packet with missing `LRE`, unknown `TOK`, stale `PROD`, incomplete `NO`, fuzzy `SRC`, or promotion-like `ACT`.

## Boundary

Local/shadow L0/L1 only. This does not authorize runtime/tooling implementation, config changes, permanent memory writes/promotion, external effects/messages/publication, deletion, paused-project work, canary/enforcement, or L2+ operational use.

## Next safe block

Test cross-agent role separation: a sender can provide the compressed temporal receipt, but the receiver must independently classify `ACT`, check sensitive scope, and reject/ask human if the sender labels a sensitive action as local.

Suggested artifact: `T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0`.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1521Z-T-synaptic-mesh-compressed-temporal-receipt-receiver-v0
sourceArtifactId: T-synaptic-mesh-compressed-temporal-receipt-receiver-v0
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-receiver-v0.md
producedAt: 2026-05-06T15:21:00Z
receiverFreshness: current
registryDigest: sha256:compressed-temporal-receipt-receiver-12of12-unsafe0-falsereject0
policyChecksum: sha256:strict-labeled-tuple-local-only-allows-sensitive-unknown-asks-damaged-abstains
lineage: successor_of_SynapticMeshCompressedTemporalReceipt-v0.1_and_T-synaptic-mesh-temporal-precedence-compressed-handoff-v0
validation: node_check_node_run_jq_passed_and_markdown_recorded
safetyResult: local_shadow_script_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: independent_receiver_uses_compressed_temporal_receipt_without_overtrusting_prose
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0_local_shadow_only
```
