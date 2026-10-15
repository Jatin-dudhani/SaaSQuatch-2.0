import React from 'react';
import { Lead, LeadStage } from '../types';
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Mail,
  Copy,
  Check,
  Building2,
  TrendingUp,
  Cloud,
  CheckCircle2,
  Download,
  PieChart,
  Clock,
  Flame,
} from 'lucide-react';
import { ArrSparkline } from './ArrSparkline';
import { getLeadArrHistory, getYoYGrowth } from '../utils/revenueUtils';

interface LeadTableProps {
  leads: Lead[];
  selectedLeadIds: Set<string>;
  onToggleSelectLead: (leadId: string) => void;
  onToggleSelectAll: () => void;
  onSelectLead: (lead: Lead) => void;
  onEnrichLead: (lead: Lead, e: React.MouseEvent) => void;
  onVerifyLead: (lead: Lead, e: React.MouseEvent) => void;
  onUpdateStage: (leadId: string, stage: LeadStage) => void;
  onResetFilters: () => void;
  onExportSelectionCsv?: () => void;
  onExportSelectionJson?: () => void;
  onClearSelection?: () => void;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedLeadIds,
  onToggleSelectLead,
  onToggleSelectAll,
  onSelectLead,
  onEnrichLead,
  onVerifyLead,
  onUpdateStage,
  onResetFilters,
  onExportSelectionCsv,
  onExportSelectionJson,
  onClearSelection,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null);
  const selectAllRef = React.useRef<HTMLInputElement | null>(null);

  const selectedCountInView = React.useMemo(() => {
    return leads.filter((lead) => selectedLeadIds.has(lead.id)).length;
  }, [leads, selectedLeadIds]);

  const allSelected = leads.length > 0 && selectedCountInView === leads.length;
  const isIndeterminate = selectedCountInView > 0 && selectedCountInView < leads.length;

  React.useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  if (leads.length === 0) {
    return (
      <div className="bg-[#111622] border border-slate-800 rounded-lg p-12 text-center">
        <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-200">No matching acquisition targets</h3>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          We could not find any leads matching your current combination of filters. Try widening your revenue range or resetting the Search Fund filters.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#111622] border border-slate-800 rounded-lg overflow-hidden shadow-sm flex flex-col">
      {/* Selection Action Toolbar Banner */}
      {selectedCountInView > 0 && (
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/80 border-b border-blue-800/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 font-semibold text-blue-200">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {selectedCountInView}
              </span>
              <span>
                {selectedCountInView} of {leads.length} {leads.length === 1 ? 'lead' : 'leads'} selected
              </span>
            </span>
            <div className="h-3.5 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              {!allSelected && (
                <button
                  onClick={onToggleSelectAll}
                  className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer underline text-[11px]"
                >
                  Select all ({leads.length})
                </button>
              )}
              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer underline text-[11px]"
                >
                  Deselect all
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px]">Export Selection:</span>
            {onExportSelectionCsv && (
              <button
                onClick={onExportSelectionCsv}
                title={`Export ${selectedCountInView} selected leads as CSV`}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV ({selectedCountInView})</span>
              </button>
            )}
            {onExportSelectionJson && (
              <button
                onClick={onExportSelectionJson}
                title={`Export ${selectedCountInView} selected leads as JSON`}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Export JSON ({selectedCountInView})</span>
              </button>
            )}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                title={isSidebarOpen ? 'Sidebar is currently open' : 'Open Selection Summary Sidebar'}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isSidebarOpen
                    ? 'bg-blue-600/90 text-white border border-blue-400/40 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>{isSidebarOpen ? 'Summary Sidebar' : 'Show Summary'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0B0F17]/80 border-b border-slate-800 text-slate-400 font-medium select-none">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 rounded border-slate-700 bg-[#0B0F17] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-blue-600"
                  title={allSelected ? 'Deselect all visible leads' : 'Select all visible leads'}
                  aria-label="Select all visible leads"
                />
              </th>
              <th className="py-3 px-4">Company & Target Domain</th>
              <th className="py-3 px-4">Industry / Location</th>
              <th className="py-3 px-4 text-right">Estimated ARR & Growth</th>
              <th className="py-3 px-4">Decision Maker</th>
              <th className="py-3 px-4">Deliverability</th>
              <th className="py-3 px-4 text-center">PE Acquirability</th>
              <th className="py-3 px-4">Deal Stage</th>
              <th className="py-3 px-4 text-center">Salesforce Sync</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leads.map((lead) => {
              const isEnriched = !!lead.aiEnrichment;
              const peScore = lead.peSignals.acquirabilityScore;
              const isHighFit = peScore >= 90;
              const isHot = lead.isHot || peScore > 85;
              const isSelected = selectedLeadIds.has(lead.id);

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-950/30 hover:bg-blue-900/40 border-l-2 border-l-blue-500'
                      : isHot
                      ? 'hover:bg-slate-800/50 border-l-2 border-l-rose-500/70 bg-gradient-to-r from-rose-950/[0.12] via-transparent to-transparent'
                      : 'hover:bg-slate-800/40 border-l-2 border-l-transparent'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectLead(lead.id)}
                      className="w-4 h-4 rounded border-slate-700 bg-[#0B0F17] text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-blue-600"
                      title={isSelected ? `Deselect ${lead.companyName}` : `Select ${lead.companyName}`}
                      aria-label={`Select ${lead.companyName}`}
                    />
                  </td>

                  {/* Company & Domain */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors flex items-center gap-2 flex-wrap">
                      <span>{lead.companyName}</span>
                      {isHot && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gradient-to-r from-rose-500/25 via-amber-500/20 to-red-500/25 text-rose-300 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.35)] shrink-0 animate-pulse"
                          title={`🔥 Hot Target: Acquirability score ${lead.peSignals.acquirabilityScore}/100 exceeds 85 threshold (auto-flagged by background processor)`}
                        >
                          <Flame className="w-3 h-3 text-rose-400 fill-rose-500/50 shrink-0" />
                          <span>HOT</span>
                        </span>
                      )}
                      {isEnriched && (
                        <span title="AI Enriched" className="flex items-center text-blue-400">
                          <Sparkles className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono">{lead.domain}</span>
                      <span aria-hidden="true">·</span>
                      <span>Est. {lead.foundedYear}</span>
                    </div>
                  </td>

                  {/* Industry & Location */}
                  <td className="py-3.5 px-4">
                    <div className="text-slate-300 font-medium truncate max-w-[170px]">
                      {lead.industry}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {lead.location.city}, {lead.location.state}
                    </div>
                  </td>

                  {/* Estimated ARR & Historical Growth Sparkline */}
                  <td className="py-3.5 px-4 text-right">
                    {(() => {
                      const arrHistory = getLeadArrHistory(lead);
                      const yoyGrowthRate = getYoYGrowth(lead, arrHistory);
                      const isPositive = yoyGrowthRate >= 0;
                      return (
                        <div className="flex items-center justify-end gap-3">
                          {/* Recharts Sparkline */}
                          <div
                            className="flex flex-col items-end shrink-0"
                            title={`Historical ARR Growth Trajectory: ${arrHistory[0]?.formattedArr || '$0'} → ${arrHistory[arrHistory.length - 1]?.formattedArr || '$0'} (+${yoyGrowthRate}% YoY)`}
                          >
                            <ArrSparkline
                              data={arrHistory}
                              width={76}
                              height={24}
                              isPositive={isPositive}
                            />
                            <div className="flex items-center gap-0.5 text-[9px] font-mono text-emerald-400 font-semibold mt-0.5">
                              <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                              <span>+{yoyGrowthRate}% YoY</span>
                            </div>
                          </div>

                          {/* Numerical ARR & EBITDA Values */}
                          <div className="text-right shrink-0 min-w-[70px]">
                            <div className="font-mono font-semibold text-slate-100 tabular-nums text-xs">
                              {lead.estimatedRevenue}
                            </div>
                            <div className="font-mono text-[11px] text-emerald-400 tabular-nums mt-0.5">
                              {lead.estimatedEbitda}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Decision Maker */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-200">
                      {lead.decisionMaker.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{lead.decisionMaker.title}</span>
                      <span aria-hidden="true">·</span>
                      <button
                        onClick={(e) => handleCopyEmail(lead.decisionMaker.email, e)}
                        title="Click to copy verified email"
                        className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                      >
                        {copiedEmail === lead.decisionMaker.email ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Deliverability */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {lead.deliverability.status === 'verified' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      <span
                        className={`font-mono font-medium tabular-nums ${
                          lead.deliverability.status === 'verified'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {lead.deliverability.score}%
                      </span>
                      <span className="text-[11px] text-slate-500 capitalize">
                        {lead.deliverability.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono truncate max-w-[150px] mt-0.5">
                      {lead.deliverability.mxProvider.split(' ')[0]}
                    </div>
                  </td>

                  {/* PE Acquirability */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <span
                        className={`font-mono font-bold tabular-nums text-sm ${
                          isHot
                            ? 'text-rose-400 font-extrabold'
                            : isHighFit
                            ? 'text-amber-400'
                            : peScore >= 80
                            ? 'text-blue-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {peScore}
                      </span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </div>
                    {isHot ? (
                      <div className="flex justify-center mt-0.5">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold text-rose-300 bg-rose-950/70 border border-rose-500/40 shadow-xs"
                          title="Score >85: Classified as Hot Acquisition Candidate"
                        >
                          <Flame className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                          <span>Hot ({peScore})</span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {lead.peSignals.ownerSuccessionRisk ? 'Succession' : 'Expansion'}
                      </div>
                    )}
                  </td>

                  {/* Deal Stage */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.stage}
                      onChange={(e) => onUpdateStage(lead.id, e.target.value as LeadStage)}
                      className="py-1 px-2 text-[11px] bg-[#0B0F17] border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="scraped">Scraped</option>
                      <option value="qualified">Qualified</option>
                      <option value="outreach_ready">Outreach Ready</option>
                      <option value="deal_pipeline">Deal Pipeline</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>

                  {/* Salesforce Sync Status Badge */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {lead.salesforceSync?.synced ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 shadow-xs cursor-pointer hover:border-emerald-500/60 transition-colors"
                        title={`Salesforce: Synced${lead.salesforceSync.syncedAt ? ` on ${lead.salesforceSync.syncedAt}` : ''}${lead.salesforceSync.recordId ? ` (ID: ${lead.salesforceSync.recordId})` : ''} · Click row to view CRM details`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Synced</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-950/40 text-amber-300 border border-amber-500/30 shadow-xs cursor-pointer hover:border-amber-500/60 transition-colors"
                        title="Salesforce: Sync Pending · Click row to open dossier and sync"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => onEnrichLead(lead, e)}
                        title="Run Deep Gemini AI Enrichment"
                        className={`p-1.5 rounded transition-colors cursor-pointer ${
                          isEnriched
                            ? 'text-blue-400 hover:bg-blue-950/60'
                            : 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => onVerifyLead(lead, e)}
                        title="Re-verify Email & MX Records"
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectLead(lead)}
                        title="Open Lead Dossier"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
