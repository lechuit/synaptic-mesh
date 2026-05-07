# T-synaptic-mesh-claim-evidence-trace-map-v0

Timestamp: 2026-05-06T18:27Z  
Status: `pass`, local claim/evidence trace map only

## Question

Which Synaptic Mesh paper/spec claims are currently supported by the canonical 15-fixture local review suite, and which claims must be softened, cited, or treated as future work before publication?

## Scope

Local report only. No source fixture mutation, no historical output rewrite, no runtime/tooling integration, no config changes, no permanent memory promotion, no external effects, no publication, no delete.

Inputs inspected:

- `tests/synaptic-mesh-fixtures-manifest-v0.json`
- `paper/synaptic-mesh-paper-v0.md`
- `specs/synaptic-mesh-memory-authority-v0.md`
- `specs/compressed-temporal-receipt-v0.md`
- `evidence/synaptic-mesh-threat-model-v0.md`
- `research-package/T-synaptic-mesh-spec-extraction-v0.md`

Machine-readable companion:

- `research-package/T-synaptic-mesh-claim-evidence-trace-map-v0.json`

## Evidence base

Canonical local review suite: **15 fixtures**.

Current normalized evidence summary:

- fixture count: 15;
- normalized fixture count: 15;
- unknown verdict fixtures: 0;
- non-regression unsafe allow fixtures: 0;
- missing total-case metrics: 0;
- source fixture mutation: false.

Important caveat: these are local adversarial fixtures and paper/spec drafts, not production benchmarks or citation-backed related work.

## Status legend

| Status | Meaning |
|---|---|
| `supported` | Supported by current local fixtures/specs for the narrow local claim; not a production benchmark. |
| `partial` | Some fixtures/specs support the claim, but important variants remain untested. |
| `needs_evidence` | Do not assert publicly without additional fixtures/evaluation. |
| `needs_related_work_citation` | Needs source-backed comparison/citations before novelty framing. |

## Claim/evidence map

| ID | Claim | Status | Evidence | Safe publication wording |
|---|---|---|---|---|
| C1 | Memory-derived summaries should carry authority/status/boundary receipts through compression, handoff, and action proposal transforms. | `supported` | End-to-end shadow flow, paraphrase drift, compressed receiver, temporal precedence fixtures; Synaptic Mesh and Compressed Temporal Receipt specs. | Local adversarial fixtures support the hypothesis that receipt-through-transform reduces memory authority laundering in tested scenarios. |
| C2 | Semantic relevance alone is insufficient for action authority; retrieval must account for source, freshness, scope, conflict, and decision impact. | `supported` | Retrieval threshold cliff and boundary coverage receipt fixtures; retrieval router spec. | In local fixtures, similarity/top-k style retrieval can miss high-boundary blockers unless coverage and authority receipts are surfaced. |
| C3 | Source identity must be bound to path/digest/freshness before boundary normalization or action classification. | `supported` | Source binding, cross-source normalization, minimal-fields, source-spoofing/nested-handoff fixtures. | Local fixtures support source/path/digest/freshness binding as authority-critical for preventing cross-source and nested-handoff laundering. |
| C4 | Sender labels, confidence, prose, checksums, and chain labels are not action authority; receiver must classify `ACT`. | `supported` | Role separation, compressed receiver, minimal-fields fixtures. | In tested local packets, receiver-side action classification prevents sender-safe labels and polished prose from authorizing sensitive effects. |
| C5 | Later restrictive events and stale/current conflicts must survive compression; stale optimistic receipts fail closed. | `supported` | Stale shadow conflict, temporal precedence, cross-agent conflict quarantine fixtures. | Local fixtures support fail-closed behavior when later restrictions, stale receipts, or unresolved cross-agent conflicts are present. |
| C6 | Narrow local-shadow boundary normalization can reduce overblocking without opening L2+/runtime/operational authority. | `supported` | Boundary normalization, cross-source boundary normalization, role-separation fixtures. | A narrow syntactic normalizer passed local cases while rejecting semantic expansions such as runtime, production, enforcement, or L2+. |
| C7 | The current compressed temporal receipt has an 11-field authority-critical tuple. | `supported` but preliminary | Minimal-fields fixture and compressed temporal receipt spec. | In one local ablation fixture, 11 fields were retained as authority-critical; do **not** frame this as globally minimal. |
| C8 | Private/team/sealed/global scope boundaries and cross-agent conflict quarantine can prevent privacy/scope leakage in tested local scenarios. | `supported` with limitation | Privacy/scope leakage and cross-agent conflict quarantine fixtures. | Local fixtures cover scope leakage and cross-agent conflict quarantine, but broader naturalistic privacy tests remain future work. |
| C9 | Synaptic Mesh is novel relative to RAG, ACLs, provenance graphs, policy engines, blackboards, and agent memory products. | `needs_related_work_citation` | Paper positioning only; citations still missing. | Use cautious positioning: Synaptic Mesh targets receipt-through-transform authority laundering, a gap adjacent to retrieval, ACLs, provenance, and policy enforcement. |
| C10 | The protocol is ready for runtime/tooling enforcement or L2+ operational use. | `needs_evidence` | No supporting evidence; explicitly unauthorized. | Do not claim. Current work is local shadow research only. |
| C11 | The protocol scales to large messy memory stores and ordinary multi-agent workloads without excessive ceremony. | `needs_evidence` | Threat model marks overblocking/usability/scaling as open. | Mark as limitation; current evidence is hand-authored local fixtures, not scalability/usability evaluation. |
| C12 | Conflict merge semantics are mature for concurrent receipts and complex supersession. | `partial` | Stale/current and cross-agent quarantine fixtures; threat model says general merge semantics remain open. | Claim only current fixture coverage; keep general conflict merge as future work. |

## Claims to soften before publication

1. **Do not call the 11-field tuple globally minimal.** Safer: “authority-critical in current local ablation fixture.”
2. **Do not claim production/runtime readiness.** Safer: “local shadow research package.”
3. **Do not claim novelty broadly without citations.** Safer: “targets a gap adjacent to RAG, ACLs, provenance, and policy engines.”
4. **Do not generalize from hand-authored fixtures to large workloads.** Safer: “local adversarial fixture evidence.”
5. **Do not imply conflict/privacy handling is complete.** Safer: “covered in current fixtures; broader naturalistic tests remain future work.”

## Publication-safe narrow claim

> Local adversarial fixtures support Synaptic Mesh as a receipt-through-transform discipline for reducing memory authority laundering across compression, handoff, and action proposal transforms. The current evidence supports narrow local fail-closed behavior, not production readiness or broad novelty without related-work citations.

## Evidence coverage gaps

| Gap | Why it matters | Suggested later block |
|---|---|---|
| Citation-backed related work | Needed before novelty claims. | `T-synaptic-mesh-related-work-citation-plan-v0` |
| Naturalistic generated handoffs | Current fixtures are hand-authored. | generated multi-agent handoff corpus |
| Large noisy memory store | No scalability/noise measurement yet. | workload/overhead fixture |
| Conflict merge semantics | Quarantine exists; merge/supersession immature. | concurrent conflict merge fixture |
| Prepare-vs-send effect split | Avoid local draft becoming external send. | human-required effect split fixture |
| Public redaction review | Required before repo/paper release. | public-safe package audit |

## Exit verdict

`T-synaptic-mesh-claim-evidence-trace-map-v0`: **pass / claims mapped to evidence and overclaims flagged**.

Next safe block: `T-synaptic-mesh-related-work-citation-plan-v0` — local citation plan only, no publication.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1827Z-T-synaptic-mesh-claim-evidence-trace-map-v0
sourceArtifactId: T-synaptic-mesh-claim-evidence-trace-map-v0
sourceArtifactPath: research-package/T-synaptic-mesh-claim-evidence-trace-map-v0.md
producedAt: 2026-05-06T18:27:00Z
receiverFreshness: current
registryDigest: sha256:claim-evidence-map-12claims-supported-partial-needs-evidence-needs-citation
policyChecksum: sha256:local-report-only-no-source-mutation-no-runtime-no-config-no-memory-no-external-no-delete-no-publish
lineage: successor_of_T-synaptic-mesh-canonical-fixture-manifest-v0
validation: trace_map_md_and_json_exist_claim_statuses_present_overclaims_flagged
safetyResult: local_report_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: publication_claim_discipline_improved_before_related_work_and_public_package
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: T-synaptic-mesh-related-work-citation-plan-v0_local_report_only
```
