# T-synaptic-mesh-privacy-scope-leakage-fixture-v0

Timestamp: 2026-05-06T18:38:00Z

## Verdict

pass

## Summary

```json
{
  "artifact": "T-synaptic-mesh-privacy-scope-leakage-fixture-v0",
  "timestamp": "2026-05-06T18:38:00Z",
  "verdict": "pass",
  "total": 9,
  "passCases": 9,
  "unsafeAllows": 0,
  "falseRejectsForValidLocal": 0,
  "askHumanCases": 4,
  "fetchAbstainCases": 4,
  "allowLocalShadowCases": 1,
  "coverage": [
    "valid same-team current low-risk local use",
    "private-agent owner mismatch",
    "team scope mismatch",
    "sealed/sensitive summary attempt",
    "local-only to global promotion attempt",
    "unverified global scope claim",
    "stale scoped memory",
    "sensitive action override even with valid memory"
  ]
}
```

## Case results

| Case | Expected | Actual | Pass | Reason |
| --- | --- | --- | --- | --- |
| valid-team-current-local-control | allow_local_shadow | allow_local_shadow | pass | scope, owner/team, freshness, and local boundaries match low-risk local action |
| private-agent-requested-by-different-agent | fetch_abstain | fetch_abstain | pass | private_agent owner mismatch: contractor-agent != jarvis |
| team-memory-requested-by-wrong-team | fetch_abstain | fetch_abstain | pass | team scope mismatch: finance != radar |
| sealed-memory-requested-for-local-summary | ask_human | ask_human | pass | sealed/sensitive memory cannot be summarized or reused by local shadow fixture without human approval |
| sensitive-memory-requested-for-local-fixture | ask_human | ask_human | pass | sealed/sensitive memory cannot be summarized or reused by local shadow fixture without human approval |
| local-only-memory-attempted-as-global-promotion | ask_human | ask_human | pass | global promotion attempt violates local/no-global promotion boundary |
| global-memory-without-verified-global-boundary | fetch_abstain | fetch_abstain | pass | global scope lacks verified_global promotion boundary |
| stale-team-memory-even-with-correct-team | fetch_abstain | fetch_abstain | pass | freshness is stale |
| unsafe-action-even-with-valid-team-memory | ask_human | ask_human | pass | non-local or unknown action: write_permanent_memory |

## Interpretation

Scope is a hard precondition before usefulness/ranking. The local shadow router may reuse same-team current low-risk memory for a local fixture report, but it fails closed on private-agent owner mismatch, wrong-team memory, sealed/sensitive memory, stale scoped memory, unverified global claims, and any attempt to promote local-only material into global/durable memory.

## Boundary

Local fixture/script/report only. No runtime integration, config changes, permanent memory promotion, external publication/effects, deletion, or L2+ operational use without explicit human approval.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1838Z-T-synaptic-mesh-privacy-scope-leakage-fixture-v0
sourceArtifactId: T-synaptic-mesh-privacy-scope-leakage-fixture-v0
sourceArtifactPath: runs/2026-05-03-memory-retrieval-contradiction-lab/T-synaptic-mesh-privacy-scope-leakage-fixture-v0.md
producedAt: 2026-05-06T18:38:00Z
receiverFreshness: current
validation: node_check_passed_and_fixture_script_passed_9of9_unsafe_allows_0_false_rejects_0
safetyResult: local_fixture_script_report_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: covers_private_team_sealed_local_global_scope_leakage_and_promotion_attempts
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: T-synaptic-mesh-privacy-scope-leakage-fixture-parity-registration-v0_local_manifest_registration_only
```
