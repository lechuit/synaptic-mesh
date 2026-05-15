# Status v0.15.6

Output boundary hardening for passive live shadow: evidence writes are restricted to package `evidence/` JSON files, while `--stdout` remains allowed. Path escapes, fixture writes, non-JSON outputs, absolute external paths, symlinked parent directories, and symlinked output files are rejected before persistence.

Boundary remains local operator-run only: no memory/config writes, no external effects, no network, no tools, no daemon/watcher, no authorization, and no enforcement.


Decision-verb sanitization is active for persisted local input text: raw allow/block/approve/enforce/authorize-style verbs are replaced before evidence is written.
