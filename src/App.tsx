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
import { BulkImportModal } from './components/BulkImportModal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [activeTab, setActiveTab] = useState<'leads' | 'verifier' | 'dossier'>('leads');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEnriching, setIsEnriching] = useState<boolean>(false);
  const [isScraperOpen, setIsScraperOpen] = useState<boolean>(false);
  const [isVerifierModalOpen, setIsVerifierModalOpen] = useState<boolean>(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [importNotice, setImportNotice] = useState<{ count: number; timestamp: string } | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

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

  // Selected count among currently filtered leads
  const selectedFilteredCount = useMemo(() => {
    return filteredLeads.filter((l) => selectedLeadIds.has(l.id)).length;
  }, [filteredLeads, selectedLeadIds]);

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

  // Bulk Import handler
  const handleBulkImport = (importedLeads: Lead[]) => {
    if (importedLeads.length === 0) return;
    setLeads((prev) => [...importedLeads, ...prev]);
    if (!selectedLead && importedLeads.length > 0) {
      setSelectedLead(importedLeads[0]);
    }
    setImportNotice({
      count: importedLeads.length,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Selection handlers
  const handleToggleSelectLead = (leadId: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(leadId)) {
        next.delete(leadId);
      } else {
        next.add(leadId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredLeads.map((l) => l.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedLeadIds.has(id));

    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedLeadIds(new Set());
  };

  // CSV Export (Selective or All)
  const handleExportCsv = (scope: 'selected' | 'all' = selectedLeadIds.size > 0 ? 'selected' : 'all') => {
    const leadsToExport =
      scope === 'selected' && selectedLeadIds.size > 0
        ? filteredLeads.filter((l) => selectedLeadIds.has(l.id))
        : filteredLeads;

    if (leadsToExport.length === 0) return;

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

    const rows = leadsToExport.map((l) => [
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
    const prefix = scope === 'selected' ? `selected_${leadsToExport.length}` : `export_${leadsToExport.length}`;
    link.setAttribute('download', `saasquatch_leads_${prefix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Export (Selective or All)
  const handleExportJson = (scope: 'selected' | 'all' = selectedLeadIds.size > 0 ? 'selected' : 'all') => {
    const leadsToExport =
      scope === 'selected' && selectedLeadIds.size > 0
        ? filteredLeads.filter((l) => selectedLeadIds.has(l.id))
        : filteredLeads;

    if (leadsToExport.length === 0) return;

    const jsonStr = JSON.stringify(leadsToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const prefix = scope === 'selected' ? `selected_${leadsToExport.length}` : `export_${leadsToExport.length}`;
    link.setAttribute('download', `saasquatch_leads_${prefix}_${new Date().toISOString().split('T')[0]}.json`);
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
        onOpenBulkImport={() => setIsBulkImportOpen(true)}
        leadsCount={leads.length}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Bulk Import Success Notice Banner */}
        {importNotice && (
          <div className="bg-emerald-950/70 border border-emerald-600/60 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-200 shadow-lg animate-checkmark-pop">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <strong className="text-white text-sm block">
                  Bulk Import Successful
                </strong>
                <span>
                  Successfully imported <span className="font-mono font-bold text-white">{importNotice.count}</span> target leads into your pipeline at {importNotice.timestamp}.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkImportOpen(true)}
                className="px-2.5 py-1 text-[11px] font-medium bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700 rounded text-emerald-200 cursor-pointer transition-colors"
              >
                Import More
              </button>
              <button
                onClick={() => setImportNotice(null)}
                className="p-1 text-emerald-400 hover:text-white rounded hover:bg-emerald-900/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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
              selectedCount={selectedFilteredCount}
              onClearSelection={handleClearSelection}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
              onOpenBulkImport={() => setIsBulkImportOpen(true)}
            />

            {/* Leads Table */}
            <LeadTable
              leads={filteredLeads}
              selectedLeadIds={selectedLeadIds}
              onToggleSelectLead={handleToggleSelectLead}
              onToggleSelectAll={handleToggleSelectAll}
              onClearSelection={handleClearSelection}
              onExportSelectionCsv={() => handleExportCsv('selected')}
              onExportSelectionJson={() => handleExportJson('selected')}
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

      {/* Bulk Lead Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        existingLeads={leads}
        onImportLeads={handleBulkImport}
      />
    </div>
  );
}
