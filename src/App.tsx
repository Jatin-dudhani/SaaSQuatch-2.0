import React, { useState, useMemo } from 'react';
import { Lead, FilterOptions, LeadStage } from './types';
import { INITIAL_LEADS } from './data/seedLeads';
import { Header } from './components/Header';
import { PipelineStats } from './components/PipelineStats';
import { LeadFilters } from './components/LeadFilters';
import { LeadTable } from './components/LeadTable';
import { LeadDrawer } from './components/LeadDrawer';
import { ScraperConsoleModal } from './components/ScraperConsoleModal';
import { EmailVerifierModal } from './components/EmailVerifierModal';
import { CapraeDossierView } from './components/CapraeDossierView';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [activeTab, setActiveTab] = useState<'leads' | 'verifier' | 'dossier'>('leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEnriching, setIsEnriching] = useState<boolean>(false);
  const [isScraperOpen, setIsScraperOpen] = useState<boolean>(false);
  const [isVerifierModalOpen, setIsVerifierModalOpen] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    industry: 'all',
    stage: 'all',
    deliverability: 'all',
    minPeScore: 0,
    onlyBootstrapped: false,
    onlySuccessionRisk: false,
    onlyLegacyTech: false,
  });

  // Extract unique industries for filter dropdown
  const industries = useMemo(() => {
    const set = new Set(leads.map((l) => l.industry));
    return Array.from(set).sort();
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search query
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          (lead.companyName || '').toLowerCase().includes(q) ||
          (lead.domain || '').toLowerCase().includes(q) ||
          (lead.decisionMaker?.name || '').toLowerCase().includes(q) ||
          (lead.location?.city || '').toLowerCase().includes(q) ||
          (lead.location?.state || '').toLowerCase().includes(q) ||
          (lead.tags || []).some((t) => (t || '').toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Industry
      if (filters.industry !== 'all' && lead.industry !== filters.industry) {
        return false;
      }

      // Stage
      if (filters.stage !== 'all' && lead.stage !== filters.stage) {
        return false;
      }

      // Deliverability
      if (filters.deliverability !== 'all') {
        if (filters.deliverability === 'verified' && lead.deliverability.status !== 'verified') {
          return false;
        }
        if (filters.deliverability === 'risky' && lead.deliverability.status === 'verified') {
          return false;
        }
      }

      // Min PE Score
      if (filters.minPeScore > 0 && lead.peSignals.acquirabilityScore < filters.minPeScore) {
        return false;
      }

      // Bootstrapped
      if (filters.onlyBootstrapped && !lead.peSignals.bootstrapped) {
        return false;
      }

      // Succession Risk
      if (filters.onlySuccessionRisk && !lead.peSignals.ownerSuccessionRisk) {
        return false;
      }

      // Legacy Tech
      if (filters.onlyLegacyTech && !lead.peSignals.legacyTechStack) {
        return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Enrich lead via server-side Gemini 3.8 Flash
  const handleEnrichLead = async (lead: Lead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsEnriching(true);
    try {
      const res = await fetch('/api/leads/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: lead.companyName,
          domain: lead.domain,
          industry: lead.industry,
          employeeCount: lead.employeeCount,
          estimatedRevenue: lead.estimatedRevenue,
          decisionMaker: lead.decisionMaker,
        }),
      });

      const enrichmentData = await res.json();

      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, aiEnrichment: enrichmentData } : l))
      );

      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead((prev) => (prev ? { ...prev, aiEnrichment: enrichmentData } : null));
      }
    } catch (err) {
      console.error('Error enriching lead:', err);
    } finally {
      setIsEnriching(false);
    }
  };

  // Re-verify lead deliverability
  const handleVerifyLead = async (lead: Lead, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch('/api/leads/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lead.decisionMaker.email }),
      });
      const data = await res.json();

      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? {
                ...l,
                deliverability: {
                  status: data.status,
                  score: data.score,
                  mxProvider: data.mxProvider,
                  isCatchAll: data.isCatchAll,
                  isDisposable: data.isDisposable,
                  smtpCheckValid: data.smtpCheckValid,
                  syntaxValid: data.syntaxValid,
                  lastChecked: data.lastChecked,
                },
              }
            : l
        )
      );

      if (selectedLead && selectedLead.id === lead.id) {
        setSelectedLead((prev) =>
          prev
            ? {
                ...prev,
                deliverability: {
                  status: data.status,
                  score: data.score,
                  mxProvider: data.mxProvider,
                  isCatchAll: data.isCatchAll,
                  isDisposable: data.isDisposable,
                  smtpCheckValid: data.smtpCheckValid,
                  syntaxValid: data.syntaxValid,
                  lastChecked: data.lastChecked,
                },
              }
            : null
        );
      }
    } catch (err) {
      console.error('Error verifying email:', err);
    }
  };

  // Update lead stage
  const handleUpdateStage = (leadId: string, stage: LeadStage) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage } : l)));
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, stage } : null));
    }
  };

  // Sync lead to Salesforce
  const handleSyncSalesforce = (
    leadId: string,
    syncData: { synced: boolean; syncedAt: string; recordId: string }
  ) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, salesforceSync: syncData } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, salesforceSync: syncData } : null));
    }
  };

  // New lead scraped
  const handleLeadScraped = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    setSelectedLead(newLead);
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Company Name',
      'Domain',
      'Industry',
      'Location',
      'Employees',
      'ARR',
      'EBITDA',
      'Decision Maker',
      'Title',
      'Email',
      'Deliverability Score',
      'Acquirability Score',
      'Stage',
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.companyName}"`,
      `"${l.domain}"`,
      `"${l.industry}"`,
      `"${l.location.city}, ${l.location.state}"`,
      l.employeeCount,
      `"${l.estimatedRevenue}"`,
      `"${l.estimatedEbitda}"`,
      `"${l.decisionMaker.name}"`,
      `"${l.decisionMaker.title}"`,
      `"${l.decisionMaker.email}"`,
      `${l.deliverability.score}%`,
      `${l.peSignals.acquirabilityScore}`,
      `"${l.stage}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saasquatch_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(filteredLeads, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `saasquatch_leads_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col antialiased">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScraper={() => setIsScraperOpen(true)}
        leadsCount={leads.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Lead Intelligence Hub */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            {/* KPI Statistics */}
            <PipelineStats leads={leads} />

            {/* Filter Console */}
            <LeadFilters
              filters={filters}
              setFilters={setFilters}
              industries={industries}
              totalFiltered={filteredLeads.length}
              totalCount={leads.length}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
            />

            {/* Leads Table */}
            <LeadTable
              leads={filteredLeads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onEnrichLead={(lead, e) => {
                setSelectedLead(lead);
                handleEnrichLead(lead, e);
              }}
              onVerifyLead={handleVerifyLead}
              onUpdateStage={handleUpdateStage}
              onResetFilters={() =>
                setFilters({
                  searchQuery: '',
                  industry: 'all',
                  stage: 'all',
                  deliverability: 'all',
                  minPeScore: 0,
                  onlyBootstrapped: false,
                  onlySuccessionRisk: false,
                  onlyLegacyTech: false,
                })
              }
            />
          </div>
        )}

        {/* Tab 2: Deliverability Lab */}
        {activeTab === 'verifier' && (
          <div className="py-4">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white tracking-tight">
                SaaSQuatch Email Deliverability & MX Routing Engine
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Protect outbound domain sender score by verifying recipient mail server responses, RFC compliance, and catch-all flags before scheduling cold cadences.
              </p>
            </div>
            <EmailVerifierModal
              isOpen={true}
              onClose={() => setActiveTab('leads')}
              leads={leads}
            />
          </div>
        )}

        {/* Tab 3: Caprae Submission Dossier */}
        {activeTab === 'dossier' && <CapraeDossierView />}
      </main>

      {/* Slide-Over Drawer for Lead Detail */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onEnrich={handleEnrichLead}
          isEnriching={isEnriching}
          onUpdateStage={handleUpdateStage}
          onVerifyEmail={async (email) => {
            const l = leads.find((x) => x.decisionMaker.email === email);
            if (l) await handleVerifyLead(l);
          }}
          onSyncSalesforce={handleSyncSalesforce}
        />
      )}

      {/* Headless Crawler Scraper Modal */}
      <ScraperConsoleModal
        isOpen={isScraperOpen}
        onClose={() => setIsScraperOpen(false)}
        onLeadScraped={handleLeadScraped}
      />
    </div>
  );
}
