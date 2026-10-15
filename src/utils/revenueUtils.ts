import { Lead, ArrHistoryPoint } from '../types';

/**
 * Parses numeric ARR from strings like:
 * "$4.8M ARR", "$6.2M", "$350K ARR", "$1.2B", "4,500,000", etc.
 */
export function parseArrValue(revenueStr: string | undefined | null): number {
  if (!revenueStr) return 0;

  const clean = String(revenueStr).trim();
  if (!clean) return 0;

  // Check for Billions: e.g. $1.2B, $2B ARR
  const bMatch = clean.match(/([\d,.]+)\s*(?:B|billion)/i);
  if (bMatch) {
    const num = parseFloat(bMatch[1].replace(/,/g, ''));
    return isNaN(num) ? 0 : num * 1_000_000_000;
  }

  // Check for Millions: e.g. $4.8M, $6.2M ARR
  const mMatch = clean.match(/([\d,.]+)\s*(?:M|million)/i);
  if (mMatch) {
    const num = parseFloat(mMatch[1].replace(/,/g, ''));
    return isNaN(num) ? 0 : num * 1_000_000;
  }

  // Check for Thousands: e.g. $750K, $500k ARR
  const kMatch = clean.match(/([\d,.]+)\s*(?:K|thousand)/i);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(/,/g, ''));
    return isNaN(num) ? 0 : num * 1_000;
  }

  // Fallback: extract numeric characters and dots
  const numericOnly = clean.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(numericOnly);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a numeric value into a concise human-readable currency string.
 * e.g. 15400000 -> "$15.4M", 450000 -> "$450K", 1200000000 -> "$1.2B"
 */
export function formatCurrency(amount: number): string {
  if (!amount || isNaN(amount) || amount === 0) return '$0';

  if (amount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '');
    return `$${val}B`;
  }
  if (amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `$${val}M`;
  }
  if (amount >= 1_000) {
    const val = Math.round(amount / 1_000);
    return `$${val}K`;
  }
  return `$${Math.round(amount).toLocaleString()}`;
}

/**
 * Formats a numeric ARR into full display format, e.g. "$17.4M ARR"
 */
export function formatArr(amount: number): string {
  return `${formatCurrency(amount)} ARR`;
}

export interface SelectionAggregates {
  leadCount: number;
  totalArr: number;
  totalEmployees: number;
  avgArr: number;
  avgEmployees: number;
  arrPerEmployee: number;
  avgPeScore: number;
  avgDeliverability: number;
  successionRiskCount: number;
  bootstrappedCount: number;
  legacyTechCount: number;
  industries: { name: string; count: number; totalArr: number }[];
}

/**
 * Computes all aggregate statistics for a set of selected leads.
 */
export function calculateSelectionAggregates(selectedLeads: Lead[]): SelectionAggregates {
  const leadCount = selectedLeads.length;

  if (leadCount === 0) {
    return {
      leadCount: 0,
      totalArr: 0,
      totalEmployees: 0,
      avgArr: 0,
      avgEmployees: 0,
      arrPerEmployee: 0,
      avgPeScore: 0,
      avgDeliverability: 0,
      successionRiskCount: 0,
      bootstrappedCount: 0,
      legacyTechCount: 0,
      industries: [],
    };
  }

  let totalArr = 0;
  let totalEmployees = 0;
  let totalPeScore = 0;
  let totalDeliverability = 0;
  let successionRiskCount = 0;
  let bootstrappedCount = 0;
  let legacyTechCount = 0;

  const industryMap: Record<string, { count: number; totalArr: number }> = {};

  for (const lead of selectedLeads) {
    const arr = parseArrValue(lead.estimatedRevenue);
    totalArr += arr;

    const employees = typeof lead.employeeCount === 'number' ? lead.employeeCount : 0;
    totalEmployees += employees;

    totalPeScore += lead.peSignals?.acquirabilityScore || 0;
    totalDeliverability += lead.deliverability?.score || 0;

    if (lead.peSignals?.ownerSuccessionRisk) successionRiskCount++;
    if (lead.peSignals?.bootstrapped) bootstrappedCount++;
    if (lead.peSignals?.legacyTechStack) legacyTechCount++;

    const ind = lead.industry || 'Other';
    if (!industryMap[ind]) {
      industryMap[ind] = { count: 0, totalArr: 0 };
    }
    industryMap[ind].count++;
    industryMap[ind].totalArr += arr;
  }

  const avgArr = totalArr / leadCount;
  const avgEmployees = Math.round(totalEmployees / leadCount);
  const arrPerEmployee = totalEmployees > 0 ? Math.round(totalArr / totalEmployees) : 0;
  const avgPeScore = Math.round(totalPeScore / leadCount);
  const avgDeliverability = Math.round(totalDeliverability / leadCount);

  const industries = Object.entries(industryMap)
    .map(([name, data]) => ({ name, count: data.count, totalArr: data.totalArr }))
    .sort((a, b) => b.totalArr - a.totalArr);

  return {
    leadCount,
    totalArr,
    totalEmployees,
    avgArr,
    avgEmployees,
    arrPerEmployee,
    avgPeScore,
    avgDeliverability,
    successionRiskCount,
    bootstrappedCount,
    legacyTechCount,
    industries,
  };
}

/**
 * Returns or generates a 5-point historical ARR quarterly trajectory for a lead.
 * If lead.arrHistory exists, returns it.
 * Otherwise, generates realistic historical quarters leading up to current estimatedRevenue.
 */
export function getLeadArrHistory(lead: Lead): ArrHistoryPoint[] {
  if (lead.arrHistory && lead.arrHistory.length > 0) {
    return lead.arrHistory;
  }

  const currentArr = parseArrValue(lead.estimatedRevenue);
  if (currentArr === 0) {
    return [
      { period: '2024 Q2', arr: 0, formattedArr: '$0' },
      { period: '2024 Q4', arr: 0, formattedArr: '$0' },
      { period: '2025 Q2', arr: 0, formattedArr: '$0' },
      { period: '2025 Q4', arr: 0, formattedArr: '$0' },
      { period: '2026 Q1', arr: 0, formattedArr: '$0' },
    ];
  }

  const peScore = lead.peSignals?.acquirabilityScore ?? 75;
  const growthRate = lead.yoyGrowth ?? (12 + (peScore % 14)); // 12% to 26%
  const periods = ['2024 Q2', '2024 Q4', '2025 Q2', '2025 Q4', '2026 Q1'];

  // Compounding quarter growth backwards from 1.0 (current ARR)
  const quarterGrowth = (growthRate / 100) / 2;
  const f4 = 1.0;
  const f3 = f4 / (1 + quarterGrowth);
  const f2 = f3 / (1 + quarterGrowth);
  const f1 = f2 / (1 + quarterGrowth);
  const f0 = f1 / (1 + quarterGrowth);
  const factors = [f0, f1, f2, f3, f4];

  // Stable seed using lead id characters
  const seedNum = (lead.id || 'lead').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  return periods.map((period, i) => {
    const bump = i === 4 ? 1 : 1 + Math.sin(seedNum * (i + 1)) * 0.02;
    const pointArr = Math.round(currentArr * factors[i] * bump);
    return {
      period,
      arr: pointArr,
      formattedArr: formatCurrency(pointArr),
    };
  });
}

/**
 * Calculates YoY growth rate from an ARR history series.
 */
export function getYoYGrowth(lead: Lead, history: ArrHistoryPoint[]): number {
  if (lead.yoyGrowth !== undefined) {
    return lead.yoyGrowth;
  }
  if (!history || history.length < 2) return 15;
  const latest = history[history.length - 1].arr;
  const baseline = history[0].arr;
  if (baseline <= 0) return 15;
  const growthOverSpan = ((latest - baseline) / baseline) * 100;
  // Span is ~1.5 years (2024 Q2 to 2026 Q1), so annualized is roughly:
  return Math.max(4, Math.round(growthOverSpan / 1.5));
}

export interface PipelineGrowthMetrics {
  avgMonthlyGrowthRate: number; // e.g. 1.8 (%)
  annualizedGrowthRate: number; // e.g. 23.8 (%)
  totalPipelineArr: number;
  totalInitialArr: number;
  netMonthlyArrAdded: number;
  sampleCount: number;
}

/**
 * Calculates the aggregate Average Monthly Growth Rate for the pipeline based on historical ARR data.
 */
export function calculatePipelineMonthlyGrowth(leads: Lead[]): PipelineGrowthMetrics {
  if (!leads || leads.length === 0) {
    return {
      avgMonthlyGrowthRate: 0,
      annualizedGrowthRate: 0,
      totalPipelineArr: 0,
      totalInitialArr: 0,
      netMonthlyArrAdded: 0,
      sampleCount: 0,
    };
  }

  let totalCurrentArr = 0;
  let totalBaselineArr = 0;
  let totalMonthlyRateSum = 0;
  let countWithArr = 0;

  // Standard historical quarter span: 2024 Q2 to 2026 Q1 is approximately 18 months
  const monthsSpan = 18;

  for (const lead of leads) {
    const history = getLeadArrHistory(lead);
    if (history.length >= 2) {
      const initial = history[0].arr;
      const latest = history[history.length - 1].arr;

      if (latest > 0) {
        totalCurrentArr += latest;
        totalBaselineArr += initial;
        countWithArr++;

        // Calculate individual lead monthly growth rate: (latest / initial)^(1/months) - 1
        const monthlyRate = (Math.pow(latest / Math.max(1, initial), 1 / monthsSpan) - 1) * 100;
        totalMonthlyRateSum += monthlyRate;
      }
    }
  }

  if (countWithArr === 0 || totalBaselineArr === 0) {
    return {
      avgMonthlyGrowthRate: 0,
      annualizedGrowthRate: 0,
      totalPipelineArr: 0,
      totalInitialArr: 0,
      netMonthlyArrAdded: 0,
      sampleCount: 0,
    };
  }

  // Portfolio-aggregate compound monthly growth rate
  const portfolioMonthlyRate = (Math.pow(totalCurrentArr / totalBaselineArr, 1 / monthsSpan) - 1) * 100;
  const meanIndividualMonthlyRate = totalMonthlyRateSum / countWithArr;

  // Blended average monthly growth rate
  const avgMonthlyGrowthRate = parseFloat(((portfolioMonthlyRate + meanIndividualMonthlyRate) / 2).toFixed(2));
  
  // Annualized rate: (1 + r/100)^12 - 1
  const annualizedGrowthRate = parseFloat(((Math.pow(1 + avgMonthlyGrowthRate / 100, 12) - 1) * 100).toFixed(1));

  // Net estimated ARR added per month across pipeline
  const netMonthlyArrAdded = Math.round(totalCurrentArr * (avgMonthlyGrowthRate / 100));

  return {
    avgMonthlyGrowthRate,
    annualizedGrowthRate,
    totalPipelineArr: totalCurrentArr,
    totalInitialArr: totalBaselineArr,
    netMonthlyArrAdded,
    sampleCount: countWithArr,
  };
}


