import React, { useState, useEffect, useRef } from 'react';
import { Lead } from '../types';
import { X, Play, Terminal, CheckCircle2, AlertTriangle, ShieldCheck, Database, RefreshCw } from 'lucide-react';

interface ScraperConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadScraped: (newLead: Lead) => void;
}

export const ScraperConsoleModal: React.FC<ScraperConsoleModalProps> = ({
  isOpen,
  onClose,
  onLeadScraped,
}) => {
  const [query, setQuery] = useState('Niche B2B SaaS & Industrial Job Shop software with founder age 55+');
  const [targetVertical, setTargetVertical] = useState('Industrial Manufacturing');
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [extractedLead, setExtractedLead] = useState<Lead | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleStartScrape = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(true);
    setIsCompleted(false);
    setLogs([]);
    setExtractedLead(null);

    const logSteps = [
      `[0.1s] Initializing distributed crawler worker node: us-east4-worker-08`,
      `[0.3s] Acquired residential rotating proxy IP: 198.51.100.44 (ISP: AT&T Business, Ohio)`,
      `[0.6s] Applying TLS client hello fingerprint randomization (Stealth evasion active)`,
      `[0.9s] Querying search indexes for: "${query}" in vertical "${targetVertical}"`,
      `[1.4s] Target discovered: DeltaCasting Operations ERP (deltacasting-tech.com)`,
      `[1.8s] Navigating headless browser: https://deltacasting-tech.com/about-management`,
      `[2.3s] Bypassed Cloudflare Bot Management v2 (Challenge passed in 140ms)`,
      `[2.8s] Extracted executive entity: Ronald 'Ron' Becker (Founder & Managing Director, since 2007)`,
      `[3.2s] Inferred email pattern: r.becker@deltacasting-tech.com (Confidence: 94%)`,
      `[3.7s] Querying MX records for deltacasting-tech.com: resolved to mail.protection.outlook.com`,
      `[4.1s] SMTP Handshake simulated: RCPT TO <r.becker@deltacasting-tech.com> -> 250 OK Mailbox Verified`,
      `[4.5s] Parsed Search Fund signals: Founder age ~63, bootstrapped, zero VC, Windows IIS on-premise footprint`,
      `[4.9s] Pipeline calculation: Estimated ARR $3.9M, EBITDA $1.3M (33%), Acquirability Score: 94/100`,
      `[5.2s] Crawl complete. Ingestion payload validated against JSON schema.`,
    ];

    let currentStep = 0;
    intervalRef.current = setInterval(() => {
      if (currentStep < logSteps.length) {
        const nextLog = logSteps[currentStep];
        currentStep++;
        if (nextLog) {
          setLogs((prev) => [...prev, nextLog]);
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);
        setIsCompleted(true);

        const newLead: Lead = {
          id: `lead-scraped-${Date.now()}`,
          companyName: 'DeltaCasting Operations ERP',
          domain: 'deltacasting-tech.com',
          industry: 'Industrial Manufacturing Software',
          subIndustry: 'Non-Ferrous Die Cast Quoting & SPC Quality',
          location: { city: 'Toledo', state: 'OH', country: 'USA' },
          employeeCount: 21,
          foundedYear: 2007,
          estimatedRevenue: '$3.9M ARR',
          estimatedEbitda: '$1.3M (33%)',
          decisionMaker: {
            name: 'Ronald Becker',
            title: 'Founder & Managing Director',
            email: 'r.becker@deltacasting-tech.com',
            linkedinUrl: 'https://linkedin.com/in/ron-becker-deltacast',
            phone: '+1 (419) 555-0812',
          },
          deliverability: {
            status: 'verified',
            score: 96,
            mxProvider: 'Microsoft 365 (mail.protection.outlook.com)',
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
            acquirabilityScore: 94,
            keyTriggers: ['Founder age 63', 'Bootstrapped for 19 years', 'Legacy desktop app to SaaS upside'],
          },
          stage: 'scraped',
          scrapedAt: new Date().toISOString().split('T')[0],
          tags: ['Just Scraped', 'Die Casting', 'Ohio', 'Search Fund High Priority'],
        };

        setExtractedLead(newLead);
      }
    }, 380);
  };

  const handleSaveToPipeline = () => {
    if (extractedLead) {
      onLeadScraped(extractedLead);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#0B0F17] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-[#111622] px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono font-medium text-slate-200">
              SaaSQuatch Distributed Headless Crawler Console
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Controls */}
        <div className="p-4 bg-[#141B29] border-b border-slate-800 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-slate-400 font-medium block">Search Query & Targeting Parameters</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isRunning}
                className="w-full py-1.5 px-3 bg-[#0B0F17] border border-slate-700 rounded text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-medium block">Target Vertical</label>
              <select
                value={targetVertical}
                onChange={(e) => setTargetVertical(e.target.value)}
                disabled={isRunning}
                className="w-full py-1.5 px-3 bg-[#0B0F17] border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Industrial Manufacturing">Industrial Manufacturing</option>
                <option value="Logistics Software">Logistics Software</option>
                <option value="GovTech & Municipalities">GovTech & Municipalities</option>
                <option value="AgriTech & Elevators">AgriTech & Elevators</option>
                <option value="LegalTech & Courts">LegalTech & Courts</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Residential Rotating Proxies Active · Anti-CAPTCHA Stealth Enabled</span>
            </div>

            <button
              onClick={handleStartScrape}
              disabled={isRunning}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-md transition-all flex items-center gap-2 cursor-pointer shadow"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Crawling Target...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Headless Scrape</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Console stream */}
        <div
          ref={logContainerRef}
          className="p-4 bg-[#080B11] font-mono text-xs text-slate-300 overflow-y-auto flex-1 min-h-[220px] max-h-[300px] space-y-1.5 select-text"
        >
          {logs.length === 0 && !isRunning && (
            <div className="text-slate-600 italic py-8 text-center">
              Worker pool idle. Click "Execute Headless Scrape" to trigger multi-source ingestion.
            </div>
          )}

          {logs.map((log, index) => {
            if (!log || typeof log !== 'string') return null;
            const isSuccess = log.includes('250 OK') || log.includes('complete');
            const isTarget = log.includes('Target discovered') || log.includes('Extracted');
            return (
              <div
                key={index}
                className={`leading-relaxed ${
                  isSuccess
                    ? 'text-emerald-400'
                    : isTarget
                    ? 'text-blue-300 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                {log}
              </div>
            );
          })}
        </div>

        {/* Extracted Card (if completed) */}
        {isCompleted && extractedLead && (
          <div className="p-4 bg-[#141B29] border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="font-semibold text-slate-100 text-xs">
                  {extractedLead.companyName}{' '}
                  <span className="font-mono text-blue-400 ml-1">({extractedLead.domain})</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Founder: {extractedLead.decisionMaker.name} ({extractedLead.decisionMaker.email}) · Score:{' '}
                  <span className="font-mono text-amber-400 font-semibold">{extractedLead.peSignals.acquirabilityScore}/100</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveToPipeline}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Save Lead to Live Pipeline</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
