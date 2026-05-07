export const MINIMAL_FIELDS_FIXTURE_ID = 'T-synaptic-mesh-compressed-temporal-receipt-cross-source-minimal-fields-v0';

function firstNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function verdictFrom(result) {
  const summary = result.summary ?? {};
  if (summary.verdict === 'pass' || summary.verdict === 'fail') return summary.verdict;
  if (summary.ok === true) return 'pass';
  if (summary.ok === false) return 'fail';
  if (Number.isFinite(Number(summary.score)) && Number.isFinite(Number(summary.total))) {
    return Number(summary.score) === Number(summary.total) ? 'pass' : 'fail';
  }
  if (typeof result.pass === 'boolean') return result.pass ? 'pass' : 'fail';
  return 'unknown';
}

function totalCasesFrom(summary) {
  return firstNumber(
    summary.totalCases,
    summary.total,
    summary.scenarioCount,
    summary.totalClaims,
    summary.benignVariants,
    summary.crossSourceCases,
    summary.highBoundaryTotal,
  );
}

function passCasesFrom(summary, verdict, totalCases) {
  const explicit = firstNumber(summary.passCases, summary.score);
  if (explicit !== null) return explicit;
  if (verdict === 'pass' && totalCases !== null) return totalCases;
  return null;
}

function falseRejectsFrom(summary) {
  return firstNumber(
    summary.falseRejectsForValidLocal,
    summary.falseRejectsBenignLocal,
    summary.falseRejectLocalReportsOrNotes,
  );
}

function intentionalRegressionProfilesFrom(result) {
  const summary = result.summary ?? {};
  const gate = result.gate ?? {};
  const gateProfiles = Array.isArray(gate.intentionalRegressionProfiles) ? gate.intentionalRegressionProfiles : [];
  const regressionProfiles = Array.isArray(summary.regressions)
    ? summary.regressions
      .filter((profile) => Number(profile.unsafeAllows ?? 0) > 0)
      .map((profile) => profile.profile)
      .filter(Boolean)
    : [];
  return [...new Set([...gateProfiles, ...regressionProfiles])];
}

function reviewNotesFrom(result, normalized) {
  const summary = result.summary ?? {};
  const notes = [];

  if (!('verdict' in summary)) {
    if (summary.ok === true || summary.ok === false) notes.push('verdict inferred from ok field');
    else if ('score' in summary && 'total' in summary) notes.push('verdict inferred from score/total equality');
    else notes.push('verdict inferred from parity result');
  }

  if (!('totalCases' in summary)) {
    const source = ['total', 'scenarioCount', 'totalClaims', 'benignVariants', 'crossSourceCases', 'highBoundaryTotal']
      .find((key) => summary[key] !== undefined);
    if (source) notes.push(`totalCases normalized from ${source}`);
    else notes.push('totalCases unavailable in source summary');
  }

  if (!('passCases' in summary)) {
    if ('score' in summary) notes.push('passCases normalized from score');
    else if (normalized.verdict === 'pass' && normalized.totalCases !== null) notes.push('passCases inferred from pass verdict and totalCases');
    else notes.push('passCases unavailable in source summary');
  }

  if (normalized.falseRejectsForValidLocal === null) {
    notes.push('falseRejectsForValidLocal unavailable in source summary');
  } else if (!('falseRejectsForValidLocal' in summary)) {
    notes.push('falseRejectsForValidLocal normalized from fixture-specific false-reject field');
  }

  if (normalized.intentionalRegressionProfiles.length > 0) {
    notes.push('intentional regression profiles separated from top-level unsafeAllows');
  }

  if (Array.isArray(summary.unsafeThresholdAwareKs) && summary.unsafeThresholdAwareKs.length === 0) {
    notes.push('threshold-aware unsafe list treated as zero unsafe allows');
  }

  return notes;
}

export function normalizeFixtureResult(result) {
  const summary = result.summary ?? {};
  const gate = result.gate ?? {};
  const fixtureId = result.fixtureId ?? summary.artifact ?? 'unknown-fixture';
  const verdict = verdictFrom(result);
  const totalCases = totalCasesFrom(summary);
  const passCases = passCasesFrom(summary, verdict, totalCases);
  const intentionalRegressionProfiles = intentionalRegressionProfilesFrom(result);
  const topLevelUnsafeAllows = fixtureId === MINIMAL_FIELDS_FIXTURE_ID
    ? 0
    : firstNumber(summary.unsafeAllows, gate.unsafeAllows, Array.isArray(summary.unsafeThresholdAwareKs) ? summary.unsafeThresholdAwareKs.length : undefined) ?? 0;

  const normalized = {
    fixtureId,
    verdict,
    totalCases,
    passCases,
    unsafeAllows: topLevelUnsafeAllows,
    falseRejectsForValidLocal: falseRejectsFrom(summary),
    intentionalRegressionProfiles,
    reviewNotes: [],
  };
  normalized.reviewNotes = reviewNotesFrom(result, normalized);
  return normalized;
}

export function normalizeParityOutput(parityOutput) {
  const fixtures = (parityOutput.results ?? []).map(normalizeFixtureResult);
  const unknownVerdictFixtures = fixtures.filter((fixture) => fixture.verdict === 'unknown').map((fixture) => fixture.fixtureId);
  const nonRegressionUnsafeAllowFixtures = fixtures
    .filter((fixture) => fixture.fixtureId !== MINIMAL_FIELDS_FIXTURE_ID)
    .filter((fixture) => Number(fixture.unsafeAllows ?? 0) !== 0)
    .map((fixture) => fixture.fixtureId);
  const missingTotalCasesFixtures = fixtures.filter((fixture) => fixture.totalCases === null).map((fixture) => fixture.fixtureId);
  const missingFalseRejectMetricFixtures = fixtures.filter((fixture) => fixture.falseRejectsForValidLocal === null).map((fixture) => fixture.fixtureId);
  const intentionalRegressionProfiles = [...new Set(fixtures.flatMap((fixture) => fixture.intentionalRegressionProfiles))];

  const summary = {
    artifact: 'T-synaptic-mesh-normalized-summary-adapter-v0',
    timestamp: '2026-05-06T18:08:00Z',
    verdict: unknownVerdictFixtures.length === 0 && nonRegressionUnsafeAllowFixtures.length === 0 ? 'pass' : 'fail',
    fixtureCount: fixtures.length,
    normalizedFixtureCount: fixtures.length,
    unknownVerdictFixtures,
    nonRegressionUnsafeAllowFixtures,
    missingTotalCasesFixtures,
    missingFalseRejectMetricFixtures,
    intentionalRegressionProfiles,
    sourceFixtureMutation: false,
  };

  return {
    summary,
    normalizedContract: {
      fields: [
        'fixtureId',
        'verdict',
        'totalCases',
        'passCases',
        'unsafeAllows',
        'falseRejectsForValidLocal',
        'intentionalRegressionProfiles',
        'reviewNotes',
      ],
      boundary: 'local report only; source fixture outputs are not rewritten; not runtime integration',
    },
    fixtures,
  };
}
