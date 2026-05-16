# Local Review Notes — Passive Live Memory/Coherence Observation Rehearsal v0.36.5

Status: approved by two independent local reviews after fixes.

Review focus:

- v0.36 consumes only the pinned completed v0.35.5 repeatability artifact by path and sha256.
- v0.36 reads only four explicit repo-local source files with pinned sha256 values.
- Source packs persist redacted excerpts, anchors, and digests only; raw source text is not persisted.
- Observation items are source-bound, human-review-only, non-authoritative, not agent-consumed, no memory promotion, no runtime integration, no policy decision.
- Negative controls should degrade on artifact spoofing, source spoofing/digest drift, unknown fields, missing anchors, raw persistence, authority/token leakage, runtime/tool/network/memory/config/raw/external-effect attempts.

Review A: blocked initial diff because persisted `reportMarkdown` was not scanned for authority/raw-persistence token poisoning. Fix added explicit reportMarkdown validation plus output-boundary regression.

Review B: approved initial release-discipline/correctness pass, then blocked because a temp-copy run saw stale manifest hashes after standalone evidence-regenerating gates. The exact documented gate path was rerun on the fixed staged diff and passed through `npm run release:check -- --target v0.36.5`; final B3 re-review approved release discipline/correctness and found no blockers.
