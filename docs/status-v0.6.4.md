# Synaptic Mesh status — v0.6.4

Status: batch failure isolation. Bad digest and missing file cases fail closed; partial success does not authorize the batch, and evidence remains record-only. This is not runtime authorization or enforcement.

Gate: `test:read-only-local-file-batch-failure-isolation`.
