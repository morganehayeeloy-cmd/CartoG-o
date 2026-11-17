import { Copy, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { MapWorkType, RubricTemplate } from '../types/rubric';
import { formatScoreNumber, getSectionBaseMax } from '../utils/scoring';

interface TemplateLibraryViewProps {
  templates: RubricTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onCustomizeTemplate: (templateId: string) => void;
  onDuplicateTemplate: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onCreateTemplate: (workType: MapWorkType, title: string) => void;
}

export function TemplateLibraryView({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onCustomizeTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
  onCreateTemplate,
}: TemplateLibraryViewProps) {
  const [filter, setFilter] = useState<'all' | MapWorkType>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MapWorkType>('croquis');

  const visible =
    filter === 'all'
      ? templates
      : templates.filter((t) => t.workType === filter);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTemplate(newType, newTitle);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Create new template card */}
      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <h1 className="font-display text-xl font-bold text-slate-900">
          Bibliothèque des grilles d&apos;évaluation
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Choisissez parmi vos modèles prêts à l&apos;emploi (croquis ou carte de synthèse) ou créez une nouvelle grille personnalisée.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12 items-end border-t border-slate-100 pt-4">
          <div className="sm:col-span-6">
            <label
              htmlFor="new-grid-title"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Sujet / titre de la nouvelle grille
            </label>
            <input
              id="new-grid-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex. : La répartition de la population en Belgique"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="new-grid-type"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Type d&apos;exercice
            </label>
            <select
              id="new-grid-type"
              value={newType}
              onChange={(e) => setNewType(e.target.value as MapWorkType)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
            >
              <option value="croquis">Croquis cartographique</option>
              <option value="synthese">Carte de synthèse</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0369A1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0284C7] transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Créer la grille</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('croquis')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'croquis'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Croquis cartographique (
            {templates.filter((t) => t.workType === 'croquis').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('synthese')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              filter === 'synthese'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Carte de synthèse (
            {templates.filter((t) => t.workType === 'synthese').length})
          </button>
        </div>
      </div>

      {/* Template cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {visible.map((tpl) => {
          const isActive = tpl.id === activeTemplateId;
          const totalMax = tpl.sections.reduce(
            (sum, s) => sum + getSectionBaseMax(s).maxPoints,
            0
          );
          const totalBonus = tpl.sections.reduce(
            (sum, s) => sum + getSectionBaseMax(s).bonusMax,
            0
          );

          return (
            <article
              key={tpl.id}
              className={`rounded-xl border bg-white p-5 flex flex-col justify-between gap-4 transition-colors ${
                isActive ? 'border-[#0369A1] ring-1 ring-[#0369A1]/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span>
                    {tpl.workType === 'croquis'
                      ? 'Croquis cartographique'
                      : 'Carte de synthèse'}
                    {' · '}
                    <span className="font-mono-tabular font-semibold text-slate-700">
                      /{formatScoreNumber(totalMax)} pts
                    </span>
                    {totalBonus > 0
                      ? ` (+${formatScoreNumber(totalBonus)} bonus)`
                      : ''}
                  </span>
                  {isActive && (
                    <span className="font-semibold text-[#0369A1]">
                      Grille active
                    </span>
                  )}
                </div>

                <h2 className="mt-1.5 font-display text-lg font-bold text-slate-900 leading-snug">
                  {tpl.title}
                </h2>
                {tpl.subtitle?.trim() && (
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {tpl.subtitle}
                  </p>
                )}

                <div className="mt-3 text-xs text-slate-500">
                  Compétences :{' '}
                  <span className="text-slate-700">
                    {tpl.sections.map((s) => s.title).join(' · ')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTemplate(tpl.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-[#0369A1] text-white hover:bg-[#0284C7]'
                    }`}
                  >
                    {isActive ? 'Évaluer avec cette grille' : 'Utiliser cette grille'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onCustomizeTemplate(tpl.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Personnaliser</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onDuplicateTemplate(tpl.id)}
                    aria-label={`Dupliquer ${tpl.title}`}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  {templates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteTemplate(tpl.id)}
                      aria-label={`Supprimer ${tpl.title}`}
                      className="rounded-lg border border-slate-200 p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
