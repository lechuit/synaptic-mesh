# Repository structure guide

Synaptic Mesh keeps protocol, implementation, research, and evidence separate so future work can scale without mixing authority claims with runtime code.

## Current top-level layout

- `specs/` — protocol contracts and stable schema-facing documentation.
- `schemas/` — formal JSON schemas for local shadow evidence records and manifest contracts; currently includes RouteDecision, ParserEvidence shape validation, the read-only local-file batch manifest schema, and the framework-shaped adapter boundary schema.
- `implementation/synaptic-mesh-shadow-v0/` — local shadow implementation, fixtures, tests, and generated evidence for the current adapter contract package.
- `research-package/` — public research notes, review worksheets, blocker ledgers, and citation support.
- `runs/` — experiment-specific artifacts kept immutable enough for reproduction.
- `evidence/` — top-level reproducibility snapshots that are intentionally separate from implementation-local evidence.
- `paper/` — manuscript-oriented material.
- `docs/` — repository operation, layout guidance, review vocabulary, full status snapshots, release ladder, and conservative coverage status that do not define runtime authority. ADRs live under `docs/adr/`; concept notes live under `docs/concepts/`.
- `design-notes/` — short implementation design notes for changes that should stay smaller than a full spec; `live-shadow-observer-v0.md` is design-only and adds no runtime observer.
- `tools/` — repo-local validation utilities, including the package-wired manifest verification and update guards.

## Architecture decisions

- [ADR 0001: Shadow receiver architecture](adr/0001-shadow-receiver-architecture.md) documents the pure core, strategy registry, contract-first evidence, manifest guard, and review-gate decisions now used by the local shadow implementation.
- [ADR 0002: Authority claim model](adr/0002-authority-claim-model.md) documents the local shadow authority-claim taxonomy, receiver verification rule, and boundary that keeps sender labels from becoming authority.
- [RouteDecision schema v0](concepts/route-decision-v0.md) documents the first formal schema and its local shadow shape-validation boundary.
- [Reason code vocabulary](reason-codes.md) documents current stable reason-code categories and representative codes without turning them into runtime authority.
- [Status snapshot v0.2.3](status-v0.2.3.md) preserves the full public-review package snapshot that used to live in the root README.
- [Release ladder](release-ladder.md) records the roadmap and explicit boundaries through the advisory-only report alpha.
- [Coverage matrix](coverage-matrix.md) separates covered, partial, pending, and out-of-scope claims before release decisions.
- [Parser normalization evidence](parser-normalization-evidence.md) documents the local-shadow bridge from raw handoffs to auditable `parserEvidence` / route-decision input shape.
- [Offline real-flow replay](real-flow-replay.md) documents naturalistic handoff replay with gold labels, scorecards, and audit logs without live observer behavior.
- [Deterministic route classifier](deterministic-route-classifier.md) documents the shadow-only classifier over parser evidence fixtures.
- [Adapter boundary for LangGraph and MCP v0](../design-notes/adapter-boundary-langgraph-mcp-v0.md) documents future adapter boundaries, prerequisites, and non-goals without adding runtime integration.
- [Manual dry-run pilot failure catalog](manual-dry-run-pilot-failure-catalog.md) documents local reject-only pilot cases that must not emit success evidence or add operational powers.
- [Manual dry-run pilot runbook](manual-dry-run-pilot-runbook.md) and [checklist](manual-dry-run-pilot-checklist.md) document the human process for running already-redacted bundles without changing the manual/local/offline/record-only boundary.
- [Manual dry-run pilot cases](manual-dry-run-pilot-cases.md) documents the expanded 12-case real-redacted pilot pack and its record-only thresholds.
- [Passive live-shadow canary runbook](passive-live-shadow-canary-runbook.md) documents the human operator process for already-redacted, opt-in canary packets while preserving passive/record-only/no-effects boundaries.
- [Framework-shaped adapter boundary](framework-shaped-adapter-boundary.md) documents fake local framework-like input shapes without adding MCP, LangGraph, A2A, GitHub bot, SDK, network, runtime, or enforcement integration.
- [Framework integration go/no-go](framework-integration-go-no-go-v0.8.0-alpha.md) records that design may proceed while real framework adapter implementation remains blocked.
- [Framework adapter candidate comparison](framework-adapter-candidate-comparison.md) compares MCP-like, LangGraph-like, A2A-like, and GitHub-bot-like candidates without authorizing implementation.
- [First real framework adapter design v0.8.1](../design-notes/first-real-framework-adapter-design-v0.8.1.md) selects the MCP read-only candidate as design-only.
- [Framework adapter implementation hazard catalog v0.8.2](framework-adapter-implementation-hazard-catalog-v0.8.2.md) records 25 implementation hazards with zero success evidence for hazard cases.
- [Framework adapter dry-run contract v0.8.3](framework-adapter-dry-run-contract-v0.8.3.md) defines framework-like local/redacted packet to local validation to record-only evidence.
- [Framework adapter reviewer runbook v0.8.4](framework-adapter-reviewer-runbook-v0.8.4.md) gives human reviewers the dry-run review process and the core phrase that dry-run evidence is not authorization.
- [Framework integration readiness public review package v0.8.5](framework-integration-readiness-public-review-package-v0.8.5.md) closes v0.8.x while preserving no real framework integration and no authorization.
- [Authority confusion benchmark spec v0.9.0](authority-confusion-benchmark-spec-v0.9.0.md) defines local/redacted context-is-not-permission benchmark cases without adding runtime authority.

## Scaling rules

1. Prefer adding new protocol contracts under `specs/` before implementation-specific fixtures depend on them.
2. Keep receiver policy core logic in `src/` pure: it should classify/evaluate packet data without filesystem, CLI, network, or evidence writes.
3. Keep IO at the edges: CLIs in `bin/`, contract/evidence writers in `tests/`, small filesystem/process adapters in `src/adapters/`, and historical outputs under `evidence/` or `runs/`.
4. Add adapter/framework mappings as narrow ports that translate framework packet shapes into the stable receiver-policy input shape; test runners may also use narrow adapters when that prevents orchestration IO from leaking into policy/core modules.
5. Avoid large file moves in behavior PRs. If a migration is needed, do it in a dedicated layout PR with manifest/evidence regeneration.
6. Keep release metadata and file inventory separate: `MANIFEST.json` is the small human-readable metadata file, while `MANIFEST.files.json` is the generated tracked-file byte/hash inventory. Run `npm run manifest:update` after tracked file changes; `npm run verify:manifest`, `npm run check`, and `npm run review:local` should fail when tracked file bytes or hashes drift.
7. Batch manifests are manifest-only contracts until an explicit adapter phase says otherwise: no batch execution yet, no discovery, no glob, no watcher/daemon, no network/live traffic, and no runtime authority.
8. Framework-shaped adapter boundaries stay fake/local/already-redacted/record-only until a later release explicitly scopes a real adapter; naming a framework shape must not imply SDK import, network use, live observer behavior, agent consumption, authorization, or enforcement.
9. Framework integration readiness records are still design/dry-run artifacts until a separate explicit authorization permits implementation; go/no-go evidence is not framework authorization.

## Suggested next package boundary

When the implementation grows past the current single package, prefer this path:

- `packages/receiver-policy-core/` for pure validators/classifiers.
- `packages/receiver-adapters/` for framework mapping ports.
- `tools/` for repo-local validation and manifest utilities.
- `evidence/` and `runs/` remain artifact stores, not import targets.
