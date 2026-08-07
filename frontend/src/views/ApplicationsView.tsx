import React, { useState, useEffect } from 'react';
import { FileCheck } from 'lucide-react';
import { ApplicationList, ApplicationDetail, ApplicationStatusEnum, JobPost } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ApplicationsHeader } from '../components/applications/ApplicationsHeader';
import { ApplicationCard } from '../components/applications/ApplicationCard';
import { ApplicationDetailModal } from '../components/applications/ApplicationDetailModal';
import { LoadingState, ErrorState, EmptyState } from '../components/common/StateMessage';

export const ApplicationsView: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<ApplicationList[]>([]);
  const [selectedAppDetail, setSelectedAppDetail] = useState<ApplicationDetail | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatusEnum | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getUserApplications({
        status: statusFilter || undefined
      });
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserApplications();
  }, [statusFilter, isAuthenticated]);

  const handleSelectApplication = async (appId: number) => {
    try {
      const detail = await apiService.getApplicationDetail(appId);
      setSelectedAppDetail(detail);

      try {
        const jobInfo = await apiService.getJobDetails(detail.job_id);
        setSelectedJob(jobInfo);
      } catch {
        setSelectedJob(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to fetch application details.');
    }
  };

  const handleCloseModal = () => {
    setSelectedAppDetail(null);
    setSelectedJob(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <ApplicationsHeader
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        loading={loading}
        onRefresh={loadUserApplications}
      />

      {loading ? (
        <LoadingState message="Fetching applications list..." />
      ) : error ? (
        <ErrorState error={error} onRetry={loadUserApplications} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No Applications Found"
          description="You haven't submitted any job applications under this status filter yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onSelect={handleSelectApplication}
            />
          ))}
        </div>
      )}

      {/* Application Detail View Modal */}
      <ApplicationDetailModal
        appDetail={selectedAppDetail}
        selectedJob={selectedJob}
        onClose={handleCloseModal}
      />
    </div>
  );
};
