import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { PublicCompany, JobsListQueryParams, JobPost } from '../types';
import { apiService } from '../services/api';
import { JobCard } from '../components/JobCard';
import { JobSearchFilter } from '../components/JobSearchFilter';
import { JobDetailModal } from '../components/JobDetailModal';
import { ApplyModal } from '../components/ApplyModal';
import { ResumeAnalysisModal } from '../components/ResumeAnalysisModal';
import { JobsHeroHeader } from '../components/jobs/JobsHeroHeader';
import { JobsListHeader } from '../components/jobs/JobsListHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/common/StateMessage';

interface JobsViewProps {
  onNavigateToCompanies: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({ onNavigateToCompanies }) => {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Record<number, PublicCompany>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextPage, setNextPage] = useState<number>(2);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [requestId, setRequestId] = useState<number>(0);

  const [filters, setFilters] = useState<JobsListQueryParams>({});
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  // Modal triggers
  const [applyJob, setApplyJob] = useState<JobPost | null>(null);
  const [analyzeJob, setAnalyzeJob] = useState<JobPost | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, companiesData] = await Promise.all([
        apiService.getJobsList({ ...filters, page: 1 }),
        apiService.getCompanies().catch(() => [])
      ]);

      setJobs(jobsData.results);
      setTotalJobs(jobsData.count);
      setHasMore(jobsData.next !== null);
      setNextPage(2);

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
  }, [JSON.stringify(filters), requestId]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const jobsData = await apiService.getJobsList({ ...filters, page: nextPage });
      setJobs((prev) => [...prev, ...jobsData.results]);
      setHasMore(jobsData.next !== null);
      setNextPage((p) => p + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load more jobs.');
    } finally {
      setLoadingMore(false);
    }
  };

  const refresh = () => setRequestId((r) => r + 1);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <JobsHeroHeader />

      {/* Job Search & Filter Controls */}
      <JobSearchFilter
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters({})}
      />

      {/* Job Listings List */}
      <div className="space-y-4">
        <JobsListHeader
          totalJobs={totalJobs}
          loading={loading}
          onRefresh={refresh}
        />

        {loading ? (
          <LoadingState message="Fetching active job postings..." />
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

        {hasMore && !error && (
          <div className="flex justify-center pt-4">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingMore ? 'Loading...' : 'Load more'}
            </button>
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
