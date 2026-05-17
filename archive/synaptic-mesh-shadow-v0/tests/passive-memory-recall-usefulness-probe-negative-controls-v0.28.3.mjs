import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { scorePassiveMemoryRecallUsefulness, validatePassiveMemoryRecallUsefulnessArtifact } from '../src/passive-memory-recall-usefulness-probe.mjs';
import { passiveMemoryRecallInput } from './passive-memory-recall-usefulness-probe-fixtures.mjs';

await mkdir(resolve('evidence'), { recursive: true });
const good = await passiveMemoryRecallInput();
const complete = scorePassiveMemoryRecallUsefulness(good);
const controls = [
  { name: 'missing_cards', input: { evidence: good.evidence }, expected: 'cards.explicit_array_required' },
  { name: 'too_few_cards', input: { cards: good.cards.slice(0, 2), evidence: good.evidence }, expected: 'cards.min_four_required' },
  { name: 'missing_card_type', input: { cards: good.cards.filter((card) => card.type !== 'contradiction'), evidence: good.evidence }, expected: 'cards.missing_type:contradiction' },
  { name: 'malformed_card', input: { cards: [{ id: 'bad', type: 'decision', need: 'short', expectedEvidenceIds: [] }, ...good.cards.slice(1)], evidence: good.evidence }, expected: 'cards[0].need_explicit_text_required' },
  { name: 'missing_evidence', input: { cards: good.cards, sourceArtifacts: good.sourceArtifacts }, expected: 'evidence.explicit_array_required' },
  { name: 'missing_source_artifacts', input: { cards: good.cards, evidence: good.evidence }, expected: 'sourceArtifacts.explicit_array_required' },
  { name: 'non_null_policy_decision', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { policyDecision: 'ALLOW' }), sourceArtifacts: good.sourceArtifacts }, expected: 'evidence[0].policyDecision_non_null' },
  { name: 'nested_authority_token', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { note: 'please approve this later' }), sourceArtifacts: good.sourceArtifacts }, expected: 'input.evidence[0].note.authority_token_detected' },
  { name: 'raw_output_key', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { rawOutput: 'secret' }), sourceArtifacts: good.sourceArtifacts }, expected: 'input.evidence[0].rawOutput_not_false' },
  { name: 'source_text_key', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { sourceText: 'secret' }), sourceArtifacts: good.sourceArtifacts }, expected: 'input.evidence[0].sourceText_not_false' },
  { name: 'network_fetch_flag', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { networkFetch: true }), sourceArtifacts: good.sourceArtifacts }, expected: 'input.evidence[0].networkFetch_not_false' },
  { name: 'tool_execution_flag', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { toolExecution: true }), sourceArtifacts: good.sourceArtifacts }, expected: 'input.evidence[0].toolExecution_not_false' },
  { name: 'memory_write_flag', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { memoryWrite: true }), sourceArtifacts: good.sourceArtifacts }, expected: 'input.evidence[0].memoryWrite_not_false' },
  { name: 'runtime_flag', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { runtimeIntegration: true }), sourceArtifacts: good.sourceArtifacts }, expected: 'input.evidence[0].runtimeIntegration_not_false' },
  { name: 'recommendation_authority', input: { cards: good.cards, evidence: good.evidence, sourceArtifacts: good.sourceArtifacts, recommendationIsAuthority: true }, expected: 'input.recommendation_treated_as_authority' },
  { name: 'unsourced_match', input: { cards: good.cards, evidence: good.evidence.map((entry) => entry.id === 'evidence-v027-repeatability' ? { ...entry, digest: undefined } : entry), sourceArtifacts: good.sourceArtifacts }, expected: 'cards.card-north-star-decision.unsourced_match' },
  { name: 'stale_not_marked', input: { cards: good.cards, evidence: good.evidence.map((entry) => entry.id === 'evidence-stale-generic-rag-context' ? { ...entry, stale: false } : entry), sourceArtifacts: good.sourceArtifacts }, expected: 'cards.card-stale-rag-negative-context.stale_evidence_not_marked_stale' },
  { name: 'contradiction_not_surfaced', input: { cards: good.cards, evidence: good.evidence.map((entry) => entry.id === 'evidence-readiness-theater-contradiction' ? { ...entry, signal: 'useful', contradicts: [] } : entry), sourceArtifacts: good.sourceArtifacts }, expected: 'cards.card-readiness-theater-contradiction.contradiction_evidence_not_surfaced' },

  { name: 'source_anchor_digest_mismatch', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { sourceAnchorDigest: 'bad-digest' }), sourceArtifacts: good.sourceArtifacts }, expected: 'cards.card-north-star-decision.source_binding.evidence-v027-repeatability.source_anchor_digest_mismatch' },
  { name: 'source_artifact_digest_mismatch', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { digest: 'bad-digest' }), sourceArtifacts: good.sourceArtifacts }, expected: 'cards.card-north-star-decision.source_binding.evidence-v027-repeatability.source_artifact_digest_mismatch' },
  { name: 'source_anchor_not_found', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { sourceAnchorId: 'missing-anchor' }), sourceArtifacts: good.sourceArtifacts }, expected: 'cards.card-north-star-decision.source_binding.evidence-v027-repeatability.source_anchor_not_found' },
  { name: 'stale_source_not_evidence_artifact', input: { cards: good.cards, evidence: mutateEvidence(good.evidence, { sourceArtifactPath: 'fixtures/not-evidence.json' }), sourceArtifacts: good.sourceArtifacts }, expected: 'evidence[0].source_path_not_evidence_artifact' }
];
const results = [];
for (const control of controls) {
  const artifact = scorePassiveMemoryRecallUsefulness(control.input);
  assert.equal(artifact.probeStatus, 'DEGRADED_MEMORY_RECALL_USEFULNESS_PROBE', control.name);
  assert.equal(artifact.policyDecision, null, control.name);
  assert.equal(artifact.validationIssues.includes(control.expected), true, `${control.name} expected ${control.expected}; got ${artifact.validationIssues.join(', ')}`);
  results.push({ name: control.name, validationIssues: artifact.validationIssues });
}
const badMetric = structuredClone(complete);
badMetric.metrics.usefulRecallRatio = Number.NaN;
assert.equal(validatePassiveMemoryRecallUsefulnessArtifact(badMetric).includes('artifact.metrics.usefulRecallRatio_invalid'), true);
const badReport = structuredClone(complete);
badReport.reportMarkdown += '\nPlease approve this as a runtime decision.\n';
assert.equal(validatePassiveMemoryRecallUsefulnessArtifact(badReport).some((issue) => issue.includes('artifact.reportMarkdown.authority_token_detected')), true);
const badPolicy = structuredClone(complete);
badPolicy.policyDecision = 'ALLOW';
assert.equal(validatePassiveMemoryRecallUsefulnessArtifact(badPolicy).includes('artifact.policyDecision_non_null'), true);
results.push({ name: 'invalid_nan_metric', validationIssues: validatePassiveMemoryRecallUsefulnessArtifact(badMetric) });
results.push({ name: 'report_authority_token', validationIssues: validatePassiveMemoryRecallUsefulnessArtifact(badReport) });
results.push({ name: 'artifact_policy_decision', validationIssues: validatePassiveMemoryRecallUsefulnessArtifact(badPolicy) });
for (const [name, args, expected] of [
  ['cli_nonlocal_cards_path', ['bin/passive-memory-recall-usefulness-probe.mjs', '--cards', '../cards.json', '--evidence', 'fixtures/passive-memory-recall-evidence-v0.28.1.json', '--source-artifacts', 'evidence/passive-memory-recall-source-anchors-v0.28.1.json', '--stdout'], 'cli.cards.nonlocal_path_rejected'],
  ['cli_network_evidence_path', ['bin/passive-memory-recall-usefulness-probe.mjs', '--cards', 'fixtures/passive-memory-recall-need-cards-v0.28.1.json', '--evidence', 'https://example.test/evidence.json', '--source-artifacts', 'evidence/passive-memory-recall-source-anchors-v0.28.1.json', '--stdout'], 'cli.evidence.network_path_rejected'],
  ['cli_glob_path', ['bin/passive-memory-recall-usefulness-probe.mjs', '--cards', 'fixtures/*.json', '--evidence', 'fixtures/passive-memory-recall-evidence-v0.28.1.json', '--source-artifacts', 'evidence/passive-memory-recall-source-anchors-v0.28.1.json', '--stdout'], 'cli.cards.glob_or_discovery_rejected'],
  ['cli_out_markdown_requires_evidence_dir', ['bin/passive-memory-recall-usefulness-probe.mjs', '--cards', 'fixtures/passive-memory-recall-need-cards-v0.28.1.json', '--evidence', 'fixtures/passive-memory-recall-evidence-v0.28.1.json', '--source-artifacts', 'evidence/passive-memory-recall-source-anchors-v0.28.1.json', '--out-markdown', 'tmp/probe.md', '--stdout'], 'cli.outMarkdown.evidence_dir_required'],
  ['cli_rejects_daemon', ['bin/passive-memory-recall-usefulness-probe.mjs', '--cards', 'fixtures/passive-memory-recall-need-cards-v0.28.1.json', '--evidence', 'fixtures/passive-memory-recall-evidence-v0.28.1.json', '--source-artifacts', 'evidence/passive-memory-recall-source-anchors-v0.28.1.json', '--daemon', '--stdout'], 'cli.rejected_flag:--daemon'],
  ['cli_rejects_memory_write', ['bin/passive-memory-recall-usefulness-probe.mjs', '--cards', 'fixtures/passive-memory-recall-need-cards-v0.28.1.json', '--evidence', 'fixtures/passive-memory-recall-evidence-v0.28.1.json', '--source-artifacts', 'evidence/passive-memory-recall-source-anchors-v0.28.1.json', '--memory-write', '--stdout'], 'cli.rejected_flag:--memory-write']
]) {
  const child = spawnSync(process.execPath, args, { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(child.status, 1, `${name} should exit degraded; stderr=${child.stderr}`);
  const artifact = JSON.parse(child.stdout);
  assert.equal(artifact.probeStatus, 'DEGRADED_MEMORY_RECALL_USEFULNESS_PROBE', name);
  assert.equal(artifact.validationIssues.includes(expected), true, `${name} expected ${expected}; got ${artifact.validationIssues.join(', ')}`);
  results.push({ name, validationIssues: artifact.validationIssues });
}
await writeFile(resolve('evidence/passive-memory-recall-usefulness-probe-negative-controls-v0.28.3.out.json'), JSON.stringify({ rejectedNegativeControls: results }, null, 2) + '\n');
console.log(JSON.stringify({ rejectedNegativeControls: results.length }, null, 2));

function mutateEvidence(evidence, patch) {
  return evidence.map((entry, index) => index === 0 ? { ...entry, ...patch } : entry);
}
