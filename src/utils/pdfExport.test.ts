import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeFilename, sanitizePdfText } from './pdfExport';
import { BUILT_IN_TEMPLATES } from '../data/defaultTemplates';
import { calculateEvaluationSummary, createEmptyEvaluation } from './scoring';

test('sanitizePdfText converts unsupported typographic glyphs while preserving French accents', () => {
  const input = "L’accès à l’eau — cœur de l’analyse (≤ 250 hab./km²) ⇒ succès";
  const out = sanitizePdfText(input);
  assert.equal(out, "L'accès à l'eau - coeur de l'analyse (<= 250 hab./km2) => succès");
});

test('sanitizeFilename strips accents and punctuation safely', () => {
  assert.equal(
    sanitizeFilename("L'accès à l'eau — Léa Dupont"),
    'l_acces_a_l_eau_lea_dupont'
  );
});

test('all built-in templates produce valid finite summaries', () => {
  for (const tpl of BUILT_IN_TEMPLATES) {
    const empty = createEmptyEvaluation(tpl);
    const summary = calculateEvaluationSummary(tpl, empty);
    assert.ok(summary.totalMax > 0, `${tpl.id} should have positive totalMax`);
    assert.ok(Number.isFinite(summary.scoreOn20), `${tpl.id} scoreOn20 must be finite`);
  }
});
