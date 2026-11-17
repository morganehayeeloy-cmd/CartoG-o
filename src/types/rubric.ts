export type MapWorkType = 'croquis' | 'synthese';

export type CompetencyRole =
  | 'communiquer'
  | 'analyser'
  | 'selectionner'
  | 'critiquer'
  | 'synthetiser'
  | 'custom';

/**
 * How a criterion is graded:
 * - 'points': discrete or decimal points from 0 up to maxPoints
 * - 'binary_error': full points by default, 0 if an error/useless info is flagged
 * - 'error_tiered': 100% (correct), 50% (erreur grave), or 0% (erreur fatale)
 */
export type CriterionEvaluationMode = 'points' | 'binary_error' | 'error_tiered';

export type ErrorTier = 'none' | 'grave' | 'fatale';

export interface CriterionItem {
  id: string;
  label: string;
  description?: string;
  maxPoints: number;
  step?: number; // e.g., 0.5 or 1
  isBonus?: boolean;
  evaluationMode: CriterionEvaluationMode;
}

export interface CompetencySection {
  id: string;
  role: CompetencyRole;
  title: string;
  subtitle?: string;
  requiresAnalyserPass?: boolean; // "À évaluer si l'analyse totalise plus de 50% des points"
  spellingPenaltyPerError?: number; // e.g. 0.5 in Analyser
  criteria: CriterionItem[];
}

export interface RubricTemplate {
  id: string;
  title: string;
  subtitle?: string;
  workType: MapWorkType;
  showScoreOn20: boolean;
  defaultTwoUpBlankPdf?: boolean;
  isBuiltIn?: boolean;
  updatedAt: string;
  sections: CompetencySection[];
}

export interface CriterionGradeInput {
  points?: number;
  hasUselessOrUnverifiedError?: boolean;
  errorTier?: ErrorTier;
}

export interface StudentEvaluation {
  id: string;
  templateId: string;
  studentName: string;
  studentClass: string;
  evaluationDate: string;
  spellingErrors: number;
  overrideAnalyserThreshold: boolean;
  generalComment: string;
  grades: Record<string, CriterionGradeInput>;
  savedAt: string;
}

export interface CalculatedCriterionResult {
  criterionId: string;
  earned: number;
  maxPoints: number;
  isBonus: boolean;
  statusNote?: string;
}

export interface CalculatedSectionResult {
  sectionId: string;
  role: CompetencyRole;
  title: string;
  rawEarned: number;
  spellingDeduction: number;
  earned: number;
  maxPoints: number; // excludes bonus
  bonusMax: number;
  lockedByAnalyserThreshold: boolean;
  criteriaResults: Record<string, CalculatedCriterionResult>;
}

export interface CalculatedEvaluationSummary {
  sectionResults: Record<string, CalculatedSectionResult>;
  analyserEarned: number;
  analyserMax: number;
  analyserPercentage: number;
  analyserPassed: boolean; // strictly > 50%
  totalEarned: number;
  totalMax: number;
  totalBonusMax: number;
  scoreOn20: number;
}
