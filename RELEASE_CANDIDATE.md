# Synaptic Mesh v0.1.2

Status: **adapter-contract hardening release candidate**. Not runtime-ready; not production/canary/enforcement-ready.

## Scope

This release candidate updates the public review package with local receiver-adapter contract hardening work:

- paper draft;
- specs;
- local shadow/reference implementation;
- curated reproducibility fixtures;
- adversarial authority-laundering regressions;
- Framework Adapter Matrix;
- contract-only receiver policy adapter tests;
- duplicate authority-field regressions;
- sensitive verb alias regressions;
- receiver-observed source mismatch regressions;
- bibliography and quote-check artifacts;
- reproducibility evidence;
- hardening roundup.

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

Adapter contract check:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:receiver-adapters
```

Expected:

- verdict: pass;
- cases: 53/53;
- unsafe allows: 0.

## Publication boundary

This archive is a public review package update. Runtime/tooling integration, config changes, permanent memory promotion, canary, enforcement, production, or L2+ operational use remain out of scope and require a separate explicit maintainer decision.

## Raw source cache policy

Raw downloaded source PDFs/HTML are intentionally excluded. Quote-check artifacts include exact snippets and source pointers; reviewers should retrieve primary sources from official URLs/DOIs as needed.
