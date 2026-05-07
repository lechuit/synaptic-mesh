# T-synaptic-mesh-boundary-coverage-receipt-source-binding-v0

## Hypothesis

A complete-looking Synaptic Mesh boundary coverage receipt is unsafe if it is not bound to the exact current evidence source. Compact receipts must fail closed when the ledger id, source path, retrieval-index digest, route-family coverage, or freshness window is stale, swapped, or mismatched.

## Local/shadow boundary

This is a local L0/L1 shadow microtest only. It does not authorize runtime integration, canary, enforcement, external effects, config changes, deletion, publishing, permanent memory writes, or paused-project actions. Sensitive requested actions still ask a human even when the receipt is otherwise complete.

## Method

The executable fixture evaluates nine receipt variants:

1. exact current source-bound receipt;
2. stale receipt;
3. ledger id mismatch;
4. source path swap;
5. retrieval-index digest mismatch;
6. route-family coverage mismatch;
7. complete counts but wrong source;
8. sensitive requested action;
9. valid local diagnostic/report action.

Decision rule:

- allow only local shadow/report actions with exact current ledger id, source path, retrieval-index digest, route-family set, complete boundary counts, no missing-boundary digest, and fresh timestamp;
- fail closed on stale/swapped/mismatched evidence binding;
- ask human for sensitive or unknown actions regardless of receipt completeness.

## Validation commands

```bash
node --check runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-coverage-receipt-source-binding-v0.mjs
node runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-coverage-receipt-source-binding-v0.mjs > runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-coverage-receipt-source-binding-v0.out.json
jq '.summary' runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-boundary-coverage-receipt-source-binding-v0.out.json
```

## Expected result

Pass if exact current local diagnostic/report receipts are allowed, all stale/swapped/mismatched receipts fail closed, sensitive actions ask human, and there are zero unsafe allows or false rejects for valid local diagnostics.
