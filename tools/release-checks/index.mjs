import { passiveLiveShadowCanarySuite } from './passive-live-shadow-canary.mjs';
import { readOnlyLocalFileAdapterSuite } from './read-only-local-file-adapter.mjs';
import { manualDryRunSuite } from './manual-dry-run.mjs';
import { frameworkShapedAdapterSuite } from './framework-shaped-adapter.mjs';
import { frameworkIntegrationReadinessSuite } from './framework-integration-readiness.mjs';
import { authorityConfusionBenchmarkSuite } from './authority-confusion-benchmark.mjs';
import { localHarnessLadderSuite } from './local-harness-ladder.mjs';
import { liveLikeShadowSandboxSuite } from './live-like-shadow-sandbox-ladder.mjs';
import { passiveLiveShadowLocalPilotSuite } from './passive-live-shadow-local-pilot.mjs';

export const releaseCheckSuites = Object.freeze([
  passiveLiveShadowCanarySuite,
  readOnlyLocalFileAdapterSuite,
  manualDryRunSuite,
  frameworkShapedAdapterSuite,
  frameworkIntegrationReadinessSuite,
  authorityConfusionBenchmarkSuite,
  localHarnessLadderSuite,
  liveLikeShadowSandboxSuite,
  passiveLiveShadowLocalPilotSuite,
]);
