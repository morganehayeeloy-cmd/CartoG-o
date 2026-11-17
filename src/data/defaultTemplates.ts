import type { MapWorkType, RubricTemplate } from '../types/rubric';

export const BUILT_IN_TEMPLATES: RubricTemplate[] = [
  {
    id: 'tpl-espagne-eau',
    title: "L'accès à l'eau dans le sud de l'Espagne",
    subtitle: 'Disparités spatiales de la population et bilan hydrique',
    workType: 'croquis',
    showScoreOn20: true,
    defaultTwoUpBlankPdf: false,
    isBuiltIn: true,
    updatedAt: '2026-11-17T00:00:00.000Z',
    sections: [
      {
        id: 'esp-analyser',
        role: 'analyser',
        title: 'Analyser',
        subtitle: 'Richesse du croquis cartographique',
        criteria: [
          { id: 'esp-a1', label: 'Espagne', maxPoints: 1, step: 1, evaluationMode: 'points' },
          { id: 'esp-a2', label: '2 pays voisins', maxPoints: 1, step: 1, evaluationMode: 'points' },
          { id: 'esp-a3', label: 'O. Atlantique', maxPoints: 1, step: 1, evaluationMode: 'points' },
          { id: 'esp-a4', label: 'M. Méditerranée', maxPoints: 1, step: 1, evaluationMode: 'points' },
          {
            id: 'esp-a5',
            label: 'Moyenne nationale de la densité de population (100 hab/km²)',
            maxPoints: 2,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-a6',
            label: 'Les zones de densité de population supérieure à la moyenne nationale',
            maxPoints: 4,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-a7',
            label: 'La zone de bilan hydrique négatif',
            maxPoints: 4,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-bonus',
            label: 'BONUS (détroit de Gibraltar, Pyrénées, ...)',
            maxPoints: 1,
            step: 0.5,
            isBonus: true,
            evaluationMode: 'points',
          },
        ],
      },
      {
        id: 'esp-selectionner',
        role: 'selectionner',
        title: 'Sélectionner',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: 'esp-sel',
            label: "Il n'y a aucune information inutile",
            description: "Pas de point si présence d'au moins 1 information inutile",
            maxPoints: 4,
            evaluationMode: 'binary_error',
          },
        ],
      },
      {
        id: 'esp-critiquer',
        role: 'critiquer',
        title: 'Critiquer',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: 'esp-crit',
            label: "Il n'y a aucune information non vérifiée",
            description: "Pas de point si présence d'au moins 1 information non vérifiée ou inutile",
            maxPoints: 2,
            evaluationMode: 'binary_error',
          },
        ],
      },
      {
        id: 'esp-synthetiser',
        role: 'synthetiser',
        title: 'Synthétiser',
        subtitle: 'Positionner et situer des objets dans l’espace',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: 'esp-syn',
            label: 'Les liens entre les informations sont corrects',
            description:
              "Le croquis traduit la réalité : disparités spatiales de la répartition de la population et de l'accès à l'eau (pays coupé Nord/Sud). 50% si erreur grave, 0% si erreur fatale.",
            maxPoints: 5,
            step: 0.5,
            evaluationMode: 'error_tiered',
          },
        ],
      },
      {
        id: 'esp-communiquer',
        role: 'communiquer',
        title: 'Communiquer',
        subtitle: 'Qualités du croquis cartographique',
        criteria: [
          {
            id: 'esp-c1',
            label: 'Le titre est complet (thème + lieu)',
            maxPoints: 2,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-c2',
            label: 'La légende est complète',
            maxPoints: 2,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-c3',
            label: 'Le choix des couleurs est correct',
            maxPoints: 2,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-c4',
            label: 'Le choix des signes est correct',
            maxPoints: 1,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-c5',
            label: 'La typographie est respectée',
            maxPoints: 1,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-c6',
            label: 'Lisibilité (soin)',
            maxPoints: 1,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'esp-c7',
            label: "L'orientation",
            maxPoints: 1,
            step: 0.5,
            evaluationMode: 'points',
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-bruxelles-seveso',
    title: 'Les entreprises Seveso dans la Région de Bruxelles-Capitale',
    subtitle: "Les principaux facteurs d'implantation des usines Seveso dans Bruxelles-Capitale",
    workType: 'synthese',
    showScoreOn20: true,
    defaultTwoUpBlankPdf: false,
    isBuiltIn: true,
    updatedAt: '2026-11-17T00:00:00.000Z',
    sections: [
      {
        id: 'bxl-communiquer',
        role: 'communiquer',
        title: 'Communiquer',
        criteria: [
          {
            id: 'bxl-c1',
            label: 'Le titre est significatif et complet (usines Seveso à Bruxelles-Capitale)',
            maxPoints: 2,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'bxl-c2',
            label: 'Les sources sont citées',
            maxPoints: 1,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'bxl-c3',
            label: 'Les qualités de la carte (lisible, légende bien placée, signes et couleurs adéquats)',
            maxPoints: 2,
            step: 0.5,
            evaluationMode: 'points',
          },
        ],
      },
      {
        id: 'bxl-analyser',
        role: 'analyser',
        title: 'Analyser',
        criteria: [
          {
            id: 'bxl-a1',
            label: 'Contenu complet de la légende',
            description:
              'Entreprises Seveso (seuil bas / seuil élevé), canal, vallée de la Senne, direction Escaut/Anvers, port de Bxl, zone industrielle, faible densité (< 250 hab./km²), nom des communes concernées',
            maxPoints: 9,
            step: 0.5,
            evaluationMode: 'points',
          },
          {
            id: 'bxl-bonus',
            label: 'BONUS : Principales autoroutes, chemin de fer (gare)',
            maxPoints: 2,
            step: 0.5,
            isBonus: true,
            evaluationMode: 'points',
          },
        ],
      },
      {
        id: 'bxl-selectionner',
        role: 'selectionner',
        title: 'Sélectionner',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: 'bxl-sel',
            label: "Il n'y a aucune information inutile",
            maxPoints: 3,
            evaluationMode: 'binary_error',
          },
        ],
      },
      {
        id: 'bxl-critiquer',
        role: 'critiquer',
        title: 'Critiquer',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: 'bxl-crit',
            label: "Il n'y a aucune information non vérifiée",
            maxPoints: 3,
            evaluationMode: 'binary_error',
          },
        ],
      },
      {
        id: 'bxl-synthetiser',
        role: 'synthetiser',
        title: 'Synthétiser',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: 'bxl-syn',
            label: 'Traduction de la réalité, positionnement et pertinence des liens',
            description:
              'La carte traduit correctement la réalité, les éléments sont bien positionnés, les liens entre les informations sont pertinents (pas d’erreur grave ni fatale).',
            maxPoints: 20,
            step: 1,
            evaluationMode: 'error_tiered',
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-banquise',
    title: 'Carte de synthèse du recul de la banquise',
    subtitle: 'Arctique : évolution glaciaire, enjeux géopolitiques et ressources',
    workType: 'synthese',
    showScoreOn20: true,
    defaultTwoUpBlankPdf: true,
    isBuiltIn: true,
    updatedAt: '2026-11-17T00:00:00.000Z',
    sections: [
      {
        id: 'banq-communiquer',
        role: 'communiquer',
        title: 'Communiquer',
        criteria: [
          { id: 'banq-c1', label: 'Titre complet et significatif (sujet + lieu)', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-c2', label: 'Légende complète et classée', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-c3', label: 'Carte lisible et soignée', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-c4', label: 'Couleurs pertinentes', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-c5', label: 'Symboles pertinents', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-c6', label: 'Éléments correctement localisés', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-c7', label: 'Carte orientée', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
        ],
      },
      {
        id: 'banq-analyser',
        role: 'analyser',
        title: 'Analyser',
        criteria: [
          { id: 'banq-a1', label: 'État de la banquise en 1979 et 2016', maxPoints: 4, step: 0.5, evaluationMode: 'points' },
          {
            id: 'banq-a2',
            label: '8 pays (USA/Alaska, Canada, Danemark/Groenland, Islande, Norvège, Suède, Finlande, Russie)',
            maxPoints: 4,
            step: 0.5,
            evaluationMode: 'points',
          },
          { id: 'banq-a3', label: 'Océan Glacial Arctique', maxPoints: 1, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-a4', label: 'Mer de Béring / Détroit de Béring', maxPoints: 1, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-a5', label: "Gisements d'hydrocarbures", maxPoints: 3, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-a6', label: 'Extraction de minerais', maxPoints: 3, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-a7', label: 'Nouvelles voies maritimes', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-a8', label: 'Zones protégées du Canada', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'banq-a9', label: "Pays membres du conseil de l'Arctique", maxPoints: 4, step: 0.5, evaluationMode: 'points' },
        ],
      },
      {
        id: 'banq-selectionner',
        role: 'selectionner',
        title: 'Sélectionner',
        requiresAnalyserPass: false,
        criteria: [
          {
            id: 'banq-sel',
            label: "Pas d'informations inutiles ou d'erreur",
            maxPoints: 2,
            evaluationMode: 'binary_error',
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-cacao',
    title: 'Localisation des principaux producteurs et importateurs de cacao dans le monde',
    subtitle: 'Producteurs (+ facteurs de localisation) et flux mondiaux',
    workType: 'croquis',
    showScoreOn20: true,
    defaultTwoUpBlankPdf: false,
    isBuiltIn: true,
    updatedAt: '2026-11-17T00:00:00.000Z',
    sections: [
      {
        id: 'cac-communiquer',
        role: 'communiquer',
        title: 'Communiquer',
        criteria: [
          { id: 'cac-c1', label: 'Le titre est complet et significatif', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: 'cac-c2', label: "L'orientation est représentée", maxPoints: 1, step: 0.5, evaluationMode: 'points' },
          { id: 'cac-c3', label: 'La légende est complète', maxPoints: 1, step: 0.5, evaluationMode: 'points' },
          { id: 'cac-c4', label: 'Le choix des couleurs', maxPoints: 1, step: 0.5, evaluationMode: 'points' },
          { id: 'cac-c5', label: 'Choix des signes corrects', maxPoints: 1, step: 0.5, evaluationMode: 'points' },
          { id: 'cac-c6', label: 'La typographie est respectée', maxPoints: 1, step: 0.5, evaluationMode: 'points' },
          {
            id: 'cac-c7',
            label: 'Légende correctement organisée (surface, ponctuel, linéaire ET quantitatif/qualitatif)',
            maxPoints: 2,
            step: 0.5,
            evaluationMode: 'points',
          },
          { id: 'cac-c8', label: 'Lisibilité (soin)', maxPoints: 1, step: 0.5, evaluationMode: 'points' },
        ],
      },
      {
        id: 'cac-analyser',
        role: 'analyser',
        title: 'Analyser',
        subtitle: '- 0,5 pt / faute d’orthographe',
        spellingPenaltyPerError: 0.5,
        criteria: [
          { id: 'cac-a1', label: 'Mers/océans : Indien, Pacifique, Atlantique', maxPoints: 3, step: 1, evaluationMode: 'points' },
          {
            id: 'cac-a2',
            label: 'Pays producteurs : Côte d’Ivoire, Ghana, Indonésie, Équateur, Cameroun, Brésil, Nigéria...',
            maxPoints: 10,
            step: 1,
            evaluationMode: 'points',
          },
          { id: 'cac-a3', label: 'Pays importateurs', maxPoints: 3, step: 1, evaluationMode: 'points' },
          { id: 'cac-a4', label: 'Classement des pays correct', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          {
            id: 'cac-a5',
            label: 'Parallèles (30° N/S + Équateur) (-1 / él. manquant)',
            maxPoints: 2,
            step: 1,
            evaluationMode: 'points',
          },
        ],
      },
      {
        id: 'cac-selcrit',
        role: 'selectionner',
        title: 'Sélectionner et Critiquer',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: 'cac-sc1',
            label: "Il n'y a pas d'information inutile",
            description: "Aucun point si présence d'au moins une information inutile ou d'erreur grave.",
            maxPoints: 5,
            evaluationMode: 'binary_error',
          },
        ],
      },
    ],
  },
];

export function createNewTemplate(workType: MapWorkType, customTitle?: string): RubricTemplate {
  const isCroquis = workType === 'croquis';
  const suffix = Date.now().toString(36);
  const title =
    customTitle?.trim() ||
    (isCroquis ? 'Nouveau croquis cartographique' : 'Nouvelle carte de synthèse');

  return {
    id: `tpl-custom-${suffix}`,
    title,
    subtitle: isCroquis
      ? 'Grille personnalisée — Croquis cartographique'
      : 'Grille personnalisée — Carte de synthèse',
    workType,
    showScoreOn20: true,
    defaultTwoUpBlankPdf: false,
    isBuiltIn: false,
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: `sec-com-${suffix}`,
        role: 'communiquer',
        title: 'Communiquer',
        subtitle: isCroquis ? 'Qualités du croquis cartographique' : 'Qualités de la carte de synthèse',
        criteria: [
          { id: `c1-${suffix}`, label: 'Titre complet et significatif (thème + lieu)', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: `c2-${suffix}`, label: 'Légende complète et hiérarchisée', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: `c3-${suffix}`, label: 'Choix des couleurs et des figurés pertinents', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
          { id: `c4-${suffix}`, label: 'Typographie, orientation et soin général', maxPoints: 2, step: 0.5, evaluationMode: 'points' },
        ],
      },
      {
        id: `sec-ana-${suffix}`,
        role: 'analyser',
        title: 'Analyser',
        subtitle: 'Éléments géographiques et repères spatiaux',
        criteria: [
          { id: `a1-${suffix}`, label: 'Repères spatiaux de base (pays, mers, limites)', maxPoints: 4, step: 0.5, evaluationMode: 'points' },
          { id: `a2-${suffix}`, label: 'Éléments thématiques principaux de la carte', maxPoints: 6, step: 0.5, evaluationMode: 'points' },
          ...(isCroquis
            ? []
            : [
                {
                  id: `a3-${suffix}`,
                  label: 'Facteurs explicatifs / dynamiques spatiales',
                  maxPoints: 4,
                  step: 0.5,
                  evaluationMode: 'points' as const,
                },
              ]),
        ],
      },
      {
        id: `sec-sel-${suffix}`,
        role: 'selectionner',
        title: 'Sélectionner',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: `sel-${suffix}`,
            label: "Il n'y a aucune information inutile",
            description: "Pas de point si présence d'au moins 1 information inutile",
            maxPoints: 2,
            evaluationMode: 'binary_error',
          },
        ],
      },
      {
        id: `sec-syn-${suffix}`,
        role: 'synthetiser',
        title: 'Synthétiser',
        requiresAnalyserPass: true,
        criteria: [
          {
            id: `syn-${suffix}`,
            label: isCroquis
              ? 'Localisation correcte et mise en relation des objets'
              : 'La carte traduit correctement la réalité et les liens entre informations',
            description: '50% si erreur grave, 0% si erreur fatale.',
            maxPoints: isCroquis ? 5 : 10,
            step: 0.5,
            evaluationMode: 'error_tiered',
          },
        ],
      },
    ],
  };
}
