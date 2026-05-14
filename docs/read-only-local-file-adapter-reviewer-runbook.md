# Read-only local-file adapter reviewer runbook

## Status

Human reviewer runbook for the first real read-only local-file adapter.

The adapter remains manual/local/read-only/record-only: one explicit already-redacted local file, fixed local evidence output, no authority, no enforcement, and no runtime integration.

A passing local-file adapter run is evidence of local read-only boundary preservation, not runtime authorization.

## Purpose

This runbook tells a human reviewer how to review the real adapter without accidentally treating local evidence as permission. The reviewer checks that the adapter remains boring:

`one explicit already-redacted local file → parserEvidence → existing classifier → DecisionTrace → human-readable advisory → record-only evidence`

The reviewer is checking boundary preservation, not granting authority.

## Required evidence before review

Before accepting a review, confirm these committed evidence files exist and report pass-level summaries:

- `implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/read-only-local-file-adapter.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-negative-controls.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter/read-only-local-file-adapter-canary.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-reproducibility.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/read-only-local-file-adapter-failure-catalog.out.json`

The failure catalog must report exactly 30 cases, zero unexpected accepts, zero source-file reads for rejected cases, zero forbidden effects, and zero true capabilities.

## Allowed review scope

The reviewer may inspect code, fixtures, docs, manifest entries, and local evidence. The reviewer may run local tests. The reviewer must not convert evidence into a runtime decision path.

Allowed review questions:

1. Is the input still one explicit already-redacted local file?
2. Are rejected/prohibited cases rejected before source read?
3. Is evidence output fixed under the adapter evidence directory?
4. Are raw classifier decisions absent from returned/committed evidence?
5. Are all authority/effect flags false?
6. Do docs avoid production, authorization, enforcement, and safety-certification claims?

## What pass means

A pass means the local adapter review evidence supports these narrow claims:

- positive adapter run reads exactly one approved already-redacted local file
- source digest is verified for the approved file
- parser evidence, DecisionTrace, and human-readable advisory are produced
- reproducibility evidence is stable after volatile fields are excluded
- failure catalog rejected cases do not read source files
- forbidden effect count is zero
- capability true count is zero
- output remains record-only local evidence

A pass is useful for release review, but it is still only local evidence.

## What pass does not mean

A pass does not mean:

- runtime authorization exists
- enforcement exists
- an agent may consume the evidence as a policy decision
- a receiver has been replaced or bypassed
- raw input, private input, or live traffic may be processed
- multiple files, directories, globs, watchers, daemons, URLs, or network paths are allowed
- MCP, A2A, LangGraph, GitHub bot, webhook, or framework integration is allowed
- tools, memory writes, config writes, publication, approvals, blocking, allowing, authorization, or enforcement are allowed
- MemoryAtom or MemoryStore integration is allowed
- production readiness or safety certification has been established

## How to run the local review

From `implementation/synaptic-mesh-shadow-v0/`:

```bash
npm run verify:manifest
npm run check
npm run review:local
npm run test:read-only-local-file-adapter-schema
npm run test:read-only-local-file-adapter
npm run test:read-only-local-file-adapter-negative-controls
npm run test:read-only-local-file-adapter-canary
npm run test:read-only-local-file-adapter-reproducibility
npm run test:read-only-local-file-adapter-failure-catalog
npm run test:read-only-local-file-adapter-reviewer-runbook
npm run release:check -- --target v0.5.3
```

For an already-published release, check out the exact tag before running the exact release target.

## Human checklist

A reviewer should explicitly confirm:

- `sourceFilePath` is still bound to the approved explicit local fixture
- `sourceArtifactDigest` is still bound before source read
- rejected/prohibited cases report `sourceFileRead: false`
- failure catalog summary reports `failureCases: 30`
- failure catalog summary reports `sourceFilesReadForRejectedCases: 0`
- reproducibility evidence excludes `generatedAt`, `durationMs`, `runId`, and `adapterRunId` from normalized hashes
- advisory report remains human-readable and non-authoritative
- raw classifier decision fields are not persisted
- `toolExecution`, `memoryWrite`, `configWrite`, `externalPublication`, `approvalEmission`, `machineReadablePolicyDecision`, `agentConsumed`, `mayBlock`, `mayAllow`, `authorization`, and `enforcement` remain false

## Abort conditions

Abort the review and block the release if any of these are true:

- source input is no longer one explicit already-redacted local file
- digest mismatch or unapproved source claims require reading the source before rejection
- a rejected/prohibited row reads a source file
- output path can be caller-selected outside the fixed adapter evidence directory
- symlink output or parent escape can mutate protected files
- raw classifier decision, selected route authority, rejected routes, compact permission, or tool authorization is exposed as authority
- any tool/memory/config/publication/approval/block/allow/authorization/enforcement flag becomes true
- docs imply production readiness, runtime authority, or enforcement readiness

## Reporting

Report results as human review findings. If the run passes, use language like:

“Local read-only adapter boundary evidence passed for the reviewed fixture and failure catalog.”

Do not say the adapter is approved for runtime, enforcement, agent consumption, or production use.
