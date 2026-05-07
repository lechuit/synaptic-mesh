export const RECEIPT_FIELD_ALIASES = Object.freeze({
  SRC: 'sourceArtifactId',
  SRCPATH: 'sourceArtifactPath',
  SRCDIGEST: 'sourceDigest',
  PROD: 'producedAt',
  FRESH: 'receiverFreshness',
  SCOPE: 'effectScope',
  PB: 'promotionBoundary',
  NO: 'negativeBoundary',
  LRE: 'lineageReceipt',
  TOK: 'tokenBudget',
  ACT: 'nextAllowedAction',
});

export const REQUIRED_COMPACT_RECEIPT_FIELDS = Object.freeze(Object.keys(RECEIPT_FIELD_ALIASES));

const PAIR_PATTERN = /([A-Z][A-Z0-9_]*)\s*(?:=|:)\s*("[^"]*"|'[^']*'|[^;\n|,]+)/g;

export function parseCompactReceipt(input = '') {
  if (typeof input !== 'string') {
    return { ok: false, fields: {}, authority: {}, metadata: {}, errors: ['receipt must be a string'] };
  }

  const fields = {};
  const authority = {};
  const metadata = {};
  const errors = [];
  let match;
  let pairs = 0;

  while ((match = PAIR_PATTERN.exec(input)) !== null) {
    pairs += 1;
    const rawKey = match[1].trim();
    const rawValue = stripQuotes(match[2].trim());
    fields[rawKey] = rawValue;
    const mapped = RECEIPT_FIELD_ALIASES[rawKey];
    if (mapped) authority[mapped] = rawValue;
    else metadata[rawKey] = rawValue;
  }

  if (pairs === 0) errors.push('no labeled receipt tuples found');

  return { ok: errors.length === 0, fields, authority, metadata, errors };
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
