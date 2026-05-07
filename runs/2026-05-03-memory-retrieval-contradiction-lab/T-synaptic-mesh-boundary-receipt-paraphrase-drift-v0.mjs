#!/usr/bin/env node
import { createHash } from 'node:crypto';

const canonical = {
  highBoundaryTotal: 8,
  retrievedHighBoundary: 8,
  missingHighBoundaryDigest: 'sha256:none',
  coverageDecision: 'allow_local_shadow',
};

const cases = [
  {
    id: 'canonical_markdown_fence',
    expect: 'allow_local_shadow',
    text: `\`\`\`coverage-receipt\nhighBoundaryTotal: 8\nretrievedHighBoundary: 8\nmissingHighBoundaryDigest: sha256:none\ncoverageDecision: allow_local_shadow\n\`\`\``,
  },
  {
    id: 'prose_paraphrase_labels',
    expect: 'allow_local_shadow',
    text: 'Coverage receipt: there are 8 high-boundary items total; 8 high-boundary items were retrieved; the missing high-boundary digest is sha256:none; decision is allow local shadow only.',
  },
  {
    id: 'copy_damage_bullets_spacing',
    expect: 'allow_local_shadow',
    text: '- high boundary total = 8\n- retrieved high boundary: 8\n- missing digest: sha256:none\n- coverage decision -> allow_local_shadow',
  },
  {
    id: 'omitted_digest',
    expect: 'fetch_abstain',
    text: 'Coverage receipt says highBoundaryTotal: 8 and retrievedHighBoundary: 8. coverageDecision: allow_local_shadow.',
  },
  {
    id: 'contradictory_counts',
    expect: 'fetch_abstain',
    text: 'highBoundaryTotal: 8\nretrievedHighBoundary: 7\nmissingHighBoundaryDigest: sha256:none\ncoverageDecision: allow_local_shadow',
  },
  {
    id: 'false_complete_with_missing_digest',
    expect: 'fetch_abstain',
    text: 'Total high boundary: 8. Retrieved high boundary: 8. Missing high-boundary digest: sha256:two-items-missing. Coverage decision: allow_local_shadow.',
  },
  {
    id: 'explicit_incomplete_decision',
    expect: 'fetch_abstain',
    text: 'There are 8 high-boundary claims, only 6 retrieved, missing digest sha256:missing-two, so coverage decision is fetch_abstain.',
  },
  {
    id: 'decision_synonym_requires_normalization',
    expect: 'allow_local_shadow',
    text: 'High-boundary total is eight (8); retrieved high-boundary is also eight (8). Missing high-boundary digest: sha256:none. Decision: allowed for local shadow, not runtime.',
  },
];

function normalizeDecision(raw = '') {
  const s = raw.toLowerCase().replace(/[\s-]+/g, '_');
  if (/fetch_?abstain|abstain|incomplete|blocked/.test(s)) return 'fetch_abstain';
  if (/allow.*local.*shadow|allow_local_shadow|local_shadow/.test(s)) return 'allow_local_shadow';
  return undefined;
}

function numberAfter(patterns, text) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return Number(m[1]);
  }
}

function fieldAfter(patterns, text) {
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim().replace(/[.;]$/, '');
  }
}

function parseReceipt(text) {
  const lower = text.toLowerCase();
  const highBoundaryTotal = numberAfter([
    /highBoundaryTotal\s*[:=]\s*(\d+)/i,
    /high[- ]boundary(?: items)? total\s*(?:is|=|:)\s*(?:eight\s*\()?([0-9]+)\)?/i,
    /(?:there are)\s*(\d+)\s*high[- ]boundary/i,
    /total high boundary:\s*(\d+)/i,
  ], text);
  const retrievedHighBoundary = numberAfter([
    /retrievedHighBoundary\s*[:=]\s*(\d+)/i,
    /retrieved high[- ]boundary\s*(?:items)?\s*(?:is|=|:|->)?\s*(?:also\s*)?(?:eight\s*\()?([0-9]+)\)?/i,
    /(\d+)\s*high[- ]boundary items were retrieved/i,
    /only\s*(\d+)\s*retrieved/i,
  ], text);
  const missingHighBoundaryDigest = fieldAfter([
    /missingHighBoundaryDigest\s*[:=]\s*(sha256:[^\s.;]+)/i,
    /missing high[- ]boundary digest(?: is|:)?\s*(sha256:[^\s.;]+)/i,
    /missing digest\s*(?:is|:|=)?\s*(sha256:[^\s.;]+)/i,
  ], text);
  const decisionRaw = fieldAfter([
    /coverageDecision\s*[:=\- >]+\s*([^\n]+)/i,
    /coverage decision\s*(?:is|:|->)?\s*([^\n]+)/i,
    /decision\s*(?:is|:)?\s*([^\n]+)/i,
  ], text) || (lower.includes('allowed for local shadow') ? 'allow local shadow' : undefined);
  return { highBoundaryTotal, retrievedHighBoundary, missingHighBoundaryDigest, coverageDecision: normalizeDecision(decisionRaw) };
}

function decide(parsed) {
  const missingFields = ['highBoundaryTotal', 'retrievedHighBoundary', 'missingHighBoundaryDigest', 'coverageDecision'].filter((k) => parsed[k] === undefined);
  if (missingFields.length) return { decision: 'fetch_abstain', reason: `missing:${missingFields.join(',')}` };
  if (parsed.retrievedHighBoundary !== parsed.highBoundaryTotal) return { decision: 'fetch_abstain', reason: 'count_mismatch' };
  if (parsed.missingHighBoundaryDigest !== 'sha256:none') return { decision: 'fetch_abstain', reason: 'missing_digest_nonempty' };
  if (parsed.coverageDecision !== 'allow_local_shadow') return { decision: 'fetch_abstain', reason: 'receipt_decision_not_allow' };
  return { decision: 'allow_local_shadow', reason: 'complete_exact_boundary_coverage' };
}

const results = cases.map((c) => {
  const parsed = parseReceipt(c.text);
  const actual = decide(parsed);
  return { id: c.id, expect: c.expect, parsed, ...actual, pass: actual.decision === c.expect };
});

const summary = {
  verdict: results.every((r) => r.pass) ? 'pass' : 'fail',
  totalCases: results.length,
  passCases: results.filter((r) => r.pass).length,
  allowedCompleteTransports: results.filter((r) => r.decision === 'allow_local_shadow').length,
  failClosedCases: results.filter((r) => r.decision === 'fetch_abstain').length,
  omissionsBlocked: results.filter((r) => r.reason?.startsWith('missing')).length,
  contradictionsBlocked: results.filter((r) => r.reason === 'count_mismatch').length,
  falseCompleteBlocked: results.filter((r) => r.reason === 'missing_digest_nonempty').length,
};

const receiptDigest = createHash('sha256').update(JSON.stringify(summary)).digest('hex').slice(0, 16);
console.log(JSON.stringify({ summary, receiptDigest, canonical, results }, null, 2));
if (summary.verdict !== 'pass') process.exitCode = 1;
