import React from 'react';
import { Lead } from '../types';
import {
  calculateSelectionAggregates,
  formatArr,
  formatCurrency,
} from '../utils/revenueUtils';
import {
  DollarSign,
  Users,
  Target,
  ShieldCheck,
  TrendingUp,
  X,
  Download,
  Building2,
  ExternalLink,
  PieChart,
  Briefcase,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';

export interface SelectionSummaryProps {
  selectedLeads: Lead[];
  allLeads?: Lead[];
  totalPipelineLeadsCount?: number;
  onToggleSelectLead: (leadId: string) => void;
  onClearSelection: () => void;
  onSelectAllFiltered?: () => void;
  onSelectTopFit?: () => void;
  onOpenLead?: (lead: Lead) => void;
  onExportCsv?: () => void;
  onExportJson?: () => void;
  onClose?: () => void;
}

export const SelectionSummary: React.FC<SelectionSummaryProps> = ({
  selectedLeads,
  allLeads = [],
  totalPipelineLeadsCount = 0,
  onToggleSelectLead,
  onClearSelection,
  onSelectAllFiltered,
  onSelectTopFit,
  onOpenLead,
  onExportCsv,
  onExportJson,
  onClose,
}) => {
  const stats = React.useMemo(() => {
    return calculateSelectionAggregates(selectedLeads);
  }, [selectedLeads]);

  const isEmpty = selectedLeads.length === 0;

  return (
    <div className="bg-[#111622] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full sticky top-6">
      {/* Sidebar Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-[#131b2e] to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Selection Summary
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {stats.leadCount} {stats.leadCount === 1 ? 'Target' : 'Targets'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Live aggregate ARR & workforce metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isEmpty && onClearSelection && (
            <button
              onClick={onClearSelection}
              title="Clear current selection"
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              title="Close sidebar"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Selection Summary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isEmpty ? (
        <div className="p-6 text-center flex flex-col items-center justify-center flex-1 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 shadow-inner">
            <Layers className="w-7 h-7 text-slate-500" />
          </div>
          <div className="max-w-xs space-y-1.5">
            <h4 className="text-sm font-semibold text-slate-200">No Targets Selected</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select leads in the table to calculate aggregate ARR, employee headcount, and private equity deal viability metrics.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full pt-2">
            {onSelectAllFiltered && (
              <button
                onClick={onSelectAllFiltered}
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Select All Filtered Targets</span>
              </button>
            )}
            {onSelectTopFit && (
              <button
                onClick={onSelectTopFit}
                className="w-full py-2 px-3 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Select Top 5 High-Fit (90+ PE)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)] custom-scrollbar">
          {/* Headline Metric 1: Aggregate ARR */}
          <div className="bg-gradient-to-br from-blue-950/40 via-[#0e1629] to-[#0f172a] border border-blue-500/30 rounded-xl p-4 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs text-blue-300/90 mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-blue-400">
                Aggregate ARR
              </span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-tight tabular-nums">
              {formatArr(stats.totalArr)}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Avg. ARR / Target:</span>
              <span className="font-mono font-medium text-slate-200">
                {formatArr(stats.avgArr)}
              </span>
            </div>
          </div>

          {/* Headline Metric 2: Total Employee Count */}
          <div className="bg-gradient-to-br from-indigo-950/40 via-[#101426] to-[#0f172a] border border-indigo-500/30 rounded-xl p-4 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs text-indigo-300/90 mb-1.5">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-400">
                Total Employee Count
              </span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-tight tabular-nums flex items-baseline gap-2">
              <span>{stats.totalEmployees.toLocaleString()}</span>
              <span className="text-xs font-normal text-slate-400">FTEs</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Avg. Workforce / Target:</span>
              <span className="font-mono font-medium text-slate-200">
                {stats.avgEmployees} employees
              </span>
            </div>
          </div>

          {/* Efficiency Metric & Search Fund Signals */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* ARR per Head */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                ARR / Employee
              </div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {formatCurrency(stats.arrPerEmployee)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Workforce efficiency
              </div>
            </div>

            {/* Avg PE Acquirability */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>PE Acquirability</span>
                <Target className="w-3 h-3 text-amber-400" />
              </div>
              <div className="text-base font-bold font-mono text-amber-400 mt-1 tabular-nums">
                {stats.avgPeScore}
                <span className="text-[10px] text-slate-500 font-normal">/100</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Caprae scorecard avg
              </div>
            </div>

            {/* Succession Risk */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Succession Risk
              </div>
              <div className="text-base font-bold font-mono text-slate-200 mt-1 tabular-nums">
                {stats.successionRiskCount}
                <span className="text-[10px] text-slate-500 font-normal">
                  {' '}
                  / {stats.leadCount}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Founder transition fit
              </div>
            </div>

            {/* Deliverability */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
              <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Deliverability</span>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="text-base font-bold font-mono text-emerald-400 mt-1 tabular-nums">
                {stats.avgDeliverability}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Verified email deliverability
              </div>
            </div>
          </div>

          {/* Industry Distribution */}
          {stats.industries.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 space-y-2">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Industry Exposure</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {stats.industries.length} {stats.industries.length === 1 ? 'sector' : 'sectors'}
                </span>
              </div>
              <div className="space-y-1.5">
                {stats.industries.map((ind) => {
                  const pct = stats.totalArr > 0 ? Math.round((ind.totalArr / stats.totalArr) * 100) : 0;
                  return (
                    <div key={ind.name} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 truncate max-w-[170px]" title={ind.name}>
                          {ind.name}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-slate-400 text-[10px]">
                          <span>{ind.count} ({formatCurrency(ind.totalArr)})</span>
                          <span className="text-slate-500 w-7 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Targets Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span>Selected Targets ({stats.leadCount})</span>
              <span className="text-[10px] text-slate-500">Click to view dossier</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {selectedLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onOpenLead && onOpenLead(lead)}
                  className="group bg-[#0d121c] hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700 rounded-lg p-2.5 transition-all flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                        {lead.companyName}
                      </span>
                      {(lead.isHot || (lead.peSignals?.acquirabilityScore ?? 0) > 85) && (
                        <span
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold text-rose-300 bg-rose-950/70 border border-rose-500/40 shrink-0"
                          title="Hot Target (>85 Acquirability)"
                        >
                          <Flame className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                          <span>HOT</span>
                        </span>
                      )}
                      {lead.aiEnrichment && (
                        <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span className="text-slate-300 font-semibold">{lead.estimatedRevenue}</span>
                      <span>·</span>
                      <span>{lead.employeeCount} emp</span>
                      <span>·</span>
                      <span className="text-amber-400 font-semibold">{lead.peSignals.acquirabilityScore} PE</span>
                      <span>·</span>
                      {lead.salesforceSync?.synced ? (
                        <span className="text-emerald-400 font-sans font-medium flex items-center gap-0.5 text-[10px]">
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                          <span>Synced</span>
                        </span>
                      ) : (
                        <span className="text-amber-400/80 font-sans font-medium flex items-center gap-0.5 text-[10px]">
                          <Clock className="w-2.5 h-2.5 shrink-0" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleSelectLead(lead.id)}
                      title={`Remove ${lead.companyName} from selection`}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                      aria-label={`Deselect ${lead.companyName}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Action Controls */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Batch Export Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              {onExportCsv && (
                <button
                  onClick={onExportCsv}
                  className="py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
              {onExportJson && (
                <button
                  onClick={onExportJson}
                  className="py-2 px-3 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Export JSON</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
