import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { JobPost } from '../types';
import { useTaskStatus } from '../hooks/useTaskStatus';

interface AiAgentSearchProps {
  onFilteredResults: (jobs: JobPost[] | null, prompt?: string) => void;
}

export const AiAgentSearch: React.FC<AiAgentSearchProps> = ({ onFilteredResults }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const {
    status,
    result,
    error: taskError,
    isPolling,
    timedOut,
    reset: resetTaskPolling
  } = useTaskStatus<JobPost[]>(taskId);

  const samplePrompts = [
    'Find remote full stack engineer jobs with salary over $140,000',
    'Show me Python or Cloud architect positions in Chicago or remote',
    'Looking for part-time frontend or documentation specialist roles'
  ];

  const triggerSearch = async (promptText: string) => {
    setSubmitError(null);
    resetTaskPolling();
    setTaskId(null);

    if (promptText.trim().length < 5) {
      setSubmitError('Search prompt must be at least 5 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.getJobsByAgent({ user_prompt: promptText });
      setSubmittedPrompt(promptText);
      if (res.task_id) {
        setTaskId(res.task_id);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to query AI job agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerSearch(prompt);
  };

  useEffect(() => {
    if (status === 'SUCCESS' && Array.isArray(result)) {
      onFilteredResults(result, submittedPrompt || prompt);
    }
  }, [status, result]);

  const handleReset = () => {
    resetTaskPolling();
    setTaskId(null);
    setSubmittedPrompt(null);
    setPrompt('');
    setSubmitError(null);
    onFilteredResults(null);
  };

  const activeError = submitError || taskError;
  const isBusy = isSubmitting || isPolling;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            AI Job Match Agent
          </h2>
          <p className="text-xs text-slate-400">Describe your ideal position in plain English to match verified job listings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={isBusy}
            placeholder="e.g., 'I want a senior remote React role paying over $150k with strong engineering culture...'"
            className="w-full p-4 pr-12 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isBusy || prompt.trim().length < 5}
            className="absolute right-3 bottom-3 p-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 font-bold transition-colors shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {isBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {activeError && (
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold">{activeError}</span>
              {timedOut && (
                <p className="text-rose-300/80 text-[11px]">
                  The Celery background worker is taking longer than expected to process your agent search.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Polling Spinner Box */}
        {isPolling && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center space-x-3 text-slate-300 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-sky-400 shrink-0" />
            <p>Processing with AI Worker — matching relevant listings for your prompt...</p>
          </div>
        )}

        {/* Sample Prompt Pills */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Try Sample Agent Queries:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isBusy}
                onClick={() => {
                  setPrompt(sp);
                  triggerSearch(sp);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                "{sp}"
              </button>
            ))}
          </div>
        </div>
      </form>

      {submittedPrompt && status === 'SUCCESS' && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sky-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>AI matched listings for: <strong className="text-white">"{submittedPrompt}"</strong></span>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-white underline text-[11px] cursor-pointer ml-2"
          >
            Reset Agent Filter
          </button>
        </div>
      )}
    </div>
  );
};
