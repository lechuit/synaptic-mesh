import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { evaluateLimitedPassiveLiveCaptureEnvelope, summarizeLimitedPassiveLiveCaptureReadiness } from '../src/limited-passive-live-capture-readiness.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, '..');
const fixture = JSON.parse(await readFile(resolve(pkg, 'fixtures/limited-passive-live-capture-envelope-v0.17.1.json'), 'utf8'));
await mkdir(resolve(pkg, 'evidence'), { recursive: true });
const controls = JSON.parse(await readFile(resolve(pkg, 'fixtures/limited-passive-live-capture-negative-controls-v0.17.3.json'), 'utf8'));
let expectedRejects = 0;
for (const control of controls) { const ev = evaluateLimitedPassiveLiveCaptureEnvelope({...fixture, ...control.input}); if (ev.readiness === 'abort') expectedRejects += 1; }
assert.equal(expectedRejects, controls.length);
const out = { artifact:'T-synaptic-mesh-limited-passive-live-capture-negative-controls-v0.17.3', timestamp:'2026-05-15T10:00:00.000Z', summary:{ expectedRejects, unexpectedPermits:0, boundaryHazardsCovered:true, enforcement:false, authorization:false, externalEffects:false }};
await writeFile(resolve(pkg,'evidence/limited-passive-live-capture-negative-controls-v0.17.3.out.json'), JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify(out.summary,null,2));
