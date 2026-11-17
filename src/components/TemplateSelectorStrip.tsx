import { Plus } from 'lucide-react';
import type { MapWorkType, RubricTemplate } from '../types/rubric';
import { formatScoreNumber, getSectionBaseMax } from '../utils/scoring';

interface TemplateSelectorStripProps {
  templates: RubricTemplate[];
  activeTemplate: RubricTemplate;
  typeFilter: 'all' | MapWorkType;
  onChangeTypeFilter: (filter: 'all' | MapWorkType) => void;
  onSelectTemplate: (templateId: string) => void;
  onCreateNewTemplate: (workType: MapWorkType) => void;
}

export function TemplateSelectorStrip({
  templates,
  activeTemplate,
  typeFilter,
  onChangeTypeFilter,
  onSelectTemplate,
  onCreateNewTemplate,
}: TemplateSelectorStripProps) {
  const filteredTemplates =
    typeFilter === 'all'
      ? templates
      : templates.filter((t) => t.workType === typeFilter);

  const totalMax = activeTemplate.sections.reduce(
    (sum, s) => sum + getSectionBaseMax(s).maxPoints,
    0
  );
  const totalBonus = activeTemplate.sections.reduce(
    (sum, s) => sum + getSectionBaseMax(s).bonusMax,
    0
  );

  return (
    <section
      aria-label="Sélection du type de carte et du modèle"
      className="border-b border-slate-200 bg-white no-print"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented filter for Croquis vs Carte de synthèse */}
          <div
            role="group"
            aria-label="Type d'exercice cartographique"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => onChangeTypeFilter('all')}
              className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => onChangeTypeFilter('croquis')}
              className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                typeFilter === 'croquis'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Croquis cartographique
            </button>
            <button
              type="button"
              onClick={() => onChangeTypeFilter('synthese')}
              className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                typeFilter === 'synthese'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Carte de synthèse
            </button>
          </div>

          {/* Template dropdown */}
          <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
            <label htmlFor="active-template-select" className="sr-only">
              Grille d&apos;évaluation active
            </label>
            <select
              id="active-template-select"
              value={activeTemplate.id}
              onChange={(e) => onSelectTemplate(e.target.value)}
              className="w-full sm:w-80 lg:w-96 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20 truncate"
            >
              {filteredTemplates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.workType === 'croquis' ? '[Croquis] ' : '[Synthèse] '}
                  {tpl.title}
                </option>
              ))}
            </select>
          </div>

          {/* Unboxed metadata summary (zero-pill discipline) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 tabular-nums">
            <span className="font-medium text-slate-700 whitespace-nowrap">
              {activeTemplate.workType === 'croquis'
                ? 'Croquis cartographique'
                : 'Carte de synthèse'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">
              Barème /{formatScoreNumber(totalMax)} pts
              {totalBonus > 0 ? ` (+${formatScoreNumber(totalBonus)} bonus)` : ''}
            </span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">
              {activeTemplate.sections.length} compétences
            </span>
          </div>
        </div>

        {/* Quick new template creation */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() =>
              onCreateNewTemplate(typeFilter === 'synthese' ? 'synthese' : 'croquis')
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              {typeFilter === 'synthese'
                ? 'Nouvelle carte synthèse'
                : 'Nouveau croquis'}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
