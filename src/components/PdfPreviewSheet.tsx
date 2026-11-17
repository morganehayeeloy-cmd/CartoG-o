import { FileDown, Printer } from 'lucide-react';
import { useState } from 'react';
import type {
  CalculatedEvaluationSummary,
  RubricTemplate,
  StudentEvaluation,
} from '../types/rubric';
import { formatScoreNumber, getSectionBaseMax } from '../utils/scoring';

interface PdfPreviewSheetProps {
  template: RubricTemplate;
  evaluation: StudentEvaluation;
  summary: CalculatedEvaluationSummary;
  onExportStudentPdf: () => void;
  onExportBlankPdf: (layout: '1-up' | '2-up') => void;
}

type PreviewMode = 'graded' | 'blank-1up' | 'blank-2up';

export function PdfPreviewSheet({
  template,
  evaluation,
  summary,
  onExportStudentPdf,
  onExportBlankPdf,
}: PdfPreviewSheetProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>('graded');

  const isBlank = previewMode !== 'graded';
  const isTwoUp = previewMode === 'blank-2up';

  const renderSingleSheet = (compact = false) => {
    const formattedDate = evaluation.evaluationDate
      ? evaluation.evaluationDate.split('-').reverse().join('/')
      : '..../..../20..';

    return (
      <div
        className={`bg-white text-slate-900 border border-slate-300 shadow-sm ${
          compact ? 'p-3 text-[10px]' : 'p-5 sm:p-6 text-xs'
        }`}
      >
        {/* Student identity line */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-3 ${
            compact ? 'text-[9.5px]' : 'text-[11px]'
          }`}
        >
          <span>
            <strong className="font-semibold">Nom de l&apos;élève :</strong>{' '}
            {!isBlank && evaluation.studentName.trim()
              ? evaluation.studentName.trim()
              : '........................................'}
          </span>
          {!compact && (
            <div className="flex items-center gap-4">
              <span>
                <strong className="font-semibold">Classe :</strong>{' '}
                {!isBlank && evaluation.studentClass.trim()
                  ? evaluation.studentClass.trim()
                  : '............'}
              </span>
              <span>
                <strong className="font-semibold">Date :</strong>{' '}
                {!isBlank ? formattedDate : '..../..../20..'}
              </span>
            </div>
          )}
        </div>

        {/* Title block */}
        <div className="text-center mb-3">
          <h3
            className={`font-display font-bold uppercase tracking-tight text-slate-900 ${
              compact ? 'text-[11px] leading-tight' : 'text-sm sm:text-base leading-snug'
            }`}
          >
            {template.title}
          </h3>
          <p className={`text-slate-600 mt-0.5 ${compact ? 'text-[9px]' : 'text-[11px]'}`}>
            {template.workType === 'croquis'
              ? 'Croquis cartographique'
              : 'Carte de synthèse'}
            {template.subtitle?.trim() ? ` — ${template.subtitle.trim()}` : ''}
          </p>
        </div>

        {/* Rubric table */}
        <table className="w-full border-collapse border border-slate-400">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="border border-slate-500 px-2 py-1.5 text-left font-semibold w-[64%]">
                Compétences, critères et indicateurs
              </th>
              <th className="border border-slate-500 px-2 py-1.5 text-center font-semibold w-[18%]">
                Maximum
              </th>
              <th className="border border-slate-500 px-2 py-1.5 text-center font-semibold w-[18%]">
                Points obtenus
              </th>
            </tr>
          </thead>
          <tbody>
            {template.sections.map((section) => {
              const secRes = summary.sectionResults[section.id];
              const { maxPoints, bonusMax } = getSectionBaseMax(section);
              const notes: string[] = [];
              if (section.requiresAnalyserPass) {
                notes.push("à évaluer si l'analyse > 50%");
              }
              if (section.spellingPenaltyPerError && section.spellingPenaltyPerError > 0) {
                notes.push(`-${formatScoreNumber(section.spellingPenaltyPerError)} / faute`);
              }

              return (
                <SectionPreviewRows
                  key={section.id}
                  section={section}
                  secRes={secRes}
                  maxPoints={maxPoints}
                  bonusMax={bonusMax}
                  notes={notes}
                  isBlank={isBlank}
                  compact={compact}
                  spellingErrors={evaluation.spellingErrors}
                />
              );
            })}

            {/* Total row */}
            <tr className="bg-slate-100 font-bold">
              <td className="border border-slate-400 px-2 py-1.5 text-slate-900">
                TOTAL
              </td>
              <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums text-slate-900">
                / {formatScoreNumber(summary.totalMax)} pts
              </td>
              <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums text-[#0369A1]">
                {isBlank
                  ? `/ ${formatScoreNumber(summary.totalMax)}`
                  : `${formatScoreNumber(summary.totalEarned)} / ${formatScoreNumber(summary.totalMax)}`}
              </td>
            </tr>

            {template.showScoreOn20 && (
              <tr className="bg-slate-50 font-bold">
                <td className="border border-slate-400 px-2 py-1.5 text-slate-900">
                  NOTE RAMENÉE SUR 20
                </td>
                <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums text-slate-600">
                  / 20
                </td>
                <td className="border border-slate-400 px-2 py-1.5 text-center tabular-nums text-[#0369A1]">
                  {isBlank ? '/ 20' : `${formatScoreNumber(summary.scoreOn20)} / 20`}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Teacher comment */}
        <div className="mt-3">
          <div className="font-semibold text-slate-800 mb-1">
            Remarque / appréciation :
          </div>
          <div
            className={`border border-slate-300 px-2.5 py-2 text-slate-700 ${
              compact ? 'min-h-[32px]' : 'min-h-[44px]'
            }`}
          >
            {!isBlank && evaluation.generalComment.trim()
              ? evaluation.generalComment.trim()
              : ''}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside
      aria-label="Aperçu de la fiche PDF élève"
      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Aperçu du document PDF
          </h2>
          <p className="text-xs text-slate-500">
            Rendu fidèle à l&apos;export A4 pour vos élèves
          </p>
        </div>

        <div
          role="group"
          aria-label="Mode d'aperçu PDF"
          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
        >
          <button
            type="button"
            onClick={() => setPreviewMode('graded')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              previewMode === 'graded'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fiche corrigée
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('blank-1up')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              previewMode === 'blank-1up'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vierge 1/page
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('blank-2up')}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
              previewMode === 'blank-2up'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vierge 2/page
          </button>
        </div>
      </div>

      {/* Live paper preview canvas */}
      <div className="rounded-lg bg-slate-100 p-3 sm:p-4 overflow-x-auto lg:max-h-[calc(100vh-19rem)] lg:overflow-y-auto">
        {isTwoUp ? (
          <div className="grid grid-cols-2 gap-3 min-w-[540px]">
            {renderSingleSheet(true)}
            {renderSingleSheet(true)}
          </div>
        ) : (
          renderSingleSheet(false)
        )}
      </div>

      {/* Direct PDF export buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        {previewMode === 'graded' ? (
          <button
            type="button"
            onClick={onExportStudentPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0369A1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284C7] transition-colors whitespace-nowrap"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            <span>Télécharger cette fiche élève (PDF)</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              onExportBlankPdf(previewMode === 'blank-2up' ? '2-up' : '1-up')
            }
            className="inline-flex items-center gap-2 rounded-lg bg-[#0369A1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284C7] transition-colors whitespace-nowrap"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>
              {previewMode === 'blank-2up'
                ? 'Télécharger PDF vierge (2 grilles / A4 paysage)'
                : 'Télécharger PDF vierge (1 grille / A4)'}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            onExportBlankPdf(template.defaultTwoUpBlankPdf ? '2-up' : '1-up')
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Grille vierge PDF</span>
        </button>
      </div>
    </aside>
  );
}

import type {
  CalculatedSectionResult,
  CompetencySection,
} from '../types/rubric';

function SectionPreviewRows({
  section,
  secRes,
  maxPoints,
  bonusMax,
  notes,
  isBlank,
  compact,
  spellingErrors,
}: {
  section: CompetencySection;
  secRes: CalculatedSectionResult | undefined;
  maxPoints: number;
  bonusMax: number;
  notes: string[];
  isBlank: boolean;
  compact: boolean;
  spellingErrors: number;
}) {
  return (
    <>
      <tr className="bg-slate-200/80 font-semibold text-slate-900">
        <td className="border border-slate-400 px-2 py-1">
          <span className="uppercase">{section.title}</span>
          {notes.length > 0 && (
            <span className="ml-1.5 font-normal text-slate-700">
              ({notes.join(' · ')})
            </span>
          )}
        </td>
        <td className="border border-slate-400 px-2 py-1 text-center tabular-nums">
          / {formatScoreNumber(maxPoints)}
          {bonusMax > 0 ? ` (+${formatScoreNumber(bonusMax)})` : ''}
        </td>
        <td className="border border-slate-400 px-2 py-1 text-center tabular-nums">
          {isBlank
            ? `/ ${formatScoreNumber(maxPoints)}`
            : secRes
            ? `${formatScoreNumber(secRes.earned)} / ${formatScoreNumber(maxPoints)}`
            : `/ ${formatScoreNumber(maxPoints)}`}
        </td>
      </tr>
      {section.criteria.map((criterion) => {
        const cRes = secRes?.criteriaResults[criterion.id];
        return (
          <tr key={criterion.id} className="align-top">
            <td className="border border-slate-400 px-2 py-1 text-slate-800">
              <div>{criterion.label}</div>
              {!compact && criterion.description?.trim() && (
                <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  {criterion.description}
                </div>
              )}
            </td>
            <td className="border border-slate-400 px-2 py-1 text-center tabular-nums text-slate-600">
              {criterion.isBonus ? '+' : ''}
              {formatScoreNumber(criterion.maxPoints)} pt
              {criterion.maxPoints > 1 ? 's' : ''}
            </td>
            <td className="border border-slate-400 px-2 py-1 text-center tabular-nums font-semibold text-slate-900">
              {isBlank ? (
                ''
              ) : cRes ? (
                <div>
                  <span>{formatScoreNumber(cRes.earned)}</span>
                  {cRes.statusNote && criterion.evaluationMode !== 'points' && (
                    <div className="text-[9.5px] font-normal text-slate-500 leading-tight">
                      {cRes.statusNote}
                    </div>
                  )}
                </div>
              ) : (
                ''
              )}
            </td>
          </tr>
        );
      })}
      {!isBlank && secRes && secRes.spellingDeduction > 0 && spellingErrors > 0 && (
        <tr className="text-red-700 bg-red-50/50">
          <td className="border border-slate-400 px-2 py-1 italic">
            Déduction orthographe ({spellingErrors} faute
            {spellingErrors > 1 ? 's' : ''})
          </td>
          <td className="border border-slate-400 px-2 py-1 text-center">-</td>
          <td className="border border-slate-400 px-2 py-1 text-center font-semibold tabular-nums">
            -{formatScoreNumber(secRes.spellingDeduction)}
          </td>
        </tr>
      )}
    </>
  );
}
