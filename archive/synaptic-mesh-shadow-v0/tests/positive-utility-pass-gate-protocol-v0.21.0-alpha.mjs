import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { positiveUtilityPassGateProtocol } from '../src/positive-utility-pass-gate.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const protocol = positiveUtilityPassGateProtocol();
assert.equal(protocol.barrierCrossed, 'non_authoritative_positive_utility_pass_to_human_review');
assert.equal(protocol.consumesBoundedExplicitMultisourceShadowRead, true);
assert.equal(protocol.classificationOnly, true);
assert.equal(protocol.nonAuthoritative, true);
assert.equal(protocol.observationAcceptedPossible, true);
assert.equal(protocol.includedInReportPossible, true);
assert.equal(protocol.readyForHumanReviewPossible, true);
assert.equal(protocol.policyDecision, null);
for (const key of ['authorization','enforcement','approvalBlockAllow','toolExecution','externalEffects','rawPersisted','rawOutput','agentConsumedOutput','runtimeAuthority']) assert.equal(protocol[key], false, key);
const out = { summary: { verdict: 'pass', protocol } };
await writeFile(resolve('evidence/positive-utility-pass-gate-protocol-v0.21.0-alpha.out.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify(out.summary, null, 2));
