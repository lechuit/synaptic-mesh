import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export const boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourcePathV052 = 'evidence/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-reviewer-package-v0.51.5.out.json';
export const boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceReportPathV052 = 'evidence/passive-live-memory-coherence-receiver-runtime-invocation-shim-rehearsal-report-v0.51.5.out.md';
export const boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceArtifactV052 = JSON.parse(readFileSync(boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourcePathV052, 'utf8'));
export const boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceReportV052 = readFileSync(boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceReportPathV052, 'utf8');
export const boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceSha256V052 = createHash('sha256').update(readFileSync(boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourcePathV052, 'utf8')).digest('hex');
export const boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceReportSha256V052 = createHash('sha256').update(boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceReportV052).digest('hex');

export function boundedNoEffectReceiverRuntimeAdapterFixtureSuiteInputV052(overrides = {}){
  return {
    sourceArtifact: JSON.parse(JSON.stringify(boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceArtifactV052)),
    sourceArtifactPath: boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourcePathV052,
    sourceArtifactSha256: boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceSha256V052,
    sourceReport: boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceReportV052,
    sourceReportPath: boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceReportPathV052,
    sourceReportSha256: boundedNoEffectReceiverRuntimeAdapterFixtureSuiteSourceReportSha256V052,
    ...overrides,
  };
}
