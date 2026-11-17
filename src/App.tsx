/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CriteriaCustomizer } from './components/CriteriaCustomizer';
import { GradingWorkspace } from './components/GradingWorkspace';
import { HeaderBar, type AppView } from './components/HeaderBar';
import { PdfPreviewSheet } from './components/PdfPreviewSheet';
import { SavedCopiesView } from './components/SavedCopiesView';
import { TemplateLibraryView } from './components/TemplateLibraryView';
import { TemplateSelectorStrip } from './components/TemplateSelectorStrip';
import { BUILT_IN_TEMPLATES, createNewTemplate } from './data/defaultTemplates';
import type { MapWorkType, RubricTemplate, StudentEvaluation } from './types/rubric';
import {
  exportBatchStudentsPdf,
  exportBlankPdf,
  exportStudentPdf,
} from './utils/pdfExport';
import { calculateEvaluationSummary, createEmptyEvaluation } from './utils/scoring';
import {
  loadActiveTemplateId,
  loadEvaluations,
  loadTemplates,
  saveActiveTemplateId,
  saveEvaluations,
  saveTemplates,
} from './utils/storage';

export default function App() {
  const [templates, setTemplates] = useState<RubricTemplate[]>(() => loadTemplates());
  const [activeTemplateId, setActiveTemplateId] = useState<string>(() =>
    loadActiveTemplateId(loadTemplates())
  );
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>(() =>
    loadEvaluations()
  );
  const [activeView, setActiveView] = useState<AppView>('evaluate');
  const [typeFilter, setTypeFilter] = useState<'all' | MapWorkType>('all');

  const activeTemplate = useMemo(
    () => templates.find((t) => t.id === activeTemplateId) ?? templates[0],
    [templates, activeTemplateId]
  );

  const [currentEvaluation, setCurrentEvaluation] = useState<StudentEvaluation>(() =>
    createEmptyEvaluation(activeTemplate)
  );
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  useEffect(() => {
    saveEvaluations(evaluations);
  }, [evaluations]);

  useEffect(() => {
    saveActiveTemplateId(activeTemplateId);
  }, [activeTemplateId]);

  // Keep typeFilter coherent if user picks a specific filter in toolbar
  const handleChangeTypeFilter = (filter: 'all' | MapWorkType) => {
    setTypeFilter(filter);
    if (filter !== 'all' && activeTemplate.workType !== filter) {
      const firstMatch = templates.find((t) => t.workType === filter);
      if (firstMatch) {
        handleSelectTemplate(firstMatch.id);
      }
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const nextTpl = templates.find((t) => t.id === templateId);
    if (!nextTpl) return;
    setActiveTemplateId(nextTpl.id);
    setCurrentEvaluation(createEmptyEvaluation(nextTpl));
    setSaveStatusMessage(null);
  };

  const handleCreateNewTemplate = (workType: MapWorkType, title?: string) => {
    const newTpl = createNewTemplate(workType, title);
    setTemplates((prev) => [newTpl, ...prev]);
    setActiveTemplateId(newTpl.id);
    setCurrentEvaluation(createEmptyEvaluation(newTpl));
    setTypeFilter(workType);
    setActiveView('customize');
  };

  const handleUpdateTemplate = (updated: RubricTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const source = templates.find((t) => t.id === templateId);
    if (!source) return;
    const suffix = Date.now().toString(36);
    const cloned: RubricTemplate = {
      ...JSON.parse(JSON.stringify(source)),
      id: `tpl-copy-${suffix}`,
      title: `${source.title} (copie)`,
      isBuiltIn: false,
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [cloned, ...prev]);
    setActiveTemplateId(cloned.id);
    setCurrentEvaluation(createEmptyEvaluation(cloned));
    setActiveView('customize');
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (templates.length <= 1) return;
    const remaining = templates.filter((t) => t.id !== templateId);
    setTemplates(remaining);
    if (activeTemplateId === templateId && remaining[0]) {
      setActiveTemplateId(remaining[0].id);
      setCurrentEvaluation(createEmptyEvaluation(remaining[0]));
    }
  };

  const handleResetBuiltInTemplate = () => {
    const original = BUILT_IN_TEMPLATES.find((t) => t.id === activeTemplate.id);
    if (!original) return;
    handleUpdateTemplate(JSON.parse(JSON.stringify(original)));
    setCurrentEvaluation(createEmptyEvaluation(original));
  };

  const summary = useMemo(
    () => calculateEvaluationSummary(activeTemplate, currentEvaluation),
    [activeTemplate, currentEvaluation]
  );

  const showExportConfirmation = (filename: string) => {
    setExportToast(`PDF exporté : ${filename}`);
    window.setTimeout(() => {
      setExportToast((prev) => (prev === `PDF exporté : ${filename}` ? null : prev));
    }, 4000);
  };

  const handleExportActiveStudentPdf = () => {
    const filename = exportStudentPdf(activeTemplate, currentEvaluation);
    if (filename) showExportConfirmation(filename);
  };

  const handleExportBlankPdf = (layout: '1-up' | '2-up') => {
    const filename = exportBlankPdf(activeTemplate, layout);
    if (filename) showExportConfirmation(filename);
  };

  const handleSaveCopy = () => {
    const nowIso = new Date().toISOString();
    const copyToSave: StudentEvaluation = {
      ...currentEvaluation,
      templateId: activeTemplate.id,
      savedAt: nowIso,
    };

    setEvaluations((prev) => {
      const idx = prev.findIndex((e) => e.id === copyToSave.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = copyToSave;
        return next;
      }
      return [copyToSave, ...prev];
    });

    const displayName = copyToSave.studentName.trim() || 'Élève sans nom';
    setSaveStatusMessage(`Copie de « ${displayName} » enregistrée dans votre classe.`);
  };

  const handleResetEvaluation = () => {
    setCurrentEvaluation(createEmptyEvaluation(activeTemplate));
    setSaveStatusMessage(null);
  };

  const handleLoadEvaluation = (ev: StudentEvaluation) => {
    const tpl = templates.find((t) => t.id === ev.templateId);
    if (tpl) {
      setActiveTemplateId(tpl.id);
    }
    setCurrentEvaluation(ev);
    setSaveStatusMessage(null);
    setActiveView('evaluate');
  };

  const handleDeleteEvaluation = (evaluationId: string) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== evaluationId));
  };

  const isBuiltInMatch = BUILT_IN_TEMPLATES.some((t) => t.id === activeTemplate.id);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <HeaderBar
        activeView={activeView}
        onSelectView={setActiveView}
        savedCopiesCount={evaluations.length}
        onExportPrimaryPdf={handleExportActiveStudentPdf}
        primaryExportLabel="Exporter en PDF"
      />

      <TemplateSelectorStrip
        templates={templates}
        activeTemplate={activeTemplate}
        typeFilter={typeFilter}
        onChangeTypeFilter={handleChangeTypeFilter}
        onSelectTemplate={handleSelectTemplate}
        onCreateNewTemplate={(wt) => handleCreateNewTemplate(wt)}
      />

      {exportToast && (
        <div
          role="status"
          aria-live="polite"
          className="mx-auto mt-3 w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 no-print"
        >
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>{exportToast}</span>
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {(activeView === 'evaluate' || activeView === 'customize') && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7">
              {activeView === 'evaluate' ? (
                <GradingWorkspace
                  template={activeTemplate}
                  evaluation={currentEvaluation}
                  summary={summary}
                  onChangeEvaluation={setCurrentEvaluation}
                  onSaveCopy={handleSaveCopy}
                  onResetEvaluation={handleResetEvaluation}
                  onOpenCustomizer={() => setActiveView('customize')}
                  saveStatusMessage={saveStatusMessage}
                />
              ) : (
                <CriteriaCustomizer
                  template={activeTemplate}
                  onUpdateTemplate={handleUpdateTemplate}
                  onDuplicateTemplate={() => handleDuplicateTemplate(activeTemplate.id)}
                  onResetBuiltInTemplate={
                    isBuiltInMatch ? handleResetBuiltInTemplate : undefined
                  }
                  onDone={() => setActiveView('evaluate')}
                />
              )}
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-20">
              <PdfPreviewSheet
                template={activeTemplate}
                evaluation={currentEvaluation}
                summary={summary}
                onExportStudentPdf={handleExportActiveStudentPdf}
                onExportBlankPdf={handleExportBlankPdf}
              />
            </div>
          </div>
        )}

        {activeView === 'copies' && (
          <SavedCopiesView
            templates={templates}
            activeTemplate={activeTemplate}
            evaluations={evaluations}
            onLoadEvaluation={handleLoadEvaluation}
            onDeleteEvaluation={handleDeleteEvaluation}
            onExportSinglePdf={(tpl, ev) => {
              const fn = exportStudentPdf(tpl, ev);
              if (fn) showExportConfirmation(fn);
            }}
            onExportBatchPdf={(tpl, evals) => {
              const fn = exportBatchStudentsPdf(tpl, evals);
              if (fn) showExportConfirmation(fn);
            }}
            onReturnToEvaluate={() => setActiveView('evaluate')}
          />
        )}

        {activeView === 'templates' && (
          <TemplateLibraryView
            templates={templates}
            activeTemplateId={activeTemplate.id}
            onSelectTemplate={(id) => {
              handleSelectTemplate(id);
              setActiveView('evaluate');
            }}
            onCustomizeTemplate={(id) => {
              handleSelectTemplate(id);
              setActiveView('customize');
            }}
            onDuplicateTemplate={handleDuplicateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onCreateTemplate={handleCreateNewTemplate}
          />
        )}
      </main>
    </div>
  );
}
