# Operator Outcome Value Scorecard v0.25.5

- Scope: local manual scorecard over explicit v0.24 captured operator outcomes.
- Boundary: non-authoritative, human-readable signal only; not a policy, approval, enforcement, or runtime artifact.
- Scorecard status: VALUE_SCORECARD_COMPLETE
- Recommendation: ADVANCE_OBSERVATION_ONLY (human-readable non-authoritative signal only).
- Metrics: usefulOutcomes=2; noiseOutcomes=1; needsMoreEvidence=0; abstainUncertain=0; reviewedItemCount=3; usefulRatio=0.6667; noiseRatio=0.3333
- Safety: policyDecision: null; authorization: false; enforcement: false; toolExecution: false; agentConsumedOutput: false; externalEffects: false; rawPersisted: false; rawOutput: false
- Validation issues: none

## Scored operator outcomes
- operator-review-source-failure-allowed-explicit-threshold: label=USEFUL_FOR_REVIEW; note=Useful and redacted [REDACTED].; reasons=CLEAR_VALUE
- operator-review-useful-valid-pass-a: label=USEFUL_FOR_REVIEW; note=Useful second sample.; reasons=CLEAR_VALUE
- operator-review-useful-valid-pass-b: label=NOT_USEFUL_NOISE; note=Noisy but bounded.; reasons=LOW_SIGNAL
