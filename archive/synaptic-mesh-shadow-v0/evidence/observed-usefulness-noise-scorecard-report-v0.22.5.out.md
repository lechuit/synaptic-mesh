# Observed Usefulness and Noise Scorecard v0.22.5

- Scope: passive scorecard over v0.21 positive utility pass gate outputs.
- Recommendation: advance (human-readable signal only; not authority).
- policyDecision: null; authorization: false; enforcement: false; toolExecution: false; agentConsumedOutput: false; externalEffects: false
- trueUsefulPasses: 3
- falsePasses: 0
- usefulRejects: 0
- missedUsefulPasses: 0
- noisyRejects: 6
- noiseRejected: 6
- falseValueWarnings: 0
- passPrecision: 1
- passUsefulness: 1
- reviewBurdenEstimate: low (3 queue items)

## Case observations
- useful-valid-pass-a: useful_valid_pass; classification=PASS_TO_HUMAN_REVIEW; expectedUsefulness=true; observedPass=true; reasons=none
- useful-valid-pass-b: useful_valid_pass; classification=PASS_TO_HUMAN_REVIEW; expectedUsefulness=true; observedPass=true; reasons=none
- source-failure-allowed-explicit-threshold: useful_source_failure_allowed_with_explicit_threshold; classification=PASS_TO_HUMAN_REVIEW; expectedUsefulness=true; observedPass=true; reasons=none
- noisy-private-reject: noisy_safe_reject; classification=REJECTED_NOT_READY_FOR_HUMAN_REVIEW; expectedUsefulness=false; observedPass=false; reasons=private_pattern_detected_in_positive_case
- source-failure-default-reject: source_failure_reject_default; classification=REJECTED_NOT_READY_FOR_HUMAN_REVIEW; expectedUsefulness=false; observedPass=false; reasons=source_failures_exceed_positive_gate_threshold
- malformed-bounds-reject: malformed_reject; classification=REJECTED_NOT_READY_FOR_HUMAN_REVIEW; expectedUsefulness=false; observedPass=false; reasons=records_per_source_exceeds_bound
- forbidden-alias-reject: forbidden_alias_reject; classification=REJECTED_NOT_READY_FOR_HUMAN_REVIEW; expectedUsefulness=false; observedPass=false; reasons=forbidden_summary_true:networkFetch
- borderline-insufficient-records-reject: borderline_insufficient_records_reject; classification=REJECTED_NOT_READY_FOR_HUMAN_REVIEW; expectedUsefulness=false; observedPass=false; reasons=insufficient_records_for_useful_human_review
- forbidden-authority-classification-reject: malformed_forbidden_reject; classification=REJECTED_NOT_READY_FOR_HUMAN_REVIEW; expectedUsefulness=false; observedPass=false; reasons=forbidden_authority_classification_token
