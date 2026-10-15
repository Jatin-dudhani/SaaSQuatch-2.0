import { Lead, LeadStage, VerificationStatus } from '../types';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationItemResult {
  index: number;
  raw: any;
  companyName: string;
  domain: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  isDuplicate: boolean;
  duplicateReason?: string;
  sanitizedLead?: Lead;
}

export interface ValidationSummary {
  total: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  items: ValidationItemResult[];
}

const VALID_STAGES: LeadStage[] = [
  'scraped',
  'qualified',
  'outreach_ready',
  'deal_pipeline',
  'archived',
];

const VALID_VERIFICATION_STATUSES: VerificationStatus[] = [
  'verified',
  'risky',
  'invalid',
  'unverified',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates a single raw JSON object against the Lead interface definition.
 * If autoRepairDefaults is true, missing sub-objects like deliverability or peSignals
 * will be filled with valid defaults instead of failing validation.
 */
export function validateLeadItem(
  raw: any,
  index: number,
  existingLeads: Lead[],
  autoRepairDefaults: boolean = false
): ValidationItemResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {
      index,
      raw,
      companyName: 'Unknown',
      domain: '',
      isValid: false,
      errors: [
        {
          field: 'root',
          message: `Record at index ${index + 1} is not a valid JSON object.`,
          severity: 'error',
        },
      ],
      warnings: [],
      isDuplicate: false,
    };
  }

  // 1. companyName
  let companyName = '';
  if (typeof raw.companyName !== 'string' || !raw.companyName.trim()) {
    errors.push({
      field: 'companyName',
      message: "Missing required string 'companyName'.",
      severity: 'error',
    });
  } else {
    companyName = raw.companyName.trim();
  }

  // 2. domain
  let domain = '';
  if (typeof raw.domain !== 'string' || !raw.domain.trim()) {
    errors.push({
      field: 'domain',
      message: "Missing required string 'domain'.",
      severity: 'error',
    });
  } else {
    domain = raw.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }

  // 3. industry
  let industry = '';
  if (typeof raw.industry !== 'string' || !raw.industry.trim()) {
    if (autoRepairDefaults) {
      industry = 'Enterprise Software';
      warnings.push({
        field: 'industry',
        message: "Defaulted 'industry' to 'Enterprise Software'.",
        severity: 'warning',
      });
    } else {
      errors.push({
        field: 'industry',
        message: "Missing required string 'industry'.",
        severity: 'error',
      });
    }
  } else {
    industry = raw.industry.trim();
  }

  // 4. subIndustry
  let subIndustry = '';
  if (typeof raw.subIndustry !== 'string') {
    if (autoRepairDefaults) {
      subIndustry = industry;
    } else {
      errors.push({
        field: 'subIndustry',
        message: "Missing string 'subIndustry'.",
        severity: 'error',
      });
    }
  } else {
    subIndustry = raw.subIndustry.trim();
  }

  // 5. location
  let location = raw.location;
  if (!location || typeof location !== 'object') {
    if (autoRepairDefaults) {
      location = { city: 'Unknown', state: 'N/A', country: 'USA' };
      warnings.push({
        field: 'location',
        message: "Defaulted 'location' to { city: 'Unknown', state: 'N/A', country: 'USA' }.",
        severity: 'warning',
      });
    } else {
      errors.push({
        field: 'location',
        message: "Missing object 'location' with { city, state, country }.",
        severity: 'error',
      });
    }
  } else {
    const locCity = typeof location.city === 'string' ? location.city : '';
    const locState = typeof location.state === 'string' ? location.state : '';
    const locCountry = typeof location.country === 'string' ? location.country : '';

    if (!locCity && !autoRepairDefaults) {
      errors.push({ field: 'location.city', message: "Missing string 'location.city'.", severity: 'error' });
    }
    if (!locCountry && !autoRepairDefaults) {
      errors.push({ field: 'location.country', message: "Missing string 'location.country'.", severity: 'error' });
    }

    location = {
      city: locCity || (autoRepairDefaults ? 'Unknown' : ''),
      state: locState || (autoRepairDefaults ? 'N/A' : ''),
      country: locCountry || (autoRepairDefaults ? 'USA' : ''),
    };
  }

  // 6. employeeCount
  let employeeCount = raw.employeeCount;
  if (typeof employeeCount !== 'number' || isNaN(employeeCount) || employeeCount < 0) {
    if (autoRepairDefaults && typeof employeeCount === 'string' && !isNaN(parseInt(employeeCount, 10))) {
      employeeCount = parseInt(employeeCount, 10);
      warnings.push({
        field: 'employeeCount',
        message: `Parsed string employeeCount to number (${employeeCount}).`,
        severity: 'warning',
      });
    } else if (autoRepairDefaults) {
      employeeCount = 25;
      warnings.push({
        field: 'employeeCount',
        message: "Defaulted 'employeeCount' to 25.",
        severity: 'warning',
      });
    } else {
      errors.push({
        field: 'employeeCount',
        message: "'employeeCount' must be a non-negative number.",
        severity: 'error',
      });
    }
  }

  // 7. foundedYear
  let foundedYear = raw.foundedYear;
  if (typeof foundedYear !== 'number' || isNaN(foundedYear) || foundedYear < 1800 || foundedYear > 2030) {
    if (autoRepairDefaults && typeof foundedYear === 'string' && !isNaN(parseInt(foundedYear, 10))) {
      foundedYear = parseInt(foundedYear, 10);
    } else if (autoRepairDefaults) {
      foundedYear = 2016;
      warnings.push({
        field: 'foundedYear',
        message: "Defaulted 'foundedYear' to 2016.",
        severity: 'warning',
      });
    } else {
      errors.push({
        field: 'foundedYear',
        message: "'foundedYear' must be a valid year number (1800-2030).",
        severity: 'error',
      });
    }
  }

  // 8. estimatedRevenue & estimatedEbitda
  let estimatedRevenue = raw.estimatedRevenue;
  if (typeof estimatedRevenue !== 'string' || !estimatedRevenue.trim()) {
    if (autoRepairDefaults) {
      estimatedRevenue = '$3.5M ARR';
    } else {
      errors.push({
        field: 'estimatedRevenue',
        message: "Missing string 'estimatedRevenue' (e.g. '$4.5M ARR').",
        severity: 'error',
      });
    }
  }

  let estimatedEbitda = raw.estimatedEbitda;
  if (typeof estimatedEbitda !== 'string' || !estimatedEbitda.trim()) {
    if (autoRepairDefaults) {
      estimatedEbitda = '$1.1M (31%)';
    } else {
      errors.push({
        field: 'estimatedEbitda',
        message: "Missing string 'estimatedEbitda' (e.g. '$1.2M (28%)').",
        severity: 'error',
      });
    }
  }

  // 9. decisionMaker
  let decisionMaker = raw.decisionMaker;
  if (!decisionMaker || typeof decisionMaker !== 'object') {
    errors.push({
      field: 'decisionMaker',
      message: "Missing object 'decisionMaker' with { name, title, email, linkedinUrl }.",
      severity: 'error',
    });
  } else {
    if (typeof decisionMaker.name !== 'string' || !decisionMaker.name.trim()) {
      errors.push({
        field: 'decisionMaker.name',
        message: "Missing required string 'decisionMaker.name'.",
        severity: 'error',
      });
    }
    if (typeof decisionMaker.title !== 'string' || !decisionMaker.title.trim()) {
      if (autoRepairDefaults) {
        decisionMaker.title = 'Executive';
      } else {
        errors.push({
          field: 'decisionMaker.title',
          message: "Missing required string 'decisionMaker.title'.",
          severity: 'error',
        });
      }
    }
    if (typeof decisionMaker.email !== 'string' || !EMAIL_REGEX.test(decisionMaker.email.trim())) {
      errors.push({
        field: 'decisionMaker.email',
        message: "Field 'decisionMaker.email' is missing or has an invalid email format.",
        severity: 'error',
      });
    }
    if (typeof decisionMaker.linkedinUrl !== 'string') {
      if (autoRepairDefaults) {
        decisionMaker.linkedinUrl = domain ? `https://linkedin.com/company/${domain}` : '';
      } else {
        errors.push({
          field: 'decisionMaker.linkedinUrl',
          message: "Missing string 'decisionMaker.linkedinUrl'.",
          severity: 'error',
        });
      }
    }
  }

  // 10. deliverability
  let deliverability = raw.deliverability;
  if (!deliverability || typeof deliverability !== 'object') {
    if (autoRepairDefaults) {
      deliverability = {
        status: 'unverified',
        score: 70,
        mxProvider: 'Pending Verification',
        isCatchAll: false,
        isDisposable: false,
        smtpCheckValid: false,
        syntaxValid: true,
        lastChecked: new Date().toISOString().split('T')[0],
      };
      warnings.push({
        field: 'deliverability',
        message: "Auto-generated default deliverability info.",
        severity: 'warning',
      });
    } else {
      errors.push({
        field: 'deliverability',
        message: "Missing object 'deliverability' with status, score, mxProvider, etc.",
        severity: 'error',
      });
    }
  } else {
    if (!VALID_VERIFICATION_STATUSES.includes(deliverability.status)) {
      if (autoRepairDefaults) {
        deliverability.status = 'unverified';
      } else {
        errors.push({
          field: 'deliverability.status',
          message: `Invalid 'deliverability.status'. Must be one of: ${VALID_VERIFICATION_STATUSES.join(', ')}.`,
          severity: 'error',
        });
      }
    }
    if (typeof deliverability.score !== 'number' || deliverability.score < 0 || deliverability.score > 100) {
      if (autoRepairDefaults) {
        deliverability.score = 75;
      } else {
        errors.push({
          field: 'deliverability.score',
          message: "'deliverability.score' must be a number between 0 and 100.",
          severity: 'error',
        });
      }
    }
  }

  // 11. peSignals
  let peSignals = raw.peSignals;
  if (!peSignals || typeof peSignals !== 'object') {
    if (autoRepairDefaults) {
      peSignals = {
        ownerSuccessionRisk: false,
        bootstrapped: true,
        legacyTechStack: false,
        highCashflowMargin: true,
        customerConcentrationLow: true,
        acquirabilityScore: 78,
        keyTriggers: ['Imported pipeline lead'],
      };
      warnings.push({
        field: 'peSignals',
        message: "Auto-generated default PE signals.",
        severity: 'warning',
      });
    } else {
      errors.push({
        field: 'peSignals',
        message: "Missing object 'peSignals' with acquirabilityScore, bootstrapped, keyTriggers, etc.",
        severity: 'error',
      });
    }
  } else {
    if (typeof peSignals.acquirabilityScore !== 'number' || peSignals.acquirabilityScore < 0 || peSignals.acquirabilityScore > 100) {
      if (autoRepairDefaults) {
        peSignals.acquirabilityScore = 75;
      } else {
        errors.push({
          field: 'peSignals.acquirabilityScore',
          message: "'peSignals.acquirabilityScore' must be a number between 0 and 100.",
          severity: 'error',
        });
      }
    }
    if (!Array.isArray(peSignals.keyTriggers)) {
      if (autoRepairDefaults) {
        peSignals.keyTriggers = [];
      } else {
        errors.push({
          field: 'peSignals.keyTriggers',
          message: "'peSignals.keyTriggers' must be an array of strings.",
          severity: 'error',
        });
      }
    }
  }

  // 12. stage
  let stage: LeadStage = raw.stage;
  if (!VALID_STAGES.includes(stage)) {
    if (autoRepairDefaults || !stage) {
      stage = 'scraped';
      if (raw.stage) {
        warnings.push({
          field: 'stage',
          message: `Invalid stage '${raw.stage}'. Defaulted to 'scraped'.`,
          severity: 'warning',
        });
      }
    } else {
      errors.push({
        field: 'stage',
        message: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}.`,
        severity: 'error',
      });
    }
  }

  // 13. tags
  let tags = raw.tags;
  if (!Array.isArray(tags)) {
    if (autoRepairDefaults) {
      tags = ['Imported'];
    } else {
      errors.push({
        field: 'tags',
        message: "'tags' must be an array of strings.",
        severity: 'error',
      });
    }
  } else {
    tags = tags.filter((t: any) => typeof t === 'string');
  }

  // 14. id & scrapedAt
  const id = typeof raw.id === 'string' && raw.id.trim()
    ? raw.id.trim()
    : `lead-imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const scrapedAt = typeof raw.scrapedAt === 'string' && raw.scrapedAt.trim()
    ? raw.scrapedAt.trim()
    : new Date().toISOString().split('T')[0];

  // Duplicate detection against existingLeads
  let isDuplicate = false;
  let duplicateReason: string | undefined;

  if (domain) {
    const existingDomainMatch = existingLeads.find(
      (l) => l.domain.toLowerCase() === domain.toLowerCase()
    );
    if (existingDomainMatch) {
      isDuplicate = true;
      duplicateReason = `Matches domain '${domain}' of existing lead '${existingDomainMatch.companyName}'`;
    }
  }

  if (!isDuplicate && companyName) {
    const existingNameMatch = existingLeads.find(
      (l) => l.companyName.toLowerCase() === companyName.toLowerCase()
    );
    if (existingNameMatch) {
      isDuplicate = true;
      duplicateReason = `Matches company name of existing lead '${existingNameMatch.companyName}'`;
    }
  }

  const isValid = errors.length === 0;

  let sanitizedLead: Lead | undefined;
  if (isValid) {
    sanitizedLead = {
      id,
      companyName,
      domain,
      industry,
      subIndustry,
      location,
      employeeCount,
      foundedYear,
      estimatedRevenue,
      estimatedEbitda,
      decisionMaker: {
        name: decisionMaker.name.trim(),
        title: decisionMaker.title.trim(),
        email: decisionMaker.email.trim().toLowerCase(),
        linkedinUrl: decisionMaker.linkedinUrl.trim(),
        ...(decisionMaker.phone ? { phone: String(decisionMaker.phone).trim() } : {}),
      },
      deliverability: {
        status: deliverability.status,
        score: deliverability.score,
        mxProvider: deliverability.mxProvider || 'Unknown',
        isCatchAll: Boolean(deliverability.isCatchAll),
        isDisposable: Boolean(deliverability.isDisposable),
        smtpCheckValid: Boolean(deliverability.smtpCheckValid),
        syntaxValid: Boolean(deliverability.syntaxValid ?? true),
        lastChecked: deliverability.lastChecked || new Date().toISOString().split('T')[0],
      },
      peSignals: {
        ownerSuccessionRisk: Boolean(peSignals.ownerSuccessionRisk),
        bootstrapped: Boolean(peSignals.bootstrapped),
        legacyTechStack: Boolean(peSignals.legacyTechStack),
        highCashflowMargin: Boolean(peSignals.highCashflowMargin),
        customerConcentrationLow: Boolean(peSignals.customerConcentrationLow),
        acquirabilityScore: peSignals.acquirabilityScore,
        keyTriggers: Array.isArray(peSignals.keyTriggers) ? peSignals.keyTriggers : [],
      },
      ...(raw.aiEnrichment && typeof raw.aiEnrichment === 'object' ? { aiEnrichment: raw.aiEnrichment } : {}),
      stage,
      scrapedAt,
      tags,
      ...(raw.salesforceSync && typeof raw.salesforceSync === 'object' ? { salesforceSync: raw.salesforceSync } : {}),
    };
  }

  return {
    index,
    raw,
    companyName: companyName || raw.companyName || `Record #${index + 1}`,
    domain: domain || raw.domain || '',
    isValid,
    errors,
    warnings,
    isDuplicate,
    duplicateReason,
    sanitizedLead,
  };
}

/**
 * Validates an entire parsed JSON payload.
 * Can be an Array of leads or an object with a `leads` or `data` property.
 */
export function validateLeadJsonPayload(
  parsedJson: any,
  existingLeads: Lead[],
  autoRepairDefaults: boolean = false
): ValidationSummary {
  let list: any[] = [];

  if (Array.isArray(parsedJson)) {
    list = parsedJson;
  } else if (parsedJson && typeof parsedJson === 'object') {
    if (Array.isArray(parsedJson.leads)) {
      list = parsedJson.leads;
    } else if (Array.isArray(parsedJson.data)) {
      list = parsedJson.data;
    } else {
      // Single object
      list = [parsedJson];
    }
  }

  const items = list.map((item, idx) =>
    validateLeadItem(item, idx, existingLeads, autoRepairDefaults)
  );

  const validCount = items.filter((i) => i.isValid).length;
  const invalidCount = items.filter((i) => !i.isValid).length;
  const duplicateCount = items.filter((i) => i.isDuplicate).length;

  return {
    total: items.length,
    validCount,
    invalidCount,
    duplicateCount,
    items,
  };
}

/**
 * Generates a clean sample JSON payload that is 100% compliant with the Lead type definition.
 */
export function getSampleLeadsTemplate(): Lead[] {
  return [
    {
      id: 'sample-lead-01',
      companyName: 'BeaconFlow Logistics SaaS',
      domain: 'beaconflow.io',
      industry: 'Supply Chain & Logistics',
      subIndustry: 'Warehouse Automation & TMS',
      location: {
        city: 'Indianapolis',
        state: 'IN',
        country: 'USA',
      },
      employeeCount: 32,
      foundedYear: 2015,
      estimatedRevenue: '$5.2M ARR',
      estimatedEbitda: '$1.7M (33%)',
      decisionMaker: {
        name: 'Gregory Miller',
        title: 'Founder & CEO',
        email: 'g.miller@beaconflow.io',
        linkedinUrl: 'https://linkedin.com/in/gregory-miller-logistics',
        phone: '+1 (317) 555-0149',
      },
      deliverability: {
        status: 'verified',
        score: 96,
        mxProvider: 'Google Workspace (aspmx.l.google.com)',
        isCatchAll: false,
        isDisposable: false,
        smtpCheckValid: true,
        syntaxValid: true,
        lastChecked: new Date().toISOString().split('T')[0],
      },
      peSignals: {
        ownerSuccessionRisk: true,
        bootstrapped: true,
        legacyTechStack: true,
        highCashflowMargin: true,
        customerConcentrationLow: true,
        acquirabilityScore: 92,
        keyTriggers: [
          'Founder age 61 with no immediate successor',
          'Zero venture capital raised',
          'High net revenue retention (108%)',
        ],
      },
      stage: 'qualified',
      scrapedAt: new Date().toISOString().split('T')[0],
      tags: ['Bootstrapped', 'Succession Risk', 'Midwest', 'High Retention'],
    },
    {
      id: 'sample-lead-02',
      companyName: 'Vanguard Medical Billing ERP',
      domain: 'vanguardmedsys.com',
      industry: 'Healthcare Technology',
      subIndustry: 'Ambulatory EHR & Revenue Cycle Management',
      location: {
        city: 'Nashville',
        state: 'TN',
        country: 'USA',
      },
      employeeCount: 45,
      foundedYear: 2011,
      estimatedRevenue: '$6.8M ARR',
      estimatedEbitda: '$2.1M (31%)',
      decisionMaker: {
        name: 'Dr. Evelyn Carter',
        title: 'Co-Founder & President',
        email: 'evelyn@vanguardmedsys.com',
        linkedinUrl: 'https://linkedin.com/in/evelyn-carter-md',
        phone: '+1 (615) 555-0177',
      },
      deliverability: {
        status: 'verified',
        score: 98,
        mxProvider: 'Microsoft 365 Exchange Online',
        isCatchAll: false,
        isDisposable: false,
        smtpCheckValid: true,
        syntaxValid: true,
        lastChecked: new Date().toISOString().split('T')[0],
      },
      peSignals: {
        ownerSuccessionRisk: true,
        bootstrapped: true,
        legacyTechStack: false,
        highCashflowMargin: true,
        customerConcentrationLow: true,
        acquirabilityScore: 89,
        keyTriggers: [
          'Founders exploring recapitalization or strategic sale',
          '350+ recurring clinic subscriptions',
        ],
      },
      stage: 'scraped',
      scrapedAt: new Date().toISOString().split('T')[0],
      tags: ['Healthcare SaaS', 'RCM', 'Recurring Revenue', 'Southeast'],
    },
  ];
}
