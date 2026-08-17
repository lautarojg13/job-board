import React, { useState } from 'react';
import { Sparkles, Upload, Loader2, CheckCircle2, AlertCircle, Clock, ListChecks } from 'lucide-react';
import { JobPost, ResumeAnalysisStart, ResumeAnalysisResult } from '../types';
import { apiService } from '../services/api';
import { Modal } from './common/Modal';
import { useTaskStatus } from '../hooks/useTaskStatus';

interface ResumeAnalysisModalProps {
  job: JobPost | null;
  onClose: () => void;
}

export const ResumeAnalysisModal: React.FC<ResumeAnalysisModalProps> = ({ job, onClose }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [analysisStart, setAnalysisStart] = useState<ResumeAnalysisStart | null>(null);

  const {
    status,
    result,
    error: taskError,
    isPolling,
    timedOut,
    reset: resetTaskPolling
  } = useTaskStatus<ResumeAnalysisResult>(taskId);

  const handleClose = () => {
    resetTaskPolling();
    setTaskId(null);
    setAnalysisStart(null);
    setResumeFile(null);
    setResumeUrl('');
    setSubmitError(null);
    setIsSubmitting(false);
    onClose();
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setSubmitError(null);
    resetTaskPolling();
    setTaskId(null);
    setAnalysisStart(null);

    const resumeInput = resumeFile || resumeUrl;
    if (!resumeInput) {
      setSubmitError('Please select or enter a resume document.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.getResumeAnalysis(job.id, resumeInput);
      setAnalysisStart(res);
      if (res.task_id) {
        setTaskId(res.task_id);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to trigger resume analysis.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = submitError || taskError;
  const isBusy = isSubmitting || isPolling;

  const getScoreColor = (score?: number) => {
    if (score === undefined || score === null) return 'text-slate-400';
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score?: number) => {
    if (score === undefined || score === null) return 'bg-slate-800/50 border-slate-700';
    if (score >= 75) return 'bg-emerald-950/30 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-950/30 border-amber-500/30';
    return 'bg-rose-950/30 border-rose-500/30';
  };

  return (
    <Modal
      isOpen={Boolean(job)}
      onClose={handleClose}
      maxWidth="lg"
      icon={<Sparkles className="w-5 h-5" />}
      title="Resume Match Inspector"
      subtitle={job ? `Target Role: ${job.title}` : ''}
    >
      {job && (
        <>
          <form onSubmit={handleAnalyze} className="space-y-5">
            {activeError && (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold">{activeError}</span>
                  {timedOut && (
                    <p className="text-rose-300/80 text-[11px]">
                      The Celery background worker is taking longer than expected to process your document.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Upload Resume to Analyze
              </label>
              <div className="border border-dashed border-slate-800 hover:border-sky-500/50 rounded-xl p-4 text-center bg-slate-900/60 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  disabled={isBusy}
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                />
                <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                  <Upload className="w-5 h-5 text-sky-400" />
                  <p className="text-xs text-slate-300">
                    {resumeFile ? (
                      <span className="font-bold text-sky-300">{resumeFile.name}</span>
                    ) : (
                      'Select PDF or Word Document'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-slate-500 font-bold">OR</div>

            <div>
              <input
                type="url"
                value={resumeUrl}
                disabled={isBusy}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="Or enter Resume URL (https://...)"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isSubmitting
                      ? 'Submitting Analysis Request...'
                      : 'Analyzing Resume in Background...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Match Analysis</span>
                </>
              )}
            </button>
          </form>

          {/* Analysis in Progress or Completed */}
          {analysisStart && (
            <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 font-bold">
                  {status === 'SUCCESS' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Analysis Complete</span>
                    </>
                  ) : isPolling ? (
                    <>
                      <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                      <span className="text-sky-400">Processing Task with AI Worker</span>
                    </>
                  ) : status === 'FAILURE' || status === 'REVOKED' || timedOut ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400">Task {status || 'Failed'}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">Task Queued</span>
                    </>
                  )}
                </div>

                {status && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      status === 'SUCCESS'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                        : status === 'FAILURE' || status === 'REVOKED'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                        : 'bg-sky-950/60 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {status}
                  </span>
                )}
              </div>

              {analysisStart.message && (
                <p className="text-slate-400 text-xs">{analysisStart.message}</p>
              )}

              <p className="text-slate-400 text-[11px]">
                Task ID: <code className="text-sky-300 font-mono break-all">{analysisStart.task_id}</code>
              </p>

              {/* Polling Spinner Box */}
              {isPolling && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center space-x-3 text-slate-300">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
                  <p className="text-xs text-slate-300">
                    Waiting for Celery background worker to finish parsing and evaluating your resume...
                  </p>
                </div>
              )}

              {/* Task Result Box */}
              {status === 'SUCCESS' && result && (
                <div className="space-y-3 pt-2">
                  {/* Match Score Card */}
                  <div className={`p-4 rounded-lg border ${getScoreBg(result.match_score)} flex items-center justify-between`}>
                    <div>
                      <span className="text-slate-400 text-[11px] font-medium block">Role Compatibility Score</span>
                      <span className="text-xs text-slate-300">Evaluation against job requirements</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black font-mono ${getScoreColor(result.match_score)}`}>
                        {result.match_score !== undefined && result.match_score !== null
                          ? `${result.match_score}%`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {Array.isArray(result.recommendations) && result.recommendations.length > 0 && (
                    <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center space-x-1.5 text-slate-300 font-bold text-xs">
                        <ListChecks className="w-4 h-4 text-sky-400" />
                        <span>Recommendations & Key Insights</span>
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                            <span className="text-sky-400 font-bold select-none leading-none mt-1">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
};
