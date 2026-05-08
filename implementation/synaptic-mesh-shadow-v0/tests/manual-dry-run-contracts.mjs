import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { effectCapabilityFields, expectInvalid, validateSchemaValue } from './live-shadow-schema-helpers.mjs';

const artifact = 'T-synaptic-mesh-manual-dry-run-contracts-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const commandSchemaPath = resolve(repoRoot, 'schemas/manual-dry-run-command.schema.json');
const resultSchemaPath = resolve(repoRoot, 'schemas/manual-dry-run-result.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/manual-dry-run-contracts.json');
const evidencePath = resolve(packageRoot, 'evidence/manual-dry-run-contracts.out.json');

const commandSchema = JSON.parse(await readFile(commandSchemaPath, 'utf8'));
const resultSchema = JSON.parse(await readFile(resultSchemaPath, 'utf8'));
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(commandSchema.title, 'ManualDryRunCommand contract');
assert.match(commandSchema.description, /processes redacted artifacts/);
assert.match(commandSchema.description, /does not capture reality/);
assert.match(commandSchema.description, /read live traffic/);
assert.match(commandSchema.description, /watcher\/daemon/);
assert.equal(commandSchema.additionalProperties, false);
assert.equal(resultSchema.title, 'ManualDryRunResult evidence record');
assert.match(resultSchema.description, /record-only audit evidence/);
assert.match(resultSchema.description, /cannot authorize/);
assert.match(resultSchema.description, /live-observer\/runtime readiness/);
assert.equal(resultSchema.additionalProperties, false);

const commandFalseFields = [
  'rawInputAllowed',
  'liveInputAllowed',
  'networkAllowed',
  'watcherAllowed',
  'daemonAllowed',
  'adapterIntegrationAllowed',
  'toolExecutionAllowed',
  'memoryWriteAllowed',
  'configWriteAllowed',
  'publicationAllowed',
  'blockingAllowed',
  'allowingAllowed',
  'approvalPathAllowed',
  'authorizationAllowed',
  'enforcementAllowed',
  'runtimeIntegrationAllowed',
];
const resultFalseFields = [
  'rawContentPersisted',
  'privatePathsPersisted',
  'secretLikeValuesPersisted',
  'toolOutputsPersisted',
  'memoryTextPersisted',
  'configTextPersisted',
  'approvalTextPersisted',
  ...effectCapabilityFields,
  'observerImplemented',
  'liveObserverImplemented',
  'watcherImplemented',
  'daemonImplemented',
  'networkAccessed',
  'adapterIntegrationImplemented',
  'runtimeIntegrationImplemented',
  'authorizationImplemented',
  'enforcementImplemented',
];
const requiredRejectedInputs = [
  'raw_handoff_text',
  'unredacted_manual_observation_bundle',
  'live_session_stream',
  'live_log_stream',
  'runtime_event',
  'network_url',
  'tool_output',
  'memory_text',
  'config_text',
  'approval_text',
];

for (const required of [
  'schemaVersion',
  'commandId',
  'mode',
  'inputKind',
  'inputBundleId',
  'redactionReviewRequired',
  'humanInvocationRequired',
  ...commandFalseFields,
  'expectedObserverAction',
  'outputKind',
  'rejectedInputKinds',
]) assert.ok(commandSchema.required.includes(required), `command schema must require ${required}`);

for (const required of [
  'schemaVersion',
  'commandId',
  'resultId',
  'completed',
  'recordOnly',
  'generatedParserEvidence',
  'generatedClassifierDecision',
  'generatedDecisionTrace',
  'generatedLiveShadowResult',
  'generatedScorecardRow',
  'observerAction',
  'forbiddenEffectsDetected',
  'validationErrorCount',
  'mismatchCount',
  'falsePermitCount',
  'falseCompactCount',
  'boundaryLossCount',
  ...resultFalseFields,
  'safetyClaimScope',
]) assert.ok(resultSchema.required.includes(required), `result schema must require ${required}`);

assert.equal(fixture.schemaVersion, 'manual-dry-run-contract-fixtures-v0');
assert.match(fixture.description, /schema fixtures only/);
assert.equal(fixture.commands.length, 2, 'fixtures must include one ordinary and one adversarial real-redacted command contract');
assert.equal(fixture.results.length, 2, 'fixtures must include matching result contracts');

const validationErrors = [];
for (const command of fixture.commands) {
  const errors = validateSchemaValue(commandSchema, command);
  if (errors.length > 0) validationErrors.push({ commandId: command.commandId, kind: 'command', errors });
  assert.equal(command.mode, 'manual_offline');
  assert.equal(command.inputKind, 'redacted_manual_observation_bundle');
  assert.equal(command.redactionReviewRequired, true);
  assert.equal(command.humanInvocationRequired, true);
  assert.equal(command.expectedObserverAction, 'record_only');
  assert.equal(command.outputKind, 'local_evidence_record_only');
  for (const field of commandFalseFields) assert.equal(command[field], false, `${command.commandId}.${field} must remain false`);
  for (const rejected of requiredRejectedInputs) assert.ok(command.rejectedInputKinds.includes(rejected), `${command.commandId} must reject ${rejected}`);
}

for (const result of fixture.results) {
  const errors = validateSchemaValue(resultSchema, result);
  if (errors.length > 0) validationErrors.push({ resultId: result.resultId, kind: 'result', errors });
  assert.equal(result.completed, true);
  assert.equal(result.recordOnly, true);
  assert.equal(result.generatedParserEvidence, true);
  assert.equal(result.generatedClassifierDecision, true);
  assert.equal(result.generatedDecisionTrace, true);
  assert.equal(result.generatedLiveShadowResult, true);
  assert.equal(result.generatedScorecardRow, true);
  assert.equal(result.observerAction, 'record_only');
  assert.deepEqual(result.forbiddenEffectsDetected, []);
  assert.equal(result.validationErrorCount, 0);
  assert.equal(result.mismatchCount, 0);
  assert.equal(result.falsePermitCount, 0);
  assert.equal(result.falseCompactCount, 0);
  assert.equal(result.boundaryLossCount, 0);
  for (const field of resultFalseFields) assert.equal(result[field], false, `${result.resultId}.${field} must remain false`);
}

assert.deepEqual(validationErrors, [], 'manual dry-run contract fixtures must validate');

const commandNegativeControls = [
  ['raw input allowed', (record) => { record.rawInputAllowed = true; }, '$.rawInputAllowed: enum mismatch'],
  ['live input allowed', (record) => { record.liveInputAllowed = true; }, '$.liveInputAllowed: enum mismatch'],
  ['network allowed', (record) => { record.networkAllowed = true; }, '$.networkAllowed: enum mismatch'],
  ['watcher allowed', (record) => { record.watcherAllowed = true; }, '$.watcherAllowed: enum mismatch'],
  ['daemon allowed', (record) => { record.daemonAllowed = true; }, '$.daemonAllowed: enum mismatch'],
  ['adapter integration allowed', (record) => { record.adapterIntegrationAllowed = true; }, '$.adapterIntegrationAllowed: enum mismatch'],
  ['tool execution allowed', (record) => { record.toolExecutionAllowed = true; }, '$.toolExecutionAllowed: enum mismatch'],
  ['memory write allowed', (record) => { record.memoryWriteAllowed = true; }, '$.memoryWriteAllowed: enum mismatch'],
  ['config write allowed', (record) => { record.configWriteAllowed = true; }, '$.configWriteAllowed: enum mismatch'],
  ['publication allowed', (record) => { record.publicationAllowed = true; }, '$.publicationAllowed: enum mismatch'],
  ['blocking allowed', (record) => { record.blockingAllowed = true; }, '$.blockingAllowed: enum mismatch'],
  ['allowing allowed', (record) => { record.allowingAllowed = true; }, '$.allowingAllowed: enum mismatch'],
  ['approval path allowed', (record) => { record.approvalPathAllowed = true; }, '$.approvalPathAllowed: enum mismatch'],
  ['authorization allowed', (record) => { record.authorizationAllowed = true; }, '$.authorizationAllowed: enum mismatch'],
  ['enforcement allowed', (record) => { record.enforcementAllowed = true; }, '$.enforcementAllowed: enum mismatch'],
  ['runtime integration allowed', (record) => { record.runtimeIntegrationAllowed = true; }, '$.runtimeIntegrationAllowed: enum mismatch'],
  ['live mode', (record) => { record.mode = 'live_observer'; }, '$.mode: enum mismatch'],
  ['raw input kind', (record) => { record.inputKind = 'raw_handoff_text'; }, '$.inputKind: enum mismatch'],
  ['non record output', (record) => { record.expectedObserverAction = 'allow'; }, '$.expectedObserverAction: enum mismatch'],
  ['missing rejected input kind', (record) => { record.rejectedInputKinds = record.rejectedInputKinds.filter((kind) => kind !== 'approval_text'); }, '$.rejectedInputKinds: allOf'],
  ['unknown property', (record) => { record.dryRunCanApprove = true; }, '$: unknown field dryRunCanApprove'],
];
for (const [label, mutation, needle] of commandNegativeControls) expectInvalid(commandSchema, fixture.commands[0], mutation, needle);

const resultNegativeControls = [
  ['not completed', (record) => { record.completed = false; }, '$.completed: enum mismatch'],
  ['not record only', (record) => { record.recordOnly = false; }, '$.recordOnly: enum mismatch'],
  ['parser evidence not generated', (record) => { record.generatedParserEvidence = false; }, '$.generatedParserEvidence: enum mismatch'],
  ['classifier decision not generated', (record) => { record.generatedClassifierDecision = false; }, '$.generatedClassifierDecision: enum mismatch'],
  ['decision trace not generated', (record) => { record.generatedDecisionTrace = false; }, '$.generatedDecisionTrace: enum mismatch'],
  ['live shadow result not generated', (record) => { record.generatedLiveShadowResult = false; }, '$.generatedLiveShadowResult: enum mismatch'],
  ['scorecard row not generated', (record) => { record.generatedScorecardRow = false; }, '$.generatedScorecardRow: enum mismatch'],
  ['observer action allow', (record) => { record.observerAction = 'allow'; }, '$.observerAction: enum mismatch'],
  ['validation error', (record) => { record.validationErrorCount = 1; }, '$.validationErrorCount: enum mismatch'],
  ['mismatch', (record) => { record.mismatchCount = 1; }, '$.mismatchCount: enum mismatch'],
  ['false permit', (record) => { record.falsePermitCount = 1; }, '$.falsePermitCount: enum mismatch'],
  ['false compact', (record) => { record.falseCompactCount = 1; }, '$.falseCompactCount: enum mismatch'],
  ['boundary loss', (record) => { record.boundaryLossCount = 1; }, '$.boundaryLossCount: enum mismatch'],
  ['forbidden effect detected', (record) => { record.forbiddenEffectsDetected = ['tool_execution']; }, '$.forbiddenEffectsDetected: too many items'],
  ['raw content persisted', (record) => { record.rawContentPersisted = true; }, '$.rawContentPersisted: enum mismatch'],
  ['private path persisted', (record) => { record.privatePathsPersisted = true; }, '$.privatePathsPersisted: enum mismatch'],
  ['secret persisted', (record) => { record.secretLikeValuesPersisted = true; }, '$.secretLikeValuesPersisted: enum mismatch'],
  ['tool output persisted', (record) => { record.toolOutputsPersisted = true; }, '$.toolOutputsPersisted: enum mismatch'],
  ['memory text persisted', (record) => { record.memoryTextPersisted = true; }, '$.memoryTextPersisted: enum mismatch'],
  ['config text persisted', (record) => { record.configTextPersisted = true; }, '$.configTextPersisted: enum mismatch'],
  ['approval text persisted', (record) => { record.approvalTextPersisted = true; }, '$.approvalTextPersisted: enum mismatch'],
  ['may block', (record) => { record.mayBlock = true; }, '$.mayBlock: enum mismatch'],
  ['may allow', (record) => { record.mayAllow = true; }, '$.mayAllow: enum mismatch'],
  ['may execute tool', (record) => { record.mayExecuteTool = true; }, '$.mayExecuteTool: enum mismatch'],
  ['may write memory', (record) => { record.mayWriteMemory = true; }, '$.mayWriteMemory: enum mismatch'],
  ['may write config', (record) => { record.mayWriteConfig = true; }, '$.mayWriteConfig: enum mismatch'],
  ['may publish externally', (record) => { record.mayPublishExternally = true; }, '$.mayPublishExternally: enum mismatch'],
  ['may enter approval path', (record) => { record.mayEnterApprovalPath = true; }, '$.mayEnterApprovalPath: enum mismatch'],
  ['observer implemented', (record) => { record.observerImplemented = true; }, '$.observerImplemented: enum mismatch'],
  ['live observer implemented', (record) => { record.liveObserverImplemented = true; }, '$.liveObserverImplemented: enum mismatch'],
  ['watcher implemented', (record) => { record.watcherImplemented = true; }, '$.watcherImplemented: enum mismatch'],
  ['daemon implemented', (record) => { record.daemonImplemented = true; }, '$.daemonImplemented: enum mismatch'],
  ['network accessed', (record) => { record.networkAccessed = true; }, '$.networkAccessed: enum mismatch'],
  ['adapter integration implemented', (record) => { record.adapterIntegrationImplemented = true; }, '$.adapterIntegrationImplemented: enum mismatch'],
  ['runtime integration implemented', (record) => { record.runtimeIntegrationImplemented = true; }, '$.runtimeIntegrationImplemented: enum mismatch'],
  ['authorization implemented', (record) => { record.authorizationImplemented = true; }, '$.authorizationImplemented: enum mismatch'],
  ['enforcement implemented', (record) => { record.enforcementImplemented = true; }, '$.enforcementImplemented: enum mismatch'],
  ['safety overclaim', (record) => { record.safetyClaimScope = 'manual_dry_run_runtime_ready'; }, '$.safetyClaimScope: enum mismatch'],
  ['unknown property', (record) => { record.approvalGrant = true; }, '$: unknown field approvalGrant'],
];
for (const [label, mutation, needle] of resultNegativeControls) expectInvalid(resultSchema, fixture.results[0], mutation, needle);

const output = {
  summary: {
    artifact,
    timestamp: '2026-05-08T05:40:00.000Z',
    verdict: 'pass',
    commandSchema: 'schemas/manual-dry-run-command.schema.json',
    resultSchema: 'schemas/manual-dry-run-result.schema.json',
    sourceFixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/manual-dry-run-contracts.json',
    commandCount: fixture.commands.length,
    resultCount: fixture.results.length,
    validationErrorCount: validationErrors.length,
    commandNegativeControlCount: commandNegativeControls.length,
    resultNegativeControlCount: resultNegativeControls.length,
    recordOnlyResultCount: fixture.results.filter((result) => result.recordOnly && result.observerAction === 'record_only').length,
    generatedParserEvidenceCount: fixture.results.filter((result) => result.generatedParserEvidence).length,
    generatedClassifierDecisionCount: fixture.results.filter((result) => result.generatedClassifierDecision).length,
    generatedDecisionTraceCount: fixture.results.filter((result) => result.generatedDecisionTrace).length,
    generatedLiveShadowResultCount: fixture.results.filter((result) => result.generatedLiveShadowResult).length,
    generatedScorecardRowCount: fixture.results.filter((result) => result.generatedScorecardRow).length,
    forbiddenEffectsDetectedCount: fixture.results.reduce((sum, result) => sum + result.forbiddenEffectsDetected.length, 0),
    mayBlockCount: fixture.results.filter((result) => result.mayBlock).length,
    mayAllowCount: fixture.results.filter((result) => result.mayAllow).length,
    rawInputAllowedCount: fixture.commands.filter((command) => command.rawInputAllowed).length,
    liveInputAllowedCount: fixture.commands.filter((command) => command.liveInputAllowed).length,
    networkAllowedCount: fixture.commands.filter((command) => command.networkAllowed).length,
    toolExecutionAllowedCount: fixture.commands.filter((command) => command.toolExecutionAllowed).length,
    memoryWriteAllowedCount: fixture.commands.filter((command) => command.memoryWriteAllowed).length,
    configWriteAllowedCount: fixture.commands.filter((command) => command.configWriteAllowed).length,
    publicationAllowedCount: fixture.commands.filter((command) => command.publicationAllowed).length,
    approvalPathAllowedCount: fixture.commands.filter((command) => command.approvalPathAllowed).length,
    mode: 'offline_schema_contract_only',
    cliImplemented: false,
    observerImplemented: false,
    liveObserverImplemented: false,
    watcherImplemented: false,
    daemonImplemented: false,
    networkAccessed: false,
    adapterIntegrationImplemented: false,
    runtimeIntegrationImplemented: false,
    toolExecutionImplemented: false,
    memoryWriteImplemented: false,
    configWriteImplemented: false,
    externalPublicationImplemented: false,
    approvalPathImplemented: false,
    blockingOrAllowingImplemented: false,
    authorizationImplemented: false,
    enforcementImplemented: false,
    safetyClaimScope: 'manual_dry_run_contract_only_not_cli_not_live_observer_not_runtime_not_authorization',
  },
  validationErrors,
  commandFalseFields,
  resultFalseFields,
  commandNegativeControls: commandNegativeControls.map(([label]) => label),
  resultNegativeControls: resultNegativeControls.map(([label]) => label),
  boundary: [
    'manual_offline_only',
    'human_invocation_required',
    'redacted_manual_observation_bundle_only',
    'redaction_review_required',
    'record_only_expected',
    'local_evidence_record_only',
    'no_cli_implementation',
    'no_live_observation',
    'no_watcher',
    'no_daemon',
    'no_network',
    'no_adapter_integration',
    'no_tool_execution',
    'no_memory_write',
    'no_config_write',
    'no_external_publication',
    'no_approval_path',
    'no_blocking',
    'no_allowing',
    'no_authorization',
    'no_enforcement',
    'no_runtime_integration',
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
