# T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0

## Claim

A narrow compressed-temporal boundary normalizer can safely survive cross-source/cross-artifact handoffs if source authority is registry-bound before any boundary normalization.

## Counterclaim

Cross-source packets can launder authority: a known source label, optimistic prose, stale handoff, wrong source path, wrong digest lane, or benign-looking L0/L1 formatting may cause the receiver to allow actions that the source artifact did not actually authorize.

## Test

Run a local Node fixture with 14 compressed temporal receipt packets spanning:

- known `SynapticMeshContradictionLedger`, `MemoryAuthorityReceipt`, and `CompressedTemporalReceiptLab` source lanes;
- benign L0/L1 local-shadow formatting variants;
- source-prose-only path, unknown source label, wrong path prefix, wrong digest lane, stale freshness, missing source digest;
- L2+/operational/sender-approved expansion attempts;
- external messaging service/config/unknown actions after otherwise valid source and boundary normalization.

Validation command:

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0.mjs && \
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0.out.json && \
jq -e '.summary.verdict == "pass" and .summary.totalCases == 14 and .summary.passCases == 14 and .summary.allowedCases == 3 and .summary.askHumanCases == 3 and .summary.fetchAbstainCases == 8 and .summary.crossSourceCases == 14 and .summary.unsafeAllows == 0 and .summary.falseRejectsBenignLocal == 0' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0.out.json
```

Result: `true`.

## Result

Verdict: **pass**.

Metrics:

- 14/14 cases passed;
- 3 local-shadow allows, all known/current/source-bound/local action;
- 8 fetch-abstain cases for unknown/prose-only/wrong/stale/expanded/missing source authority;
- 3 ask-human cases for external messaging service, config, and unknown action;
- 10/10 benign boundary variants routed correctly;
- unsafe allows: 0;
- false rejects of benign local allows: 0.

## Finding

Boundary normalization must be downstream of source binding, not parallel to it.

Safe order:

1. parse exact receipt tuple;
2. verify source label against allowed source lane;
3. verify source path prefix and digest lane;
4. require current freshness;
5. reject expansive tuple hints (`L2+`, operational, runtime, enforcement/canary, production, sender-approved);
6. normalize only narrow syntactic L0/L1 local-shadow boundary variants;
7. classify `ACT` independently.

The important constraint is that a normalized boundary never promotes the action. It only removes harmless formatting drift after source authority has already survived stricter checks.

## Boundary

This remains local/shadow evidence only. It does not authorize runtime/tooling changes, config, permanent memory, external messaging service/external messages, publishing, deletion, paused-project work, canary/enforcement, production use, or L2+.

## Next safe block

`T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0`

Question: after adding source path/digest binding, what is the minimum receipt tuple that preserves source authority, temporal precedence, local boundary, forbidden effects, and independent action classification without over-bloating the handoff?

Suggested criteria:

- compare full tuple vs minimal candidate tuples;
- preserve 0 unsafe allows on source laundering/stale/sensitive cases;
- preserve 0 false rejects for known/current/local L0/L1 cases;
- measure field count/byte savings;
- stop if compression loses source path, digest, freshness, boundary, forbidden effects, or action separation.
