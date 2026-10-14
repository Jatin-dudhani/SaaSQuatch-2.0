import React, { useState } from 'react';
import { DeliverabilityInfo, Lead } from '../types';
import {
  X,
  MailCheck,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
} from 'lucide-react';

interface EmailVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
}

export const EmailVerifierModal: React.FC<EmailVerifierModalProps> = ({
  isOpen,
  onClose,
  leads,
}) => {
  const [emailInput, setEmailInput] = useState('r.vance@apexdispatch.io');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (emailToTest?: string) => {
    const target = emailToTest || emailInput;
    if (!target.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/leads/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#0B0F17] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-[#111622] px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <MailCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                SaaSQuatch Real-Time Deliverability & MX Verification Lab
              </h2>
              <p className="text-[11px] text-slate-400">
                Prevent hard bounces, verify SMTP handshakes, and detect catch-all mailboxes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-slate-300 font-medium block">
              Enter Direct Contact Email or Select a Target
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="e.g. founder@domain.com"
                className="flex-1 py-2 px-3 bg-[#141B29] border border-slate-700 rounded-md text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading || !emailInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Run Verification</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Pick Samples from dataset */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="text-slate-500">Quick Test:</span>
              {leads.slice(0, 4).map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setEmailInput(l.decisionMaker.email);
                    handleVerify(l.decisionMaker.email);
                  }}
                  className="font-mono text-slate-400 hover:text-emerald-400 underline decoration-slate-700 cursor-pointer"
                >
                  {l.decisionMaker.email}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Results Card */}
          {result && (
            <div className="bg-[#141B29] border border-slate-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  {result.status === 'verified' && (
                    <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                  {result.status === 'risky' && (
                    <div className="w-10 h-10 rounded-full bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  )}
                  {result.status === 'invalid' && (
                    <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
                      <ShieldX className="w-5 h-5" />
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-bold text-white font-mono">{result.email}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Status:{' '}
                      <strong
                        className={`capitalize font-semibold ${
                          result.status === 'verified'
                            ? 'text-emerald-400'
                            : result.status === 'risky'
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {result.status}
                      </strong>{' '}
                      · Confidence Score:{' '}
                      <span className="font-mono text-white font-bold">{result.score}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Sender Safety
                  </div>
                  <div
                    className={`font-semibold font-mono text-xs ${
                      result.score >= 90
                        ? 'text-emerald-400'
                        : result.score >= 60
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    {result.score >= 90
                      ? 'Safe for Cold Outreach'
                      : result.score >= 60
                      ? 'Moderate Bounce Risk'
                      : 'High Bounce Risk'}
                  </div>
                </div>
              </div>

              {/* Technical Breakdown Matrix */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">RFC 5322 Syntax Valid:</span>
                  <span className={result.syntaxValid ? 'text-emerald-400 font-mono font-semibold' : 'text-red-400 font-mono'}>
                    {result.syntaxValid ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">SMTP Handshake:</span>
                  <span className={result.smtpCheckValid ? 'text-emerald-400 font-mono font-semibold' : 'text-red-400 font-mono'}>
                    {result.smtpCheckValid ? '250 OK' : 'REFUSED'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Catch-All Server:</span>
                  <span className={result.isCatchAll ? 'text-amber-400 font-mono font-semibold' : 'text-emerald-400 font-mono'}>
                    {result.isCatchAll ? 'DETECTED' : 'NO (Direct)'}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-[#0B0F17] border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Disposable Domain:</span>
                  <span className={result.isDisposable ? 'text-red-400 font-mono font-semibold' : 'text-emerald-400 font-mono'}>
                    {result.isDisposable ? 'YES (Burner)' : 'CLEAN'}
                  </span>
                </div>
              </div>

              {/* MX Provider Notes */}
              <div className="text-[11px] bg-[#0B0F17] p-3 rounded border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">
                  MX Route: <span className="text-slate-200 font-mono">{result.mxProvider}</span>
                </div>
                <div className="text-slate-400">{result.notes}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
