# Passive Live-Shadow Canary Runbook

## Status

Manual/local/opt-in/passive/record-only/no-effects.

This runbook is for human operators preparing or reviewing a passive live-shadow canary packet. It explains how to keep the canary inside the current `v0.2.1` boundary: already-redacted local input, explicit opt-in, local evidence only, and no runtime authority.

## What this is

A passive live-shadow canary is a small, already-redacted local packet used to check whether the current canary contract preserves passive boundaries.

The canary is intentionally narrow. It is a local rehearsal of the boundary shape around future live-shaped operation, not a live observer and not a deployment step.

## What this is not

- not live traffic capture
- not raw input persistence
- not runtime integration
- not a daemon, watcher, or adapter
- not tool execution
- not memory/config writes
- not external publication or publication automation
- not an approval path
- not blocking, allowing, authorization, or enforcement
- not production readiness or safety certification

## What is a canary packet?

A canary packet is an already-redacted local artifact with an explicit source tuple and passive boundary fields. It must be safe to commit or review as fixture/evidence material because it contains no raw private content, secrets, tool outputs, memory text, config text, approval text, or live session capture.

A valid canary packet must represent:

- `sourceKind: manual_redacted_canary_packet`
- `inputBoundary: already_redacted`
- `outputBoundary: record_only_local_evidence`
- `observerMode: passive`
- `observerAction: record_only`
- `effectBoundary: no_effects`
- a complete source tuple: `sourceArtifactId`, `sourceArtifactPath`, `sourceDigest`, `sourceMtime`, and `receiverNow`

If a packet comes from live traffic, unredacted content, an automatic watcher, or a runtime adapter, it is not an acceptable canary packet for this runbook.

## How to verify opt-in

Before running or accepting a canary packet, confirm all opt-in evidence is explicit and local:

1. The packet has `optIn: true`.
2. The fixture-level contract says `optInRequired: true`.
3. The operator can identify the local source artifact and its digest.
4. There is no implied opt-in from repository presence, branch name, CI status, release status, or prior test success.
5. There is no runtime/session/user-data capture path hidden behind the packet.

Abort if opt-in is missing, ambiguous, inherited, or inferred from anything other than the packet and its reviewed local source tuple.

## What record-only means

Record-only means the canary may produce local audit/evidence records and nothing else.

A record-only run may classify a packet as accepted or rejected by the canary contract. It may not change behavior outside the evidence file, and it may not feed a result into any operational decision path.

Record-only specifically forbids:

- executing tools
- writing memory or config
- publishing externally
- entering approval paths
- blocking, allowing, authorizing, or enforcing actions
- starting daemons/watchers/adapters
- deleting data or starting retention schedulers
- modifying agent instructions

## What artifacts may be written

Only local evidence artifacts under the package evidence directory may be written by the current tests:

- `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary.out.json`
- `implementation/synaptic-mesh-shadow-v0/evidence/passive-live-shadow-canary-reproducibility.out.json`

Those artifacts are audit records only. They must not contain raw input, secrets, private paths, tool outputs, memory/config text, approval text, or live session content.

Do not write canary output outside the repository evidence area. Do not write runtime logs, external notifications, memory updates, config updates, publication artifacts, or approval/block/allow records as part of a canary run.

## How to run the local gates

From `implementation/synaptic-mesh-shadow-v0/`:

```bash
npm run test:passive-live-shadow-canary
npm run test:passive-live-shadow-canary-reproducibility
```

For merge readiness on post-`v0.2.1` PRs, also run the broader local gates used by this package:

```bash
npm run verify:manifest
npm run check
npm run review:local
```

For a future release PR, run `npm run release:check -- --target <next-release>` with that release target. Do not run `release:check -- --target v0.2.1` from a later PR unless the working tree is exactly the published `v0.2.1` tag/commit.

## What pass means

A canary pass means the local canary packet satisfied the current passive boundary checks:

- explicit opt-in was present
- source tuple fields were present and digest-shaped
- input was already-redacted local canary material
- output remained record-only local evidence
- passive/no-effects fields stayed intact
- forbidden effect and capability counters stayed zero
- reproducibility checks found no normalized-output, reason-set, scorecard, or boundary-verdict mismatch across the expected repeated runs

A canary pass is evidence of local passive boundary preservation, not runtime authorization.

## What pass does not mean

A pass does not mean:

- the system is runtime-ready
- the canary can observe live traffic
- raw input may be persisted
- a daemon, watcher, adapter, or live observer may be enabled
- tools may be executed
- memory/config writes are allowed
- publication or publication automation is allowed
- approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement is allowed
- production safety has been certified
- future canary packets can skip opt-in or redaction review

## When to abort

Abort before running or accepting a canary packet if any of these are true:

- opt-in is missing, false, inherited, or ambiguous
- the packet is not already redacted
- the source is live traffic, live logs, a session capture, a watcher, daemon, adapter, or runtime integration
- the source tuple is incomplete or digest format is invalid
- raw input, secrets, private paths, tool outputs, memory/config text, approval text, or live session content is present
- any capability flag or effect implies tool execution, memory/config writes, publication, approval, blocking, allowing, authorization, deletion, retention scheduling, or enforcement
- output would be written outside local evidence artifacts
- a reviewer wants to use the result to permit a runtime action
- a failure is being reinterpreted as partial operational permission

A rejected or aborted canary may be useful evidence, but it must remain evidence-only. Fix the packet or contract in a new local review step; do not bypass the boundary to make the canary pass.
