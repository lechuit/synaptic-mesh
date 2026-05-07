import assert from 'node:assert/strict';
import { parseCompactReceipt } from '../src/receipt-parser.mjs';
import { validateCompactReceiptForAction } from '../src/receipt-validator.mjs';

const baseReceipt = 'SRC=T-synaptic-mesh-minimum-functional-reference-scope-v0; SRCPATH=research-package/T-synaptic-mesh-minimum-functional-reference-scope-v0.md; SRCDIGEST=sha256:abc123; PROD=2026-05-06T19:10:00Z; FRESH=current; SCOPE=local_shadow; PB=no_memory_write_human_confirmation_required; NO=external_runtime_config_delete_publish_l2; LRE=successor_of_scope_v0; TOK=budget_1k; ACT=create_local_fixture; NOTE=unknown_metadata_preserved';

const parsed = parseCompactReceipt(baseReceipt);
assert.equal(parsed.ok, true);
assert.equal(parsed.authority.sourceArtifactId, 'T-synaptic-mesh-minimum-functional-reference-scope-v0');
assert.equal(parsed.authority.sourceDigest, 'sha256:abc123');
assert.equal(parsed.metadata.NOTE, 'unknown_metadata_preserved');

const expectedSource = {
  sourceArtifactId: 'T-synaptic-mesh-minimum-functional-reference-scope-v0',
  sourceArtifactPath: 'research-package/T-synaptic-mesh-minimum-functional-reference-scope-v0.md',
  sourceDigest: 'sha256:abc123',
};

const allow = validateCompactReceiptForAction(baseReceipt, {
  expectedSource,
  proposedAction: { verb: 'write_doc', target: 'research-package/T-synaptic-mesh-local-receipt-parser-validator-v0.md', riskTier: 'low_local' },
});
assert.equal(allow.decision, 'allow_local_shadow');
assert.equal(allow.metadata.NOTE, 'unknown_metadata_preserved');

const missing = validateCompactReceiptForAction(baseReceipt.replace(' SRCDIGEST=sha256:abc123;', ''), {
  expectedSource,
  proposedAction: { verb: 'write_doc', target: 'local', riskTier: 'low_local' },
});
assert.equal(missing.decision, 'fetch_abstain');
assert.match(missing.reasons.join('\n'), /SRCDIGEST|source digest mismatch/);

const wrongPath = validateCompactReceiptForAction(baseReceipt, {
  expectedSource: { ...expectedSource, sourceArtifactPath: 'different.md' },
  proposedAction: { verb: 'write_doc', target: 'local', riskTier: 'low_local' },
});
assert.equal(wrongPath.decision, 'fetch_abstain');
assert.match(wrongPath.reasons.join('\n'), /source path mismatch/);

const stale = validateCompactReceiptForAction(baseReceipt.replace('FRESH=current', 'FRESH=stale'), {
  expectedSource,
  proposedAction: { verb: 'write_doc', target: 'local', riskTier: 'low_local' },
});
assert.equal(stale.decision, 'fetch_abstain');
assert.match(stale.reasons.join('\n'), /freshness/);

const malformed = validateCompactReceiptForAction('this is not a tuple receipt', {
  proposedAction: { verb: 'write_doc', target: 'local', riskTier: 'low_local' },
});
assert.equal(malformed.decision, 'fetch_abstain');
assert.match(malformed.reasons.join('\n'), /no labeled receipt tuples|missing compact authority fields/);

for (const verb of ['send_external', 'runtime_integrate', 'change_config', 'delete', 'publish', 'l2_operational_use']) {
  const result = validateCompactReceiptForAction(baseReceipt, {
    expectedSource,
    proposedAction: { verb, target: 'sensitive', riskTier: 'sensitive' },
  });
  assert.equal(result.decision, 'ask_human', verb);
}

console.log(JSON.stringify({
  verdict: 'pass',
  cases: 11,
  decisions: {
    validLocal: allow.decision,
    missingDigest: missing.decision,
    wrongPath: wrongPath.decision,
    stale: stale.decision,
    malformed: malformed.decision,
    sensitive: 'ask_human',
  },
  unknownMetadataPreserved: allow.metadata.NOTE,
}, null, 2));
