import React, { useState, useEffect } from 'react';
import { CAPRAE_DOSSIER, CapraeDossierQuestion } from '../data/capraeDossier';
import {
  FileText,
  Video,
  Building,
  Server,
  Clock,
  Flame,
  Copy,
  Check,
  Download,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const CapraeDossierView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('video_script');
  const [copied, setCopied] = useState(false);

  // Video script teleprompter timer
  const [timerSeconds, setTimerSeconds] = useState(120);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyAll = () => {
    let md = `# Caprae Capital Partners - Full Stack Developer Pre-Work Submission\n\n`;
    md += `Candidate: Full Stack Developer Applicant\nDate: ${new Date().toLocaleDateString()}\nRole: Full Stack Developer\nSubmission Target: recruiting@capraecapital.com\n\n---\n\n`;

    CAPRAE_DOSSIER.forEach((item) => {
      md += `## ${item.title}\n`;
      if (item.subtitle) md += `*${item.subtitle}*\n\n`;
      item.paragraphs.forEach((p) => {
        md += `${p}\n\n`;
      });
      if (item.bulletPoints) {
        item.bulletPoints.forEach((b) => {
          md += `- ${b}\n`;
        });
        md += `\n`;
      }
      if (item.takeaways) {
        md += `> **Key Takeaway**: ${item.takeaways}\n\n`;
      }
      md += `---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMd = () => {
    let md = `# Caprae Capital Partners - Full Stack Developer Pre-Work Submission\n\n`;
    CAPRAE_DOSSIER.forEach((item) => {
      md += `## ${item.title}\n\n`;
      item.paragraphs.forEach((p) => {
        md += `${p}\n\n`;
      });
      if (item.bulletPoints) {
        item.bulletPoints.forEach((b) => {
          md += `- ${b}\n`;
        });
        md += `\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Caprae_Capital_Full_Stack_Handbook_Submission.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentQuestions = CAPRAE_DOSSIER.filter((q) => q.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Dossier Banner */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
              <span>Caprae Capital Partners</span>
              <span aria-hidden="true">·</span>
              <span>Managing Principal: Kevin Hong</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Full Stack Developer Interview Pre-Work Handbook Dossier
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Complete, authoritative responses for the AI-Readiness Pre-Screening Challenge,
              including the 2-minute video presentation teleprompter script, business model teardown,
              and full backend cloud architecture blueprint.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyAll}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied for Email!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Entire Submission</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMd}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download .MD</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveCategory('video_script')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'video_script'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>2-Min Video Script</span>
          </button>

          <button
            onClick={() => setActiveCategory('business_understanding')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'business_understanding'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Business Understanding (10 Pts)</span>
          </button>

          <button
            onClick={() => setActiveCategory('technical_architecture')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'technical_architecture'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Technical Architecture (10 Pts)</span>
          </button>

          <button
            onClick={() => setActiveCategory('employment_expectations')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'employment_expectations'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Employment Expectations</span>
          </button>

          <button
            onClick={() => setActiveCategory('reapplicant_questions')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'reapplicant_questions'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Culture & Reapplicant (5 Pts)</span>
          </button>
        </div>
      </div>

      {/* Teleprompter Timer for Video Script Tab */}
      {activeCategory === 'video_script' && (
        <div className="bg-[#141B29] border border-blue-900/60 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Video Rehearsal Teleprompter Mode
              </div>
              <div className="text-[11px] text-slate-400">
                Paced for a clean 120-second concise walkthrough under the handbook criteria
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="font-mono text-xl font-bold text-blue-300 tabular-nums px-3 py-1 rounded bg-[#0B0F17] border border-slate-800">
              {formatTimer(timerSeconds)}
            </div>

            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-2 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors cursor-pointer"
              title={isTimerRunning ? 'Pause timer' : 'Start rehearsal timer'}
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(120);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors cursor-pointer"
              title="Reset timer to 2:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Questions & Content Cards */}
      <div className="space-y-6">
        {currentQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-[#111622] border border-slate-800/80 rounded-xl p-6 space-y-4 shadow-sm"
          >
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">{q.title}</h2>
              {q.subtitle && (
                <p className="text-xs text-blue-400 font-medium mt-0.5">{q.subtitle}</p>
              )}
            </div>

            <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
              {q.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {q.bulletPoints && q.bulletPoints.length > 0 && (
              <ul className="space-y-2 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                {q.bulletPoints.map((b, idx) => {
                  const [leadIn, ...rest] = b.split(': ');
                  return (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        {rest.length > 0 ? (
                          <>
                            <strong className="text-slate-100 font-semibold">{leadIn}:</strong>{' '}
                            <span>{rest.join(': ')}</span>
                          </>
                        ) : (
                          <span>{b}</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {q.takeaways && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  Executive Core Thesis:
                </span>
                <span className="text-slate-300 font-medium">{q.takeaways}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submission Instructions Box */}
      <div className="bg-[#141B29] border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-200">Ready to Submit to Caprae Capital</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Email target:{' '}
            <a
              href="mailto:recruiting@capraecapital.com"
              className="text-blue-400 font-mono hover:underline"
            >
              recruiting@capraecapital.com
            </a>{' '}
            · Subject Line: <span className="text-slate-200 font-mono">Full Stack Developer - Handbook Submission - [Your Name]</span>
          </div>
        </div>

        <button
          onClick={handleCopyAll}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer shadow"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Complete Dossier Packet</span>
        </button>
      </div>
    </div>
  );
};
