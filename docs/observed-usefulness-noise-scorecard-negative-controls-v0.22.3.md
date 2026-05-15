# Negative Controls v0.22.3

Negative controls prove malformed/forbidden cases do not produce `PASS_TO_HUMAN_REVIEW`:

- malformed bounds reject
- forbidden alias/capability reject
- forbidden authority classification token reject

All negative controls preserve `policyDecision: null`, `authorization: false`, `enforcement: false`, and `unexpectedPermits: 0`.
