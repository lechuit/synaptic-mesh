# Local Review Notes v0.44.5

Status: approved by two independent local reviews after one source-path hardening blocker was fixed.

## Review A — source/authority boundary

Initial result: blocked.

Blocker found:
- Live-source path pinning accepted traversal-like paths if normalization produced an expected repo path. Example: a `liveSourcePacks[].path` shaped like `../../docs/status-v0.43.5.md` could normalize to an expected source instead of being rejected before read/validation.

Fix applied:
- Default live source paths are now explicit repo-root-relative paths.
- Live source pre-read pinning rejects absolute paths and any `..` segment before reading.
- Live source reads resolve through explicit repo-root containment and verify the final relative path equals the pinned expected path.
- Validation flags traversal-like `liveSourcePacks[].path` as `path_not_pinned_pre_read` instead of silently accepting normalization.
- Negative controls now include traversal syntax toward an expected live source.

Final result: approved.

Evidence checked:
- Traversal-like live-source paths are rejected before read, including traversal that would resolve to an expected source.
- Repo-local source containment is enforced with explicit repo-root resolution.
- Validation reports traversal-like source pack paths.
- `policyDecision: null` remains top-level only.
- `agentConsumedOutput: false`, `promoteToMemory: false`, `rawPersisted: false`, `noMemoryWrites: true`, `noRuntimeIntegration: true` remain intact.
- Evidence artifact validates cleanly and report generation is stable.
- No runtime/tool/network/external effects found.

## Review B — release discipline/output boundary

Final result: approved.

Evidence checked:
- `npm run test:passive-live-memory-coherence-receiver-usefulness-live-observation` passed.
- Full `node ../../tools/release-check.mjs` from package root passed.
- `git diff --cached --check` and `git diff --check` passed.
- v0.44.5 release-check suite is registered in `tools/release-checks/index.mjs`.
- Manifest includes v0.44.5 release-check/source/evidence paths.
- Negative controls cover traversal-like artifact/source paths, including traversal toward an expected live source.
- Artifact/output boundaries remain human-context-only: top-level-only `policyDecision: null`, no `policyDecision` in protocol/metrics/items/stdout, `agentConsumedOutput: false`, `rawPersisted: false`, no memory writes/runtime integration.
- Unknown-field and forbidden-boundary smuggling checks reject malformed runtime/boundary fields.
- README, RELEASE_NOTES, and status docs describe v0.44.5 as passive observation-only human context, not runtime authority.

No blockers remain.
