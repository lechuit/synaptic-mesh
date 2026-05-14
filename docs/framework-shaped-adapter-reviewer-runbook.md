# Framework-shaped adapter reviewer runbook v0.7.4

## Status

Human reviewer runbook for the framework-shaped adapter boundary. Manual, local, fake/local/already-redacted fixtures only, committed record-only evidence only, no effects. Not runtime-ready; not production/enforcement-ready.

## Purpose

This runbook tells reviewers how to inspect the `v0.7.x` framework-shaped adapter evidence chain without treating it as operational permission.

A passing framework-shaped adapter review is evidence of local boundary preservation, not runtime authorization.

## Required evidence before review

Reviewers should confirm the following evidence artifacts are present and pass their gates:

- `framework-shaped-adapter-boundary-schema.out.json` — boundary schema, positive/negative fixture coverage, and operational capability flags pinned false.
- `framework-shaped-adapter-hazard-catalog.out.json` — 25 hazards rejected or downgraded before pipeline, with `pipelineRunsForRejectedCases: 0`, `sourceReadsForRejectedCases: 0`, and `successOutputsForRejectedCases: 0`.
- `simulated-framework-shaped-adapter.out.json` — two fake local positive cases (`mcp_like`, `langgraph_like`) producing parserEvidence, neutralized classifierDecision, DecisionTrace, advisory report, and record-only evidence.
- `simulated-framework-shaped-adapter-reproducibility.out.json` — two deterministic reruns, `normalizedOutputMismatches: 0`, `baselineMismatches: 0`, eight drift controls, `unexpectedAccepts: 0`, and `expectedReasonCodeMisses: 0`.

## Allowed review scope

The reviewer is checking boundary preservation, not granting authority.

Allowed scope:

- local repository files already committed or staged for review;
- fake/local/already-redacted framework-shaped fixtures only;
- human-readable docs and record-only JSON evidence;
- script wiring, manifest hashes, and release-check assertions;
- checks that no real framework integration or runtime authority was introduced.

## What pass means

A pass means the review package consistently shows:

- framework-shaped boundary spec only;
- fake/local/already-redacted fixtures only;
- record-only evidence;
- neutralized classifier evidence with `classifierCompactAllowedTrue: 0`;
- all hazard cases rejected or downgraded before pipeline;
- reproducible normalized simulated-adapter output;
- no machine-readable policy decision;
- no automatic agent consumption;
- no approval, block, allow, authorization, or enforcement.

## What pass does not mean

Do not say the adapter is approved for runtime, enforcement, agent consumption, or production use.

A pass does not mean:

- MCP, LangGraph, A2A, or GitHub bot integration exists;
- a framework SDK can be imported;
- network calls, live traffic, resource fetches, tools, watchers, or daemons are allowed;
- memory/config writes or publication automation are allowed;
- any agent may consume the output as instruction or policy;
- any approval, block, allow, authorization, or enforcement decision is granted.

## How to run the local review

From repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run verify:manifest
npm --prefix implementation/synaptic-mesh-shadow-v0 run check
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-shaped-adapter-boundary-schema
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-shaped-adapter-hazard-catalog
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:simulated-framework-shaped-adapter
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:simulated-framework-shaped-adapter-reproducibility
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:framework-shaped-adapter-reviewer-runbook
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.7.4
```

## Human checklist

Before approving, confirm:

- the release branch contains only v0.7.4 reviewer-runbook scoped changes;
- all required evidence files are present in `MANIFEST.files.json`;
- hazard metrics remain pinned at 25 hazards and zero rejected-case pipeline/source/success activity;
- simulated adapter evidence keeps exactly two positive cases and `classifierCompactAllowedTrue: 0`;
- reproducibility evidence keeps two runs, zero normalized-output mismatches, zero baseline mismatches, and eight drift-control rejects;
- docs consistently say this is not real framework integration;
- no new dependency, SDK import, network path, runtime path, watcher, daemon, tool execution, memory/config write, publication, agent-consumed output, machine policy, approval, block, allow, authorization, or enforcement path appears.

## Abort conditions

Abort the review if any of these appear:

- real framework integration, SDK import, network/live traffic, resource fetch, or tool execution;
- memory/config write, publication, watcher, daemon, or external effect;
- agent-consumed instructions, machine-readable policy, approval, block, allow, authorization, or enforcement;
- `classifierCompactAllowedTrue` above zero;
- hazard case pipeline/source/success activity above zero;
- reproducibility mismatch or unexpected drift-control accept;
- docs implying runtime, production, enforcement, or safety certification.

## Reporting

Report review results as human-readable findings only. Use this wording when applicable:

> The v0.7.4 reviewer runbook evidence passed local record-only checks. This is boundary-preservation evidence only, not runtime authorization or enforcement approval.

Include gate results, reviewer findings, and any non-blocking hardening notes. Do not convert this runbook into machine-readable policy or agent instructions.
