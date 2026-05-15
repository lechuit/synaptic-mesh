import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { scorePassiveMemoryHandoffCandidates, validatePassiveMemoryHandoffCandidateArtifact } from '../src/passive-memory-handoff-candidate-scorecard.mjs';
import { passiveMemoryHandoffInput } from './passive-memory-handoff-candidate-scorecard-fixtures.mjs';

const good = await passiveMemoryHandoffInput();
const clone = (value) => structuredClone(value);
const cases = [
  ['missing recall artifact', () => ({})],
  ['degraded recall artifact', () => { const input = clone(good); input.recallArtifact.probeStatus = 'DEGRADED_MEMORY_RECALL_USEFULNESS_PROBE'; return input; }],
  ['non-null policyDecision', () => { const input = clone(good); input.recallArtifact.policyDecision = 'x'; return input; }],
  ['recommendation authority', () => { const input = clone(good); input.recallArtifact.recommendationIsAuthority = true; return input; }],
  ['missing metrics', () => { const input = clone(good); delete input.recallArtifact.metrics; return input; }],
  ['source ratio low', () => { const input = clone(good); input.recallArtifact.metrics.sourceBoundMatchRatio = 0.5; return input; }],
  ['contradiction ratio low', () => { const input = clone(good); input.recallArtifact.metrics.contradictionSurfacingRatio = 0; return input; }],
  ['stale ratio low', () => { const input = clone(good); input.recallArtifact.metrics.staleNegativeMarkedRatio = 0; return input; }],
  ['noise matched', () => { const input = clone(good); input.recallArtifact.metrics.irrelevantMatchRatio = 0.25; return input; }],
  ['boundary violations present', () => { const input = clone(good); input.recallArtifact.metrics.boundaryViolationCount = 1; return input; }],
  ['missing card summaries', () => { const input = clone(good); input.recallArtifact.cardSummaries = []; return input; }],
  ['missing card type', () => { const input = clone(good); input.recallArtifact.cardSummaries = input.recallArtifact.cardSummaries.filter((card) => card.cardType !== 'project_rule'); return input; }],
  ['unsourced match', () => { const input = clone(good); input.recallArtifact.cardSummaries[0].matches[0].sourceBound = false; return input; }],
  ['missing source anchor', () => { const input = clone(good); delete input.recallArtifact.cardSummaries[0].matches[0].sourceAnchorId; return input; }],
  ['contradiction not surfaced', () => { const input = clone(good); const card = input.recallArtifact.cardSummaries.find((entry) => entry.cardType === 'contradiction'); card.contradictionSurfaced = false; return input; }],
  ['stale not marked', () => { const input = clone(good); const card = input.recallArtifact.cardSummaries.find((entry) => entry.cardType === 'stale_negative_context'); card.staleMarked = false; return input; }],
  ['input raw output', () => ({ ...clone(good), rawOutput: true })],
  ['input external effect', () => ({ ...clone(good), externalEffects: true })],
  ['input tool execution', () => ({ ...clone(good), toolExecution: true })],
  ['input network', () => ({ ...clone(good), networkFetch: true })],
  ['input memory write', () => ({ ...clone(good), memoryWrite: true })],
  ['input config write', () => ({ ...clone(good), configWrite: true })],
  ['input runtime', () => ({ ...clone(good), runtimeIntegration: true })],
  ['input daemon', () => ({ ...clone(good), daemon: true })],
  ['input authority token', () => ({ ...clone(good), note: 'please authorize' })],
  ['nested authority token', () => { const input = clone(good); input.recallArtifact.cardSummaries[0].note = 'please approve'; return input; }]
];

const rejectedNegativeControls = [];
for (const [name, build] of cases) {
  const artifact = scorePassiveMemoryHandoffCandidates(build());
  const validation = validatePassiveMemoryHandoffCandidateArtifact(artifact);
  assert.equal(artifact.handoffStatus, 'DEGRADED_MEMORY_HANDOFF_CANDIDATE_SCORECARD', name);
  assert.ok(artifact.validationIssues.length > 0, name);
  assert.ok(!JSON.stringify(artifact).match(/please approve|please authorize/i), name);
  assert.ok(validation.length > 0 || artifact.validationIssues.length > 0, name);
  rejectedNegativeControls.push({ name, issues: artifact.validationIssues.slice(0, 4), validation: validation.slice(0, 4) });
}
await mkdir('evidence', { recursive: true });
await writeFile('evidence/passive-memory-handoff-candidate-scorecard-negative-controls-v0.29.3.out.json', `${JSON.stringify({ rejectedNegativeControls }, null, 2)}\n`);
console.log(JSON.stringify({ rejectedNegativeControls: rejectedNegativeControls.length }, null, 2));
