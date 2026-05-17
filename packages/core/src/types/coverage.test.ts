import { describe, expect, it } from 'vitest';
import { CoverageReceiptSchema } from './coverage.js';

describe('CoverageReceipt — internal consistency', () => {
  it('parses a complete coverage', () => {
    expect(() =>
      CoverageReceiptSchema.parse({
        highBoundaryTotal: 3,
        retrievedHighBoundary: 3,
        missingHighBoundaryDigests: [],
        coverageDecision: 'complete',
      }),
    ).not.toThrow();
  });

  it('parses a partial coverage when missing digests match the gap', () => {
    expect(() =>
      CoverageReceiptSchema.parse({
        highBoundaryTotal: 3,
        retrievedHighBoundary: 2,
        missingHighBoundaryDigests: ['a'.repeat(64)],
        coverageDecision: 'partial',
      }),
    ).not.toThrow();
  });

  it('rejects retrievedHighBoundary > highBoundaryTotal', () => {
    expect(() =>
      CoverageReceiptSchema.parse({
        highBoundaryTotal: 1,
        retrievedHighBoundary: 5,
        missingHighBoundaryDigests: [],
        coverageDecision: 'complete',
      }),
    ).toThrow(/cannot exceed/);
  });

  it('rejects when missing-digest count does not match the gap', () => {
    expect(() =>
      CoverageReceiptSchema.parse({
        highBoundaryTotal: 3,
        retrievedHighBoundary: 1,
        missingHighBoundaryDigests: ['a'.repeat(64)],
        coverageDecision: 'partial',
      }),
    ).toThrow(/must equal/);
  });
});
