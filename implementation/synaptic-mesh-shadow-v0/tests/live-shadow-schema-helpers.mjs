import assert from 'node:assert/strict';

export const requiredForbiddenPaths = [
  'runtime',
  'tools',
  'memory_write',
  'config_write',
  'external_publication',
  'agent_instruction',
  'approval_path',
];

export const effectCapabilityFields = [
  'mayBlock',
  'mayAllow',
  'mayExecuteTool',
  'mayWriteMemory',
  'mayWriteConfig',
  'mayPublishExternally',
  'mayModifyAgentInstructions',
  'mayEnterApprovalPath',
];

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

export function validateSchemaValue(schema, value, path = '$') {
  const errors = [];
  const actualType = typeOf(value);
  if (schema.type === 'integer') {
    if (actualType !== 'number' || !Number.isInteger(value)) return [`${path}: expected integer, got ${actualType}`];
  } else if (schema.type && actualType !== schema.type) {
    return [`${path}: expected ${schema.type}, got ${actualType}`];
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: enum mismatch`);
  if (schema.pattern && typeof value === 'string' && !(new RegExp(schema.pattern).test(value))) errors.push(`${path}: pattern mismatch`);
  if (schema.type === 'object') {
    for (const field of schema.required ?? []) if (!Object.hasOwn(value, field)) errors.push(`${path}: missing required field ${field}`);
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties ?? {}));
      for (const field of Object.keys(value)) if (!allowed.has(field)) errors.push(`${path}: unknown field ${field}`);
    }
    const additional = schema.additionalProperties;
    for (const [field, childValue] of Object.entries(value)) {
      if (Object.hasOwn(schema.properties ?? {}, field)) errors.push(...validateSchemaValue(schema.properties[field], childValue, `${path}.${field}`));
      else if (additional && typeof additional === 'object') errors.push(...validateSchemaValue(additional, childValue, `${path}.${field}`));
    }
  }
  if (schema.type === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: too few items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: too many items`);
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) errors.push(`${path}: duplicate items`);
    }
    if (schema.items) for (const [index, item] of value.entries()) errors.push(...validateSchemaValue(schema.items, item, `${path}[${index}]`));
  }
  return errors;
}

export function expectInvalid(schema, validValue, mutation, expectedNeedle) {
  const mutated = structuredClone(validValue);
  mutation(mutated);
  const errors = validateSchemaValue(schema, mutated);
  assert.ok(errors.length > 0, `negative control must fail: ${expectedNeedle}`);
  assert.ok(errors.some((error) => error.includes(expectedNeedle)), `negative control should include ${expectedNeedle}; got ${errors.join('; ')}`);
}

export function assertNoCapabilityBooleans(record) {
  for (const field of effectCapabilityFields) assert.equal(record[field], false, `${field} must remain false`);
}
