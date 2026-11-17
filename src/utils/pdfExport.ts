import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type {
  CalculatedEvaluationSummary,
  RubricTemplate,
  StudentEvaluation,
} from '../types/rubric';
import {
  calculateEvaluationSummary,
  formatScoreNumber,
  getSectionBaseMax,
} from './scoring';

/**
 * jsPDF built-in Helvetica uses WinAnsiEncoding (ISO-8859-1 subset).
 * Standard French accents (é è ê ë à â ç ù û î ï ô ö) are supported,
 * while typographic curly quotes, œ, ≥, ≤, ⇒, ² need clean ASCII/WinAnsi equivalents.
 */
export function sanitizePdfText(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/⇒/g, '=>')
    .replace(/→/g, '->')
    .replace(/²/g, '2')
    .replace(/…/g, '...')
    .replace(/–|—/g, '-');
}

export function sanitizeFilename(name: string): string {
  const cleaned = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  return cleaned || 'grille_evaluation';
}

function workTypeLabel(type: RubricTemplate['workType']): string {
  return type === 'croquis' ? 'Croquis cartographique' : 'Carte de synthèse';
}

function drawStudentPage(
  doc: jsPDF,
  template: RubricTemplate,
  evaluation: StudentEvaluation | null,
  summary: CalculatedEvaluationSummary | null,
  options?: { offsetX?: number; sheetWidth?: number; marginY?: number; compact?: boolean }
) {
  const offsetX = options?.offsetX ?? 0;
  const sheetWidth = options?.sheetWidth ?? doc.internal.pageSize.getWidth();
  const marginX = 14;
  const startX = offsetX + marginX;
  const usableWidth = sheetWidth - marginX * 2;
  const compact = Boolean(options?.compact);
  let cursorY = options?.marginY ?? 14;

  // Student info row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(compact ? 8.5 : 10);
  doc.setTextColor(30, 41, 59);

  const studentLabel = evaluation?.studentName?.trim()
    ? `Nom de l'élève : ${evaluation.studentName.trim()}`
    : "Nom de l'élève : ..................................................";
  const classLabel = evaluation?.studentClass?.trim()
    ? `Classe : ${evaluation.studentClass.trim()}`
    : 'Classe : ................';
  const dateLabel = evaluation?.evaluationDate
    ? `Date : ${evaluation.evaluationDate.split('-').reverse().join('/')}`
    : 'Date : ..../..../20..';

  doc.text(sanitizePdfText(studentLabel), startX, cursorY);
  if (!compact) {
    doc.text(sanitizePdfText(classLabel), startX + usableWidth * 0.56, cursorY);
    doc.text(sanitizePdfText(dateLabel), startX + usableWidth * 0.80, cursorY);
  }
  cursorY += compact ? 6 : 8;

  // Header block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(compact ? 10.5 : 13);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(sanitizePdfText(template.title.toUpperCase()), usableWidth);
  doc.text(titleLines, startX + usableWidth / 2, cursorY, { align: 'center' });
  cursorY += titleLines.length * (compact ? 4.5 : 5.5) + 1;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(compact ? 8.5 : 9.5);
  doc.setTextColor(71, 85, 105);
  const subParts = [workTypeLabel(template.workType)];
  if (template.subtitle?.trim()) subParts.push(template.subtitle.trim());
  const subLines = doc.splitTextToSize(sanitizePdfText(subParts.join(' — ')), usableWidth);
  doc.text(subLines, startX + usableWidth / 2, cursorY, { align: 'center' });
  cursorY += subLines.length * (compact ? 3.8 : 4.2) + 3;

  // Build table body
  type RowCell = {
    content: string;
    colSpan?: number;
    styles?: Record<string, unknown>;
  };
  const body: (string | RowCell)[][] = [];

  for (const section of template.sections) {
    const secResult = summary?.sectionResults[section.id];
    const { maxPoints: secMax, bonusMax: secBonusMax } = getSectionBaseMax(section);

    const headerNotes: string[] = [];
    if (section.requiresAnalyserPass) {
      headerNotes.push("à évaluer si l'analyse totalise > 50% des points");
    }
    if (section.spellingPenaltyPerError && section.spellingPenaltyPerError > 0) {
      headerNotes.push(`-${formatScoreNumber(section.spellingPenaltyPerError)} / faute d'orthographe`);
    }
    if (section.subtitle?.trim() && !section.subtitle.includes('faute')) {
      headerNotes.push(section.subtitle.trim());
    }

    const secHeaderTitle =
      headerNotes.length > 0
        ? `${section.title.toUpperCase()} (${headerNotes.join(' · ')})`
        : section.title.toUpperCase();

    const secMaxLabel =
      secBonusMax > 0
        ? `/ ${formatScoreNumber(secMax)} (+${formatScoreNumber(secBonusMax)})`
        : `/ ${formatScoreNumber(secMax)}`;

    const secEarnedLabel = secResult
      ? secResult.lockedByAnalyserThreshold
        ? `0 / ${formatScoreNumber(secMax)}`
        : `${formatScoreNumber(secResult.earned)} / ${formatScoreNumber(secMax)}`
      : `/ ${formatScoreNumber(secMax)}`;

    // Competency group row
    body.push([
      {
        content: sanitizePdfText(secHeaderTitle),
        colSpan: 1,
        styles: {
          fillColor: [226, 232, 240],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          fontSize: compact ? 8 : 9,
        },
      },
      {
        content: sanitizePdfText(secMaxLabel),
        styles: {
          fillColor: [226, 232, 240],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: compact ? 8 : 9,
        },
      },
      {
        content: sanitizePdfText(secEarnedLabel),
        styles: {
          fillColor: [226, 232, 240],
          textColor: [15, 23, 42],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: compact ? 8 : 9,
        },
      },
    ]);

    for (const criterion of section.criteria) {
      const cRes = secResult?.criteriaResults[criterion.id];
      const maxStr = criterion.isBonus
        ? `+ ${formatScoreNumber(criterion.maxPoints)} pt${criterion.maxPoints > 1 ? 's' : ''}`
        : `${formatScoreNumber(criterion.maxPoints)} pt${criterion.maxPoints > 1 ? 's' : ''}`;

      let labelText = criterion.label;
      if (criterion.description?.trim() && !compact) {
        labelText += `\n${criterion.description.trim()}`;
      }

      let earnedStr = '';
      if (cRes) {
        earnedStr = formatScoreNumber(cRes.earned);
        if (cRes.statusNote && criterion.evaluationMode !== 'points') {
          earnedStr += `\n(${cRes.statusNote})`;
        }
      }

      body.push([
        {
          content: sanitizePdfText(labelText),
          styles: {
            fontSize: compact ? 7.5 : 8.5,
            textColor: [30, 41, 59],
          },
        },
        {
          content: sanitizePdfText(maxStr),
          styles: {
            halign: 'center',
            valign: 'middle',
            fontSize: compact ? 7.5 : 8.5,
            textColor: [51, 65, 85],
          },
        },
        {
          content: sanitizePdfText(earnedStr),
          styles: {
            halign: 'center',
            valign: 'middle',
            fontStyle: cRes ? 'bold' : 'normal',
            fontSize: compact ? 7.5 : 8.5,
            textColor: [15, 23, 42],
          },
        },
      ]);
    }

    // Show spelling deduction line if evaluated and > 0
    if (
      evaluation &&
      secResult &&
      secResult.spellingDeduction > 0 &&
      evaluation.spellingErrors > 0
    ) {
      body.push([
        {
          content: sanitizePdfText(
            `Déduction orthographe (${evaluation.spellingErrors} faute${
              evaluation.spellingErrors > 1 ? 's' : ''
            })`
          ),
          styles: {
            fontStyle: 'italic',
            fontSize: compact ? 7.5 : 8.5,
            textColor: [185, 28, 28],
          },
        },
        { content: '-', styles: { halign: 'center', fontSize: compact ? 7.5 : 8.5 } },
        {
          content: sanitizePdfText(`-${formatScoreNumber(secResult.spellingDeduction)}`),
          styles: {
            halign: 'center',
            fontStyle: 'bold',
            fontSize: compact ? 7.5 : 8.5,
            textColor: [185, 28, 28],
          },
        },
      ]);
    }
  }

  // Totals row
  const rawMaxAll = template.sections.reduce(
    (acc, sec) => acc + getSectionBaseMax(sec).maxPoints,
    0
  );
  const totalEarnedDisplay = summary
    ? `${formatScoreNumber(summary.totalEarned)} / ${formatScoreNumber(summary.totalMax)}`
    : `     / ${formatScoreNumber(rawMaxAll)}`;

  body.push([
    {
      content: 'TOTAL',
      styles: {
        fontStyle: 'bold',
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontSize: compact ? 8.5 : 10,
      },
    },
    {
      content: sanitizePdfText(`/ ${formatScoreNumber(rawMaxAll)} pts`),
      styles: {
        fontStyle: 'bold',
        halign: 'center',
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontSize: compact ? 8.5 : 10,
      },
    },
    {
      content: sanitizePdfText(totalEarnedDisplay),
      styles: {
        fontStyle: 'bold',
        halign: 'center',
        fillColor: [241, 245, 249],
        textColor: [3, 105, 161],
        fontSize: compact ? 8.5 : 10,
      },
    },
  ]);

  if (template.showScoreOn20) {
    const on20Display = summary
      ? `${formatScoreNumber(summary.scoreOn20)} / 20`
      : '     / 20';
    body.push([
      {
        content: 'NOTE RAMENÉE SUR 20',
        styles: {
          fontStyle: 'bold',
          fillColor: [248, 250, 252],
          textColor: [15, 23, 42],
          fontSize: compact ? 8.5 : 9.5,
        },
      },
      {
        content: '/ 20',
        styles: {
          fontStyle: 'bold',
          halign: 'center',
          fillColor: [248, 250, 252],
          textColor: [71, 85, 105],
          fontSize: compact ? 8.5 : 9.5,
        },
      },
      {
        content: sanitizePdfText(on20Display),
        styles: {
          fontStyle: 'bold',
          halign: 'center',
          fillColor: [248, 250, 252],
          textColor: [3, 105, 161],
          fontSize: compact ? 9 : 10.5,
        },
      },
    ]);
  }

  autoTable(doc, {
    startY: cursorY,
    margin: { left: startX, right: doc.internal.pageSize.getWidth() - (offsetX + sheetWidth) + marginX },
    tableWidth: usableWidth,
    head: [
      [
        sanitizePdfText('Compétences, critères et indicateurs'),
        sanitizePdfText('Maximum'),
        sanitizePdfText('Points obtenus'),
      ],
    ],
    body,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: compact ? 8 : 9,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: usableWidth * 0.66 },
      1: { cellWidth: usableWidth * 0.16, halign: 'center' },
      2: { cellWidth: usableWidth * 0.18, halign: 'center' },
    },
    styles: {
      lineColor: [148, 163, 184],
      lineWidth: 0.2,
      cellPadding: compact ? 1.6 : 2.5,
      font: 'helvetica',
      overflow: 'linebreak',
    },
  });

  // General comment box
  const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY + 80;
  const pageHeight = doc.internal.pageSize.getHeight();
  if (finalY + 18 < pageHeight - 8) {
    const commentY = finalY + 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(compact ? 8 : 9);
    doc.setTextColor(30, 41, 59);
    doc.text(sanitizePdfText('Remarque / appréciation :'), startX, commentY);

    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(203, 213, 225);
    const boxHeight = compact ? 12 : 16;
    doc.rect(startX, commentY + 2, usableWidth, boxHeight);

    if (evaluation?.generalComment?.trim()) {
      const commentLines = doc.splitTextToSize(
        sanitizePdfText(evaluation.generalComment.trim()),
        usableWidth - 4
      );
      doc.text(commentLines.slice(0, 3), startX + 2, commentY + 6.5);
    }
  }
}

export function exportStudentPdf(
  template: RubricTemplate,
  evaluation: StudentEvaluation
): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const summary = calculateEvaluationSummary(template, evaluation);
  drawStudentPage(doc, template, evaluation, summary);

  const studentPart = evaluation.studentName.trim()
    ? `_${sanitizeFilename(evaluation.studentName)}`
    : '';
  const filename = `${sanitizeFilename(template.title)}${studentPart}.pdf`;
  doc.save(filename);
  return filename;
}

export function exportBlankPdf(
  template: RubricTemplate,
  layout: '1-up' | '2-up'
): string {
  if (layout === '2-up') {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth(); // 297mm
    const halfWidth = pageWidth / 2;
    drawStudentPage(doc, template, null, null, {
      offsetX: 0,
      sheetWidth: halfWidth,
      marginY: 12,
      compact: true,
    });
    // Vertical cut line
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(halfWidth, 8, halfWidth, doc.internal.pageSize.getHeight() - 8);
    doc.setLineDashPattern([], 0);

    drawStudentPage(doc, template, null, null, {
      offsetX: halfWidth,
      sheetWidth: halfWidth,
      marginY: 12,
      compact: true,
    });
    const filename = `${sanitizeFilename(template.title)}_grille_vierge_2parpage.pdf`;
    doc.save(filename);
    return filename;
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawStudentPage(doc, template, null, null);
  const filename = `${sanitizeFilename(template.title)}_grille_vierge.pdf`;
  doc.save(filename);
  return filename;
}

export function exportBatchStudentsPdf(
  template: RubricTemplate,
  evaluations: StudentEvaluation[]
): string {
  if (evaluations.length === 0) return '';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  evaluations.forEach((ev, index) => {
    if (index > 0) doc.addPage();
    const summary = calculateEvaluationSummary(template, ev);
    drawStudentPage(doc, template, ev, summary);
  });
  const filename = `${sanitizeFilename(template.title)}_classe_${evaluations.length}_eleves.pdf`;
  doc.save(filename);
  return filename;
}
