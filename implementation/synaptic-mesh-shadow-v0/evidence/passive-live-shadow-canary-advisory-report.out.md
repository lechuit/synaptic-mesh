# Synaptic Mesh v0.3.0-alpha passive canary advisory report

> ADVISORY ONLY. This report is human-readable evidence, not authority. Advisory no es authority.

## Scope

- manual, local, opt-in, already-redacted evidence only;
- passive and record-only;
- no live traffic reads;
- no runtime integration;
- no tool execution;
- no memory or config writes;
- no external publication automation;
- no approval path, blocking, allowing, authorization, or enforcement;
- not automatically consumed by agents.

## Evidence summary

- Expanded passive canary pack: pass; 13/13 target labels covered; unexpected accepts 0; unexpected rejects 0.
- Source-boundary expansion: pass; 11/11 target labels covered; unexpected accepts 0; unexpected rejects 0.
- Source-boundary baseline stress: pass; malformed tuple, stale digest, missing mtime, wrong lane, and output containment checks remain present.
- Drift scorecard baseline: pass; route/reason/boundary/scorecard/trace/normalized-output drift counts remain zero.

## Interpretation

The current canary evidence is consistent with the intended local review boundary. It should help a human reviewer spot whether passive canary fixtures preserve source/output boundaries and non-authority posture.

This report must not be used by an agent, runtime, tool, CI workflow, policy layer, or approval system as an action permit, denial, grant, command, instruction, or safety certification.

## Next human review questions

- Are the source/output metadata stress rows still representative enough for the next release step?
- Are advisory report words clear without implying operational authority?
- Is another 0.2.x split needed before any broader alpha work?

## Non-authority invariant

Advisory no es authority. The report exists only as local human-readable evidence.

