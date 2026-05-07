# Public Release Path

This repository publishes the curated Synaptic Mesh v0.1.0-rc1 surface, not the private working tree that produced it.

## Public package name

```text
synaptic-mesh
```

## Release tag

```text
v0.1.0-rc1
```

## Included surface

- paper draft;
- protocol specs;
- local shadow/reference implementation;
- curated fixtures and reproducibility evidence;
- quote-check and bibliography artifacts;
- release/boundary documentation.

## Excluded surface

- private workspace state;
- raw source PDF/HTML caches;
- runtime/config integration;
- production/canary/enforcement paths.

## Reproducibility preflight

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

Expected:

- review-local pass 13/13;
- fixture parity 15/15;
- unsafe allow signals 0;
- source fixture mutation false.
