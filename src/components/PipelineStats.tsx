import React from 'react';
import { Lead } from '../types';
import { Target, ShieldCheck, Sparkles, DollarSign, Building } from 'lucide-react';

interface PipelineStatsProps {
  leads: Lead[];
}

export const PipelineStats: React.FC<PipelineStatsProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const highPeFit = leads.filter((l) => l.peSignals.acquirabilityScore >= 90).length;
  const avgDeliverability =
    totalLeads > 0
      ? Math.round(leads.reduce((acc, curr) => acc + curr.deliverability.score, 0) / totalLeads)
      : 0;
  const enrichedCount = leads.filter((l) => !!l.aiEnrichment).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 py-4">
      <div className="bg-[#111622] border border-slate-800/80 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Active Targets</span>
          <Building className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="text-xl font-bold font-mono text-white tabular-nums">
          {totalLeads}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          Across 7 niche verticals
        </div>
      </div>

      <div className="bg-[#111622] border border-slate-800/80 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>High Acquirability (90+)</span>
          <Target className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
          {highPeFit}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          Owner retirement / succession
        </div>
      </div>

      <div className="bg-[#111622] border border-slate-800/80 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Deliverability Rate</span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
          {avgDeliverability}%
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          MX verified & SMTP verified
        </div>
      </div>

      <div className="bg-[#111622] border border-slate-800/80 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>AI Enriched Dossiers</span>
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div className="text-xl font-bold font-mono text-blue-400 tabular-nums">
          {enrichedCount}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          Gemini 3.8 Flash analyzed
        </div>
      </div>

      <div className="col-span-2 lg:col-span-1 bg-[#111622] border border-slate-800/80 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Target Revenue Pool</span>
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="text-xl font-bold font-mono text-indigo-300 tabular-nums">
          ~$78M ARR
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          Avg. EBITDA Margin: 33%
        </div>
      </div>
    </div>
  );
};
