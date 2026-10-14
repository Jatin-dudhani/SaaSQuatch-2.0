import React, { useState, useEffect } from 'react';
import { Lead, SalesforceFieldMapping, SalesforceFieldType, SalesforceSyncRule } from '../types';
import {
  Settings,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Code,
  Save,
  HelpCircle,
  Database,
  Cloud,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const DEFAULT_SALESFORCE_MAPPINGS: SalesforceFieldMapping[] = [
  {
    id: 'map-1',
    sourceField: 'companyName',
    sourceLabel: 'Company Name',
    targetObject: 'Account',
    targetField: 'Name',
    fieldType: 'string',
    syncRule: 'always_overwrite',
    isRequired: true,
  },
  {
    id: 'map-2',
    sourceField: 'domain',
    sourceLabel: 'Company Website',
    targetObject: 'Account',
    targetField: 'Website',
    fieldType: 'url',
    syncRule: 'always_overwrite',
  },
  {
    id: 'map-3',
    sourceField: 'estimatedRevenue',
    sourceLabel: 'Estimated ARR',
    targetObject: 'Account',
    targetField: 'AnnualRevenue',
    fieldType: 'currency',
    syncRule: 'always_overwrite',
  },
  {
    id: 'map-4',
    sourceField: 'estimatedEbitda',
    sourceLabel: 'EBITDA Margin',
    targetObject: 'Account',
    targetField: 'EBITDA_Margin__c',
    fieldType: 'percent',
    syncRule: 'always_overwrite',
  },
  {
    id: 'map-5',
    sourceField: 'decisionMaker.name',
    sourceLabel: 'Contact Name',
    targetObject: 'Contact',
    targetField: 'LastName',
    fieldType: 'string',
    syncRule: 'always_overwrite',
    isRequired: true,
  },
  {
    id: 'map-6',
    sourceField: 'decisionMaker.title',
    sourceLabel: 'Contact Title',
    targetObject: 'Contact',
    targetField: 'Title',
    fieldType: 'string',
    syncRule: 'always_overwrite',
  },
  {
    id: 'map-7',
    sourceField: 'decisionMaker.email',
    sourceLabel: 'Contact Email',
    targetObject: 'Contact',
    targetField: 'Email',
    fieldType: 'string',
    syncRule: 'always_overwrite',
    isRequired: true,
  },
  {
    id: 'map-8',
    sourceField: 'decisionMaker.phone',
    sourceLabel: 'Contact Phone',
    targetObject: 'Contact',
    targetField: 'Phone',
    fieldType: 'string',
    syncRule: 'fill_if_empty',
  },
  {
    id: 'map-9',
    sourceField: 'peSignals.acquirabilityScore',
    sourceLabel: 'PE Acquirability Score',
    targetObject: 'Opportunity',
    targetField: 'Acquirability_Score__c',
    fieldType: 'percent',
    syncRule: 'always_overwrite',
  },
  {
    id: 'map-10',
    sourceField: 'peSignals.ownerSuccessionRisk',
    sourceLabel: 'Owner Succession Trigger',
    targetObject: 'Opportunity',
    targetField: 'Succession_Trigger__c',
    fieldType: 'boolean',
    syncRule: 'always_overwrite',
  },
  {
    id: 'map-11',
    sourceField: 'deliverability.score',
    sourceLabel: 'Email Deliverability Score',
    targetObject: 'Contact',
    targetField: 'Deliverability_Score__c',
    fieldType: 'percent',
    syncRule: 'always_overwrite',
  },
  {
    id: 'map-12',
    sourceField: 'aiEnrichment.maThesis',
    sourceLabel: 'M&A Deal Thesis (AI)',
    targetObject: 'Opportunity',
    targetField: 'Acquisition_Thesis__c',
    fieldType: 'string',
    syncRule: 'fill_if_empty',
  },
];

const AVAILABLE_SOURCE_FIELDS = [
  { field: 'companyName', label: 'Company Name' },
  { field: 'domain', label: 'Website Domain' },
  { field: 'industry', label: 'Industry Vertical' },
  { field: 'subIndustry', label: 'Sub-Industry' },
  { field: 'employeeCount', label: 'Employee Count' },
  { field: 'foundedYear', label: 'Year Founded' },
  { field: 'estimatedRevenue', label: 'Estimated Revenue (ARR)' },
  { field: 'estimatedEbitda', label: 'Estimated EBITDA' },
  { field: 'location.city', label: 'Location: City' },
  { field: 'location.state', label: 'Location: State' },
  { field: 'decisionMaker.name', label: 'Decision Maker Name' },
  { field: 'decisionMaker.title', label: 'Decision Maker Title' },
  { field: 'decisionMaker.email', label: 'Decision Maker Email' },
  { field: 'decisionMaker.phone', label: 'Decision Maker Phone' },
  { field: 'decisionMaker.linkedinUrl', label: 'LinkedIn Profile URL' },
  { field: 'deliverability.score', label: 'Deliverability Confidence %' },
  { field: 'deliverability.mxProvider', label: 'Mail Server Gateway / MX' },
  { field: 'peSignals.acquirabilityScore', label: 'PE Acquirability Score (0-100)' },
  { field: 'peSignals.ownerSuccessionRisk', label: 'Owner Succession Flag' },
  { field: 'peSignals.bootstrapped', label: 'Bootstrapped Flag' },
  { field: 'stage', label: 'SaaSQuatch Deal Stage' },
  { field: 'aiEnrichment.summary', label: 'AI Business Summary' },
  { field: 'aiEnrichment.maThesis', label: 'AI M&A Thesis' },
  { field: 'aiEnrichment.businessModel', label: 'AI Business Model' },
];

interface SalesforceMappingSettingsProps {
  currentLead: Lead;
  onMappingsChange?: (mappings: SalesforceFieldMapping[]) => void;
}

export const SalesforceMappingSettings: React.FC<SalesforceMappingSettingsProps> = ({
  currentLead,
  onMappingsChange,
}) => {
  const [mappings, setMappings] = useState<SalesforceFieldMapping[]>(() => {
    try {
      const saved = localStorage.getItem('saasquatch_salesforce_mappings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load mappings from localStorage', e);
    }
    return DEFAULT_SALESFORCE_MAPPINGS;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);

  // New field form state
  const [newSourceField, setNewSourceField] = useState('industry');
  const [newTargetObject, setNewTargetObject] = useState<'Account' | 'Contact' | 'Lead' | 'Opportunity'>('Account');
  const [newTargetField, setNewTargetField] = useState('Industry');
  const [newFieldType, setNewFieldType] = useState<SalesforceFieldType>('string');
  const [newSyncRule, setNewSyncRule] = useState<SalesforceSyncRule>('always_overwrite');

  useEffect(() => {
    if (onMappingsChange) {
      onMappingsChange(mappings);
    }
  }, [mappings, onMappingsChange]);

  const handleUpdateMapping = (id: string, updates: Partial<SalesforceFieldMapping>) => {
    setMappings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleDeleteMapping = (id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMapping = () => {
    if (!newTargetField.trim()) return;

    const sourceDef = AVAILABLE_SOURCE_FIELDS.find((f) => f.field === newSourceField);
    const newMapping: SalesforceFieldMapping = {
      id: `map-custom-${Date.now()}`,
      sourceField: newSourceField,
      sourceLabel: sourceDef?.label || newSourceField,
      targetObject: newTargetObject,
      targetField: newTargetField.trim(),
      fieldType: newFieldType,
      syncRule: newSyncRule,
    };

    setMappings((prev) => [...prev, newMapping]);
    setNewTargetField('');
  };

  const handleSaveMappings = () => {
    try {
      localStorage.setItem('saasquatch_salesforce_mappings', JSON.stringify(mappings));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDefaults = () => {
    setMappings(DEFAULT_SALESFORCE_MAPPINGS);
    try {
      localStorage.setItem('saasquatch_salesforce_mappings', JSON.stringify(DEFAULT_SALESFORCE_MAPPINGS));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to extract nested values for preview
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
  };

  // Build simulated payload for the currently selected lead
  const previewPayload = React.useMemo(() => {
    const payload: Record<string, Record<string, any>> = {
      Account: {},
      Contact: {},
      Opportunity: {},
      Lead: {},
    };

    mappings.forEach((m) => {
      const val = getNestedValue(currentLead, m.sourceField);
      if (val !== undefined) {
        payload[m.targetObject][m.targetField] = val;
      }
    });

    // Remove empty objects
    const cleaned: Record<string, any> = {};
    Object.entries(payload).forEach(([k, v]) => {
      if (Object.keys(v).length > 0) cleaned[k] = v;
    });

    return cleaned;
  }, [mappings, currentLead]);

  return (
    <div className="bg-[#111622] border border-slate-800 rounded-lg p-4 space-y-4 text-xs">
      {/* Title & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Salesforce Custom Field Mapping & Schema Settings
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Map SaaSQuatch lead attributes to standard or custom (`__c`) Salesforce CRM fields to preserve schema integrity.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="px-2.5 py-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset mappings to standard Salesforce defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveMappings}
            className="px-3 py-1.5 font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Schema</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mappings Table */}
      <div className="border border-slate-800/80 rounded-md overflow-hidden bg-[#0B0F17]">
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="sticky top-0 bg-[#141B29] border-b border-slate-800 text-slate-400 font-medium select-none z-10">
              <tr>
                <th className="py-2.5 px-3">Lead Source Field</th>
                <th className="py-2.5 px-3">Salesforce Object</th>
                <th className="py-2.5 px-3">Target API Field</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Sync Rule</th>
                <th className="py-2.5 px-2 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {mappings.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Source Field */}
                  <td className="py-2 px-3 font-sans">
                    <span className="text-slate-200 font-medium">{m.sourceLabel}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">{m.sourceField}</span>
                  </td>

                  {/* Target Object */}
                  <td className="py-2 px-3">
                    <select
                      value={m.targetObject}
                      onChange={(e) =>
                        handleUpdateMapping(m.id, {
                          targetObject: e.target.value as any,
                        })
                      }
                      className="py-1 px-1.5 bg-[#141B29] border border-slate-700/80 rounded text-slate-300 text-[11px] focus:outline-none focus:border-sky-500"
                    >
                      <option value="Account">Account</option>
                      <option value="Contact">Contact</option>
                      <option value="Opportunity">Opportunity</option>
                      <option value="Lead">Lead</option>
                    </select>
                  </td>

                  {/* Target Field */}
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={m.targetField}
                      onChange={(e) => handleUpdateMapping(m.id, { targetField: e.target.value })}
                      placeholder="e.g. FieldName__c"
                      className="w-full py-1 px-2 bg-[#141B29] border border-slate-700/80 rounded text-sky-400 text-[11px] font-mono focus:outline-none focus:border-sky-500"
                    />
                  </td>

                  {/* Field Type */}
                  <td className="py-2 px-3">
                    <select
                      value={m.fieldType}
                      onChange={(e) =>
                        handleUpdateMapping(m.id, {
                          fieldType: e.target.value as SalesforceFieldType,
                        })
                      }
                      className="py-1 px-1.5 bg-[#141B29] border border-slate-700/80 rounded text-slate-300 text-[10px] focus:outline-none focus:border-sky-500"
                    >
                      <option value="string">String</option>
                      <option value="currency">Currency</option>
                      <option value="percent">Percent</option>
                      <option value="boolean">Boolean</option>
                      <option value="url">URL</option>
                      <option value="picklist">Picklist</option>
                    </select>
                  </td>

                  {/* Sync Rule */}
                  <td className="py-2 px-3">
                    <select
                      value={m.syncRule}
                      onChange={(e) =>
                        handleUpdateMapping(m.id, {
                          syncRule: e.target.value as SalesforceSyncRule,
                        })
                      }
                      className="py-1 px-1.5 bg-[#141B29] border border-slate-700/80 rounded text-slate-300 text-[10px] font-sans focus:outline-none focus:border-sky-500"
                    >
                      <option value="always_overwrite">Always Overwrite</option>
                      <option value="fill_if_empty">Fill If Empty</option>
                    </select>
                  </td>

                  {/* Delete */}
                  <td className="py-2 px-2 text-center">
                    {!m.isRequired ? (
                      <button
                        onClick={() => handleDeleteMapping(m.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Remove mapping"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-600 font-sans" title="Required mapping">
                        Req
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Field Form */}
      <div className="bg-[#0B0F17] border border-slate-800 rounded p-3 space-y-2">
        <span className="font-semibold text-slate-200 block text-[11px]">Add Custom Field Translation</span>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {/* Pick Source */}
          <div className="sm:col-span-2">
            <select
              value={newSourceField}
              onChange={(e) => {
                setNewSourceField(e.target.value);
                const s = AVAILABLE_SOURCE_FIELDS.find((x) => x.field === e.target.value);
                if (s) {
                  setNewTargetField(s.label.replace(/[^a-zA-Z0-9]/g, '_') + '__c');
                }
              }}
              className="w-full py-1.5 px-2 bg-[#141B29] border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              {AVAILABLE_SOURCE_FIELDS.map((f) => (
                <option key={f.field} value={f.field}>
                  {f.label} ({f.field})
                </option>
              ))}
            </select>
          </div>

          {/* Pick Object */}
          <div>
            <select
              value={newTargetObject}
              onChange={(e) => setNewTargetObject(e.target.value as any)}
              className="w-full py-1.5 px-2 bg-[#141B29] border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="Account">Account</option>
              <option value="Contact">Contact</option>
              <option value="Opportunity">Opportunity</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          {/* Target Field Input */}
          <div>
            <input
              type="text"
              value={newTargetField}
              onChange={(e) => setNewTargetField(e.target.value)}
              placeholder="e.g. Industry_Code__c"
              className="w-full py-1.5 px-2 bg-[#141B29] border border-slate-700 rounded text-sky-400 font-mono text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Add Button */}
          <div>
            <button
              onClick={handleAddMapping}
              disabled={!newTargetField.trim()}
              className="w-full py-1.5 px-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Mapping</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payload Preview Toggle */}
      <div className="pt-1">
        <button
          onClick={() => setShowPayloadPreview(!showPayloadPreview)}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
        >
          <Code className="w-3.5 h-3.5 text-sky-400" />
          <span>{showPayloadPreview ? 'Hide' : 'Inspect'} Simulated Salesforce REST Payload</span>
          {showPayloadPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showPayloadPreview && (
          <div className="mt-2 p-3 rounded bg-[#080B11] border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-48">
            <pre>{JSON.stringify(previewPayload, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
