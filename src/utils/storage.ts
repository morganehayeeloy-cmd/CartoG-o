import type { RubricTemplate, StudentEvaluation } from '../types/rubric';
import { BUILT_IN_TEMPLATES } from '../data/defaultTemplates';

const TEMPLATES_KEY = 'cartogrille.templates.v1';
const EVALUATIONS_KEY = 'cartogrille.evaluations.v1';
const ACTIVE_TEMPLATE_KEY = 'cartogrille.activeTemplateId.v1';

export function loadTemplates(): RubricTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return BUILT_IN_TEMPLATES;
    const parsed = JSON.parse(raw) as RubricTemplate[];
    if (!Array.isArray(parsed) || parsed.length === 0) return BUILT_IN_TEMPLATES;
    return parsed;
  } catch {
    return BUILT_IN_TEMPLATES;
  }
}

export function saveTemplates(templates: RubricTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function loadEvaluations(): StudentEvaluation[] {
  try {
    const raw = localStorage.getItem(EVALUATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudentEvaluation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEvaluations(evaluations: StudentEvaluation[]): void {
  try {
    localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(evaluations));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function loadActiveTemplateId(templates: RubricTemplate[]): string {
  try {
    const saved = localStorage.getItem(ACTIVE_TEMPLATE_KEY);
    if (saved && templates.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // Ignore
  }
  return templates[0]?.id ?? BUILT_IN_TEMPLATES[0].id;
}

export function saveActiveTemplateId(templateId: string): void {
  try {
    localStorage.setItem(ACTIVE_TEMPLATE_KEY, templateId);
  } catch {
    // Ignore
  }
}
