export type VerificationStatus = 'verified' | 'risky' | 'invalid' | 'unverified';

export type LeadStage = 'scraped' | 'qualified' | 'outreach_ready' | 'deal_pipeline' | 'archived';

export interface DecisionMaker {
  name: string;
  title: string;
  email: string;
  linkedinUrl: string;
  phone?: string;
}

export interface PESignals {
  ownerSuccessionRisk: boolean;
  bootstrapped: boolean;
  legacyTechStack: boolean;
  highCashflowMargin: boolean;
  customerConcentrationLow: boolean;
  acquirabilityScore: number; // 0 to 100
  keyTriggers: string[];
}

export interface AiEnrichmentResult {
  summary: string;
  businessModel: string;
  maThesis: string;
  operationalUpside: string[];
  techStack: string[];
  outreachSequences: {
    peSearchFundPitch: string;
    b2bSalesPitch: string;
    linkedInInMail: string;
    coldCallScript: string;
  };
  enrichedAt: string;
  source?: 'gemini-3.8-flash' | 'synthetic-engine';
}

export interface DeliverabilityInfo {
  status: VerificationStatus;
  score: number; // 0 to 100
  mxProvider: string;
  isCatchAll: boolean;
  isDisposable: boolean;
  smtpCheckValid: boolean;
  syntaxValid: boolean;
  lastChecked: string;
}

export interface ArrHistoryPoint {
  period: string;
  arr: number;
  formattedArr?: string;
}

export interface Lead {
  id: string;
  companyName: string;
  domain: string;
  industry: string;
  subIndustry: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  employeeCount: number;
  foundedYear: number;
  estimatedRevenue: string; // e.g. "$4.5M ARR"
  estimatedEbitda: string;  // e.g. "$1.4M (31%)"
  arrHistory?: ArrHistoryPoint[];
  yoyGrowth?: number; // e.g. 18 for +18%
  decisionMaker: DecisionMaker;
  deliverability: DeliverabilityInfo;
  peSignals: PESignals;
  aiEnrichment?: AiEnrichmentResult;
  stage: LeadStage;
  scrapedAt: string;
  tags: string[];
  isHot?: boolean;
  hotMarkedAt?: string;
  salesforceSync?: {
    synced: boolean;
    syncedAt: string;
    recordId: string;
  };
}

export interface FilterOptions {
  searchQuery: string;
  industry: string;
  stage: string;
  deliverability: string;
  minPeScore: number;
  onlyBootstrapped: boolean;
  onlySuccessionRisk: boolean;
  onlyLegacyTech: boolean;
  onlyHot?: boolean;
}

export interface ScrapeSimulationLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'crawl';
  message: string;
}

export type SalesforceSyncRule = 'always_overwrite' | 'fill_if_empty';
export type SalesforceFieldType = 'string' | 'currency' | 'percent' | 'boolean' | 'picklist' | 'url';

export interface SalesforceFieldMapping {
  id: string;
  sourceField: string;
  sourceLabel: string;
  targetObject: 'Account' | 'Contact' | 'Lead' | 'Opportunity';
  targetField: string;
  fieldType: SalesforceFieldType;
  syncRule: SalesforceSyncRule;
  isRequired?: boolean;
}
