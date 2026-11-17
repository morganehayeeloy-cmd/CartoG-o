import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  Save,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  CalculatedEvaluationSummary,
  CompetencySection,
  CriterionGradeInput,
  CriterionItem,
  ErrorTier,
  RubricTemplate,
  StudentEvaluation,
} from '../types/rubric';
import { formatScoreNumber, getSectionBaseMax } from '../utils/scoring';

interface GradingWorkspaceProps {
  template: RubricTemplate;
  evaluation: StudentEvaluation;
  summary: CalculatedEvaluationSummary;
  onChangeEvaluation: (updater: (prev: StudentEvaluation) => StudentEvaluation) => void;
  onSaveCopy: () => void;
  onResetEvaluation: () => void;
  onOpenCustomizer: () => void;
  saveStatusMessage: string | null;
}

export function GradingWorkspace({
  template,
  evaluation,
  summary,
  onChangeEvaluation,
  onSaveCopy,
  onResetEvaluation,
  onOpenCustomizer,
  saveStatusMessage,
}: GradingWorkspaceProps) {
  const hasSpellingPenaltySection = template.sections.some(
    (s) => (s.spellingPenaltyPerError ?? 0) > 0
  );

  const updateCriterionGrade = (
    criterionId: string,
    patch: Partial<CriterionGradeInput>
  ) => {
    onChangeEvaluation((prev) => ({
      ...prev,
      grades: {
        ...prev.grades,
        [criterionId]: {
          ...prev.grades[criterionId],
          ...patch,
        },
      },
    }));
  };

  return (
    <div className="space-y-5">
      {/* Live Score Summary Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">
              {template.workType === 'croquis'
                ? 'Croquis cartographique'
                : 'Carte de synthèse'}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 text-balance">
              {template.title}
            </h1>
            {template.subtitle?.trim() && (
              <p className="text-sm text-slate-600 mt-0.5">{template.subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-500">Total brut</div>
              <div className="font-mono-tabular text-2xl font-semibold text-slate-900">
                {formatScoreNumber(summary.totalEarned)}
                <span className="text-base font-normal text-slate-500">
                  {' '}
                  / {formatScoreNumber(summary.totalMax)}
                </span>
              </div>
            </div>

            {template.showScoreOn20 && (
              <div className="pl-5 border-l border-slate-200 text-right">
                <div className="text-xs font-medium text-slate-500">Note / 20</div>
                <div className="font-mono-tabular text-2xl font-bold text-[#0369A1]">
                  {formatScoreNumber(summary.scoreOn20)}
                  <span className="text-base font-normal text-slate-500"> / 20</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student identity inputs */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-12 border-t border-slate-100 pt-4">
          <div className="sm:col-span-5">
            <label
              htmlFor="student-name-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Nom et prénom de l&apos;élève
            </label>
            <input
              id="student-name-input"
              type="text"
              value={evaluation.studentName}
              onChange={(e) =>
                onChangeEvaluation((prev) => ({
                  ...prev,
                  studentName: e.target.value,
                }))
              }
              placeholder="Ex. : Léa Dupont"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="student-class-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Classe
            </label>
            <input
              id="student-class-input"
              type="text"
              value={evaluation.studentClass}
              onChange={(e) =>
                onChangeEvaluation((prev) => ({
                  ...prev,
                  studentClass: e.target.value,
                }))
              }
              placeholder="Ex. : 4e Géo B"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
            />
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="eval-date-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Date d&apos;évaluation
            </label>
            <input
              id="eval-date-input"
              type="date"
              value={evaluation.evaluationDate}
              onChange={(e) =>
                onChangeEvaluation((prev) => ({
                  ...prev,
                  evaluationDate: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 tabular-nums focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
            />
          </div>
        </div>

        {/* Spelling faults control when relevant */}
        {hasSpellingPenaltySection && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <div>
              <label
                htmlFor="spelling-errors-input"
                className="text-xs font-semibold text-slate-800"
              >
                Fautes d&apos;orthographe (Analyser)
              </label>
              <p className="text-xs text-slate-500">
                Déduction automatique selon le barème de la grille
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Diminuer le nombre de fautes d'orthographe"
                onClick={() =>
                  onChangeEvaluation((prev) => ({
                    ...prev,
                    spellingErrors: Math.max(0, prev.spellingErrors - 1),
                  }))
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <input
                id="spelling-errors-input"
                type="number"
                min={0}
                step={1}
                value={evaluation.spellingErrors}
                onChange={(e) =>
                  onChangeEvaluation((prev) => ({
                    ...prev,
                    spellingErrors: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-sm font-semibold tabular-nums text-slate-900"
              />
              <button
                type="button"
                aria-label="Augmenter le nombre de fautes d'orthographe"
                onClick={() =>
                  onChangeEvaluation((prev) => ({
                    ...prev,
                    spellingErrors: prev.spellingErrors + 1,
                  }))
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Analyser 50% threshold status banner when any section uses requiresAnalyserPass */}
      {template.sections.some((s) => s.requiresAnalyserPass) &&
        summary.analyserMax > 0 && (
          <div
            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs ${
              summary.analyserPassed
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                : 'border-amber-300 bg-amber-50 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {summary.analyserPassed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
              )}
              <span>
                <strong>Règle des 50% en Analyser :</strong>{' '}
                <span className="font-mono-tabular font-semibold">
                  {formatScoreNumber(summary.analyserEarned)} /{' '}
                  {formatScoreNumber(summary.analyserMax)} ({summary.analyserPercentage}%)
                </span>{' '}
                —{' '}
                {summary.analyserPassed
                  ? 'Seuil dépassé (> 50%), les compétences conditionnelles sont débloquées.'
                  : 'Seuil non atteint (≤ 50%), Sélectionner / Critiquer / Synthétiser sont verrouillées à 0.'}
              </span>
            </div>

            {!summary.analyserPassed && (
              <label className="inline-flex items-center gap-2 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={evaluation.overrideAnalyserThreshold}
                  onChange={(e) =>
                    onChangeEvaluation((prev) => ({
                      ...prev,
                      overrideAnalyserThreshold: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-amber-400 text-[#0369A1] focus:ring-[#0369A1]"
                />
                <span>Forcer l&apos;évaluation</span>
              </label>
            )}
          </div>
        )}

      {/* Competency Grading Sections */}
      {template.sections.map((section) => (
        <CompetencyGradingCard
          key={section.id}
          section={section}
          summary={summary}
          evaluation={evaluation}
          onUpdateCriterion={updateCriterionGrade}
        />
      ))}

      {/* General appreciation + actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div>
          <label
            htmlFor="general-comment-textarea"
            className="block text-sm font-semibold text-slate-900 mb-1.5"
          >
            Remarque / appréciation pour l&apos;élève
          </label>
          <textarea
            id="general-comment-textarea"
            rows={3}
            value={evaluation.generalComment}
            onChange={(e) =>
              onChangeEvaluation((prev) => ({
                ...prev,
                generalComment: e.target.value,
              }))
            }
            placeholder="Points forts, axes d'amélioration (légende, localisation, soin, sélection des informations)..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSaveCopy}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>Enregistrer la copie</span>
            </button>

            <button
              type="button"
              onClick={onResetEvaluation}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Nouvel élève</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenCustomizer}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Personnaliser les critères</span>
          </button>
        </div>

        {saveStatusMessage && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{saveStatusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CompetencyGradingCard({
  section,
  summary,
  evaluation,
  onUpdateCriterion,
}: {
  section: CompetencySection;
  summary: CalculatedEvaluationSummary;
  evaluation: StudentEvaluation;
  onUpdateCriterion: (
    criterionId: string,
    patch: Partial<CriterionGradeInput>
  ) => void;
}) {
  const secRes = summary.sectionResults[section.id];
  const { maxPoints, bonusMax } = getSectionBaseMax(section);
  const isLocked = Boolean(secRes?.lockedByAnalyserThreshold);

  return (
    <section
      aria-label={`Compétence ${section.title}`}
      className={`rounded-xl border bg-white overflow-hidden transition-opacity ${
        isLocked ? 'border-slate-200 opacity-75' : 'border-slate-200'
      }`}
    >
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">{section.title}</h2>
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Verrouillé (Analyse ≤ 50%)
              </span>
            )}
          </div>
          {(section.subtitle || section.requiresAnalyserPass || section.spellingPenaltyPerError) && (
            <p className="text-xs text-slate-500 mt-0.5">
              {[
                section.subtitle,
                section.requiresAnalyserPass
                  ? "Condition : > 50% en Analyser"
                  : null,
                section.spellingPenaltyPerError
                  ? `-${formatScoreNumber(section.spellingPenaltyPerError)} pt / faute d'orthographe`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>

        <div className="font-mono-tabular text-sm font-bold text-slate-900">
          {formatScoreNumber(secRes?.earned ?? 0)}
          <span className="font-normal text-slate-500">
            {' '}
            / {formatScoreNumber(maxPoints)}
            {bonusMax > 0 ? ` (+${formatScoreNumber(bonusMax)})` : ''}
          </span>
        </div>
      </div>

      {/* Criteria rows */}
      <div className="divide-y divide-slate-100">
        {section.criteria.map((criterion) => (
          <CriterionGradeRow
            key={criterion.id}
            criterion={criterion}
            input={evaluation.grades[criterion.id]}
            earned={secRes?.criteriaResults[criterion.id]?.earned ?? 0}
            disabled={isLocked}
            onUpdate={(patch) => onUpdateCriterion(criterion.id, patch)}
          />
        ))}
      </div>
    </section>
  );
}

function CriterionGradeRow({
  criterion,
  input,
  earned,
  disabled,
  onUpdate,
}: {
  criterion: CriterionItem;
  input: CriterionGradeInput | undefined;
  earned: number;
  disabled: boolean;
  onUpdate: (patch: Partial<CriterionGradeInput>) => void;
}) {
  const step = criterion.step ?? 0.5;
  const currentPoints = input?.points ?? 0;

  // Build quick score buttons when reasonable count (<= 11 options)
  const buildQuickOptions = (): number[] | null => {
    const count = Math.floor(criterion.maxPoints / step) + 1;
    if (count > 11 || count < 2) return null;
    const opts: number[] = [];
    for (let v = 0; v <= criterion.maxPoints + 1e-6; v += step) {
      opts.push(Math.round(v * 100) / 100);
    }
    return opts;
  };

  const quickOptions =
    criterion.evaluationMode === 'points' ? buildQuickOptions() : null;

  return (
    <div className="px-4 py-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-medium text-slate-900">
            {criterion.label}
          </span>
          <span className="text-xs font-mono-tabular text-slate-500">
            ({criterion.isBonus ? 'Bonus +' : '/'}
            {formatScoreNumber(criterion.maxPoints)} pt
            {criterion.maxPoints > 1 ? 's' : ''})
          </span>
        </div>
        {criterion.description?.trim() && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {criterion.description}
          </p>
        )}
      </div>

      {/* Controls depending on evaluation mode */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {criterion.evaluationMode === 'binary_error' && (
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onUpdate({ hasUselessOrUnverifiedError: false })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-50 ${
                !input?.hasUselessOrUnverifiedError
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Validé ({formatScoreNumber(criterion.maxPoints)} pts)
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onUpdate({ hasUselessOrUnverifiedError: true })}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-50 ${
                input?.hasUselessOrUnverifiedError
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Info inutile / erreur (0 pt)
            </button>
          </div>
        )}

        {criterion.evaluationMode === 'error_tiered' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(
                [
                  { id: 'none', label: 'Pertinent' },
                  { id: 'grave', label: 'Erreur grave (50%)' },
                  { id: 'fatale', label: 'Erreur fatale (0%)' },
                ] as { id: ErrorTier; label: string }[]
              ).map((opt) => {
                const active = (input?.errorTier ?? 'none') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={disabled}
                    onClick={() =>
                      onUpdate({
                        errorTier: opt.id,
                        points:
                          opt.id === 'none'
                            ? input?.points ?? criterion.maxPoints
                            : undefined,
                      })
                    }
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap disabled:opacity-50 ${
                      active
                        ? opt.id === 'fatale'
                          ? 'bg-red-600 text-white shadow-xs'
                          : opt.id === 'grave'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {(input?.errorTier ?? 'none') === 'none' && (
              <input
                type="number"
                aria-label={`Points pour ${criterion.label}`}
                disabled={disabled}
                min={0}
                max={criterion.maxPoints}
                step={step}
                value={input?.points ?? criterion.maxPoints}
                onChange={(e) =>
                  onUpdate({
                    points: Math.min(
                      criterion.maxPoints,
                      Math.max(0, Number(e.target.value) || 0)
                    ),
                  })
                }
                className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-xs font-semibold tabular-nums text-slate-900 disabled:opacity-50"
              />
            )}
          </div>
        )}

        {criterion.evaluationMode === 'points' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {quickOptions ? (
              <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                {quickOptions.map((val) => {
                  const isSelected = Math.abs(currentPoints - val) < 0.01;
                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={disabled}
                      aria-label={`${criterion.label} : ${formatScoreNumber(val)} ${
                        val > 1 ? 'points' : 'point'
                      }`}
                      onClick={() => onUpdate({ points: val })}
                      className={`min-w-[30px] rounded-md px-2 py-1 text-xs font-semibold tabular-nums transition-colors disabled:opacity-50 ${
                        isSelected
                          ? 'bg-[#0369A1] text-white shadow-xs'
                          : 'text-slate-700 hover:bg-white'
                      }`}
                    >
                      {formatScoreNumber(val)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Retirer ${step} point à ${criterion.label}`}
                  onClick={() =>
                    onUpdate({ points: Math.max(0, currentPoints - step) })
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <input
                  type="number"
                  aria-label={`Points pour ${criterion.label}`}
                  disabled={disabled}
                  min={0}
                  max={criterion.maxPoints}
                  step={step}
                  value={currentPoints}
                  onChange={(e) =>
                    onUpdate({
                      points: Math.min(
                        criterion.maxPoints,
                        Math.max(0, Number(e.target.value) || 0)
                      ),
                    })
                  }
                  className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-sm font-semibold tabular-nums text-slate-900 disabled:opacity-50"
                />
                <button
                  type="button"
                  disabled={disabled}
                  aria-label={`Ajouter ${step} point à ${criterion.label}`}
                  onClick={() =>
                    onUpdate({
                      points: Math.min(criterion.maxPoints, currentPoints + step),
                    })
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="w-14 text-right font-mono-tabular text-xs font-bold text-slate-900">
          {formatScoreNumber(earned)} pt{earned > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
