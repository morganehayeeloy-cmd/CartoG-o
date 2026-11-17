import { Download, FileText, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { RubricTemplate, StudentEvaluation } from '../types/rubric';
import { calculateEvaluationSummary, formatScoreNumber } from '../utils/scoring';

interface SavedCopiesViewProps {
  templates: RubricTemplate[];
  activeTemplate: RubricTemplate;
  evaluations: StudentEvaluation[];
  onLoadEvaluation: (evaluation: StudentEvaluation) => void;
  onDeleteEvaluation: (evaluationId: string) => void;
  onExportSinglePdf: (template: RubricTemplate, evaluation: StudentEvaluation) => void;
  onExportBatchPdf: (template: RubricTemplate, evaluations: StudentEvaluation[]) => void;
  onReturnToEvaluate: () => void;
}

export function SavedCopiesView({
  templates,
  activeTemplate,
  evaluations,
  onLoadEvaluation,
  onDeleteEvaluation,
  onExportSinglePdf,
  onExportBatchPdf,
  onReturnToEvaluate,
}: SavedCopiesViewProps) {
  const [scope, setScope] = useState<'active' | 'all'>('active');

  const visibleEvaluations =
    scope === 'active'
      ? evaluations.filter((e) => e.templateId === activeTemplate.id)
      : evaluations;

  const activeCopies = evaluations.filter(
    (e) => e.templateId === activeTemplate.id
  );

  // Class statistics for active template
  const activeStats = (() => {
    if (activeCopies.length === 0) return null;
    const scoresOn20 = activeCopies.map(
      (ev) => calculateEvaluationSummary(activeTemplate, ev).scoreOn20
    );
    const avg = scoresOn20.reduce((a, b) => a + b, 0) / scoresOn20.length;
    const min = Math.min(...scoresOn20);
    const max = Math.max(...scoresOn20);
    return {
      count: activeCopies.length,
      avg: Math.round(avg * 10) / 10,
      min,
      max,
    };
  })();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              Copies évaluées et export groupé
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Retrouvez les grilles corrigées de vos élèves et exportez un PDF individuel ou pour toute la classe.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setScope('active')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  scope === 'active'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cette grille ({activeCopies.length})
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  scope === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Toutes les grilles ({evaluations.length})
              </button>
            </div>

            {activeCopies.length > 0 && (
              <button
                type="button"
                onClick={() => onExportBatchPdf(activeTemplate, activeCopies)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0369A1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284C7] transition-colors whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Exporter toute la classe (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Class statistics strip */}
        {activeStats && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-4">
            <div>
              <div className="text-xs text-slate-500">Copies (grille active)</div>
              <div className="font-mono-tabular text-lg font-bold text-slate-900">
                {activeStats.count}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Moyenne de classe</div>
              <div className="font-mono-tabular text-lg font-bold text-[#0369A1]">
                {formatScoreNumber(activeStats.avg)} / 20
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Note minimale</div>
              <div className="font-mono-tabular text-lg font-semibold text-slate-800">
                {formatScoreNumber(activeStats.min)} / 20
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Note maximale</div>
              <div className="font-mono-tabular text-lg font-semibold text-slate-800">
                {formatScoreNumber(activeStats.max)} / 20
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty state or list */}
      {visibleEvaluations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <FileText
            className="mx-auto h-9 w-9 text-slate-400"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-base font-semibold text-slate-900">
            Aucune copie enregistrée
          </h2>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            Évaluez une carte dans l&apos;onglet Évaluation puis cliquez sur « Enregistrer la copie » pour constituer votre suivi de classe.
          </p>
          <button
            type="button"
            onClick={onReturnToEvaluate}
            className="mt-4 rounded-lg bg-[#0369A1] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0284C7]"
          >
            Évaluer un élève
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <th className="px-4 py-3">Élève</th>
                  <th className="px-4 py-3">Classe</th>
                  <th className="px-4 py-3">Grille</th>
                  <th className="px-4 py-3 text-right">Score brut</th>
                  <th className="px-4 py-3 text-right">Note / 20</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {visibleEvaluations.map((ev) => {
                  const tpl =
                    templates.find((t) => t.id === ev.templateId) ??
                    activeTemplate;
                  const summary = calculateEvaluationSummary(tpl, ev);
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {ev.studentName.trim() || 'Élève sans nom'}
                        <div className="text-xs font-normal text-slate-500 tabular-nums">
                          {ev.evaluationDate.split('-').reverse().join('/')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {ev.studentClass.trim() || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                        <span className="text-xs text-slate-500 mr-1.5">
                          {tpl.workType === 'croquis' ? 'Croquis' : 'Synthèse'} ·
                        </span>
                        {tpl.title}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular font-medium text-slate-900">
                        {formatScoreNumber(summary.totalEarned)} /{' '}
                        {formatScoreNumber(summary.totalMax)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono-tabular font-bold text-[#0369A1]">
                        {formatScoreNumber(summary.scoreOn20)} / 20
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onExportSinglePdf(tpl, ev)}
                            aria-label={`Exporter le PDF de ${ev.studentName || 'cet élève'}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onLoadEvaluation(ev)}
                            aria-label={`Modifier l'évaluation de ${ev.studentName || 'cet élève'}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Ouvrir</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEvaluation(ev.id)}
                            aria-label={`Supprimer la copie de ${ev.studentName || 'cet élève'}`}
                            className="rounded-md border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
