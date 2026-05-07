# Synaptic Mesh v0.1.0-rc1

Generated locally: 2026-05-07T02:44Z  
Bundle: `synaptic-mesh-public-review-v0-20260507-0244`  
Status: public release candidate; **not runtime-ready**; **not production/canary/enforcement-ready**.

## What this is

A public release-candidate review package for Synaptic Mesh / Multi-Agent Memory Authority Protocol: a protocol proposal for preserving authority/status/boundary receipts through multi-agent memory transforms.

Included:

- paper draft: `paper/synaptic-mesh-paper-v0.md`
- specs: `specs/`
- local shadow/reference implementation: `implementation/synaptic-mesh-shadow-v0/`
- bibliography and review artifacts: `research-package/`
- reproducibility snapshot: `evidence/`

## What this is not

- not a publication or external release;
- not production software;
- not runtime/tooling integration;
- not a safety certification;
- not an enforcement/canary/L2+ operational artifact.

## Quick local review

From this bundle root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

Expected current result: 11/11 commands pass, fixture parity 15/15, unsafe allow signals 0, source fixture mutation false.

## Citation/source policy

The bundle includes quote-check reports and bibliography metadata. It intentionally excludes raw downloaded source PDFs/HTML caches; reviewers should retrieve primary sources from their official URLs/DOIs if needed.

## Publication boundary

External publication/release still requires explicit project-owner/human approval after reviewing this bundle.
Runtime/tooling integration requires a separate explicit approval track.
