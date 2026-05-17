# Synaptic Mesh / Multi-Agent Memory Authority — Research Package Index v0.2

Generated: 2026-05-07T01:59Z  
Status: public research package index / post-human-review + quote-check worksheet refreshed / not runtime-ready

## Purpose

This index organizes the Synaptic Mesh / Multi-Agent Memory Authority Protocol line into a local research package map. It tracks the paper/spec/evidence/reference implementation pieces without authorizing publication, production/runtime tooling integration, config changes, permanent memory promotion, external sends, deletion, canary, enforcement, production, or L2+ operational use.

Confirmed direction: finish the current memory/Synaptic Mesh line before switching tracks, and build toward a real implementation plus publishable research package with documents, tests, specs, paper material, evidence, implementation notes, and human-reviewed release gates.

## Current readiness verdict

| Track | Status | Meaning |
|---|---|---|
| Research idea | Strong local candidate | Narrow claim, threat model, and receipt-through-transform invariants have emerged from local tests. |
| Local evidence | Green local shadow spine | Review-local gate passes, fixture parity is 15/15, unsafe allow signals are 0, source fixture mutation is false. |
| Paper/spec package | Integrated local draft | Paper draft, specs, bibliography seed, citation notes, and claim/evidence map exist; exact quote/deep-read remains before publication. |
| Minimum functional reference | Reviewable locally | README quickstart, parser/validator, CLI, synthetic handoffs, transform regression, and one-command review runner exist. |
| Human review packet | Prepared locally | Human review brief, publication blocker ledger, quote-check worksheet, and worksheet consistency validation exist. |
| Runtime/operational integration | Not authorized | Requires separate explicit human approval, safety gates, canary/rollback plan, and operational audit. |
| External publication | Not authorized | Requires quote/deep-read, final metadata, redaction/public-private audit, fresh reproducibility capture, and explicit project-owner/human approval. |

Short version: **local package and functional shadow reference are reviewable; publication and runtime remain blocked.**

## Narrow publishable claim

Synaptic Mesh is not merely agent memory, vector search, ACLs, provenance, policy engines, CRDTs, or knowledge graphs.

The sharper claim:

> In multi-agent memory systems, authority/status/boundary receipts must survive compression transforms — source result → summary → handoff → next-action → action proposal — so stale, denied, sealed, local-only, partial-lineage, or human-required evidence cannot be laundered into action authority.

Core design maxim:

> Do not build a memory that remembers more. Build a memory that knows when to distrust itself.

## Package structure

```text
synaptic-mesh/
  paper/                 # paper draft, abstract, related work, references
  specs/                 # protocol specs and schemas
  tests/                 # curated reproducible fixture suite or pointers into runs/
  evidence/              # metric tables, failures, repairs, threat model
  implementation/        # local shadow/reference implementation only
  docs/                  # README, glossary, quickstart, diagrams, release notes
  research-package/      # indexes, readiness gates, publication checklist
  runs/...               # raw/working experiment artifacts
```

## Completed package spine

### A. Paper / thesis material

| Artifact | Role | Status |
|---|---|---|
| `paper/aletheia-paper-v0.md` | Integrated local paper draft v0.1 | Complete public release-candidate integration; not runtime-ready. |
| `research-package/T-synaptic-mesh-paper-skeleton-v0.md` | Paper skeleton receipt | Complete. |
| `research-package/T-synaptic-mesh-paper-draft-integration-v0.md` | Paper integration receipt | Complete. |
| `research-package/T-synaptic-mesh-related-work-citation-plan-v0.md` | Related-work plan | Complete. |
| `research-package/T-synaptic-mesh-related-work-citation-integration-notes-v0.md` | Citation integration notes | Complete. |
| `research-package/T-synaptic-mesh-bibliography-seed-v0.md` | 16 seed references across 8 buckets | Complete seed; final metadata/style still needed. |
| `research-package/T-synaptic-mesh-citation-bibtex-cleanup-v0.md` | Local bibliography cleanup pass | Complete local draft. |
| `research-package/T-synaptic-mesh-paper-citation-linkage-check-v0.md` | Paper↔BibTeX ID linkage | Complete; 16/16, missing 0, unused 0. |

### B. Specs / protocol primitives

| Artifact | Role | Status |
|---|---|---|
| `specs/` | Stable local protocol/spec drafts | Present; needs final consistency pass before release. |
| `research-package/T-synaptic-mesh-spec-extraction-v0.md` | First spec extraction pass | Complete. |
| `research-package/T-synaptic-mesh-minimum-functional-reference-scope-v0.md` | Scope boundary for implementation reference | Complete. |
| `research-package/T-synaptic-mesh-reference-implementation-plan-v0.md` | Shadow-only API/data-model plan | Complete planning; not runtime. |
| `research-package/T-synaptic-mesh-threat-model-v0.md` | Threat model | Complete standalone draft. |
| `research-package/T-synaptic-mesh-claim-evidence-trace-map-v0.md` | Claim/evidence trace map | Complete. |

### C. Local evidence / reproducibility

| Artifact | Role | Status |
|---|---|---|
| `research-package/T-synaptic-mesh-repro-suite-manifest-v0.md` | Reproducibility manifest | Complete; points to canonical 15-fixture set. |
| `implementation/synaptic-mesh-shadow-v0/fixtures/manifest.json` | Canonical fixture manifest | Complete. |
| `implementation/synaptic-mesh-shadow-v0/evidence/review-local.out.json` | One-command review evidence | Fresh rerun pass: 13/13 commands. |
| `implementation/synaptic-mesh-shadow-v0/evidence/fixture-parity.out.json` | Fixture parity evidence | Pass 15/15. |
| `implementation/synaptic-mesh-shadow-v0/evidence/normalized-fixture-summary.out.json` | Normalized summary evidence | Complete over 15 fixtures. |
| `implementation/synaptic-mesh-shadow-v0/evidence/cli-validator.out.json` | CLI behavior evidence | Pass; unsafe allows 0. |

### D. Minimum functional reference

| Artifact | Role | Status |
|---|---|---|
| `implementation/synaptic-mesh-shadow-v0/` | Local shadow/reference package | Reviewable locally; not runtime. |
| `implementation/synaptic-mesh-shadow-v0/README.md` | Boundary + reviewer quickstart | Complete as of `T-synaptic-mesh-readme-boundary-quickstart-v0`. |
| `research-package/T-synaptic-mesh-local-receipt-parser-validator-v0.md` | Parser/validator target | Complete. |
| `research-package/T-synaptic-mesh-receipt-transform-regression-v0.md` | Transform regression target | Complete. |
| `research-package/T-synaptic-mesh-local-cli-validator-v0.md` | CLI validator target | Complete. |
| `research-package/T-synaptic-mesh-synthetic-handoff-examples-v0.md` | Synthetic handoff examples | Complete. |
| `research-package/T-synaptic-mesh-review-local-runner-v0.md` | One-command local review runner | Complete. |
| `research-package/T-synaptic-mesh-readme-boundary-quickstart-v0.md` | README boundary quickstart | Complete. |

### E. Human review / publication gate packet

| Artifact | Role | Status |
|---|---|---|
| `research-package/T-synaptic-mesh-public-redaction-and-citation-check-v0.md` | Public hygiene audit | Complete with required fixes identified. |
| `research-package/T-synaptic-mesh-public-redaction-fixes-v0.md` | Private path/stale index fixes | Complete. |
| `research-package/T-synaptic-mesh-quote-check-priority-plan-v0.md` | Quote-check priority order | Complete. |
| `research-package/T-synaptic-mesh-quote-check-notes-v0.md` | Tier A local notes | Complete scaffold; exact quotes still required. |
| `research-package/T-synaptic-mesh-tier-a-wording-softening-v0.md` | Conservative Tier A wording repair | Complete. |
| `research-package/T-synaptic-mesh-tier-b-quote-check-notes-v0.md` | Tier B local notes | Complete scaffold; exact quotes still required. |
| `research-package/T-synaptic-mesh-tier-c-doc-landscape-check-v0.md` | Tier C landscape notes | Complete scaffold; live-doc checks still required. |
| `research-package/T-synaptic-mesh-publication-blocker-ledger-v0.md` | B01–B09 release blocker ledger | Complete; publication remains blocked. |
| `research-package/T-synaptic-mesh-human-review-brief-v0.md` | Concise human review brief | Complete local-only. |
| `research-package/T-synaptic-mesh-quote-check-worksheet-v0.md` | R01–R18 quote-check worksheet | Complete; active IDs covered and R06/R09 reserved. |
| `research-package/T-synaptic-mesh-worksheet-consistency-validation-v0.md` | Paper/BibTeX/worksheet consistency gate | Complete historical gate; superseded by R11 downgrade active-set refresh. |
| `research-package/T-synaptic-mesh-tier-a-source-retrieval-v0.md` | Tier A source retrieval/cache | Complete; 6/6 sources cached. |
| `research-package/T-synaptic-mesh-tier-a-exact-quote-capture-v0.md` | Tier A exact quote capture | Complete; conservative claims supported. |
| `research-package/T-synaptic-mesh-tier-b-source-retrieval-and-quote-capture-v0.md` | Tier B quote capture | Complete for 5/6; R11 blocked. |
| `research-package/T-synaptic-mesh-r11-resolution-or-downgrade-v0.md` | R11 resolution/downgrade | Complete; R11 disabled from publication-critical support; R10 carries blackboard-lineage claim. |
| `research-package/T-synaptic-mesh-tier-c-live-doc-check-v0.md` | Tier C live-doc landscape check | Complete; R08/R16/R17/R18 checked live, access date recorded, R18 redirect updated. |
| `research-package/T-synaptic-mesh-final-metadata-bibtex-style-v0.md` | Final active bibliography metadata/style | Complete for local publication review; active 15-ref set aligned. |
| `research-package/T-synaptic-mesh-final-claim-audit-v0.md` | Final conservative claim audit | Complete; paper language aligned with quote-check and landscape constraints. |
| `research-package/T-synaptic-mesh-publication-reproducibility-rerun-v0.md` | Publication-readiness reproducibility rerun | Historical publication snapshot; complete at 12/12 commands, 15/15 fixture parity, unsafe allow signals 0. Current live review-local evidence is 13/13. |
| `research-package/T-synaptic-mesh-public-private-boundary-audit-v0.md` | Public/private boundary audit | Complete for public-facing surface; private operator/path traces redacted. |
| `research-package/T-synaptic-mesh-human-review-package-final-v0.md` | Final human-review packet | Complete; local publication-review checkpoint reached and human decision required. |

## Reviewer quickstart

From the repository/workspace root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

From the package directory:

```bash
cd implementation/synaptic-mesh-shadow-v0
npm run review:local
npm run test:receipt
npm run test:transform
npm run test:cli
npm run test:handoff
```

Expected current gate snapshot:

```json
{
  "reviewLocalVerdict": "pass",
  "commands": "13/13",
  "fixtureParity": "15/15",
  "normalizedSummaryFixtures": 15,
  "unsafeAllowSignals": 0,
  "sourceFixtureMutation": false
}
```

## Key evidence metrics snapshot

| Gate | Current result | Evidence file |
|---|---:|---|
| Review-local runner | 13/13 commands pass | `implementation/synaptic-mesh-shadow-v0/evidence/review-local.out.json` |
| Fixture parity | 15/15 pass | `implementation/synaptic-mesh-shadow-v0/evidence/fixture-parity.out.json` |
| Normalized summary | 15 fixtures | `implementation/synaptic-mesh-shadow-v0/evidence/normalized-fixture-summary.out.json` |
| CLI validator | pass, unsafe allows 0 | `implementation/synaptic-mesh-shadow-v0/evidence/cli-validator.out.json` |
| Synthetic handoffs | pass | `implementation/synaptic-mesh-shadow-v0/evidence/synthetic-handoff-examples.out.json` |
| Transform regression | pass | `implementation/synaptic-mesh-shadow-v0/evidence/receipt-transform-regression.out.json` |
| Partial receipt degradation | pass | `implementation/synaptic-mesh-shadow-v0/evidence/partial-receipt-degrade.out.json` |

## Known useful failures and repairs

| Failure | Repair | Representative artifact |
|---|---|---|
| Sender/prose could imply broader authority than the receiver should allow. | Receiver classifies action independently; sender label is not authority. | `T-synaptic-mesh-compressed-temporal-receipt-role-separation-v0` |
| Boundary wording drift could overblock harmless variants or accept semantic expansion. | Normalize only narrow syntactic local-shadow L0/L1 variants; reject expansion terms first. | `T-synaptic-mesh-compressed-temporal-boundary-normalization-v0` |
| Cross-source packets could launder authority through known-looking labels/prose. | Verify source identity, source path, source digest, and freshness before boundary normalization. | `T-synaptic-mesh-compressed-temporal-boundary-normalization-cross-source-v0` |
| Forbidden terms in `NO` could be misread as grants. | Treat `NO` as a prohibition lane, not an authorization lane. | `T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0` |
| Source spoofing/nested handoff could hide stale or mismatched authority. | Canonical fixture parity and CLI validation fail closed on digest/source mismatch. | `T-synaptic-mesh-source-spoofing-fixture-parity-registration-v0`, `T-synaptic-mesh-local-cli-validator-v0` |
| Cross-agent conflict could leak raw claims or over-trust team/global memory. | Quarantine conflict lanes and require explicit human/verified paths for higher-risk action. | `T-synaptic-mesh-cross-agent-conflict-quarantine-fixture-v0` |
| Summary/label drift can convert boundaries into authority. | Receiver-side rubric requires source/gate, local/no-effect scope, authority-change checks, dropped-negation fetch/label, and label-shadow-only interpretation. | `T-compression-uncertainty-contract-receiver-rubric-real-handoff-v0` |

## Publication blockers still open

Before any external release/publication:

1. **Tier A exact quote/deep-read:** R07, R03, R04, R01, R12, R14.
2. **Tier B exact quote/deep-read:** R05, R02, R13, R15, and R10 have exact quotes; R11 is disabled/pending source-exact access and no longer publication-critical.
3. **Tier C live-doc checks:** complete as landscape-only with access dates; R18 redirect updated.
4. **Final metadata/BibTeX/venue style:** complete for local publication review; final target-venue style may still be needed at release prep.
5. **Final claim audit:** complete for local publication review.
6. **Publication-grade reproducibility capture:** complete; rerun again if code/fixtures change before publication.
7. **Public/private boundary audit:** complete for public-facing surface; final export-specific pass still recommended.
8. **Human approval:** final human-review packet ready; explicit project-owner/human approval still required before external publication/release.
9. **Runtime/tooling approval:** separate approval before host runtime/tooling/L2+ operational integration.

## Implementation gaps still open

Before operational implementation:

1. freeze stable schema definitions for MemoryAtom, Evidence Ledger, Conflict Registry, Receipt, Retrieval Router, and Action Context Packet;
2. keep validators deterministic and test-backed;
3. define failure policy for fetch/abstain vs ask-human vs allow-local;
4. design canary/rollback/audit plan if later approved;
5. get explicit project-owner/human approval for L2+ operational/runtime work.

## Recommended next package action

### Next local-safe block

`D-synaptic-mesh-publication-review-decision-v0`

Goal: collect public review feedback and triage post-RC changes. Runtime integration remains blocked without a separate explicit maintainer decision.

Allowed now: local markdown/docs, local bibliography inspection, local source-pack planning, local validation.  
Not allowed: publication, runtime/tooling integration, config changes, permanent memory promotion, external release, deletion, canary/enforcement/production, or L2+ operational use.

## Superseded stale next-step notes

Older next-step notes that pointed to paper skeleton, paper draft integration, citation cleanup, human review brief, quote-check worksheet, or worksheet consistency validation are superseded by completed package artifacts above unless a later root `next-action.md` explicitly reselects one.

## Guardrails / approval boundaries

Allowed now:

- local markdown/docs;
- local fixture indexing;
- local spec/paper synthesis;
- local shadow reference review;
- local quote-check planning.

Not allowed without explicit human approval:

- external publication;
- repo release/public push if intended as publication;
- runtime/tooling integration;
- production/runtime config changes;
- durable/permanent memory promotion;
- external sends except milestone/blocker/decision updates;
- deletion;
- paused creative projects;
- canary/enforcement/production/L2+ operational use.

## Exit verdict

`T-synaptic-mesh-research-package-index-refresh-post-review-v0`: **pass / package index refreshed after human review brief, quote-check worksheet, worksheet consistency validation, and fresh review-local gate**.

The package now points at the true remaining blockers. Next recommended local-safe block is `T-synaptic-mesh-tier-a-source-pack-preflight-v0`.
