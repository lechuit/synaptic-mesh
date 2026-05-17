import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '../..');
const fixturePath = resolve(packageRoot, 'fixtures/authority-confusion-benchmark-v0.9.0.json');
const schemaPath = resolve(repoRoot, 'schemas/authority-confusion-benchmark-case.schema.json');
const docsPath = resolve(repoRoot, 'docs/authority-confusion-benchmark-spec-v0.9.0.md');
const evidencePath = resolve(packageRoot, 'evidence/authority-confusion-benchmark-spec-v0.9.0.out.json');

const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));
const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const docs = await readFile(docsPath, 'utf8');

assert.equal(schema.properties.localOnly.const, true, 'schema must require localOnly true');
assert.equal(schema.properties.alreadyRedacted.const, true, 'schema must require alreadyRedacted true');
assert.equal(schema.properties.authorityEvidencePresent.const, false, 'schema must require authorityEvidencePresent false');
assert.equal(fixture.benchmark, 'authority-confusion-benchmark-v0.9.0');
assert.equal(fixture.status, 'local_redacted_fixture_spec_only');
assert.equal(fixture.cases.length, 12, 'benchmark must contain 12 authority-confusion cases');

const categories = new Set();
const ids = new Set();
let temptingPhraseCases = 0;
let missingAuthorityCases = 0;
let localRedactedCases = 0;
let naivePermitExpected = 0;
let safePermitExpected = 0;
let capabilityTrueCount = 0;
for (const item of fixture.cases) {
  assert.match(item.id, /^AC-[0-9]{3}$/);
  assert(!ids.has(item.id), 'duplicate case id');
  ids.add(item.id);
  categories.add(item.category);
  if (typeof item.temptingPhrase === 'string' && item.temptingPhrase.length > 0) temptingPhraseCases += 1;
  if ((item.missingAuthorityFields ?? []).length > 0 && item.authorityEvidencePresent === false) missingAuthorityCases += 1;
  if (item.localOnly === true && item.alreadyRedacted === true) localRedactedCases += 1;
  if (item.naiveLikelyDecision === 'permit') naivePermitExpected += 1;
  if (item.expectedSafeDecision === 'permit') safePermitExpected += 1;
  capabilityTrueCount += Object.values(item.forbiddenCapabilities ?? {}).filter(Boolean).length;
}

assert.equal(ids.size, 12, 'case ids must be unique');
assert.equal(categories.size, 12, 'each case should exercise a distinct authority-confusion category');
assert.equal(temptingPhraseCases, 12, 'each case must include a tempting phrase');
assert.equal(missingAuthorityCases, 12, 'each case must be missing authority evidence');
assert.equal(localRedactedCases, 12, 'each case must be local and already redacted');
assert.equal(naivePermitExpected, 12, 'all cases should tempt a naive permit baseline');
assert.equal(safePermitExpected, 0, 'no benchmark case may expect permit');
assert.equal(capabilityTrueCount, 0, 'all forbidden capability booleans must remain false');

const requiredDocsPhrases = ['Authority Confusion Benchmark','context is not permission','12 local/redacted cases','naive baseline should be tempted to permit','expected safe decision is never permit','No runtime','No network','No SDK import','No tool execution','No memory/config writes','No approval, block/allow, authorization, or enforcement','release:check -- --target v0.9.0'];
const missingDocsPhrases = requiredDocsPhrases.filter((phrase) => !docs.includes(phrase));
assert.deepEqual(missingDocsPhrases, [], 'benchmark spec docs must include required phrases');

const summary = {
  authorityConfusionBenchmarkSpec: 'pass',
  releaseLayer: 'v0.9.0',
  benchmarkCases: fixture.cases.length,
  categories: categories.size,
  localRedactedCases,
  temptingPhraseCases,
  missingAuthorityCases,
  naivePermitExpected,
  safePermitExpected,
  capabilityTrueCount,
  benchmarkSpecReady: true,
  runtimeImplemented: false,
  networkAllowed: false,
  sdkImported: false,
  resourceFetch: false,
  toolExecution: false,
  liveTraffic: false,
  watcherDaemon: false,
  memoryWrite: false,
  configWrite: false,
  externalPublicationAutomation: false,
  agentConsumed: false,
  machineReadablePolicyDecision: false,
  approvalEmission: false,
  mayBlock: false,
  mayAllow: false,
  authorization: false,
  enforcement: false
};

const output = {
  artifact: 'T-synaptic-mesh-authority-confusion-benchmark-spec-v0.9.0',
  timestamp: '2026-05-14T20:48:00.000Z',
  summary,
  categories: [...categories].sort(),
  boundary: ['local_redacted_fixture_spec_only','context_is_not_permission','no_runtime','no_network','no_sdk_import','no_tool_execution','no_memory_config_writes','no_agent_consumption','no_machine_policy','no_approval_block_allow_authorization_or_enforcement']
};
await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
