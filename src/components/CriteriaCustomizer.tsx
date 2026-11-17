import {
  ArrowDown,
  ArrowUp,
  Copy,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type {
  CompetencyRole,
  CompetencySection,
  CriterionEvaluationMode,
  CriterionItem,
  MapWorkType,
  RubricTemplate,
} from '../types/rubric';
import { formatScoreNumber, getSectionBaseMax } from '../utils/scoring';

interface CriteriaCustomizerProps {
  template: RubricTemplate;
  onUpdateTemplate: (updated: RubricTemplate) => void;
  onDuplicateTemplate: () => void;
  onResetBuiltInTemplate?: () => void;
  onDone: () => void;
}

const COMPETENCY_PRESETS: {
  role: CompetencyRole;
  title: string;
  requiresAnalyserPass?: boolean;
  defaultMode: CriterionEvaluationMode;
  defaultMax: number;
}[] = [
  {
    role: 'communiquer',
    title: 'Communiquer',
    defaultMode: 'points',
    defaultMax: 2,
  },
  {
    role: 'analyser',
    title: 'Analyser',
    defaultMode: 'points',
    defaultMax: 4,
  },
  {
    role: 'selectionner',
    title: 'Sélectionner',
    requiresAnalyserPass: true,
    defaultMode: 'binary_error',
    defaultMax: 3,
  },
  {
    role: 'critiquer',
    title: 'Critiquer',
    requiresAnalyserPass: true,
    defaultMode: 'binary_error',
    defaultMax: 2,
  },
  {
    role: 'synthetiser',
    title: 'Synthétiser',
    requiresAnalyserPass: true,
    defaultMode: 'error_tiered',
    defaultMax: 10,
  },
];

export function CriteriaCustomizer({
  template,
  onUpdateTemplate,
  onDuplicateTemplate,
  onResetBuiltInTemplate,
  onDone,
}: CriteriaCustomizerProps) {
  const totalMax = template.sections.reduce(
    (sum, s) => sum + getSectionBaseMax(s).maxPoints,
    0
  );

  const patchTemplate = (patch: Partial<RubricTemplate>) => {
    onUpdateTemplate({
      ...template,
      ...patch,
      updatedAt: new Date().toISOString(),
    });
  };

  const updateSection = (
    sectionId: string,
    updater: (sec: CompetencySection) => CompetencySection
  ) => {
    patchTemplate({
      sections: template.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
    });
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= template.sections.length) return;
    const next = [...template.sections];
    const [removed] = next.splice(index, 1);
    next.splice(target, 0, removed);
    patchTemplate({ sections: next });
  };

  const deleteSection = (sectionId: string) => {
    if (template.sections.length <= 1) return;
    patchTemplate({
      sections: template.sections.filter((s) => s.id !== sectionId),
    });
  };

  const addSection = (preset?: (typeof COMPETENCY_PRESETS)[number]) => {
    const uid = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
    const newSec: CompetencySection = {
      id: `sec_${uid}`,
      role: preset?.role ?? 'custom',
      title: preset?.title ?? 'Nouvelle compétence',
      requiresAnalyserPass: preset?.requiresAnalyserPass ?? false,
      criteria: [
        {
          id: `crit_${uid}`,
          label:
            preset?.defaultMode === 'binary_error'
              ? "Il n'y a aucune information inutile"
              : preset?.defaultMode === 'error_tiered'
              ? 'Les liens entre les informations sont pertinents'
              : 'Nouveau critère',
          maxPoints: preset?.defaultMax ?? 2,
          step: 0.5,
          evaluationMode: preset?.defaultMode ?? 'points',
        },
      ],
    };
    patchTemplate({ sections: [...template.sections, newSec] });
  };

  const addCriterion = (sectionId: string) => {
    const uid = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
    updateSection(sectionId, (sec) => ({
      ...sec,
      criteria: [
        ...sec.criteria,
        {
          id: `crit_${uid}`,
          label: 'Nouveau critère',
          maxPoints: 2,
          step: 0.5,
          evaluationMode: 'points',
        },
      ],
    }));
  };

  const updateCriterion = (
    sectionId: string,
    criterionId: string,
    patch: Partial<CriterionItem>
  ) => {
    updateSection(sectionId, (sec) => ({
      ...sec,
      criteria: sec.criteria.map((c) => (c.id === criterionId ? { ...c, ...patch } : c)),
    }));
  };

  const moveCriterion = (sectionId: string, index: number, direction: -1 | 1) => {
    updateSection(sectionId, (sec) => {
      const target = index + direction;
      if (target < 0 || target >= sec.criteria.length) return sec;
      const next = [...sec.criteria];
      const [removed] = next.splice(index, 1);
      next.splice(target, 0, removed);
      return { ...sec, criteria: next };
    });
  };

  const deleteCriterion = (sectionId: string, criterionId: string) => {
    updateSection(sectionId, (sec) => {
      if (sec.criteria.length <= 1) return sec;
      return {
        ...sec,
        criteria: sec.criteria.filter((c) => c.id !== criterionId),
      };
    });
  };

  return (
    <div className="space-y-5">
      {/* General Template Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">
              Personnalisation des critères et du barème
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Toutes vos modifications s&apos;enregistrent automatiquement et mettent à jour l&apos;aperçu PDF.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onDuplicateTemplate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Dupliquer</span>
            </button>
            {onResetBuiltInTemplate && (
              <button
                type="button"
                onClick={onResetBuiltInTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Réinitialiser</span>
              </button>
            )}
            <button
              type="button"
              onClick={onDone}
              className="rounded-lg bg-[#0369A1] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0284C7] whitespace-nowrap"
            >
              Retour à l&apos;évaluation
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <label
              htmlFor="custom-tpl-title"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Titre de la grille / sujet de la carte
            </label>
            <input
              id="custom-tpl-title"
              type="text"
              value={template.title}
              onChange={(e) => patchTemplate({ title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
            />
          </div>

          <div className="sm:col-span-4">
            <label
              htmlFor="custom-tpl-worktype"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Type d&apos;exercice
            </label>
            <select
              id="custom-tpl-worktype"
              value={template.workType}
              onChange={(e) =>
                patchTemplate({ workType: e.target.value as MapWorkType })
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
            >
              <option value="croquis">Croquis cartographique</option>
              <option value="synthese">Carte de synthèse</option>
            </select>
          </div>

          <div className="sm:col-span-12">
            <label
              htmlFor="custom-tpl-subtitle"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Sous-titre ou problématique (facultatif)
            </label>
            <input
              id="custom-tpl-subtitle"
              type="text"
              value={template.subtitle ?? ''}
              onChange={(e) => patchTemplate({ subtitle: e.target.value })}
              placeholder="Ex. : Les principaux facteurs d'implantation..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-5">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={template.showScoreOn20}
                onChange={(e) =>
                  patchTemplate({ showScoreOn20: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-[#0369A1] focus:ring-[#0369A1]"
              />
              <span>Afficher la note convertie sur 20</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(template.defaultTwoUpBlankPdf)}
                onChange={(e) =>
                  patchTemplate({ defaultTwoUpBlankPdf: e.target.checked })
                }
                className="h-4 w-4 rounded border-slate-300 text-[#0369A1] focus:ring-[#0369A1]"
              />
              <span>Grille vierge 2 par page par défaut (format A4 paysage)</span>
            </label>
          </div>

          <div className="text-xs font-semibold text-slate-800 font-mono-tabular">
            Total actuel du barème : / {formatScoreNumber(totalMax)} pts
          </div>
        </div>
      </div>

      {/* Sections Editor */}
      {template.sections.map((section, secIndex) => {
        const { maxPoints, bonusMax } = getSectionBaseMax(section);
        return (
          <div
            key={section.id}
            className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[220px]">
                  <label
                    htmlFor={`sec-title-${section.id}`}
                    className="sr-only"
                  >
                    Nom de la compétence
                  </label>
                  <input
                    id={`sec-title-${section.id}`}
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(section.id, (s) => ({
                        ...s,
                        title: e.target.value,
                      }))
                    }
                    className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-bold text-slate-900 focus:border-[#0369A1] focus:outline-none"
                  />

                  <select
                    aria-label={`Rôle de la compétence ${section.title}`}
                    value={section.role}
                    onChange={(e) =>
                      updateSection(section.id, (s) => ({
                        ...s,
                        role: e.target.value as CompetencyRole,
                      }))
                    }
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                  >
                    <option value="communiquer">Compétence : Communiquer</option>
                    <option value="analyser">Compétence : Analyser</option>
                    <option value="selectionner">Compétence : Sélectionner</option>
                    <option value="critiquer">Compétence : Critiquer</option>
                    <option value="synthetiser">Compétence : Synthétiser</option>
                    <option value="custom">Compétence personnalisée</option>
                  </select>

                  <span className="text-xs font-mono-tabular font-semibold text-slate-600">
                    /{formatScoreNumber(maxPoints)} pts
                    {bonusMax > 0 ? ` (+${formatScoreNumber(bonusMax)} bonus)` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Monter la compétence ${section.title}`}
                    disabled={secIndex === 0}
                    onClick={() => moveSection(secIndex, -1)}
                    className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Descendre la compétence ${section.title}`}
                    disabled={secIndex === template.sections.length - 1}
                    onClick={() => moveSection(secIndex, 1)}
                    className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Supprimer la compétence ${section.title}`}
                    disabled={template.sections.length <= 1}
                    onClick={() => deleteSection(section.id)}
                    className="rounded-md border border-slate-300 bg-white p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
                <input
                  type="text"
                  aria-label={`Précision pour ${section.title}`}
                  value={section.subtitle ?? ''}
                  onChange={(e) =>
                    updateSection(section.id, (s) => ({
                      ...s,
                      subtitle: e.target.value,
                    }))
                  }
                  placeholder="Sous-titre facultatif (ex. : Qualités de la carte)"
                  className="flex-1 min-w-[200px] rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800"
                />

                {section.role !== 'analyser' && (
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(section.requiresAnalyserPass)}
                      onChange={(e) =>
                        updateSection(section.id, (s) => ({
                          ...s,
                          requiresAnalyserPass: e.target.checked,
                        }))
                      }
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#0369A1]"
                    />
                    <span>Condition : &gt; 50% en Analyser</span>
                  </label>
                )}

                {section.role === 'analyser' && (
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(section.spellingPenaltyPerError ?? 0) > 0}
                      onChange={(e) =>
                        updateSection(section.id, (s) => ({
                          ...s,
                          spellingPenaltyPerError: e.target.checked ? 0.5 : 0,
                        }))
                      }
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#0369A1]"
                    />
                    <span>Pénalité -0,5 pt / faute d&apos;orthographe</span>
                  </label>
                )}
              </div>
            </div>

            {/* Criteria list */}
            <div className="divide-y divide-slate-100">
              {section.criteria.map((criterion, critIdx) => (
                <div key={criterion.id} className="p-3.5 space-y-2.5">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 items-start">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor={`crit-label-${criterion.id}`}
                        className="block text-[11px] font-medium text-slate-500 mb-0.5"
                      >
                        Intitulé du critère
                      </label>
                      <input
                        id={`crit-label-${criterion.id}`}
                        type="text"
                        value={criterion.label}
                        onChange={(e) =>
                          updateCriterion(section.id, criterion.id, {
                            label: e.target.value,
                          })
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`crit-max-${criterion.id}`}
                        className="block text-[11px] font-medium text-slate-500 mb-0.5"
                      >
                        Points max
                      </label>
                      <input
                        id={`crit-max-${criterion.id}`}
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={criterion.maxPoints}
                        onChange={(e) =>
                          updateCriterion(section.id, criterion.id, {
                            maxPoints: Math.max(0.5, Number(e.target.value) || 1),
                          })
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold tabular-nums text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label
                        htmlFor={`crit-mode-${criterion.id}`}
                        className="block text-[11px] font-medium text-slate-500 mb-0.5"
                      >
                        Mode de notation
                      </label>
                      <select
                        id={`crit-mode-${criterion.id}`}
                        value={criterion.evaluationMode}
                        onChange={(e) =>
                          updateCriterion(section.id, criterion.id, {
                            evaluationMode: e.target.value as CriterionEvaluationMode,
                          })
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800"
                      >
                        <option value="points">Points (0 à max)</option>
                        <option value="binary_error">Tout ou rien (info inutile)</option>
                        <option value="error_tiered">Paliers (grave 50% / fatale 0%)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1 flex items-end justify-end gap-1 pt-5">
                      <button
                        type="button"
                        aria-label={`Monter critère ${criterion.label}`}
                        disabled={critIdx === 0}
                        onClick={() => moveCriterion(section.id, critIdx, -1)}
                        className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-35"
                      >
                        <ArrowUp className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Supprimer critère ${criterion.label}`}
                        disabled={section.criteria.length <= 1}
                        onClick={() => deleteCriterion(section.id, criterion.id)}
                        className="rounded border border-slate-200 p-1 text-red-600 hover:bg-red-50 disabled:opacity-35"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      type="text"
                      aria-label={`Description ou indicateurs pour ${criterion.label}`}
                      value={criterion.description ?? ''}
                      onChange={(e) =>
                        updateCriterion(section.id, criterion.id, {
                          description: e.target.value,
                        })
                      }
                      placeholder="Indicateurs détaillés facultatifs (ex. : Côte d'Ivoire, Ghana, ...)"
                      className="flex-1 min-w-[220px] rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                    />

                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      {criterion.evaluationMode === 'points' && (
                        <label className="inline-flex items-center gap-1.5">
                          <span>Pas :</span>
                          <select
                            value={criterion.step ?? 0.5}
                            onChange={(e) =>
                              updateCriterion(section.id, criterion.id, {
                                step: Number(e.target.value),
                              })
                            }
                            className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs"
                          >
                            <option value={0.5}>0,5 pt</option>
                            <option value={1}>1 pt</option>
                          </select>
                        </label>
                      )}

                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(criterion.isBonus)}
                          onChange={(e) =>
                            updateCriterion(section.id, criterion.id, {
                              isBonus: e.target.checked,
                            })
                          }
                          className="h-3.5 w-3.5 rounded border-slate-300 text-[#0369A1]"
                        />
                        <span>Critère BONUS (hors maximum)</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5">
              <button
                type="button"
                onClick={() => addCriterion(section.id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0369A1] hover:text-[#0284C7]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Ajouter un critère à {section.title}</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* Add new competency bar */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4">
        <div className="text-xs font-semibold text-slate-700 mb-2.5">
          Ajouter une compétence à la grille :
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {COMPETENCY_PRESETS.map((preset) => (
            <button
              key={preset.role}
              type="button"
              onClick={() => addSection(preset)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5 text-[#0369A1]" aria-hidden="true" />
              <span>{preset.title}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => addSection()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Compétence libre</span>
          </button>
        </div>
      </div>
    </div>
  );
}
