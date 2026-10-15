import React, { useState } from 'react';
import { Lead, LeadStage } from '../types';
import {
  X,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Building,
  User,
  ExternalLink,
  Copy,
  Check,
  Send,
  RefreshCw,
  Mail,
  Linkedin,
  Phone,
  ChevronRight,
  TrendingUp,
  Cpu,
  Cloud,
  CheckCircle2,
  Settings,
  Loader2,
  Flame,
} from 'lucide-react';
import { SalesforceMappingSettings, DEFAULT_SALESFORCE_MAPPINGS } from './SalesforceMappingSettings';
import { SalesforceFieldMapping } from '../types';
import { ArrSparkline } from './ArrSparkline';
import { getLeadArrHistory, getYoYGrowth } from '../utils/revenueUtils';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onEnrich: (lead: Lead) => Promise<void>;
  isEnriching: boolean;
  onUpdateStage: (leadId: string, stage: LeadStage) => void;
  onVerifyEmail: (email: string) => Promise<void>;
  onSyncSalesforce: (leadId: string, syncData: { synced: boolean; syncedAt: string; recordId: string }) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  lead,
  onClose,
  onEnrich,
  isEnriching,
  onUpdateStage,
  onVerifyEmail,
  onSyncSalesforce,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSequenceTab, setActiveSequenceTab] = useState<'pe' | 'b2b' | 'linkedin' | 'call'>('pe');
  const [customAngle, setCustomAngle] = useState('');
  const [customPitchResult, setCustomPitchResult] = useState<string | null>(null);
  const [customPitchMeta, setCustomPitchMeta] = useState<{ isFallback?: boolean; source?: string; notice?: string } | null>(null);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [isSyncingSalesforce, setIsSyncingSalesforce] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [showMappingSettings, setShowMappingSettings] = useState(false);
  const [customMappings, setCustomMappings] = useState<SalesforceFieldMapping[]>(DEFAULT_SALESFORCE_MAPPINGS);

  if (!lead) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateCustomPitch = async () => {
    if (!lead || !customAngle.trim()) return;
    setIsGeneratingCustom(true);
    try {
      const res = await fetch('/api/leads/generate-custom-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: lead.companyName,
          decisionMakerName: lead.decisionMaker.name,
          targetRole: lead.decisionMaker.title,
          customAngle,
        }),
      });
      const data = await res.json();
      if (data.pitch) {
        setCustomPitchResult(data.pitch);
        setCustomPitchMeta({
          isFallback: data.isFallback,
          source: data.source,
          notice: data.notice,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const handleSyncSalesforce = async () => {
    if (!lead) return;
    setIsSyncingSalesforce(true);
    try {
      // Simulate realistic network delay (650ms) so user can see the subtle 'Syncing' spinner
      await new Promise((resolve) => setTimeout(resolve, 650));
      const res = await fetch('/api/leads/sync-salesforce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          companyName: lead.companyName,
          domain: lead.domain,
          decisionMaker: lead.decisionMaker,
          fieldMappings: customMappings,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSyncSalesforce(lead.id, {
          synced: true,
          syncedAt: data.syncedAt,
          recordId: data.recordId,
        });
        setJustSynced(true);
        setTimeout(() => setJustSynced(false), 4000);
      }
    } catch (err) {
      console.error('Error syncing to Salesforce:', err);
    } finally {
      setIsSyncingSalesforce(false);
    }
  };

  const enrichment = lead.aiEnrichment;
  const sfSync = lead.salesforceSync;

  const formatSyncTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatSyncDateTime = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-[#0F141F] border-l border-slate-800 h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0F141F]/95 backdrop-blur-md border-b border-slate-800 p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">{lead.companyName}</h2>
              {(lead.isHot || (lead.peSignals?.acquirabilityScore ?? 0) > 85) && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gradient-to-r from-rose-500/25 via-amber-500/20 to-red-500/25 text-rose-300 border border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.35)] shrink-0 animate-pulse"
                  title="🔥 Hot Target: Acquirability score exceeds 85 threshold (auto-flagged by background engine)"
                >
                  <Flame className="w-3 h-3 text-rose-400 fill-rose-500/50 shrink-0" />
                  <span>HOT TARGET</span>
                </span>
              )}
              <a
                href={`https://${lead.domain}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors"
                title="Visit website"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="font-mono text-blue-400">{lead.domain}</span>
              <span aria-hidden="true">·</span>
              <span>{lead.industry}</span>
              <span aria-hidden="true">·</span>
              <span>{lead.location.city}, {lead.location.state}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Salesforce Sync Header Control */}
            {isSyncingSalesforce ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-sky-200 bg-sky-950/80 border border-sky-600/70 rounded transition-colors shadow-xs whitespace-nowrap">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-300" />
                <span>Syncing...</span>
              </div>
            ) : justSynced ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/90 text-emerald-300 font-medium text-xs animate-checkmark-pop animate-green-glow shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-checkmark-pop stroke-[2.5]" />
                <span>Synced!</span>
              </div>
            ) : sfSync?.synced ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-700/80 text-emerald-300 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Synced</span>
                {formatSyncTime(sfSync.syncedAt) && (
                  <span className="font-mono text-emerald-400/80 text-[10px] hidden sm:inline">
                    ({formatSyncTime(sfSync.syncedAt)})
                  </span>
                )}
                <button
                  onClick={handleSyncSalesforce}
                  disabled={isSyncingSalesforce}
                  className="ml-1 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                  title="Re-sync record to Salesforce CRM"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSyncSalesforce}
                disabled={isSyncingSalesforce}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                title="Push lead to Salesforce CRM"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Sync to Salesforce</span>
              </button>
            )}

            <select
              value={lead.stage}
              onChange={(e) => onUpdateStage(lead.id, e.target.value as LeadStage)}
              className="py-1 px-2.5 text-xs bg-[#171F2E] border border-slate-700 rounded text-slate-200 font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="scraped">Scraped</option>
              <option value="qualified">Qualified</option>
              <option value="outreach_ready">Outreach Ready</option>
              <option value="deal_pipeline">Deal Pipeline</option>
              <option value="archived">Archived</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          {/* Top Deal Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#141B29] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Financial Profile</span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    +{getYoYGrowth(lead, getLeadArrHistory(lead))}% YoY
                  </span>
                </div>
                <div className="text-sm font-bold font-mono text-white mt-1 tabular-nums">{lead.estimatedRevenue}</div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5 tabular-nums">EBITDA: {lead.estimatedEbitda}</div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/80">
                <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-between">
                  <span>ARR Trajectory</span>
                  <span className="font-mono text-[9px] text-slate-400">Recharts Sparkline</span>
                </div>
                <ArrSparkline data={getLeadArrHistory(lead)} width={175} height={30} />
              </div>
            </div>

            <div className="bg-[#141B29] border border-slate-800 rounded-lg p-3">
              <div className="text-slate-500 text-[11px]">PE Acquirability Fit</div>
              <div className="text-sm font-bold font-mono text-amber-400 mt-1 tabular-nums">{lead.peSignals.acquirabilityScore}/100</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {lead.peSignals.ownerSuccessionRisk ? 'Owner Succession Trigger' : 'Operational Upside'}
              </div>
            </div>

            <div className="bg-[#141B29] border border-slate-800 rounded-lg p-3">
              <div className="text-slate-500 text-[11px]">Email Deliverability</div>
              <div className="flex items-center gap-1.5 mt-1">
                {lead.deliverability.status === 'verified' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-sm font-bold font-mono text-white tabular-nums">{lead.deliverability.score}%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 capitalize">{lead.deliverability.status} MX</div>
            </div>
          </div>

          {/* Decision Maker Card */}
          <div className="bg-[#141B29] border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                  {lead.decisionMaker.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-slate-100 text-sm">{lead.decisionMaker.name}</div>
                  <div className="text-slate-400">{lead.decisionMaker.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lead.decisionMaker.phone && (
                  <a
                    href={`tel:${lead.decisionMaker.phone}`}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800/80 rounded transition-colors"
                    title={`Call: ${lead.decisionMaker.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={lead.decisionMaker.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-blue-400 bg-slate-800/80 rounded transition-colors"
                  title="View LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <span className="text-slate-500 text-[11px] block">Verified Direct Email</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-slate-200 select-all">{lead.decisionMaker.email}</span>
                  <button
                    onClick={() => handleCopy(lead.decisionMaker.email, 'email')}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Copy Email"
                  >
                    {copiedKey === 'email' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">MX Gateway Host</span>
                <div className="text-slate-300 font-mono mt-0.5 truncate" title={lead.deliverability.mxProvider}>
                  {lead.deliverability.mxProvider}
                </div>
              </div>
            </div>
          </div>

          {/* Salesforce CRM Integration Card */}
          <div className="bg-[#141B29] border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-sky-950/80 border border-sky-800/70 text-sky-400">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-slate-100 flex items-center gap-2">
                    <span>Salesforce CRM Integration</span>
                    {sfSync?.synced ? (
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] flex items-center gap-1 bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 ${
                          justSynced ? 'animate-checkmark-pop animate-green-glow ring-2 ring-emerald-500/50' : ''
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3 h-3 text-emerald-400 ${
                            justSynced ? 'animate-checkmark-pop stroke-[2.5]' : ''
                          }`}
                        />
                        SYNCED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-400">
                        NOT SYNCED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Automatic Account, Contact, and Opportunity object routing</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMappingSettings(!showMappingSettings)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showMappingSettings
                      ? 'bg-sky-950/90 border border-sky-700 text-sky-300'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title="Configure custom field mapping between SaaSQuatch lead attributes and Salesforce schema"
                >
                  <Settings className="w-3.5 h-3.5 text-sky-400" />
                  <span>{showMappingSettings ? 'Hide Schema' : 'Map Fields'}</span>
                </button>

                <button
                  onClick={handleSyncSalesforce}
                  disabled={isSyncingSalesforce}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isSyncingSalesforce
                      ? 'text-sky-200 bg-sky-800/80 border border-sky-600/70 cursor-wait'
                      : justSynced
                      ? 'text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 animate-checkmark-pop animate-green-glow shadow-emerald-900/40 shadow-md'
                      : sfSync?.synced
                      ? 'text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700'
                      : 'text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700'
                  }`}
                  title={sfSync?.synced ? 'Re-sync lead to Salesforce CRM' : 'Push lead to Salesforce CRM'}
                >
                  {isSyncingSalesforce ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-200" />
                      <span className="tracking-wide">Syncing...</span>
                    </>
                  ) : justSynced ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white animate-checkmark-pop stroke-[2.5]" />
                      <span>Synced!</span>
                    </>
                  ) : sfSync?.synced ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Re-sync Record</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3.5 h-3.5" />
                      <span>Sync to Salesforce</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Success Banner on Sync */}
            {justSynced && sfSync?.synced && (
              <div className="bg-emerald-950/80 border border-emerald-500/80 rounded-md p-3 flex items-center justify-between text-emerald-200 shadow-lg shadow-emerald-950/50 animate-checkmark-pop animate-green-glow">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-emerald-300 stroke-[3] animate-checkmark-pop" />
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-100 flex items-center gap-2">
                      <span>Salesforce Sync Successful</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-900/60 rounded border border-emerald-600/60 text-emerald-300">
                        HTTP 200 OK
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-300/90 mt-0.5">
                      Created Salesforce Lead & Account record with ID <strong className="font-mono text-white select-all">{sfSync.recordId}</strong>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-checkmark-pop" />
                  <span>Synced</span>
                </div>
              </div>
            )}

            {sfSync?.synced ? (
              <div className="bg-[#0B0F17] border border-slate-800 rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Salesforce Record ID:</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-sky-400 font-semibold select-all">{sfSync.recordId}</span>
                      <button
                        onClick={() => handleCopy(sfSync.recordId, 'sfRecordId')}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy Salesforce Record ID"
                      >
                        {copiedKey === 'sfRecordId' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Last Synchronized:</span>
                    <span className="text-slate-300 font-mono mt-0.5 block">
                      {formatSyncDateTime(sfSync.syncedAt)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-600/70 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-checkmark-pop" />
                  </div>
                  <span>Mapped to Account (<strong>{lead.companyName}</strong>) & Contact (<strong>{lead.decisionMaker.name}</strong>) with deal stage <strong>{lead.stage}</strong>.</span>
                </div>
              </div>
            ) : (
              <div className="bg-[#0B0F17] border border-slate-800/80 rounded p-3 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Push this qualified company directly to your Salesforce CRM pipeline in one click.</span>
                <span className="text-slate-500 font-mono text-[10px]">Ready to sync</span>
              </div>
            )}

            {/* Embedded Schema & Custom Field Mapping Settings */}
            {showMappingSettings && (
              <div className="pt-2">
                <SalesforceMappingSettings
                  currentLead={lead}
                  onMappingsChange={setCustomMappings}
                />
              </div>
            )}
          </div>

          {/* PE Signals & Acquisition Triggers */}
          <div className="bg-[#141B29] border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Search Fund / PE Deal Sourcing Signals</span>
              </span>
              <span className="text-slate-500 text-[11px]">Caprae Sourcing Model</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
              {lead.peSignals.keyTriggers.map((trig, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300"
                >
                  {trig}
                </span>
              ))}
            </div>
          </div>

          {/* Deep AI Enrichment Section */}
          <div className="bg-[#141B29] border border-slate-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-950/70 border border-blue-800/60 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Caprae Deep AI Deal Teardown</h3>
                  <p className="text-[11px] text-slate-400">
                    {enrichment?.source === 'synthetic-engine'
                      ? 'Powered by Contextual Intelligence Engine (Quota fallback)'
                      : 'Powered by server-side Google Gemini 3.8 Flash'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onEnrich(lead)}
                disabled={isEnriching}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isEnriching ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                    <span>{enrichment ? 'Re-Analyze Target' : 'Run Gemini Enrichment'}</span>
                  </>
                )}
              </button>
            </div>

            {enrichment ? (
              <div className="space-y-4 pt-2">
                {/* Summary & Monetization */}
                <div className="space-y-1.5">
                  <span className="text-slate-400 font-medium">Target Summary & Business Model</span>
                  <p className="text-slate-200 leading-relaxed bg-[#0B0F17] p-3 rounded border border-slate-800">
                    {enrichment.summary}
                  </p>
                  <p className="text-slate-400 text-[11px] italic">
                    Monetization: {enrichment.businessModel}
                  </p>
                </div>

                {/* M&A Thesis */}
                <div className="space-y-1.5">
                  <span className="text-amber-400 font-medium">Caprae 7-Year Acquisition & MaaS Thesis</span>
                  <div className="text-slate-200 leading-relaxed bg-amber-950/20 border border-amber-900/30 p-3 rounded">
                    {enrichment.maThesis}
                  </div>
                </div>

                {/* Operational Upside */}
                <div className="space-y-1.5">
                  <span className="text-emerald-400 font-medium">Post-Acquisition Practical AI Roadmap</span>
                  <ul className="space-y-1.5">
                    {enrichment.operationalUpside.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-emerald-400 font-mono">0{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                {enrichment.techStack && enrichment.techStack.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">Detected Technographics</span>
                    <div className="flex flex-wrap gap-1.5">
                      {enrichment.techStack.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-slate-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outreach Sequences */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">Multi-Channel Outreach Sequences</span>
                    <span className="text-[11px] text-slate-500">1-click personalized pitches</span>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 p-1 bg-[#0B0F17] rounded-md border border-slate-800">
                    <button
                      onClick={() => setActiveSequenceTab('pe')}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        activeSequenceTab === 'pe'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      PE Succession Pitch
                    </button>
                    <button
                      onClick={() => setActiveSequenceTab('b2b')}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        activeSequenceTab === 'b2b'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      B2B Sales Angle
                    </button>
                    <button
                      onClick={() => setActiveSequenceTab('linkedin')}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        activeSequenceTab === 'linkedin'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      LinkedIn InMail
                    </button>
                    <button
                      onClick={() => setActiveSequenceTab('call')}
                      className={`flex-1 py-1 px-2 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        activeSequenceTab === 'call'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      30s Cold Call
                    </button>
                  </div>

                  {/* Sequence content box */}
                  <div className="relative bg-[#0B0F17] border border-slate-800 rounded-md p-3.5">
                    <p className="text-slate-200 leading-relaxed font-sans text-xs whitespace-pre-wrap pr-6">
                      {activeSequenceTab === 'pe' && enrichment.outreachSequences.peSearchFundPitch}
                      {activeSequenceTab === 'b2b' && enrichment.outreachSequences.b2bSalesPitch}
                      {activeSequenceTab === 'linkedin' && enrichment.outreachSequences.linkedInInMail}
                      {activeSequenceTab === 'call' && enrichment.outreachSequences.coldCallScript}
                    </p>

                    <button
                      onClick={() => {
                        let text = '';
                        if (activeSequenceTab === 'pe') text = enrichment.outreachSequences.peSearchFundPitch;
                        if (activeSequenceTab === 'b2b') text = enrichment.outreachSequences.b2bSalesPitch;
                        if (activeSequenceTab === 'linkedin') text = enrichment.outreachSequences.linkedInInMail;
                        if (activeSequenceTab === 'call') text = enrichment.outreachSequences.coldCallScript;
                        handleCopy(text, 'sequence');
                      }}
                      className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Copy pitch to clipboard"
                    >
                      {copiedKey === 'sequence' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Custom Angle Generator */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="font-semibold text-slate-300 block">Custom Angle Generator</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Inquire about selling off-market without broker commission..."
                      value={customAngle}
                      onChange={(e) => setCustomAngle(e.target.value)}
                      className="flex-1 py-1.5 px-3 bg-[#0B0F17] border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleGenerateCustomPitch}
                      disabled={isGeneratingCustom || !customAngle.trim()}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {isGeneratingCustom ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      <span>Generate</span>
                    </button>
                  </div>

                  {customPitchResult && (
                    <div className="relative bg-[#0B0F17] border border-blue-900/40 rounded-lg p-3.5 mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        {customPitchMeta?.isFallback ? (
                          <div
                            className="flex items-center gap-1.5 text-[10px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded"
                            title="Gemini API prepayment quota reached; generated via tailored contextual intelligence engine."
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Contextual AI Engine (Quota Fallback)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                            <Sparkles className="w-3 h-3 text-blue-400" />
                            <span>Gemini 3.8 Flash</span>
                          </div>
                        )}

                        <button
                          onClick={() => handleCopy(customPitchResult, 'customPitch')}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          title="Copy personalized pitch to clipboard"
                        >
                          {copiedKey === 'customPitch' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Pitch</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-slate-200 text-xs whitespace-pre-wrap leading-relaxed font-sans pt-1">
                        {customPitchResult}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center bg-[#0B0F17] border border-dashed border-slate-800 rounded-lg p-6">
                <Sparkles className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="font-medium text-slate-200">No Deep Enrichment Generated Yet</div>
                <p className="text-slate-500 text-[11px] mt-1 max-w-sm mx-auto">
                  Click the button above to run Gemini 3.8 Flash on {lead.companyName} to generate the M&A deal thesis, operational AI roadmap, and multi-channel outreach pitches.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
