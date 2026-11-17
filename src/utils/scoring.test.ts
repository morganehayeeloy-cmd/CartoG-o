import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEvaluationSummary,
  computeCriterionScore,
  createEmptyEvaluation,
  formatScoreNumber,
} from './scoring';
import type { RubricTemplate } from '../types/rubric';

const sampleTemplate: RubricTemplate = {
  id: 'test-espagne',
  title: "L'accès à l'eau dans le sud de l'Espagne",
  workType: 'croquis',
  showScoreOn20: true,
  updatedAt: '2026-11-17T00:00:00.000Z',
  sections: [
    {
      id: 'sec-analyser',
      role: 'analyser',
      title: 'Analyser',
      spellingPenaltyPerError: 0.5,
      criteria: [
        {
          id: 'c-espagne',
          label: 'Espagne et voisins',
          maxPoints: 10,
          step: 1,
          evaluationMode: 'points',
        },
        {
          id: 'c-bonus',
          label: 'BONUS (détroit de Gibraltar)',
          maxPoints: 1,
          step: 1,
          isBonus: true,
          evaluationMode: 'points',
        },
      ],
    },
    {
      id: 'sec-selectionner',
      role: 'selectionner',
      title: 'Sélectionner',
      requiresAnalyserPass: true,
      criteria: [
        {
          id: 'c-sel',
          label: "Il n'y a aucune information inutile",
          maxPoints: 4,
          evaluationMode: 'binary_error',
        },
      ],
    },
    {
      id: 'sec-synthetiser',
      role: 'synthetiser',
      title: 'Synthétiser',
      requiresAnalyserPass: true,
      criteria: [
        {
          id: 'c-syn',
          label: 'Liens entre les informations corrects',
          maxPoints: 5,
          evaluationMode: 'error_tiered',
        },
      ],
    },
    {
      id: 'sec-communiquer',
      role: 'communiquer',
      title: 'Communiquer',
      criteria: [
        {
          id: 'c-com',
          label: 'Titre complet',
          maxPoints: 2,
          evaluationMode: 'points',
        },
      ],
    },
  ],
};

test('locks conditional sections when Analyser is at or below 50%', () => {
  const evalData = createEmptyEvaluation(sampleTemplate);
  evalData.grades['c-espagne'] = { points: 5 }; // exactly 50% of 10 (needs strictly > 50%)
  evalData.grades['c-com'] = { points: 2 };

  const summary = calculateEvaluationSummary(sampleTemplate, evalData);
  assert.equal(summary.analyserPassed, false);
  assert.equal(summary.sectionResults['sec-selectionner'].lockedByAnalyserThreshold, true);
  assert.equal(summary.sectionResults['sec-selectionner'].earned, 0);
  assert.equal(summary.sectionResults['sec-synthetiser'].earned, 0);
  assert.equal(summary.totalEarned, 7);
  assert.equal(summary.totalMax, 21); // 10 + 4 + 5 + 2 (bonus excluded from max)
});

test('unlocks conditional sections when Analyser exceeds 50% and applies spelling penalty', () => {
  const evalData = createEmptyEvaluation(sampleTemplate);
  evalData.grades['c-espagne'] = { points: 7 };
  evalData.grades['c-bonus'] = { points: 1 };
  evalData.grades['c-sel'] = { hasUselessOrUnverifiedError: false };
  evalData.grades['c-syn'] = { errorTier: 'grave' }; // 50% of 5 = 2.5
  evalData.grades['c-com'] = { points: 2 };
  evalData.spellingErrors = 3; // -1.5 from Analyser (7 + 1 - 1.5 = 6.5 > 5)

  const summary = calculateEvaluationSummary(sampleTemplate, evalData);
  assert.equal(summary.analyserEarned, 6.5);
  assert.equal(summary.analyserPassed, true);
  assert.equal(summary.sectionResults['sec-selectionner'].earned, 4);
  assert.equal(summary.sectionResults['sec-synthetiser'].earned, 2.5);
  assert.equal(summary.totalEarned, 15); // 6.5 + 4 + 2.5 + 2
  assert.equal(summary.totalMax, 21);
  assert.equal(summary.totalBonusMax, 1);
  assert.equal(summary.scoreOn20, 14.3);
});

test('spelling penalty floors Analyser at 0 rather than negative', () => {
  const evalData = createEmptyEvaluation(sampleTemplate);
  evalData.grades['c-espagne'] = { points: 1 };
  evalData.spellingErrors = 10;

  const summary = calculateEvaluationSummary(sampleTemplate, evalData);
  assert.equal(summary.analyserEarned, 0);
});

test('error_tiered and binary_error criteria compute expected points', () => {
  const binaryRes = computeCriterionScore(
    {
      id: 'b1',
      label: 'Aucune info inutile',
      maxPoints: 3,
      evaluationMode: 'binary_error',
    },
    { hasUselessOrUnverifiedError: true }
  );
  assert.equal(binaryRes.earned, 0);

  const fatalRes = computeCriterionScore(
    {
      id: 't1',
      label: 'Synthèse',
      maxPoints: 20,
      evaluationMode: 'error_tiered',
    },
    { errorTier: 'fatale' }
  );
  assert.equal(fatalRes.earned, 0);

  assert.equal(formatScoreNumber(14.5), '14,5');
  assert.equal(formatScoreNumber(15), '15');
});
