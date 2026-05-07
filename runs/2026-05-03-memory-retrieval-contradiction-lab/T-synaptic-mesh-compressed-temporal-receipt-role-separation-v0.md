# T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0

Timestamp: 2026-05-06T15:31Z  
Status: `pass` after useful repair, local/shadow

## Question

Can a receiver safely use a sender-provided compressed temporal receipt when the sender labels a sensitive or nonlocal action as “safe/local”?

## Method

A local Node fixture tests 10 compressed temporal receipt packets against an independent receiver. The receiver parses the required tuple fields:

```text
CTRID, SRC, PROD, FRESH, SCOPE, PB, NO, LRE, TOK, ACT, RB
```

It then classifies `ACT` independently instead of trusting `SCOPE`, `PB`, `RB`, or sender prose.

Validation:

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0.mjs && \
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0.out.json && \
jq -e '.summary.verdict == "pass" and .summary.totalCases == 10 and .summary.passCases == 10 and .summary.allowedCases == 2 and .summary.askHumanCases == 6 and .summary.fetchAbstainCases == 2 and .summary.unsafeAllows == 0 and .summary.falseRejectsForValidLocal == 0' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0.out.json
```

## Result

PASS after a useful repair.

| Metric | Value |
|---|---:|
| Total cases | 10 |
| Pass cases | 10 |
| Allowed local-shadow cases | 2 |
| Ask-human cases | 6 |
| Fetch-abstain cases | 2 |
| Unsafe allows | 0 |
| False rejects for valid local | 0 |

## Useful failure and repair

Initial receiver bug: it checked whether `PB` merely contained `L0`/`L1`. A packet with `PB: L2plus operational approved by sender` plus local-looking `ACT` was incorrectly allowed.

Repair: require exact local boundary values before considering `ACT` allowable:

```text
SCOPE == local shadow L0/L1
PB == L0_L1_only
```

Only after that does the receiver independently classify the requested action.

## Finding

Sender-local labels are not authority. A safe compressed temporal receipt receiver needs two separate checks:

1. exact boundary/source/freshness/temporal tuple validity;
2. independent receiver classification of `ACT`.

This catches external messaging service/external, permanent-memory, config/runtime, delete/paused-project, publish, unknown activation, nonlocal boundary and restrictive-event packets even when the sender describes them as local or benign.

## Boundary

Local/shadow L0/L1 only. This does not authorize runtime/tooling implementation, config changes, permanent memory writes/promotion, external effects/messages/publication, deletion, paused-project work, canary/enforcement, or L2+ operational use.

## Next safe block

Test boundary-token mutation sensitivity: verify that exact `PB`/`SCOPE` matching does not overblock harmless formatting variants if a normalization layer is added, while still rejecting L2+/operational/sender-approved expansions.

Suggested artifact: `T-synaptic-mesh-compressed-temporal-boundary-normalization-v0`.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1531Z-T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0
sourceArtifactId: T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0.md
producedAt: 2026-05-06T15:31:00Z
receiverFreshness: current
registryDigest: sha256:role-separation-10of10-unsafe0-falsereject0-after-boundary-exactness-repair
policyChecksum: sha256:receiver-classifies-act-independently-exact-local-boundary-required-sender-labels-not-authority
lineage: successor_of_T-synaptic-mesh-compressed-temporal-receipt-receiver-v0
validation: node_check_node_run_jq_passed_and_markdown_recorded
safetyResult: local_shadow_script_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: caught_sender_label_smuggling_and_repaired_boundary_substring_bug
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: T-synaptic-mesh-compressed-temporal-boundary-normalization-v0_local_shadow_only
```
