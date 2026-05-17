import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { boundedMultisourceShadowReadProtocol, preflightBoundedMultisourceShadowRead } from '../src/bounded-multisource-shadow-read.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const protocol = boundedMultisourceShadowReadProtocol();
assert.equal(protocol.barrierCrossed, 'bounded_explicit_multisource_shadow_read');
assert.equal(protocol.explicitMultiSourceOnly, true);
assert.equal(protocol.maxSources, 3);
assert.equal(protocol.maxRecordsPerSource, 5);
assert.equal(protocol.maxTotalRecords, 12);
for (const key of ['networkFetch','resourceFetch','autonomousLiveMode','watcherDaemon','globRecursiveDiscovery','implicitSources','outsideRepoPaths','symlinks','toolExecution','memoryConfigWrites','rawPersisted','rawOutput','agentConsumedOutput','machineReadablePolicyDecision','approvalBlockAllowAuthorizationEnforcement','externalEffects']) assert.equal(protocol[key], false, key);
assert.equal(protocol.policyDecision, null);
const preflight = preflightBoundedMultisourceShadowRead({ ...protocol, sources: ['README.md', 'RELEASE_NOTES.md'] });
assert.equal(preflight.preflight, 'pass');
await writeFile(resolve('evidence/bounded-multisource-shadow-read-protocol-v0.20.0-alpha.out.json'), JSON.stringify({ summary: { boundedExplicitMultisourceShadowReadBarrierCrossed: true, protocolPass: true, unexpectedPermits: 0 }, protocol }, null, 2) + '\n');
console.log(JSON.stringify(protocol, null, 2));
