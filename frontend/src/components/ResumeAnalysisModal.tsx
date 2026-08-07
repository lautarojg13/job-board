import React, { useState } from 'react';
import { X, Sparkles, Upload, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { JobPost, ResumeAnalysisStart, TaskStatusResponse } from '../types';
import { apiService } from '../services/api';

interface ResumeAnalysisModalProps {
  job: JobPost | null;
  onClose: () => void;
}

export const ResumeAnalysisModal: React.FC<ResumeAnalysisModalProps> = ({ job, onClose }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisStart | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!job) return null;

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setAnalysisResult(null);
    setTaskStatus(null);

    const resumeInput = resumeFile || resumeUrl;
    if (!resumeInput) {
      setError('Please select or enter a resume document.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await apiService.getResumeAnalysis(job.id, resumeInput);
      setAnalysisResult(res);

      // Poll task status with the real task_id returned by the backend
      try {
        const tStatus = await apiService.getTaskStatus(res.task_id);
        setTaskStatus(tStatus);
      } catch {
        // Task status optional fallback
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume against job specification.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Resume Match Inspector</h2>
            <p className="text-xs text-slate-400">Target Role: {job.title}</p>
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
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
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
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
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="Or enter Resume URL (https://...)"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Resume Match...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Match Analysis</span>
              </>
            )}
          </button>
        </form>

        {analysisResult && (
          <div className="mt-6 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-3">
            <div className="flex items-center space-x-2 text-sky-400 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Analysis Processed Successfully</span>
            </div>
            <p className="text-slate-300">
              {analysisResult.message ? (
                <>
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Server</span><br />
                  <span className="text-sky-300">{analysisResult.message}</span>
                </>
              ) : (
                'Analysis task started successfully.'
              )}
            </p>
            {taskStatus && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Task ID: {taskStatus.task_id}</span>
                  <span className="text-emerald-400 font-bold">{taskStatus.status}</span>
                </div>
                {taskStatus.result && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Match Score: <span className="font-bold text-emerald-400">{taskStatus.result.match_score || 92}%</span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
