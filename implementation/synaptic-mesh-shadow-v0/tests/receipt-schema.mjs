import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifact = 'T-synaptic-mesh-receipt-schema-v0';
const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, '..');
const repoRoot = resolve(packageRoot, '..', '..');
const schemaPath = resolve(repoRoot, 'schemas/receipt.schema.json');
const fixturePath = resolve(packageRoot, 'fixtures/receipts.json');
const evidencePath = resolve(packageRoot, 'evidence/receipt-schema.out.json');
const validationTime = new Date('2026-05-07T20:35:00.000Z');

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function validateSchemaValue(schema, value, path = '$') {
  const errors = [];
  const actualType = typeOf(value);
  if (schema.type && actualType !== schema.type) {
    return [`${path}: expected ${schema.type}, got ${actualType}`];
  }

  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: enum mismatch`);
  if (schema.pattern && typeof value === 'string' && !(new RegExp(schema.pattern).test(value))) errors.push(`${path}: pattern mismatch`);
  if (schema.format === 'date-time' && typeof value === 'string' && Number.isNaN(Date.parse(value))) errors.push(`${path}: invalid date-time`);

  if (schema.type === 'object') {
    const required = schema.required ?? [];
    for (const field of required) {
      if (!Object.hasOwn(value, field)) errors.push(`${path}: missing required field ${field}`);
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}));
      for (const field of Object.keys(value)) {
        if (!allowed.has(field)) errors.push(`${path}: unknown field ${field}`);
      }
    }
    for (const [field, childSchema] of Object.entries(schema.properties ?? {})) {
      if (Object.hasOwn(value, field)) errors.push(...validateSchemaValue(childSchema, value[field], `${path}.${field}`));
    }
  }

  if (schema.type === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: too few items`);
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) errors.push(`${path}: duplicate items`);
    }
    if (schema.items) {
      for (const [index, item] of value.entries()) errors.push(...validateSchemaValue(schema.items, item, `${path}[${index}]`));
    }
  }

  return errors;
}

function semanticReceiptChecks(receipt) {
  const errors = [];
  const forbidden = new Set(receipt.forbiddenEffects ?? []);
  for (const effect of ['external', 'runtime', 'config', 'delete', 'publish', 'memory']) {
    if (!forbidden.has(effect)) errors.push(`forbiddenEffects missing ${effect}`);
  }
  if (receipt.policyWindow?.validFrom && receipt.policyWindow?.validUntil) {
    const from = new Date(receipt.policyWindow.validFrom);
    const until = new Date(receipt.policyWindow.validUntil);
    if (!(from <= validationTime && validationTime < until)) errors.push('policy window is not current at validation time');
  }
  if (receipt.producedAt && new Date(receipt.producedAt) > validationTime) errors.push('producedAt is in the future');
  if (receipt.scope !== 'local_shadow') errors.push('scope is not local_shadow');
  if (receipt.lineage?.laterRestrictiveEvent !== 'none') errors.push('later restrictive event is not none');
  return errors;
}

function classifyReason(errors) {
  const joined = errors.join(' | ');
  if (joined.includes('missing required field policyChecksum')) return 'missing_required_field:policyChecksum';
  if (joined.includes('policy window is not current')) return 'policy_window_not_current';
  if (joined.includes('grammarDigest: enum mismatch')) return 'enum_mismatch:grammarDigest';
  if (joined.includes('missing required field forbiddenEffects')) return 'missing_required_field:forbiddenEffects';
  return errors[0] ?? 'unknown';
}

const schema = JSON.parse(await readFile(schemaPath, 'utf8'));
const fixture = JSON.parse(await readFile(fixturePath, 'utf8'));

assert.equal(schema.title, 'Receipt evidence record');
assert.match(schema.description, /Local shadow-only|local shadow-only/i);
assert.match(schema.description, /does not prove semantic correctness/);
assert.equal(schema.additionalProperties, false);
for (const required of ['receiptId', 'version', 'producedAt', 'source', 'policyChecksum', 'grammarDigest', 'policyWindow', 'freshness', 'scope', 'promotionBoundary', 'forbiddenEffects', 'lineage', 'riskTier', 'action']) {
  assert.ok(schema.required.includes(required), `schema must require ${required}`);
}
assert.deepEqual(schema.properties.version.enum, ['receipt-v0']);
assert.deepEqual(schema.properties.scope.enum, ['local_shadow']);
assert.deepEqual(schema.properties.freshness.enum, ['current']);
assert.deepEqual(schema.properties.grammarDigest.enum, ['sha256:compressed-temporal-receipt-v0']);
assert.equal(schema.properties.forbiddenEffects.uniqueItems, true);

const validResults = [];
for (const receipt of fixture.validReceipts) {
  const errors = [...validateSchemaValue(schema, receipt), ...semanticReceiptChecks(receipt)];
  validResults.push({ id: receipt.receiptId, valid: errors.length === 0, errors });
}
assert.deepEqual(validResults.filter((result) => !result.valid), [], 'all valid receipt fixtures should validate');

const invalidResults = [];
for (const row of fixture.invalidReceipts) {
  const errors = [...validateSchemaValue(schema, row.receipt), ...semanticReceiptChecks(row.receipt)];
  const reason = classifyReason(errors);
  invalidResults.push({ id: row.id, valid: errors.length === 0, reason, errors });
  assert.ok(errors.length > 0, `${row.id} should fail validation`);
  assert.equal(reason, row.expectedReason, `${row.id} should fail for expected reason`);
}

const output = {
  summary: {
    artifact,
    timestamp: process.env.SYNAPTIC_MESH_FRESH_TIMESTAMPS === '1' ? new Date().toISOString() : validationTime.toISOString(),
    verdict: 'pass',
    schema: 'schemas/receipt.schema.json',
    fixture: 'implementation/synaptic-mesh-shadow-v0/fixtures/receipts.json',
    validReceipts: validResults.length,
    invalidReceipts: invalidResults.length,
    requiredFieldsChecked: schema.required.length,
    schemaValidationImplemented: true,
    runtimeEnforcementImplemented: false,
    safetyClaimScope: 'local_shadow_schema_shape_validation_only_not_semantic_correctness_not_runtime_authorization',
  },
  requiredFields: schema.required,
  coverageAreas: {
    sourceBinding: ['source.artifactId', 'source.path', 'source.digest'],
    policyBinding: ['policyChecksum', 'policyWindow'],
    grammarBinding: ['grammarDigest'],
    freshnessAndScope: ['producedAt', 'freshness', 'scope'],
    boundaries: ['promotionBoundary', 'forbiddenEffects', 'lineage.laterRestrictiveEvent'],
    action: ['action.verb'],
    negativeCases: invalidResults.map((result) => result.id),
  },
  knownUncoveredRisks: [
    'schema_shape_validation_does_not_prove_source_authenticity_or_digest_correctness',
    'policyChecksum_and_grammarDigest_are_local_shadow_bindings_not_trust_tokens',
    'policyWindow_current_check_is_fixture_time_semantic_test_not_json_schema_expressiveness',
    'no_runtime_classifier_adapter_mcp_langgraph_or_enforcement_added',
    'no_memory_atom_conflict_record_or_action_context_packet_schema_added'
  ],
  validResults,
  invalidResults,
  boundary: [
    'local_shadow_only',
    'schema_shape_validation_only',
    'not_runtime_integration',
    'not_tool_authorization',
    'not_external_publication'
  ],
};

await mkdir(dirname(evidencePath), { recursive: true });
await writeFile(evidencePath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output, null, 2));
