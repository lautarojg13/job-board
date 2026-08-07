import React, { useState, useEffect } from 'react';
import { RefreshCw, Briefcase } from 'lucide-react';
import {
  JobPost,
  PublicCompany,
  ApplicationList,
  ApplicationDetail,
  JobPostStatusEnum,
  EmploymentTypeEnum,
  WorkModeEnum,
  ApplicationStatusEnum
} from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EmployerHeader } from '../components/employer/EmployerHeader';
import { JobPostForm } from '../components/employer/JobPostForm';
import { EmployerJobCard } from '../components/employer/EmployerJobCard';
import { JobApplicantsModal } from '../components/employer/JobApplicantsModal';
import { RespondApplicationModal } from '../components/employer/RespondApplicationModal';
import { LoadingState, EmptyState } from '../components/common/StateMessage';

export const EmployerDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [ownerJobs, setOwnerJobs] = useState<JobPost[]>([]);
  const [companies, setCompanies] = useState<PublicCompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tabs inside employer portal
  const [activeTab, setActiveTab] = useState<'my_jobs' | 'post_job'>('my_jobs');

  // Form for creating/editing job
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [companyId, setCompanyId] = useState<number | undefined>(undefined);
  const [location, setLocation] = useState<string>('San Francisco, CA');
  const [salary, setSalary] = useState<number | undefined>(120000);
  const [employmentType, setEmploymentType] = useState<EmploymentTypeEnum>('FT');
  const [workMode, setWorkMode] = useState<WorkModeEnum>('remote');
  const [status, setStatus] = useState<JobPostStatusEnum>('active');

  const [isSubmittingJob, setIsSubmittingJob] = useState<boolean>(false);
  const [jobSubmitSuccess, setJobSubmitSuccess] = useState<string | null>(null);

  // Applications view for a job
  const [selectedJobForApps, setSelectedJobForApps] = useState<JobPost | null>(null);
  const [jobApps, setJobApps] = useState<ApplicationList[]>([]);
  const [loadingApps, setLoadingApps] = useState<boolean>(false);

  // Respond to application modal
  const [respondingAppId, setRespondingAppId] = useState<number | null>(null);
  const [appDetail, setAppDetail] = useState<ApplicationDetail | null>(null);
  const [responseStatus, setResponseStatus] = useState<ApplicationStatusEnum>('reviewed');
  const [responseMessage, setResponseMessage] = useState<string>('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState<boolean>(false);

  const loadEmployerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, compData] = await Promise.all([
        apiService.getOwnerJobsList().catch(() => apiService.getJobsList()),
        apiService.getCompanies().catch(() => [])
      ]);
      setOwnerJobs(jobsData);
      setCompanies(compData);
      if (compData.length > 0 && !companyId) {
        setCompanyId(compData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load employer jobs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployerData();
  }, [isAuthenticated]);

  const handleCreateOrUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmittingJob(true);
    setJobSubmitSuccess(null);
    setError(null);

    try {
      if (editingJobId) {
        await apiService.editJobPost(editingJobId, {
          title,
          description: description || null,
          location: location || null,
          salary: salary || null,
          employment_type: employmentType,
          work_mode: workMode,
          status
        });
        setJobSubmitSuccess('Job posting updated successfully!');
      } else {
        await apiService.postJob({
          title,
          description: description || null,
          company: companyId || (companies[0]?.id || 101),
          location: location || null,
          salary: salary || null,
          employment_type: employmentType,
          work_mode: workMode,
          status
        });
        setJobSubmitSuccess('New job posted successfully!');
      }

      setTimeout(() => {
        setJobSubmitSuccess(null);
        resetJobForm();
        setActiveTab('my_jobs');
        loadEmployerData();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to save job post.');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleEditClick = (job: JobPost) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setDescription(job.description || '');
    setCompanyId(job.company || undefined);
    setLocation(job.location || '');
    setSalary(job.salary || undefined);
    setEmploymentType(job.employment_type || 'FT');
    setWorkMode(job.work_mode || 'remote');
    setStatus(job.status || 'active');
    setActiveTab('post_job');
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job post?')) return;
    try {
      await apiService.deleteJobPost(jobId);
      loadEmployerData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete job post.');
    }
  };

  const resetJobForm = () => {
    setEditingJobId(null);
    setTitle('');
    setDescription('');
    setLocation('San Francisco, CA');
    setSalary(120000);
    setEmploymentType('FT');
    setWorkMode('remote');
    setStatus('active');
  };

  const handleViewApplicants = async (job: JobPost) => {
    setSelectedJobForApps(job);
    setLoadingApps(true);
    try {
      const apps = await apiService.getJobApplications(job.id);
      setJobApps(apps);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch job applications.');
    } finally {
      setLoadingApps(false);
    }
  };

  const handleOpenResponseModal = async (appId: number) => {
    setRespondingAppId(appId);
    try {
      const detail = await apiService.getApplicationDetail(appId);
      setAppDetail(detail);
      setResponseStatus(detail.status);
    } catch {
      setAppDetail(null);
    }
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingAppId) return;

    setIsSubmittingResponse(true);
    try {
      await apiService.respondToApplication(respondingAppId, {
        application_status: responseStatus,
        message: responseMessage || undefined
      });
      alert('Application response sent successfully!');
      setRespondingAppId(null);
      setAppDetail(null);
      setResponseMessage('');

      if (selectedJobForApps) {
        handleViewApplicants(selectedJobForApps);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update application status.');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <EmployerHeader
        activeTab={activeTab}
        totalOwnerJobs={ownerJobs.length}
        onTabChange={(tab) => {
          if (tab === 'post_job') resetJobForm();
          setActiveTab(tab);
        }}
      />

      {/* Main Tab Switch */}
      {activeTab === 'post_job' ? (
        <JobPostForm
          editingJobId={editingJobId}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          companyId={companyId}
          setCompanyId={setCompanyId}
          location={location}
          setLocation={setLocation}
          salary={salary}
          setSalary={setSalary}
          employmentType={employmentType}
          setEmploymentType={setEmploymentType}
          workMode={workMode}
          setWorkMode={setWorkMode}
          status={status}
          setStatus={setStatus}
          companies={companies}
          isSubmittingJob={isSubmittingJob}
          jobSubmitSuccess={jobSubmitSuccess}
          error={error}
          onSubmit={handleCreateOrUpdateJob}
          onCancel={() => setActiveTab('my_jobs')}
        />
      ) : (
        /* MY JOBS LIST */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{ownerJobs.length} Job Posts Managed</span>
            <button
              onClick={loadEmployerData}
              className="flex items-center space-x-1 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <LoadingState message="Loading owner job postings..." />
          ) : ownerJobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No Job Postings Yet"
              description="Create your first job listing to receive candidate applications."
              actionText="Create Job Post"
              onAction={() => setActiveTab('post_job')}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ownerJobs.map((job) => (
                <EmployerJobCard
                  key={job.id}
                  job={job}
                  onViewApplicants={handleViewApplicants}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Job Applicants Drawer Modal */}
      <JobApplicantsModal
        selectedJob={selectedJobForApps}
        applications={jobApps}
        loadingApps={loadingApps}
        onClose={() => setSelectedJobForApps(null)}
        onRespond={handleOpenResponseModal}
      />

      {/* Respond to Application Modal */}
      <RespondApplicationModal
        respondingAppId={respondingAppId}
        appDetail={appDetail}
        responseStatus={responseStatus}
        setResponseStatus={setResponseStatus}
        responseMessage={responseMessage}
        setResponseMessage={setResponseMessage}
        isSubmittingResponse={isSubmittingResponse}
        onClose={() => {
          setRespondingAppId(null);
          setAppDetail(null);
        }}
        onSubmit={handleSubmitResponse}
      />
    </div>
  );
};
