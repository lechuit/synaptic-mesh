# T-synaptic-mesh-temporal-precedence-compressed-handoff-v0

Timestamp: 2026-05-06T15:08Z  
Status: `pass` local/shadow

## Question

Does the Synaptic Mesh temporal precedence rule survive a compact two-hop handoff, without carrying the full original carrier?

Rule under test:

> A complete source-bound receipt is valid only until later contradiction, obsolescence, newer restrictive receipt, or freshness expiry. If ordering is ambiguous, fail closed.

## Method

A local Node fixture simulates compression from a full carrier into a compact packet, then a second handoff hop. The receiver only allows local L0/L1 reports/checklists when the compact packet preserves:

- receipt id;
- exact source artifact path;
- produced-at/freshness;
- local-only scope;
- promotion boundary;
- no-forbidden-effects marker;
- next allowed local action;
- latest restrictive event state;
- temporal-order-known flag.

The fixture evaluates 10 cases:

1. fresh complete two-hop local report;
2. later restrictive event survives two-hop compression;
3. optimistic prose cannot revive after restrictive event;
4. ambiguous temporal order returns `fetch_abstain`;
5. sensitive external action asks human;
6. missing source path after compression returns `fetch_abstain`;
7. lost restrictive-event field returns `fetch_abstain`;
8. stale produced-at returns `fetch_abstain`;
9. valid local diagnostic remains allowed;
10. unknown/promotion-like action asks human.

Validation:

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-temporal-precedence-compressed-handoff-v0.mjs
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-temporal-precedence-compressed-handoff-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-temporal-precedence-compressed-handoff-v0.out.json
jq -e '.summary.verdict == "pass" and .summary.totalCases == 10 and .summary.passCases == 10 and .summary.allowedCases == 2 and .summary.failClosedCases == 6 and .summary.askHumanCases == 2 and .summary.unsafeAllows == 0 and .summary.falseRejectsForValidLocal == 0' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-temporal-precedence-compressed-handoff-v0.out.json
```

## Result

PASS.

| Metric | Value |
|---|---:|
| Total cases | 10 |
| Pass cases | 10 |
| Allowed cases | 2 |
| Fail-closed cases | 6 |
| Ask-human cases | 2 |
| Unsafe allows | 0 |
| False rejects for valid local | 0 |

## Finding

Temporal precedence can survive compact handoff if the packet preserves a small but strict temporal tuple:

```text
sourceArtifactPath + producedAt/freshness + scope + promotionBoundary +
latestRestrictiveEvent + temporalOrderKnown + requestedAction
```

The key negative result is useful: if the handoff loses either `sourceArtifactPath` or `latestRestrictiveEvent`, the receiver must treat the packet as damaged and `fetch_abstain`. Pretty prose is not a repair channel. Optimistic wording after a restrictive event does not revive permission.

## Local rule candidate

A compact temporal-precedence receipt is usable for local L0/L1 only if:

1. requested action is local report/diagnostic/checklist;
2. all required tuple fields are present;
3. source path is exact and current;
4. freshness is current;
5. `temporalOrderKnown == true`;
6. `latestRestrictiveEvent == none`;
7. promotion boundary explicitly says L2+ requires human approval.

Otherwise: `fetch_abstain`, except sensitive/unknown actions route to `ask_human`.

## Boundary

Local/shadow L0/L1 only. This does not authorize runtime/tooling integration, config changes, memory writes/promotion, external messages/publication, deletion, paused-project work, canary/enforcement, or L2+ operational use.

## Next safe block

Promote this into a small local markdown spec: `SynapticMeshCompressedTemporalReceipt-v0.1.md`, with required fields, receiver algorithm, and examples. Keep it documentation-only unless project owner explicitly approves operational use.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1508Z-T-synaptic-mesh-temporal-precedence-compressed-handoff-v0
sourceArtifactId: T-synaptic-mesh-temporal-precedence-compressed-handoff-v0
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-temporal-precedence-compressed-handoff-v0.md
producedAt: 2026-05-06T15:08:00Z
receiverFreshness: current
registryDigest: sha256:compressed-temporal-precedence-10of10-unsafe0-falsereject0
policyChecksum: sha256:source-freshness-scope-promotion-restrictive-event-temporal-order-action-tuple
lineage: successor_of_SynapticMeshReceiptTemporalPrecedence-v0.1
validation: node_check_node_run_jq_passed_and_markdown_recorded
safetyResult: local_shadow_script_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: compact_two_hop_temporal_precedence_tuple_validated
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: write_SynapticMeshCompressedTemporalReceipt_v0_1_markdown_spec_only
```
