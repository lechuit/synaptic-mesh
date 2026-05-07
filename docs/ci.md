# CI baseline gates

This repository uses a GitHub Actions baseline to rerun the local shadow validation gates on pull requests and pushes to `main`.

The baseline job runs from `implementation/synaptic-mesh-shadow-v0` and executes:

1. `npm run verify:manifest`
2. `npm run check`
3. `npm run test:receiver-adapters`
4. `npm run review:local`
5. `npm run test:action-policy`
6. `npm run test:authority-routes`
7. `npm run test:authority-envelope`

The workflow uploads the generated shadow evidence JSON files and `MANIFEST.json` as a `shadow-baseline-evidence` artifact for review. Review evidence records commands with a stable `node` label so local and GitHub runners do not diverge only because of host-specific executable paths.

## Boundary

These gates are local-shadow validation only. Passing CI does **not** mean the project is runtime-ready, does **not** enforce authorization in production, and does **not** imply MCP/A2A integration, tool execution, or protocol-standard status.

The CI baseline is intended to preserve reproducibility for the existing fixtures, manifest, local review runner, action-policy contracts, receiver adapters, authority routes, and PR26 authority-envelope checks.
