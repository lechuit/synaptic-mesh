import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  expectedPassingRedactionGateOutput,
  scanRedactionCandidate,
  summarizeRedactionGate,
} from '../src/redaction-scanner.mjs';

const artifact = 'T-synaptic-mesh-redaction-scanner-minimal-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const fixturePath = resolve(packageRoot, 'fixtures/redaction-scanner-minimal.json');
const policyPath = resolve(packageRoot, 'fixtures/redaction-policy.json');
const evidencePath = resolve(packageRoot, 'evidence/redaction-scanner-minimal.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const policy = JSON.parse(await readFile(policyPath, 'utf8'));
const expectedOutput = expectedPassingRedactionGateOutput();
const expectedReasonClasses = [
  'raw_content',
  'secret_like_value',
  'private_path',
  'tool_output',
  'memory_text',
  'config_text',
  'approval_text',
  'long_raw_prompt',
  'unknown_sensitive_field',
];

assert.equal(fixture.mode, 'manual_offline_redaction_scan_only');
assert.equal(policy.redactionGate, 'reject_sensitive_persistence');
assert.equal(policy.defaultAction, 'reject_unknown_sensitive_field');
for (const reasonClass of expectedReasonClasses) assert.ok(policy.sensitiveFieldClasses.includes(reasonClass), `policy must include ${reasonClass}`);
assert.match(fixture.description, /No real raw prompts/);

const passResults = fixture.passCases.map((candidate) => scanRedactionCandidate(candidate));
const blockResults = fixture.blockCases.map((candidate) => scanRedactionCandidate(candidate));
const passOutput = summarizeRedactionGate(passResults);
assert.deepEqual(passOutput, expectedOutput, 'redacted/metadata-only pass cases must produce the expected public redactionGate output');

for (const result of passResults) {
  assert.equal(result.redactionGate, 'pass', `${result.caseId} must pass`);
  assert.deepEqual(result.reasonCodes, [], `${result.caseId} must have no reason codes`);
}

for (const [index, result] of blockResults.entries()) {
  const expectedReasonClass = fixture.blockCases[index].expectedReasonClass;
  assert.equal(result.redactionGate, 'reject', `${result.caseId} must reject`);
  assert.ok(result.evidencePointers.includes(expectedReasonClass), `${result.caseId} must point to ${expectedReasonClass}`);
}

const coveredReasonClasses = [...new Set(blockResults.flatMap((result) => result.evidencePointers))].sort();
assert.deepEqual(coveredReasonClasses, [...expectedReasonClasses].sort(), 'scanner must cover every requested blocking sensitive class');

const allResults = [...passResults, ...blockResults];
const rejectedBlockCases = blockResults.filter((result) => result.redactionGate === 'reject').length;
const unexpectedPasses = blockResults.filter((result) => result.redactionGate !== 'reject');
const unexpectedRejects = passResults.filter((result) => result.redactionGate !== 'pass');
assert.equal(rejectedBlockCases, fixture.blockCases.length, 'every block case must reject');
assert.deepEqual(unexpectedPasses, [], 'negative cases must not pass');
assert.deepEqual(unexpectedRejects, [], 'pass cases must not reject');

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-09T01:05:00.000Z',
    verdict: 'pass',
    scanner: 'implementation/synaptic-mesh-shadow-v0/src/redaction-scanner.mjs',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/redaction-scanner-minimal.json',
    policyFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/redaction-policy.json',
    redactionGate: 'pass',
    passCases: fixture.passCases.length,
    blockCases: fixture.blockCases.length,
    rejectedBlockCases,
    unexpectedPasses: unexpectedPasses.length,
    unexpectedRejects: unexpectedRejects.length,
    coveredReasonClasses,
    rawPersisted: false,
    secretLikePersisted: false,
    privatePathPersisted: false,
    toolOutputPersisted: false,
    memoryTextPersisted: false,
    configTextPersisted: false,
    approvalTextPersisted: false,
    longRawPromptPersistedInPassOutput: false,
    unknownSensitiveFieldPersistedInPassOutput: false,
    mode: 'manual_offline_redaction_scan_only',
    liveObserverImplemented: false,
    liveTrafficRead: false,
    daemonImplemented: false,
    watcherImplemented: false,
    adapterIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingImplemented: false,
    allowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'minimal_redaction_scanner_over_committed_fixtures_only_not_runtime_not_authorization_not_enforcement',
  },
  expectedOutput,
  passOutput,
  passResults,
  blockResults,
  boundary: fixture.boundary,
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
