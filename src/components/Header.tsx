import React from 'react';
import { Sparkles, Terminal, MailCheck, FileText, Database, ShieldCheck, Upload } from 'lucide-react';

interface HeaderProps {
  activeTab: 'leads' | 'verifier' | 'dossier';
  setActiveTab: (tab: 'leads' | 'verifier' | 'dossier') => void;
  onOpenScraper: () => void;
  onOpenBulkImport: () => void;
  leadsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenScraper,
  onOpenBulkImport,
  leadsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-inner">
              <Database className="w-4 h-4 text-white" />
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('leads');
              }}
              className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-blue-400 transition-colors"
            >
              SaaSQuatch <span className="text-blue-400 font-mono text-sm px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/60 ml-1">2.0</span>
            </a>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('leads')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'leads' ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              <span>Lead Intelligence</span>
              <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {leadsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('verifier')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'verifier' ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              <MailCheck className="w-4 h-4 text-emerald-400" />
              <span>Deliverability Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('dossier')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'dossier' ? 'text-blue-400 font-semibold' : ''
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Caprae Submission Dossier</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenBulkImport}
              className="px-3 py-2 text-xs font-semibold text-slate-200 bg-slate-850 hover:bg-slate-800 active:bg-slate-900 border border-slate-700/80 rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              title="Bulk import leads from JSON file with schema validation"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Bulk Import</span>
            </button>

            <button
              onClick={onOpenScraper}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-blue-200" />
              <span>Run Live Scraper</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
