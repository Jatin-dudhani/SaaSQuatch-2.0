import React from 'react';
import { FilterOptions } from '../types';
import { Search, Filter, Download, RotateCcw, CheckSquare, Square, Upload } from 'lucide-react';

interface LeadFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  industries: string[];
  totalFiltered: number;
  totalCount: number;
  selectedCount?: number;
  onClearSelection?: () => void;
  onExportCsv: (scope?: 'selected' | 'all') => void;
  onExportJson: (scope?: 'selected' | 'all') => void;
  onOpenBulkImport?: () => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  setFilters,
  industries,
  totalFiltered,
  totalCount,
  selectedCount = 0,
  onClearSelection,
  onExportCsv,
  onExportJson,
  onOpenBulkImport,
}) => {
  const handleReset = () => {
    setFilters({
      searchQuery: '',
      industry: 'all',
      stage: 'all',
      deliverability: 'all',
      minPeScore: 0,
      onlyBootstrapped: false,
      onlySuccessionRisk: false,
      onlyLegacyTech: false,
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.industry !== 'all' ||
    filters.stage !== 'all' ||
    filters.deliverability !== 'all' ||
    filters.minPeScore > 0 ||
    filters.onlyBootstrapped ||
    filters.onlySuccessionRisk ||
    filters.onlyLegacyTech;

  return (
    <div className="bg-[#111622] border border-slate-800 rounded-lg p-4 space-y-3">
      {/* Top row: search + industry + stage + export */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search company, domain, decision maker, city, or tags..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 text-sm bg-[#0B0F17] border border-slate-700/80 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Industry */}
        <div className="w-full lg:w-52">
          <select
            value={filters.industry}
            onChange={(e) => setFilters((prev) => ({ ...prev, industry: e.target.value }))}
            aria-label="Filter by industry"
            className="w-full py-2 px-3 text-sm bg-[#0B0F17] border border-slate-700/80 rounded-md text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">All Industries ({industries.length})</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Deliverability */}
        <div className="w-full lg:w-44">
          <select
            value={filters.deliverability}
            onChange={(e) => setFilters((prev) => ({ ...prev, deliverability: e.target.value }))}
            aria-label="Filter by deliverability"
            className="w-full py-2 px-3 text-sm bg-[#0B0F17] border border-slate-700/80 rounded-md text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Deliverability: All</option>
            <option value="verified">Verified (90%+ MX)</option>
            <option value="risky">Catch-All / Risky</option>
          </select>
        </div>

        {/* Export and Import Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenBulkImport && (
            <button
              onClick={onOpenBulkImport}
              title="Bulk import leads from JSON file"
              className="px-3 py-2 text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-800/80 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import JSON</span>
            </button>
          )}

          {selectedCount > 0 ? (
            <div className="flex items-center gap-1.5 bg-blue-950/40 border border-blue-800/70 rounded-md p-1">
              <span className="text-[11px] font-semibold text-blue-300 px-2 flex items-center gap-1.5">
                <span>{selectedCount} selected</span>
                {onClearSelection && (
                  <button
                    onClick={onClearSelection}
                    className="text-blue-400 hover:text-white font-bold cursor-pointer"
                    title="Clear selection"
                  >
                    ×
                  </button>
                )}
              </span>
              <button
                onClick={() => onExportCsv('selected')}
                title={`Export ${selectedCount} selected leads to CSV`}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({selectedCount})</span>
              </button>
              <button
                onClick={() => onExportJson('selected')}
                title={`Export ${selectedCount} selected leads to JSON`}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export JSON ({selectedCount})</span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onExportCsv('all')}
                title="Export all filtered leads to CSV"
                className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => onExportJson('all')}
                title="Export all filtered leads to JSON"
                className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom row: Search Fund acquisition triggers + clear */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-300">
          <span className="text-slate-500 font-medium">PE / Search Fund Signals:</span>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlySuccessionRisk: !prev.onlySuccessionRisk }))
            }
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              filters.onlySuccessionRisk ? 'text-amber-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {filters.onlySuccessionRisk ? (
              <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Owner Succession / Retirement</span>
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlyBootstrapped: !prev.onlyBootstrapped }))
            }
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              filters.onlyBootstrapped ? 'text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {filters.onlyBootstrapped ? (
              <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Bootstrapped (0% VC)</span>
          </button>

          <button
            onClick={() =>
              setFilters((prev) => ({ ...prev, onlyLegacyTech: !prev.onlyLegacyTech }))
            }
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              filters.onlyLegacyTech ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {filters.onlyLegacyTech ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Legacy Tech (MaaS AI Upside)</span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className="text-slate-500">Min Acquirability:</span>
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, minPeScore: prev.minPeScore === 90 ? 0 : 90 }))
              }
              className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                filters.minPeScore === 90
                  ? 'bg-amber-950/70 border border-amber-700/60 text-amber-300 font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              90+ High Fit
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            Showing <strong className="text-white font-mono">{totalFiltered}</strong> of{' '}
            <span className="font-mono">{totalCount}</span> targets
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
