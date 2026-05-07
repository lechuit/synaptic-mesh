# T-synaptic-mesh-compressed-temporal-boundary-normalization-v0

Timestamp: 2026-05-06T15:45Z  
Status: `pass` after useful repair, local/shadow

## Question

Can a compressed temporal receipt receiver normalize harmless `SCOPE`/`PB` formatting variants without reopening dangerous expansions like L2+, operational/runtime, enforcement/canary, or “approved by sender”?

## Method

A local Node fixture tests 12 compressed temporal receipt packets. The receiver:

1. parses the required tuple (`CTRID`, `SRC`, `PROD`, `FRESH`, `SCOPE`, `PB`, `NO`, `LRE`, `TOK`, `ACT`);
2. verifies source and current freshness;
3. rejects expansive boundary hints before action classification;
4. normalizes only a narrow allowlist of benign L0/L1 local-shadow variants;
5. independently classifies `ACT` as local-shadow, sensitive, or unknown.

Validation:

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-v0.mjs && \
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-v0.out.json && \
jq -e '.summary.verdict == "pass" and .summary.totalCases == 12 and .summary.passCases == 12 and .summary.allowedCases == 4 and .summary.askHumanCases == 3 and .summary.fetchAbstainCases == 5 and .summary.benignVariants == 8 and .summary.benignVariantPasses == 8 and .summary.unsafeAllows == 0 and .summary.falseRejectsBenignLocal == 0' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-v0.out.json
```

Result: `true`.

## Result

| Metric | Value |
|---|---:|
| Total cases | 12 |
| Pass cases | 12 |
| Allowed local-shadow cases | 4 |
| Ask-human cases | 3 |
| Fetch-abstain cases | 5 |
| Benign variants | 8 |
| Benign variant passes | 8 |
| Unsafe allows | 0 |
| False rejects for benign local | 0 |

## Useful failure and repair

Initial normalization repair was too strict in two ways:

1. it treated prohibitive `NO: no external no config no memory no delete` text as suspicious because the same words appear in sensitive actions;
2. it failed the benign `PB: only L0 + L1` variant because `+` survived compaction.

Repair:

- use a narrower expansive-hint check for tuple metadata (`L2+`, operational/runtime, enforcement/canary, production, approved-by-sender), not generic prohibition words;
- accept `onlyl0+l1` as equivalent to `onlyl0l1`.

## Finding

A small normalization layer is useful if it is asymmetric:

- tolerant for purely syntactic L0/L1 local-shadow variants (spaces, slash, hyphen, casing, `level0/level1`, word order);
- intolerant for semantic expansion terms (`L2+`, operational/runtime, enforcement/canary, production, approved-by-sender);
- never lets a normalized boundary authorize a sensitive or unknown action.

This avoids overblocking harmless receipt formatting drift while preserving the role-separation result: receiver-side action classification remains mandatory.

## Boundary

Local/shadow L0/L1 only. This does not authorize runtime/tooling implementation, config changes, permanent memory writes/promotion, external effects/messages/publication, deletion, paused-project work, canary/enforcement, or L2+ operational use.

## Next safe block

`T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0`

Goal: test whether the same narrow normalization rule survives cross-source/cross-artifact handoff packets without source laundering: allow benign variants only from known source artifacts with current freshness, fetch-abstain unknown/source-prose-only packets, and ask-human for sensitive/unknown actions even if source and boundary normalize.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1545Z-T-synaptic-mesh-compressed-temporal-boundary-normalization-v0
sourceArtifactId: T-synaptic-mesh-compressed-temporal-boundary-normalization-v0
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-v0.md
producedAt: 2026-05-06T15:45:00Z
receiverFreshness: current
registryDigest: sha256:boundary-normalization-12of12-benign8of8-unsafe0-falsereject0
policyChecksum: sha256:narrow-syntactic-normalization-expansive-terms-reject-independent-act-classification
lineage: successor_of_T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0
validation: node_check_node_run_jq_passed_and_markdown_recorded
safetyResult: local_shadow_script_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: benign_boundary_formatting_drift_tolerated_without_l2_or_sender_approval_expansion
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0_local_shadow_only
```
