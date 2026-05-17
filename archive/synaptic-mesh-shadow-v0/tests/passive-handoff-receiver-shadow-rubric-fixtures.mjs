import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
export const canonicalHandoffArtifactPath = path.join(packageRoot, 'evidence/passive-memory-handoff-candidate-scorecard-reviewer-package-v0.29.5.out.json');
export function canonicalHandoffArtifact() { return JSON.parse(readFileSync(canonicalHandoffArtifactPath, 'utf8')); }
export function clone(value) { return JSON.parse(JSON.stringify(value)); }
export function canonicalInput() { return { handoffArtifact: canonicalHandoffArtifact() }; }
export function assertBoundary(output, assert) {
  assert.equal(output.policyDecision, null);
  assert.equal(output.recommendationIsAuthority, false);
  assert.equal(output.agentConsumedOutput, false);
  assert.equal(output.notRuntimeInstruction, true);
  assert.equal(output.noMemoryWrites, true);
  assert.equal(output.noRuntimeIntegration, true);
  for (const item of output.receiverItems ?? []) {
    assert.equal(item.policyDecision, null);
    assert.equal(item.promoteToMemory, false);
    assert.equal(item.agentConsumedOutput, false);
    assert.equal(item.recommendationIsAuthority, false);
  }
}
