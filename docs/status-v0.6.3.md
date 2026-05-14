# Synaptic Mesh status — v0.6.3

Status: batch reproducibility gate. Replays the manual explicit batch canary twice and compares normalized record-only evidence hashes. Passing means deterministic local evidence, not runtime authorization.

Gate: `test:read-only-local-file-batch-reproducibility`.
