# Local Review Notes — Passive Live Memory/Coherence Usefulness Window v0.38.5

Status: approved by two independent local reviews after blocker fix.

Review focus:

- v0.38 consumes only the pinned completed v0.37.5 repeatability scorecard artifact by path and sha256.
- v0.38 assembles four stable signals into a bounded passive human handoff usefulness window.
- Handoff judgements are source-bound, stable, redacted, human-review-only, non-authoritative, not agent-consumed, no memory promotion, no runtime integration, no policy decision.
- Negative controls degrade artifact spoofing, digest drift, unknown fields, report poisoning, label/stability/source drift, raw persistence, authority/token leakage, runtime/tool/network/memory/config/raw/external-effect attempts.

Review A: APPROVED.

Evidence:

- Confirmed artifact validator rejects unknown top-level, protocol, metrics, handoff item, and usefulness judgement fields.
- Confirmed clean generated artifact validates with no issues.
- Confirmed output remains bounded passive human-review-only/non-authoritative: no runtime authority, no memory writes, no runtime integration, no policy decision, no agent-consumed output.
- Gates passed: `npm run test:passive-live-memory-coherence-usefulness-window`; `npm run release:check`.

Review B: APPROVED.

Independent local Review B stress-tested v0.38.5 artifact validation for benign unknown-field smuggling across top-level, protocol, metrics, handoffItems, and usefulnessJudgements; all were rejected. Additional probes rejected handoff/usefulness semantic drift and authority-token leakage in reportMarkdown. Persisted reviewer package validated cleanly. Gates passed: `npm run test:passive-live-memory-coherence-usefulness-window`, `npm run verify:manifest`, `npm run release:check`, and `git diff --cached --check`. No blocker found.
