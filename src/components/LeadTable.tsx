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
} from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEnrichLead: (lead: Lead, e: React.MouseEvent) => void;
  onVerifyLead: (lead: Lead, e: React.MouseEvent) => void;
  onUpdateStage: (leadId: string, stage: LeadStage) => void;
  onResetFilters: () => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onSelectLead,
  onEnrichLead,
  onVerifyLead,
  onUpdateStage,
  onResetFilters,
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState<string | null>(null);

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
    <div className="bg-[#111622] border border-slate-800 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0B0F17]/80 border-b border-slate-800 text-slate-400 font-medium select-none">
              <th className="py-3 px-4">Company & Target Domain</th>
              <th className="py-3 px-4">Industry / Location</th>
              <th className="py-3 px-4 text-right">ARR / EBITDA</th>
              <th className="py-3 px-4">Decision Maker</th>
              <th className="py-3 px-4">Deliverability</th>
              <th className="py-3 px-4 text-center">PE Acquirability</th>
              <th className="py-3 px-4">Deal Stage</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leads.map((lead) => {
              const isEnriched = !!lead.aiEnrichment;
              const peScore = lead.peSignals.acquirabilityScore;
              const isHighFit = peScore >= 90;

              return (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Company & Domain */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                      <span>{lead.companyName}</span>
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

                  {/* ARR / EBITDA */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-semibold text-slate-200 tabular-nums">
                      {lead.estimatedRevenue}
                    </div>
                    <div className="font-mono text-[11px] text-emerald-400 tabular-nums mt-0.5">
                      {lead.estimatedEbitda}
                    </div>
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
                          isHighFit
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
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {lead.peSignals.ownerSuccessionRisk ? 'Succession' : 'Expansion'}
                    </div>
                  </td>

                  {/* Stage Dropdown & SF Status */}
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

                    {lead.salesforceSync?.synced && (
                      <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1" title={`Synced at ${lead.salesforceSync.syncedAt}`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>SF: Synced</span>
                      </div>
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
