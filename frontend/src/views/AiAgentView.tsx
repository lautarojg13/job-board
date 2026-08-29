import React, { useState, useEffect } from 'react';
import { Briefcase, Sparkles } from 'lucide-react';
import { PublicCompany, JobPost } from '../types';
import { apiService } from '../services/api';
import { AiAgentSearch } from '../components/AiAgentSearch';
import { JobCard } from '../components/JobCard';
import { JobsListHeader } from '../components/jobs/JobsListHeader';
import { JobDetailModal } from '../components/JobDetailModal';
import { ApplyModal } from '../components/ApplyModal';
import { ResumeAnalysisModal } from '../components/ResumeAnalysisModal';
import { EmptyState } from '../components/common/StateMessage';

export const AiAgentView: React.FC = () => {
  const [companiesMap, setCompaniesMap] = useState<Record<number, PublicCompany>>({});
  const [aiResults, setAiResults] = useState<JobPost[] | null>(null);

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [applyJob, setApplyJob] = useState<JobPost | null>(null);
  const [analyzeJob, setAnalyzeJob] = useState<JobPost | null>(null);

  useEffect(() => {
    apiService
      .getCompanies()
      .then((companies) => {
        const compMap: Record<number, PublicCompany> = {};
        companies.forEach((c) => {
          compMap[c.id] = c;
        });
        setCompaniesMap(compMap);
      })
      .catch(() => {
        setCompaniesMap({});
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AI Job Match Agent
          </h1>
          <p className="text-sm text-slate-400">
            Describe your ideal role and the agent matches verified listings for you.
          </p>
        </div>
      </div>

      <AiAgentSearch onFilteredResults={setAiResults} />

      {aiResults !== null && (
        <div className="space-y-4">
          <JobsListHeader totalJobs={aiResults.length} loading={false} onRefresh={() => {}} />

          {aiResults.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No AI Matches Found"
              description="No jobs matched your agent prompt criteria. Try refining your query."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {aiResults.map((job) => (
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
      )}

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

      <ApplyModal
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onSuccess={() => {
          setAiResults(null);
        }}
      />

      <ResumeAnalysisModal
        job={analyzeJob}
        onClose={() => setAnalyzeJob(null)}
      />
    </div>
  );
};
