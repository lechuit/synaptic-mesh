# T-synaptic-mesh-boundary-coverage-receipt-v0

## Claim

A compact SynapticMesh contradiction-ledger receiver can detect incomplete high-boundary coverage using a tiny coverage receipt without loading the full ledger.

## Counterclaim

If the receiver cannot inspect the whole ledger, a compact receipt may create false completeness: missing high-boundary claims could be hidden by persuasive summaries or tampered counts.

## Local/shadow test

Script: `T-synaptic-mesh-boundary-coverage-receipt-v0.mjs`

The fixture reuses the 12-claim threshold-cliff ledger shape with 8 high-boundary claims, then evaluates five compact handoffs:

- `top2_fragment`
- `top5_sensitive_but_incomplete`
- `top8_missing_one_authority_gap`
- `top9_complete_high_boundary`
- `tampered_claims_complete_without_count`

Receipt fields tested:

- `highBoundaryTotal`
- `retrievedHighBoundary`
- `missingHighBoundaryDigest`
- `coverageDecision: complete | incomplete_fetch_abstain`

Receiver rule:

- if counts/digest show incomplete coverage: `fetch_abstain`
- if receipt claims completeness but retrieved high-boundary count disagrees: `fetch_abstain_receipt_mismatch`
- only truly complete high-boundary coverage may `allow_complete_local_shadow`

## Validation

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-coverage-receipt-v0.mjs
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-coverage-receipt-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-coverage-receipt-v0.out.json
jq '.summary' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-coverage-receipt-v0.out.json
```

Observed summary:

```json
{
  "ok": true,
  "highBoundaryTotal": 8,
  "incompleteReceiptsDetected": 4,
  "completeReceiptsAllowed": 1,
  "receiptMismatchBlocks": 1,
  "falseCompleteAllows": 0,
  "rule": "Coverage receipts must expose highBoundaryTotal, retrievedHighBoundary, missingHighBoundaryDigest and coverageDecision; incomplete or mismatched receipts force fetch_abstain."
}
```

## Result

Pass.

The boundary receipt detected all incomplete compact handoffs, allowed the single complete high-boundary handoff, and blocked a tampered false-complete receipt via count mismatch.

## Finding

Boundary coverage should be an explicit receipt, not an implicit property of top-k handoff text. A compact receiver does not need the whole ledger to know it lacks enough authority; it needs a verifiable coverage receipt and must fail closed on mismatch.

## Boundary

Local/shadow L0/L1 only. This does not authorize runtime/tooling, config, permanent memory, external messaging service/external effects, publication, deletion, paused projects, canary, enforcement, or L2+ operational dependence.

## Next safe block

`T-synaptic-mesh-boundary-receipt-paraphrase-drift-v0`: test whether the coverage receipt survives Markdown/prose paraphrase/copy damage without losing `highBoundaryTotal`, `retrievedHighBoundary`, `missingHighBoundaryDigest`, or fail-closed behavior.
