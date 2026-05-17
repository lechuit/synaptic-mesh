import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
export const canonicalReceiverArtifactPath = path.join(packageRoot, 'evidence/passive-handoff-receiver-shadow-rubric-reviewer-package-v0.30.5.out.json');
export function canonicalReceiverArtifact(){ return JSON.parse(readFileSync(canonicalReceiverArtifactPath, 'utf8')); }
export function clone(v){ return JSON.parse(JSON.stringify(v)); }
export function canonicalInput(){ const raw = readFileSync(canonicalReceiverArtifactPath, 'utf8'); return { receiverArtifact: JSON.parse(raw), receiverArtifactPath: 'evidence/passive-handoff-receiver-shadow-rubric-reviewer-package-v0.30.5.out.json', receiverArtifactSha256: createHash('sha256').update(raw).digest('hex') }; }
export function assertBoundary(out, assert){
  assert.equal(out.policyDecision, null);
  assert.equal(out.recommendationIsAuthority, false);
  assert.equal(out.agentConsumedOutput, false);
  assert.equal(out.notRuntimeInstruction, true);
  assert.equal(out.noMemoryWrites, true);
  assert.equal(out.noRuntimeIntegration, true);
  for (const item of out.conflictItems ?? []) {
    assert.equal(item.policyDecision, null);
    assert.equal(item.precedenceSuggestionIsAuthority, false);
    assert.equal(item.promoteToMemory, false);
    assert.equal(item.agentConsumedOutput, false);
    assert.equal(item.recommendationIsAuthority, false);
  }
}
