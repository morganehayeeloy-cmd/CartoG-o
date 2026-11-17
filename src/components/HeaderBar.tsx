import { Download } from 'lucide-react';

export type AppView = 'evaluate' | 'customize' | 'copies' | 'templates';

interface HeaderBarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  savedCopiesCount: number;
  onExportPrimaryPdf: () => void;
  primaryExportLabel: string;
}

export function HeaderBar({
  activeView,
  onSelectView,
  savedCopiesCount,
  onExportPrimaryPdf,
  primaryExportLabel,
}: HeaderBarProps) {
  const navItems: { id: AppView; label: string }[] = [
    { id: 'evaluate', label: 'Évaluation' },
    { id: 'customize', label: 'Personnaliser' },
    {
      id: 'copies',
      label: savedCopiesCount > 0 ? `Copies (${savedCopiesCount})` : 'Copies',
    },
    { id: 'templates', label: 'Modèles' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm no-print">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:gap-8 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectView('evaluate')}
          className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] rounded-sm"
        >
          CartoGrille
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`relative py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] rounded-sm ${
                  isActive
                    ? 'text-[#0369A1]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-[#0369A1]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExportPrimaryPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0369A1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0284C7] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>{primaryExportLabel}</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation strip */}
      <nav
        aria-label="Navigation mobile"
        className="flex md:hidden items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-[#0369A1] shadow-xs border border-slate-200'
                  : 'text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
