# T-synaptic-mesh-readme-boundary-quickstart-v0

Timestamp: 2026-05-06T19:40Z  
Status: `pass`, local documentation only

## Purpose

Update the local Synaptic Mesh shadow reference README so reviewers can run the minimum functional reference and understand the safety boundary.

This target is documentation only. It is not runtime/tooling integration, production/runtime config, durable memory, publication, enforcement, external effect automation, canary, production, or L2+ use.

## Updated artifact

- `implementation/synaptic-mesh-shadow-v0/README.md`

## Boundary made explicit

The README now states that the package is:

- local research/reference only;
- shadow/checklist validation only;
- allowed to run local tests and write local evidence files.

It also states that the package is not:

- production/runtime tooling integration;
- production/runtime config;
- durable/permanent memory;
- external publication;
- canary, production, or enforcement;
- an approval system for sensitive actions;
- permission to publish, send externally, delete, change config, or promote memory.

## Quickstart commands documented

From the package directory:

```bash
npm run review:local
npm run test:receipt
npm run test:transform
npm run test:cli
npm run test:handoff
```

From the repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

## CLI documentation added

The README now points reviewers to:

```bash
node bin/validate-receipt.mjs --help
npm run test:cli
```

It explains expected synthetic CLI outcomes:

- `allow_local_shadow` for current, source-matched, low-risk local shadow actions;
- `fetch_abstain` for missing digest/source mismatch/freshness problems;
- `ask_human` for sensitive or unknown actions such as publication;
- no unsafe allow for spoofed, incomplete, stale, or sensitive receipts.

## Evidence links added

The README now links the local evidence directory and key files:

- `implementation/synaptic-mesh-shadow-v0/evidence/review-local.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/receipt-parser-validator.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/receipt-transform-regression.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/cli-validator.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/synthetic-handoff-examples.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/fixture-parity.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/normalized-fixture-summary.out.json`

## Current gates documented

The README now records the observed review-local gates:

```json
{
  "reviewLocalVerdict": "pass",
  "commands": "11/11",
  "fixtureParity": "15/15",
  "normalizedSummaryFixtures": 15,
  "unsafeAllowSignals": 0,
  "sourceFixtureMutation": false
}
```

## Validation

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
```

Expected: pass, local evidence refreshed.

## Interpretation

The minimum functional reference now has a reviewer-facing README that separates local reproducibility from operational authority. A passing local review means the reference package is locally reproducible. It does not authorize runtime integration, enforcement, publication, config changes, memory promotion, deletion, external sends, or L2+ operational use.

## Exit verdict

`T-synaptic-mesh-readme-boundary-quickstart-v0`: **pass / README boundary quickstart ready**.

Next safe block: `T-synaptic-mesh-research-package-index-refresh-v0` — refresh the local research package index so it references the completed minimum functional reference pieces and removes/marks stale next-step sections. Local markdown/docs only.

## HandoffReceipt

```authority-receipt
receiptId: AR-20260506-1940Z-T-synaptic-mesh-readme-boundary-quickstart-v0
sourceArtifactId: T-synaptic-mesh-readme-boundary-quickstart-v0
sourceArtifactPath: research-package/T-synaptic-mesh-readme-boundary-quickstart-v0.md
producedAt: 2026-05-06T19:40:00Z
receiverFreshness: current
registryDigest: sha256:readme-boundary-quickstart-review-local-pass-commands10-fixture15-normalized15-unsafe0
policyChecksum: sha256:local-docs-only-no-runtime-no-config-no-memory-no-external-no-delete-no-publish
lineage: successor_of_T-synaptic-mesh-review-local-runner-v0
validation: npm_review_local_pass_after_readme_update
safetyResult: local_docs_only_no_runtime_no_config_no_memory_no_external_no_delete_no_publish_no_paused_projects
usabilityResult: reviewer_quickstart_documents_boundary_commands_cli_evidence_and_gates
riskTier: low_local
promotionBoundary: L0_L1_only_without_human_approval_L2plus_operational_requires_approval
nextAllowedAction: T-synaptic-mesh-research-package-index-refresh-v0_local_markdown_only
```
