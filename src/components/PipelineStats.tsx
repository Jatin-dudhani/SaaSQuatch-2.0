import React from 'react';
import { Lead } from '../types';
import { Target, ShieldCheck, Sparkles, DollarSign, Building, Flame, TrendingUp } from 'lucide-react';
import { calculatePipelineMonthlyGrowth, formatCurrency } from '../utils/revenueUtils';

interface PipelineStatsProps {
  leads: Lead[];
}

export const PipelineStats: React.FC<PipelineStatsProps> = ({ leads }) => {
  const totalLeads = leads.length;
  const hotCount = leads.filter((l) => l.isHot || (l.peSignals?.acquirabilityScore ?? 0) > 85).length;
  const highPeFit = leads.filter((l) => (l.peSignals?.acquirabilityScore ?? 0) >= 90).length;
  const avgDeliverability =
    totalLeads > 0
      ? Math.round(leads.reduce((acc, curr) => acc + curr.deliverability.score, 0) / totalLeads)
      : 0;
  const enrichedCount = leads.filter((l) => !!l.aiEnrichment).length;

  // Calculate Average Monthly Growth Rate and related pipeline metrics based on historical ARR series
  const growthMetrics = React.useMemo(() => {
    return calculatePipelineMonthlyGrowth(leads);
  }, [leads]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 py-4">
      {/* 1. Active Targets */}
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

      {/* 2. Average Monthly Growth Rate */}
      <div className="bg-[#111622] border border-slate-800/80 rounded-lg p-3 group hover:border-emerald-500/40 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="text-slate-300 font-medium">Avg Monthly Growth</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        </div>
        <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums flex items-baseline gap-1">
          <span>+{growthMetrics.avgMonthlyGrowthRate.toFixed(1)}%</span>
          <span className="text-[11px] text-emerald-500/80 font-sans font-normal">/mo</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
          <span>~{growthMetrics.annualizedGrowthRate}% Ann.</span>
          <span className="text-emerald-400/80 font-mono text-[10px]">CMGR</span>
        </div>
      </div>

      {/* 3. Hot Targets */}
      <div className="bg-[#111622] border border-slate-800/80 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Hot Targets (&gt;85)</span>
          <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-500/40" />
        </div>
        <div className="text-xl font-bold font-mono text-rose-400 tabular-nums flex items-baseline gap-1.5">
          <span>{hotCount}</span>
          <span className="text-[11px] text-slate-400 font-sans font-normal">({highPeFit} &ge; 90)</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          Auto-flagged background engine
        </div>
      </div>

      {/* 4. Deliverability Rate */}
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

      {/* 5. AI Enriched Dossiers */}
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

      {/* 6. Target Revenue Pool */}
      <div className="bg-[#111622] border border-slate-800/80 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Target Revenue Pool</span>
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div className="text-xl font-bold font-mono text-indigo-300 tabular-nums">
          {growthMetrics.totalPipelineArr > 0 ? formatCurrency(growthMetrics.totalPipelineArr) : '$0'} ARR
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          +~{formatCurrency(growthMetrics.netMonthlyArrAdded)}/mo net
        </div>
      </div>
    </div>
  );
};

