# Release checklist

Use this checklist before opening a release PR or drafting a GitHub release. It is a local-review guardrail only; it does not publish, tag, deploy, enable runtime behavior, or certify production safety.

## Version and target consistency

- Confirm `MANIFEST.json` has the intended public review package version.
- Confirm the root `README.md` title, status line, and current-status wording match the manifest public review package version.
- Confirm `RELEASE_NOTES.md` names the same manifest version and describes only changes that are already in the repository.
- Confirm the release/tag target explicitly with `release:check -- --target vX.Y.Z` when validating a release candidate or already-published GitHub release.
- Confirm `implementation/synaptic-mesh-shadow-v0/package.json` remains the private local shadow package (`0.0.0-local`) unless a separate maintainer decision changes package publication scope.

## Local gates

Run release gates from the package directory:

```bash
cd implementation/synaptic-mesh-shadow-v0
npm run release:check -- --target v0.1.4
```

`release:check` verifies the manifest/docs package version, reports the explicit `releaseTarget`, reports the local Git `currentPublishedRelease` when available, and runs the release-critical local gates. If `--target` is omitted, it defaults to the manifest version and prints a warning so release PRs do not silently inherit a stale target.

It runs:

- `npm run verify:manifest`
- `npm run check`
- `npm run test:receiver-adapters`
- `npm run review:local`
- `npm run test:action-policy`
- `npm run test:authority-routes`
- `npm run test:authority-envelope`
- `npm run test:route-decision-schema`
- `npm run test:threat-model-routes`
- `npm run test:route-decision-wrong-routes`
- `npm run test:receipt-schema`

For auditability, keep the individual gate names visible in PR notes even when `release:check` is the command reviewers run.

## Evidence expectations

- Confirm `MANIFEST.json` verifies after all tracked file changes.
- Confirm local evidence is deterministic unless explicitly opting into fresh timestamps.
- Confirm Receipt schema evidence remains local-shadow shape validation only; schema success is not proof of source authenticity, freshness truth, policy correctness, or runtime authorization.
- Confirm source fixtures are not mutated by the review run (`sourceFixtureMutation: false` in local review evidence).
- Confirm release-check output remains local-only and does not call network services or runtime tools.

## CI expectations

- Confirm GitHub Actions are green for the PR.
- Confirm `main` was green before release finalization.
- If CI differs from local output, treat the release as blocked until the discrepancy is explained in the PR.

## Scope and claims

Before publishing any release body or announcement, confirm it states the boundary plainly:

- local shadow / public review package only;
- no runtime integration;
- no MCP/A2A or real framework adapter integration;
- no tool execution;
- no production, canary, enforcement, or safety-certification claims;
- no protocol-standard claim.

Use conservative wording: describe tested local fixtures and review gates, not operational guarantees.
