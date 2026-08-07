import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { JobPostList, PublicCompany, JobsListQueryParams, JobPost } from '../types';
import { apiService } from '../services/api';
import { JobCard } from '../components/JobCard';
import { JobSearchFilter } from '../components/JobSearchFilter';
import { JobDetailModal } from '../components/JobDetailModal';
import { ApplyModal } from '../components/ApplyModal';
import { ResumeAnalysisModal } from '../components/ResumeAnalysisModal';
import { AiAgentSearch } from '../components/AiAgentSearch';
import { JobsHeroHeader } from '../components/jobs/JobsHeroHeader';
import { JobsListHeader } from '../components/jobs/JobsListHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/common/StateMessage';

interface JobsViewProps {
  onNavigateToEmployer: () => void;
  onNavigateToCompanies: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ onNavigateToEmployer }) => {
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
      <JobsHeroHeader
        showAiAgent={showAiAgent}
        onToggleAiAgent={() => setShowAiAgent(!showAiAgent)}
        onNavigateToEmployer={onNavigateToEmployer}
      />

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
        <JobsListHeader
          totalJobs={jobs.length}
          loading={loading}
          onRefresh={loadData}
        />

        {loading ? (
          <LoadingState message="Querying DRF jobs API..." />
        ) : error ? (
          <ErrorState error={error} onRetry={loadData} />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Job Listings Found"
            description="No jobs matched your current filter criteria. Try adjusting your search keywords, location, or salary parameters."
            actionText="Reset Filters"
            onAction={() => setFilters({})}
          />
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
