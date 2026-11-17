import type {
  CalculatedCriterionResult,
  CalculatedEvaluationSummary,
  CalculatedSectionResult,
  CompetencySection,
  CriterionGradeInput,
  CriterionItem,
  RubricTemplate,
  StudentEvaluation,
} from '../types/rubric';

export function roundToHalfOrTenth(value: number, precision: 1 | 2 = 2): number {
  const factor = precision === 1 ? 10 : 100;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function clampPoints(value: number, maxPoints: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > maxPoints) return maxPoints;
  return roundToHalfOrTenth(value, 2);
}

export function computeCriterionScore(
  criterion: CriterionItem,
  input: CriterionGradeInput | undefined
): CalculatedCriterionResult {
  const maxPoints = Math.max(0, criterion.maxPoints);
  const isBonus = Boolean(criterion.isBonus);

  if (criterion.evaluationMode === 'binary_error') {
    const hasError = Boolean(input?.hasUselessOrUnverifiedError);
    return {
      criterionId: criterion.id,
      earned: hasError ? 0 : maxPoints,
      maxPoints,
      isBonus,
      statusNote: hasError ? 'Information inutile / erreur (0 pt)' : 'Validé',
    };
  }

  if (criterion.evaluationMode === 'error_tiered') {
    const tier = input?.errorTier ?? 'none';
    if (tier === 'fatale') {
      return {
        criterionId: criterion.id,
        earned: 0,
        maxPoints,
        isBonus,
        statusNote: 'Erreur fatale (0%)',
      };
    }
    if (tier === 'grave') {
      const half = roundToHalfOrTenth(maxPoints * 0.5, 2);
      return {
        criterionId: criterion.id,
        earned: half,
        maxPoints,
        isBonus,
        statusNote: 'Erreur grave (50%)',
      };
    }
    const basePoints =
      input?.points !== undefined ? clampPoints(input.points, maxPoints) : maxPoints;
    return {
      criterionId: criterion.id,
      earned: basePoints,
      maxPoints,
      isBonus,
      statusNote: basePoints === maxPoints ? 'Pertinent' : undefined,
    };
  }

  // Standard 'points' mode
  const raw = input?.points ?? 0;
  const earned = clampPoints(raw, maxPoints);
  return {
    criterionId: criterion.id,
    earned,
    maxPoints,
    isBonus,
  };
}

export function getSectionBaseMax(section: CompetencySection): {
  maxPoints: number;
  bonusMax: number;
} {
  let maxPoints = 0;
  let bonusMax = 0;
  for (const criterion of section.criteria) {
    if (criterion.isBonus) {
      bonusMax += Math.max(0, criterion.maxPoints);
    } else {
      maxPoints += Math.max(0, criterion.maxPoints);
    }
  }
  return {
    maxPoints: roundToHalfOrTenth(maxPoints, 2),
    bonusMax: roundToHalfOrTenth(bonusMax, 2),
  };
}

export function calculateEvaluationSummary(
  template: RubricTemplate,
  evaluation: Pick<
    StudentEvaluation,
    'grades' | 'spellingErrors' | 'overrideAnalyserThreshold'
  >
): CalculatedEvaluationSummary {
  const sectionResults: Record<string, CalculatedSectionResult> = {};

  // Pass 1: Compute Analyser first so threshold rules can depend on it
  let analyserEarned = 0;
  let analyserMax = 0;

  for (const section of template.sections) {
    if (section.role === 'analyser') {
      const { maxPoints, bonusMax } = getSectionBaseMax(section);
      const criteriaResults: Record<string, CalculatedCriterionResult> = {};
      let rawEarned = 0;

      for (const criterion of section.criteria) {
        const res = computeCriterionScore(criterion, evaluation.grades[criterion.id]);
        criteriaResults[criterion.id] = res;
        rawEarned += res.earned;
      }

      const penaltyPerError = section.spellingPenaltyPerError ?? 0;
      const spellingDeduction =
        penaltyPerError > 0
          ? roundToHalfOrTenth(Math.max(0, evaluation.spellingErrors) * penaltyPerError, 2)
          : 0;
      const earned = roundToHalfOrTenth(Math.max(0, rawEarned - spellingDeduction), 2);

      analyserEarned += earned;
      analyserMax += maxPoints;

      sectionResults[section.id] = {
        sectionId: section.id,
        role: section.role,
        title: section.title,
        rawEarned: roundToHalfOrTenth(rawEarned, 2),
        spellingDeduction,
        earned,
        maxPoints,
        bonusMax,
        lockedByAnalyserThreshold: false,
        criteriaResults,
      };
    }
  }

  const analyserPercentage =
    analyserMax > 0 ? roundToHalfOrTenth((analyserEarned / analyserMax) * 100, 1) : 100;
  // Rule from PDFs: "si l'analyse totalise plus de 50% des points" (strictly > 50%, or >= if 0 max)
  const analyserPassed = analyserMax === 0 ? true : analyserEarned > analyserMax * 0.5;

  // Pass 2: Compute all other sections
  for (const section of template.sections) {
    if (section.role === 'analyser') continue;

    const { maxPoints, bonusMax } = getSectionBaseMax(section);
    const isLocked =
      Boolean(section.requiresAnalyserPass) &&
      !analyserPassed &&
      !evaluation.overrideAnalyserThreshold;

    const criteriaResults: Record<string, CalculatedCriterionResult> = {};
    let rawEarned = 0;

    for (const criterion of section.criteria) {
      if (isLocked) {
        criteriaResults[criterion.id] = {
          criterionId: criterion.id,
          earned: 0,
          maxPoints: Math.max(0, criterion.maxPoints),
          isBonus: Boolean(criterion.isBonus),
          statusNote: 'Non évalué (Analyse ≤ 50%)',
        };
      } else {
        const res = computeCriterionScore(criterion, evaluation.grades[criterion.id]);
        criteriaResults[criterion.id] = res;
        rawEarned += res.earned;
      }
    }

    const penaltyPerError = section.spellingPenaltyPerError ?? 0;
    const spellingDeduction =
      !isLocked && penaltyPerError > 0
        ? roundToHalfOrTenth(Math.max(0, evaluation.spellingErrors) * penaltyPerError, 2)
        : 0;
    const earned = isLocked
      ? 0
      : roundToHalfOrTenth(Math.max(0, rawEarned - spellingDeduction), 2);

    sectionResults[section.id] = {
      sectionId: section.id,
      role: section.role,
      title: section.title,
      rawEarned: roundToHalfOrTenth(rawEarned, 2),
      spellingDeduction,
      earned,
      maxPoints,
      bonusMax,
      lockedByAnalyserThreshold: isLocked,
      criteriaResults,
    };
  }

  let totalEarned = 0;
  let totalMax = 0;
  let totalBonusMax = 0;

  for (const section of template.sections) {
    const res = sectionResults[section.id];
    if (!res) continue;
    totalEarned += res.earned;
    totalMax += res.maxPoints;
    totalBonusMax += res.bonusMax;
  }

  totalEarned = roundToHalfOrTenth(totalEarned, 2);
  totalMax = roundToHalfOrTenth(totalMax, 2);
  totalBonusMax = roundToHalfOrTenth(totalBonusMax, 2);

  const scoreOn20 =
    totalMax > 0 ? roundToHalfOrTenth((totalEarned / totalMax) * 20, 1) : 0;

  return {
    sectionResults,
    analyserEarned: roundToHalfOrTenth(analyserEarned, 2),
    analyserMax: roundToHalfOrTenth(analyserMax, 2),
    analyserPercentage,
    analyserPassed,
    totalEarned,
    totalMax,
    totalBonusMax,
    scoreOn20,
  };
}

export function formatScoreNumber(value: number): string {
  const rounded = roundToHalfOrTenth(value, 2);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace('.', ',');
}

export function createEmptyEvaluation(template: RubricTemplate): StudentEvaluation {
  const grades: Record<string, CriterionGradeInput> = {};
  for (const section of template.sections) {
    for (const criterion of section.criteria) {
      if (criterion.evaluationMode === 'binary_error') {
        grades[criterion.id] = { hasUselessOrUnverifiedError: false };
      } else if (criterion.evaluationMode === 'error_tiered') {
        grades[criterion.id] = { errorTier: 'none', points: criterion.maxPoints };
      } else {
        grades[criterion.id] = { points: 0 };
      }
    }
  }

  return {
    id: `eval_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    templateId: template.id,
    studentName: '',
    studentClass: '',
    evaluationDate: new Date().toISOString().slice(0, 10),
    spellingErrors: 0,
    overrideAnalyserThreshold: false,
    generalComment: '',
    grades,
    savedAt: new Date().toISOString(),
  };
}
