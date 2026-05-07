# Synaptic Mesh v0.1.1

Status: **hardening release candidate**. Not runtime-ready; not production/canary/enforcement-ready.

## Scope

This release candidate updates the public review package with local hardening work:

- paper draft;
- specs;
- local shadow/reference implementation;
- curated reproducibility fixtures;
- adversarial authority-laundering regressions;
- contract-only receiver policy adapter tests;
- bibliography and quote-check artifacts;
- reproducibility evidence;
- public/private boundary audit.

## Validation expected

From this release-candidate root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

Expected:

- verdict: pass;
- commands: 13/13;
- fixture parity: 15/15;
- unsafe allow signals: 0;
- source fixture mutation: false.

## Publication boundary

This archive is a public review package update. Runtime/tooling integration, config changes, permanent memory promotion, canary, enforcement, production, or L2+ operational use remain out of scope and require a separate explicit maintainer decision.

## Raw source cache policy

Raw downloaded source PDFs/HTML are intentionally excluded. Quote-check artifacts include exact snippets and source pointers; reviewers should retrieve primary sources from official URLs/DOIs as needed.
