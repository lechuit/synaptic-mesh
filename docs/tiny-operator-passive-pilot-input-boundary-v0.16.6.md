# v0.16.6 tiny passive pilot input boundary hardening

The tiny operator-run passive pilot now accepts only one explicit package `fixtures/` `.txt` sample input at a time. External paths, package metadata/docs/evidence, directories, non-text fixtures, symlinked input files, and symlinked parent-directory escapes are rejected before read.

The boundary remains local/manual/no-effects only: no autonomous live mode, no watcher/daemon, no network/resource fetch, no SDK/framework adapter, no tool execution, no memory/config writes, no agent-consumed output, no machine-readable policy decision, no approval/block/allow/authorization/enforcement, and no external effects.

Evidence: packageFixtureInputOnly: true; inputPathEscapeRejected: true; inputSymlinkFileRejected: true; inputSymlinkParentRejected: true; rawPersisted: false; externalEffects: false; enforcement: false.
