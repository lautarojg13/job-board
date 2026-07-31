import React, { useState, useEffect } from 'react';
import { Briefcase, RefreshCw, AlertCircle, PlusCircle, Sparkles, Building2 } from 'lucide-react';
import { JobPostList, PublicCompany, JobsListQueryParams, JobPost } from '../types';
import { apiService } from '../services/api';
import { JobCard } from '../components/JobCard';
import { JobSearchFilter } from '../components/JobSearchFilter';
import { JobDetailModal } from '../components/JobDetailModal';
import { ApplyModal } from '../components/ApplyModal';
import { ResumeAnalysisModal } from '../components/ResumeAnalysisModal';
import { AiAgentSearch } from '../components/AiAgentSearch';

interface JobsViewProps {
  onNavigateToEmployer: () => void;
  onNavigateToCompanies: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ onNavigateToEmployer, onNavigateToCompanies }) => {
  const [jobs, setJobs] = useState<JobPostList[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Record<number, PublicCompany>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<JobsListQueryParams>({});
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Modal triggers
  const [applyJob, setApplyJob] = useState<JobPost | null>(null);
  const [analyzeJob, setAnalyzeJob] = useState<JobPost | null>(null);
  const [showAiAgent, setShowAiAgent] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, companiesData] = await Promise.all([
        apiService.getJobsList(filters),
        apiService.getCompanies().catch(() => [])
      ]);

      setJobs(jobsData);

      const compMap: Record<number, PublicCompany> = {};
      companiesData.forEach((c) => {
        compMap[c.id] = c;
      });
      setCompaniesMap(compMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [JSON.stringify(filters)]);

  const handleAgentPromptResult = (prompt: string) => {
    if (prompt) {
      setFilters((prev) => ({
        ...prev,
        search: prompt
      }));
    } else {
      setFilters({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-6 sm:p-8 rounded-2xl border border-slate-800 text-slate-100 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>DRF Open API Job Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Find your next engineering role
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Search, match, and apply directly to verified full-time, part-time, and contract roles powered by Django REST Framework.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAiAgent(!showAiAgent)}
            className="px-4 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-sky-400 text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>{showAiAgent ? 'Hide AI Agent' : 'AI Match Agent'}</span>
          </button>

          <button
            onClick={onNavigateToEmployer}
            className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition-colors shadow-md shadow-sky-500/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a Job</span>
          </button>
        </div>
      </div>

      {/* Optional AI Agent Prompt Search */}
      {showAiAgent && (
        <AiAgentSearch onFilteredResults={handleAgentPromptResult} />
      )}

      {/* Job Search & Filter Controls */}
      <JobSearchFilter
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      {/* Job Listings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold text-slate-200">
            Showing {jobs.length} job post{jobs.length !== 1 && 's'}
          </span>
          <button
            onClick={loadData}
            className="flex items-center space-x-1 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
            <p className="text-sm text-slate-400">Querying DRF jobs API...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs text-center space-y-3">
            <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
            <p className="leading-relaxed">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-slate-800 text-white font-semibold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No Job Listings Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No jobs matched your current filter criteria. Try adjusting your search keywords, location, or salary parameters.
            </p>
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 bg-sky-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-sky-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                company={job.company ? companiesMap[job.company] : undefined}
                onSelect={(id) => setSelectedJobId(id)}
                onQuickApply={async (id) => {
                  try {
                    const fullJob = await apiService.getJobDetails(id);
                    setApplyJob(fullJob);
                  } catch {
                    // ignore
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <JobDetailModal
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
        onApply={(j) => {
          setSelectedJobId(null);
          setApplyJob(j);
        }}
        onAnalyzeResume={(j) => {
          setSelectedJobId(null);
          setAnalyzeJob(j);
        }}
      />

      {/* Apply Modal */}
      <ApplyModal
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onSuccess={loadData}
      />

      {/* Resume Analysis Modal */}
      <ResumeAnalysisModal
        job={analyzeJob}
        onClose={() => setAnalyzeJob(null)}
      />
    </div>
  );
};
