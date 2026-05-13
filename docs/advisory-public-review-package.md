# Advisory public review package

Status: v0.3.5 public review package. Manual, local, opt-in, record-only, no effects. This document is for human reviewers only.

> ADVISORY ONLY. This package is human-readable review evidence, not authority. Advisory no es authority.

## Purpose

This package (`docs/advisory-public-review-package.md`) gives public reviewers a compact map of the advisory report hardening evidence from v0.3.0-alpha through v0.3.5 without creating runtime, policy, approval, authorization, enforcement, or agent-consumed instructions.

## Review order

1. Read `docs/status-v0.3.0-alpha.md` for the original human-readable advisory report.
2. Read `docs/status-v0.3.1.md` for Unicode/bidi hygiene.
3. Read `docs/status-v0.3.2.md` for advisory report misuse/failure catalog coverage.
4. Read `docs/status-v0.3.3.md` for advisory report reproducibility/drift checks.
5. Read `docs/advisory-report-reviewer-runbook.md` and `docs/status-v0.3.4.md` for human reviewer steps and stop conditions.
6. Use this package as an index only; do not use it as policy, approval, authorization, enforcement, or agent instruction.

## Evidence index

| Layer | Evidence | Expected reviewer signal |
| --- | --- | --- |
| v0.3.0-alpha | `passive-live-shadow-canary-advisory-report.out.json`, `passive-live-shadow-canary-advisory-report.out.md` | Advisory report is human-readable only and non-authoritative. |
| v0.3.1 | `passive-live-shadow-canary-advisory-unicode-bidi-guard.out.json` | Hidden/bidi and machine-readable Unicode findings are zero. |
| v0.3.2 | `passive-live-shadow-canary-advisory-report-failure-catalog.out.json` | 12 misuse cases reject, 0 unexpected accepts. |
| v0.3.3 | `passive-live-shadow-canary-advisory-report-reproducibility.out.json` | 2 runs, 0 normalized-output mismatches, 6 drift negatives reject. |
| v0.3.4 | `passive-live-shadow-canary-advisory-reviewer-runbook.out.json` | Runbook required phrases/sections/commands are present and forbidden phrases are absent. |

## Required public-review checks

Public reviewers should confirm:

- every listed evidence file is committed and included in `MANIFEST.files.json`;
- release docs point to the current release target and do not stale-reference a prior release as current;
- no row claims production readiness, runtime readiness, safety certification, approval, block/allow, authorization, or enforcement;
- advisory evidence says `machineReadablePolicyDecision: false` and `consumedByAgent: false`;
- failure catalog reports 12 expected rejects and 0 unexpected accepts;
- reproducibility reports 2 runs and 0 normalized-output mismatches;
- runbook reports 10 required phrases, 6 sections, 6 commands, and 0 forbidden phrase findings;
- public review text says “two independent local reviews” when reviews are not GitHub UI reviews.

## Required local commands

```bash
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-unicode-bidi-guard
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report-failure-catalog
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-report-reproducibility
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-reviewer-runbook
npm --prefix implementation/synaptic-mesh-shadow-v0 run test:passive-live-shadow-canary-advisory-public-review-package
npm --prefix implementation/synaptic-mesh-shadow-v0 run review:local
npm --prefix implementation/synaptic-mesh-shadow-v0 run release:check -- --target v0.3.5
```

## Boundary

This package is not an approval workflow, not a runtime policy, not a machine-readable decision, and not an agent-consumed instruction. It does not grant permission, deny requests, authorize operations, enforce policy, execute tools, write memory/config, publish externally, or mutate agent instructions.
