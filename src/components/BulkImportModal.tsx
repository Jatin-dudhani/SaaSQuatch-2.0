import React, { useState, useRef, useMemo } from 'react';
import { Lead } from '../types';
import {
  X,
  Upload,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Copy,
  Check,
  FileText,
  Trash2,
  Layers,
  ArrowRight,
  Info,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  validateLeadJsonPayload,
  getSampleLeadsTemplate,
  ValidationSummary,
  ValidationItemResult,
} from '../utils/leadValidator';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLeads: Lead[];
  onImportLeads: (leadsToImport: Lead[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  existingLeads,
  onImportLeads,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [jsonText, setJsonText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [autoRepair, setAutoRepair] = useState<boolean>(false);
  const [skipDuplicates, setSkipDuplicates] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'invalid' | 'duplicates'>('all');
  const [isCopiedTemplate, setIsCopiedTemplate] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse JSON and compute validation summary
  const validationSummary: ValidationSummary | null = useMemo(() => {
    if (!jsonText.trim()) return null;

    try {
      const parsed = JSON.parse(jsonText);
      setJsonParseError(null);
      return validateLeadJsonPayload(parsed, existingLeads, autoRepair);
    } catch (err: any) {
      setJsonParseError(err?.message || 'Invalid JSON syntax. Please check formatting.');
      return null;
    }
  }, [jsonText, existingLeads, autoRepair]);

  if (!isOpen) return null;

  // Process file upload
  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.name.endsWith('.json') && file.type !== 'application/json' && !file.type.includes('text')) {
      setJsonParseError('Please upload a valid .json file.');
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonText(content);
      setJsonParseError(null);
    };
    reader.onerror = () => {
      setJsonParseError('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Download sample template
  const handleDownloadSample = () => {
    const sample = getSampleLeadsTemplate();
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saasquatch_sample_leads.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Load sample into textarea
  const handleLoadSample = () => {
    const sample = getSampleLeadsTemplate();
    setJsonText(JSON.stringify(sample, null, 2));
    setFileName('sample_leads.json');
    setFileSize('2.4 KB');
    setJsonParseError(null);
  };

  // Copy sample to clipboard
  const handleCopySample = () => {
    const sample = getSampleLeadsTemplate();
    navigator.clipboard.writeText(JSON.stringify(sample, null, 2));
    setIsCopiedTemplate(true);
    setTimeout(() => setIsCopiedTemplate(false), 2000);
  };

  // Filtered validation items for list display
  const displayedItems = useMemo(() => {
    if (!validationSummary) return [];
    if (filterTab === 'valid') return validationSummary.items.filter((i) => i.isValid && (!skipDuplicates || !i.isDuplicate));
    if (filterTab === 'invalid') return validationSummary.items.filter((i) => !i.isValid);
    if (filterTab === 'duplicates') return validationSummary.items.filter((i) => i.isDuplicate);
    return validationSummary.items;
  }, [validationSummary, filterTab, skipDuplicates]);

  // Leads ready to commit
  const leadsReadyToImport = useMemo(() => {
    if (!validationSummary) return [];
    return validationSummary.items
      .filter((item) => item.isValid && item.sanitizedLead && (!skipDuplicates || !item.isDuplicate))
      .map((item) => item.sanitizedLead as Lead);
  }, [validationSummary, skipDuplicates]);

  const handleCommitImport = () => {
    if (leadsReadyToImport.length === 0) return;
    onImportLeads(leadsReadyToImport);
    onClose();
  };

  const handleClear = () => {
    setJsonText('');
    setFileName('');
    setFileSize('');
    setJsonParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-4xl bg-[#0B0F17] border border-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#111622] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Bulk Lead Import & Schema Validator
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
                  JSON Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload or paste a JSON array of leads. Validates decision makers, deliverability, PE signals, and schema integrity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Download schema-compliant sample JSON template"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Sample Template</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Mode Selector & Action Bar */}
        <div className="bg-[#141B29] px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-md">
              <button
                onClick={() => setInputMode('upload')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'upload'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
              </button>
              <button
                onClick={() => setInputMode('paste')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  inputMode === 'paste'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Paste JSON</span>
              </button>
            </div>

            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1 rounded border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Load 2 Sample Leads</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-300">Skip Duplicates</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none" title="Auto-fill default PE signals and deliverability for simplified files">
              <input
                type="checkbox"
                checked={autoRepair}
                onChange={(e) => setAutoRepair(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-300">Auto-Repair Defaults</span>
            </label>

            {jsonText && (
              <button
                onClick={handleClear}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* File Upload Zone */}
          {inputMode === 'upload' && !jsonText && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-950/20'
                  : 'border-slate-700/80 hover:border-blue-500/60 bg-[#0F1420]/60 hover:bg-[#131A29]/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                Drop your leads JSON file here, or <span className="text-blue-400 underline underline-offset-2">browse files</span>
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Accepts array of Lead objects or wrapped payload <code className="font-mono text-slate-300">{`{ "leads": [...] }`}</code>.
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSample();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download Sample Schema (.json)</span>
                </button>
              </div>
            </div>
          )}

          {/* Active File Info bar */}
          {fileName && (
            <div className="bg-[#111726] border border-blue-900/40 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-950 border border-blue-800/80 flex items-center justify-center text-blue-400">
                  <FileJson className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>{fileName}</span>
                    <span className="font-mono text-[10px] text-slate-400">({fileSize})</span>
                  </div>
                  <div className="text-[11px] text-slate-400">File loaded and parsed into validation memory</div>
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                Change File
              </button>
            </div>
          )}

          {/* Paste JSON Mode */}
          {inputMode === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="font-medium text-slate-300">Paste JSON Content</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopySample}
                    className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isCopiedTemplate ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedTemplate ? 'Copied Sample' : 'Copy Sample Template'}</span>
                  </button>
                  <span>{jsonText.split('\n').length} lines</span>
                </div>
              </div>
              <textarea
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setFileName('pasted_leads.json');
                  setFileSize(`${(e.target.value.length / 1024).toFixed(1)} KB`);
                }}
                placeholder={`[\n  {\n    "companyName": "ApexDispatch Systems",\n    "domain": "apexdispatch.io",\n    "industry": "Logistics Software",\n    "employeeCount": 28,\n    "foundedYear": 2014,\n    "estimatedRevenue": "$4.8M ARR",\n    "estimatedEbitda": "$1.5M (31%)",\n    "decisionMaker": {\n      "name": "Richard Vance",\n      "title": "CEO",\n      "email": "r.vance@apexdispatch.io",\n      "linkedinUrl": "https://linkedin.com/in/richard-vance"\n    },\n    ...\n  }\n]`}
                rows={9}
                className="w-full p-3 font-mono text-xs bg-[#070B11] border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
              />
            </div>
          )}

          {/* JSON Syntax Error alert */}
          {jsonParseError && (
            <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-rose-200">JSON Syntax Error</strong>
                <span className="font-mono text-[11px] break-all">{jsonParseError}</span>
              </div>
            </div>
          )}

          {/* Validation Metrics KPI Grid */}
          {validationSummary && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => setFilterTab('all')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    filterTab === 'all'
                      ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/40'
                      : 'bg-[#111726] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-medium text-slate-400">Total Parsed</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {validationSummary.total}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Records in file</div>
                </div>

                <div
                  onClick={() => setFilterTab('valid')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    filterTab === 'valid'
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'bg-[#111726] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-medium text-emerald-400 flex items-center justify-between">
                    <span>Valid Schema</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-300 mt-1">
                    {validationSummary.validCount}
                  </div>
                  <div className="text-[10px] text-emerald-500/80 mt-0.5">Ready for pipeline</div>
                </div>

                <div
                  onClick={() => setFilterTab('invalid')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    filterTab === 'invalid'
                      ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/40'
                      : 'bg-[#111726] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-medium text-rose-400 flex items-center justify-between">
                    <span>Schema Errors</span>
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-rose-300 mt-1">
                    {validationSummary.invalidCount}
                  </div>
                  <div className="text-[10px] text-rose-500/80 mt-0.5">Needs correction</div>
                </div>

                <div
                  onClick={() => setFilterTab('duplicates')}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    filterTab === 'duplicates'
                      ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/40'
                      : 'bg-[#111726] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-medium text-amber-400 flex items-center justify-between">
                    <span>Duplicates</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                    {validationSummary.duplicateCount}
                  </div>
                  <div className="text-[10px] text-amber-500/80 mt-0.5">
                    {skipDuplicates ? 'Will be skipped' : 'Will be imported'}
                  </div>
                </div>
              </div>

              {/* Records Preview Table / List */}
              <div className="bg-[#111622] border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 bg-[#141B29] border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-200">Validation Breakdown</span>
                    <span className="text-slate-400">({displayedItems.length} records)</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      onClick={() => setFilterTab('all')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        filterTab === 'all' ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterTab('valid')}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        filterTab === 'valid' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Valid ({validationSummary.validCount})
                    </button>
                    {validationSummary.invalidCount > 0 && (
                      <button
                        onClick={() => setFilterTab('invalid')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          filterTab === 'invalid' ? 'bg-rose-950 text-rose-300 border border-rose-800 font-medium' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Errors ({validationSummary.invalidCount})
                      </button>
                    )}
                    {validationSummary.duplicateCount > 0 && (
                      <button
                        onClick={() => setFilterTab('duplicates')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${
                          filterTab === 'duplicates' ? 'bg-amber-950 text-amber-300 border border-amber-800 font-medium' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Duplicates ({validationSummary.duplicateCount})
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto">
                  {displayedItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No records match the current filter tab.
                    </div>
                  ) : (
                    displayedItems.map((item) => (
                      <div
                        key={item.index}
                        className={`p-3.5 text-xs transition-colors ${
                          !item.isValid
                            ? 'bg-rose-950/10 hover:bg-rose-950/20'
                            : item.isDuplicate
                            ? 'bg-amber-950/10 hover:bg-amber-950/20'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-500 text-[10px]">
                                #{item.index + 1}
                              </span>
                              <span className="font-semibold text-white">
                                {item.companyName}
                              </span>
                              {item.domain && (
                                <span className="font-mono text-[11px] text-blue-400">
                                  {item.domain}
                                </span>
                              )}
                              {item.sanitizedLead && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                                  {item.sanitizedLead.industry}
                                </span>
                              )}
                            </div>

                            {/* Details row if valid */}
                            {item.sanitizedLead && (
                              <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>
                                  DM: <strong className="text-slate-200">{item.sanitizedLead.decisionMaker.name}</strong> ({item.sanitizedLead.decisionMaker.title})
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="font-mono text-slate-300">{item.sanitizedLead.decisionMaker.email}</span>
                                <span className="text-slate-600">•</span>
                                <span className="font-mono text-emerald-400">
                                  PE Score: {item.sanitizedLead.peSignals.acquirabilityScore}/100
                                </span>
                                <span className="text-slate-600">•</span>
                                <span className="font-mono text-slate-300">
                                  {item.sanitizedLead.estimatedRevenue}
                                </span>
                              </div>
                            )}

                            {/* Duplicate Warning */}
                            {item.isDuplicate && (
                              <div className="text-[11px] text-amber-400 flex items-center gap-1.5 mt-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{item.duplicateReason}</span>
                                {skipDuplicates && (
                                  <span className="text-slate-400 font-mono text-[10px]">
                                    (Skipped by rule)
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Validation Errors list */}
                            {item.errors.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {item.errors.map((err, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start gap-1.5 text-[11px] text-rose-400 font-mono bg-rose-950/30 px-2 py-1 rounded border border-rose-900/40"
                                  >
                                    <XCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                                    <span>
                                      <strong className="text-rose-300">{err.field}:</strong> {err.message}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Auto-repair warnings */}
                            {item.warnings.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.warnings.map((warn, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-1.5 text-[10px] text-amber-300 font-mono"
                                  >
                                    <Info className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                    <span>{warn.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0">
                            {item.isValid ? (
                              item.isDuplicate && skipDuplicates ? (
                                <span className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-amber-950/70 border border-amber-800 text-amber-300 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  DUPLICATE (SKIP)
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-emerald-950/80 border border-emerald-800 text-emerald-300 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  VALID LEAD
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-1 rounded text-[10px] font-mono font-medium bg-rose-950/80 border border-rose-800 text-rose-300 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                {item.errors.length} ERROR{item.errors.length > 1 ? 'S' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#111622] px-5 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {validationSummary ? (
              <span>
                Ready to import:{' '}
                <strong className="text-emerald-400 font-mono text-sm">
                  {leadsReadyToImport.length}
                </strong>{' '}
                lead{leadsReadyToImport.length !== 1 ? 's' : ''}
                {validationSummary.duplicateCount > 0 && skipDuplicates && (
                  <span className="text-amber-400 ml-1">
                    ({validationSummary.duplicateCount} duplicate{validationSummary.duplicateCount !== 1 ? 's' : ''} skipped)
                  </span>
                )}
              </span>
            ) : (
              <span>Upload or paste a JSON leads array to validate.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCommitImport}
              disabled={leadsReadyToImport.length === 0}
              className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                leadsReadyToImport.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import {leadsReadyToImport.length} Leads to Pipeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
