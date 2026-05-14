# Synaptic Mesh v0.6.5

Status: batch public review release `v0.6.5`; manual, local, read-only, explicit already-redacted batch manifests only, digest-bound inputs, max five inputs, record-only evidence; **not runtime-ready**; **not production/enforcement-ready**.

Current v0.6.5 status is narrower than the long-term protocol goal: this repository now closes the v0.6.x batch-readiness phase with negative controls, a manual batch canary, reproducibility, failure isolation, and a public review package. It does not authorize runtime integration or automatic agent consumption.

## Validate

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.6.5
```

## v0.6.x roadmap

- `v0.6.0-alpha` — batch manifest schema.
- `v0.6.1` — batch negative controls.
- `v0.6.2` — batch adapter canary.
- `v0.6.3` — batch reproducibility gate.
- `v0.6.4` — batch failure isolation.
- `v0.6.5` — batch public review package.

## Boundary

This package is for protocol, citation, fixture, adapter-boundary design, batch-manifest schema, local batch evidence, and reference-implementation review only. No runtime integration, no tools, no memory/config writes, no external publication automation, no approval path, no block/allow, no authorization, no enforcement.

## Docs

- [v0.6.5 status](docs/status-v0.6.5.md)
- [Batch public review package](docs/read-only-local-file-batch-public-review-package.md)
- [Batch manifest contract](docs/read-only-local-file-batch-manifest.md)
