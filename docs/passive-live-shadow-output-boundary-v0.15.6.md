# v0.15.6 passive live shadow output boundary hardening

This hardening layer keeps the manual passive live shadow CLI from writing evidence outside the package evidence directory. Operators may use `--stdout`, or a `.json` output path under `implementation/synaptic-mesh-shadow-v0/evidence/`; path escapes, fixture writes, non-JSON outputs, absolute external paths, symlinked parent directories, and symlinked output files are rejected before persistence.

Boundary remains unchanged: local operator-run only, no autonomous live mode, no daemon/watcher, no network/resource fetch, no tool execution, no memory/config writes, no agent-consumed output, no machine-readable policy decision, and no approval/block/allow/authorization/enforcement.

Evidence summary: evidenceDirectoryOnly: true; stdoutAllowed: true; outputPathEscapeRejected: true; symlinkParentRejected: true; symlinkOutputFileRejected: true; memoryConfigWrite: false; externalEffects: false; enforcement: false.

Additionally, raw decision verbs in local input (`allow`, `block`, `approve`, `enforce`, `authorize`, including common inflections) are replaced before persistence. The evidence packet may remain advisory/record-only without carrying input text that looks like a policy decision.
