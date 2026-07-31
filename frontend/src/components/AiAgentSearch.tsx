import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import { JobPostList } from '../types';

interface AiAgentSearchProps {
  onFilteredResults: (prompt: string) => void;
}

export const AiAgentSearch: React.FC<AiAgentSearchProps> = ({ onFilteredResults }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = useState<string | null>(null);

  const samplePrompts = [
    'Find remote full stack engineer jobs with salary over $140,000',
    'Show me Python or Django architect positions in Chicago or remote',
    'Looking for part-time frontend or documentation specialist roles'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (prompt.trim().length < 5) {
      setError('Search prompt must be at least 5 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.getJobsByAgent({ user_prompt: prompt });
      setSubmittedPrompt(prompt);
      onFilteredResults(prompt);
    } catch (err: any) {
      setError(err.message || 'Failed to query AI job agent.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-xs text-slate-400">Describe your ideal position in plain English to match DRF listings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="e.g., 'I want a senior remote React role paying over $150k with strong engineering culture...'"
            className="w-full p-4 pr-12 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || prompt.trim().length < 5}
            className="absolute right-3 bottom-3 p-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 font-bold transition-colors shadow-md"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-400">{error}</p>
        )}

        {/* Sample Prompt Pills */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Try Sample Agent Queries:</span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(sp);
                  onFilteredResults(sp);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                "{sp}"
              </button>
            ))}
          </div>
        </div>
      </form>

      {submittedPrompt && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sky-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Agent filter applied: <strong className="text-white">"{submittedPrompt}"</strong></span>
          </div>
          <button
            onClick={() => {
              setSubmittedPrompt(null);
              setPrompt('');
              onFilteredResults('');
            }}
            className="text-slate-400 hover:text-white underline text-[11px]"
          >
            Reset Agent Filter
          </button>
        </div>
      )}
    </div>
  );
};
