#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { summarizeLimitedPassiveLiveCaptureReadiness } from '../src/limited-passive-live-capture-readiness.mjs';
const fixture = resolve(import.meta.dirname, '../fixtures/limited-passive-live-capture-envelope-v0.17.1.json');
const envelope = JSON.parse(readFileSync(fixture, 'utf8'));
console.log(JSON.stringify(summarizeLimitedPassiveLiveCaptureReadiness(envelope), null, 2));
