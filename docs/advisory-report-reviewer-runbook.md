# Advisory report reviewer runbook

Status: v0.3.4 reviewer runbook. Manual, local, opt-in, record-only, no effects. This document is for human reviewers only.

> ADVISORY ONLY. This runbook is human-readable review guidance, not authority. Advisory no es authority.

## Purpose

Use this runbook to review the passive canary advisory report evidence without turning that evidence into policy, approval, authorization, enforcement, or agent-consumed instruction.

## Required local commands

Run from the repository root:

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-unicode-bidi-guard
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report-failure-catalog
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report-reproducibility
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.4
```

## Human review checklist

A reviewer should verify:

- the advisory report says `ADVISORY ONLY` and `Advisory no es authority`;
- the report is human-readable evidence only;
- JSON evidence says `machineReadablePolicyDecision: false`;
- JSON evidence says `consumedByAgent: false` and `automaticAgentConsumptionImplemented: false`;
- evidence reports zero unexpected accepts for misuse/failure and reproducibility negative controls;
- Unicode/bidi guard reports zero text and machine-readable findings;
- reproducibility reports two deterministic runs and zero normalized-output mismatches;
- no source evidence paths escape committed repository evidence;
- no wording grants approval, permission, authorization, blocking, allowing, or enforcement;
- no tool execution, memory write, config write, publication, or agent-instruction write is introduced.

## Stop conditions

Stop review and request a fix if any of these appear:

- the report claims to approve, block, allow, authorize, or enforce;
- a machine-readable policy decision field becomes true;
- an agent-consumption or automatic-consumption field becomes true;
- a report text hash, byte count, summary, source evidence list, or report path drifts unexpectedly;
- hidden or bidi Unicode appears in docs, fixtures, evidence, tests, scripts, or release metadata;
- a change adds runtime integration, daemon, watcher, adapter, tool execution, memory/config writes, publication automation, or approval path;
- release metadata, docs, fixtures, evidence, and release-check disagree about the release target or expected counts.

## Review wording

When these checks are performed locally by agents or scripts, describe them publicly as **two independent local reviews**. Do not describe them as GitHub reviews unless they are visible in the GitHub review UI.

## Boundary

This runbook is not an approval workflow. It does not grant permission, deny requests, authorize operations, enforce policy, execute tools, write memory/config, publish externally, or instruct agents. It is only a human-readable local review checklist for committed evidence.
