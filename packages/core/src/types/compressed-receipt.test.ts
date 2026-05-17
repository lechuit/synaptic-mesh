/**
 * Tests for the Compressed Temporal Receipt schema.
 *
 * These tests function as an executable spec: every invariant the
 * compressed-temporal-receipt-v0.md spec requires must show up here as a
 * passing parse (positive) or a rejecting parse (negative).
 */

import { describe, expect, it } from 'vitest';
import {
  AUTHORITY_CRITICAL_KEYS,
  CompressedReceiptSchema,
  OPTIONAL_AUDIT_KEYS,
} from './compressed-receipt.js';

function baseValid(): unknown {
  return {
    src: 'src-artifact-001',
    srcPath: 'specs/aletheia-memory-authority-v0.md',
    srcDigest: 'a'.repeat(64),
    producedAt: '2026-05-16T12:00:00Z',
    freshness: 'current',
    scope: 'local',
    promotionBoundary: 'no_durable_promotion',
    forbiddenEffects: ['no_runtime_effect'],
    laterRestrictiveEvent: 'none',
    tupleComplete: true,
    proposedAction: 'local_documentation',
  };
}

describe('CompressedReceipt — invariants', () => {
  describe('positive parse', () => {
    it('accepts a minimal valid receipt with only the 11 authority fields', () => {
      const parsed = CompressedReceiptSchema.parse(baseValid());
      expect(parsed.tupleComplete).toBe(true);
      expect(parsed.freshness).toBe('current');
    });

    it('accepts a receipt with all 5 optional audit fields', () => {
      const parsed = CompressedReceiptSchema.parse({
        ...(baseValid() as object),
        receiptId: 'r-001',
        receiverHint: 'no auto-promotion',
        chain: 'shadow→handoff',
        confidence: 0.83,
        prose: 'short human summary',
      });
      expect(parsed.receiptId).toBe('r-001');
      expect(parsed.confidence).toBe(0.83);
    });
  });

  describe('fail-closed on missing/invalid authority fields', () => {
    it('rejects missing SRC', () => {
      const r = { ...(baseValid() as Record<string, unknown>) };
      r.src = undefined;
      expect(() => CompressedReceiptSchema.parse(r)).toThrow();
    });

    it('rejects FRESH=stale (parses, but the policy layer must fail-close on it)', () => {
      // The schema accepts the enum value — the *policy* fails closed.
      // This test pins that distinction.
      const parsed = CompressedReceiptSchema.parse({
        ...(baseValid() as object),
        freshness: 'stale',
      });
      expect(parsed.freshness).toBe('stale');
    });

    it('rejects FRESH=invalid_string', () => {
      expect(() =>
        CompressedReceiptSchema.parse({
          ...(baseValid() as object),
          freshness: 'kinda_fresh',
        }),
      ).toThrow();
    });

    it('rejects LRE=anything-but-none-or-known-enum', () => {
      expect(() =>
        CompressedReceiptSchema.parse({
          ...(baseValid() as object),
          laterRestrictiveEvent: 'maybe',
        }),
      ).toThrow();
    });

    it('rejects TOK=false — incomplete tuples fail closed at parse time', () => {
      expect(() =>
        CompressedReceiptSchema.parse({
          ...(baseValid() as object),
          tupleComplete: false,
        }),
      ).toThrow(/TOK must be true/);
    });

    it('rejects empty NO — empty prohibition list fails closed', () => {
      expect(() =>
        CompressedReceiptSchema.parse({
          ...(baseValid() as object),
          forbiddenEffects: [],
        }),
      ).toThrow(/at least one forbidden effect/);
    });

    it('rejects non-ISO producedAt', () => {
      expect(() =>
        CompressedReceiptSchema.parse({
          ...(baseValid() as object),
          producedAt: '2026-05-16',
        }),
      ).toThrow();
    });

    it('rejects malformed digest', () => {
      expect(() =>
        CompressedReceiptSchema.parse({
          ...(baseValid() as object),
          srcDigest: 'not-a-hex-digest',
        }),
      ).toThrow();
    });
  });

  describe('optional field validation', () => {
    it('rejects confidence > 1', () => {
      expect(() =>
        CompressedReceiptSchema.parse({
          ...(baseValid() as object),
          confidence: 1.5,
        }),
      ).toThrow();
    });

    it('rejects negative confidence', () => {
      expect(() =>
        CompressedReceiptSchema.parse({
          ...(baseValid() as object),
          confidence: -0.1,
        }),
      ).toThrow();
    });
  });
});

describe('CompressedReceipt — wire-key inventory', () => {
  it('exposes exactly the 11 spec-mandated authority keys', () => {
    expect(AUTHORITY_CRITICAL_KEYS).toEqual([
      'SRC',
      'SRCPATH',
      'SRCDIGEST',
      'PROD',
      'FRESH',
      'SCOPE',
      'PB',
      'NO',
      'LRE',
      'TOK',
      'ACT',
    ]);
    expect(AUTHORITY_CRITICAL_KEYS).toHaveLength(11);
  });

  it('exposes exactly the 5 spec-mandated optional keys', () => {
    expect(OPTIONAL_AUDIT_KEYS).toEqual(['CTRID', 'RB', 'CHAIN', 'CONF', 'PROSE']);
    expect(OPTIONAL_AUDIT_KEYS).toHaveLength(5);
  });
});
