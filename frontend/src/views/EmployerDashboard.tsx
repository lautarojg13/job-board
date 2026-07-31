import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Briefcase,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Building2,
  DollarSign,
  Send,
  RefreshCw,
  FileText
} from 'lucide-react';
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

export const EmployerDashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <PlusCircle className="w-6 h-6 mr-2.5 text-sky-400" />
            Employer & Recruiter Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">Publish job posts, manage company listings, and process candidates</p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              resetJobForm();
              setActiveTab('my_jobs');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'my_jobs'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Job Postings ({ownerJobs.length})
          </button>
          <button
            onClick={() => {
              resetJobForm();
              setActiveTab('post_job');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'post_job'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            + Post New Job
          </button>
        </div>
      </div>

      {/* Main Tab Switch */}
      {activeTab === 'post_job' ? (
        <div className="max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {editingJobId ? `Edit Job Posting #${editingJobId}` : 'Publish New Job Posting'}
              </h2>
              <p className="text-xs text-slate-400">Endpoint: POST /jobs/post-job/ or PATCH /jobs/edit-job-post/&#123;id&#125;/</p>
            </div>
          </div>

          {jobSubmitSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{jobSubmitSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateOrUpdateJob} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer (Python/Django)"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Company
                </label>
                <select
                  value={companyId || ''}
                  onChange={(e) => setCompanyId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA or Remote"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentTypeEnum)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="FT">Full-Time (FT)</option>
                  <option value="PT">Part-Time (PT)</option>
                  <option value="CT">Contract (CT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Work Mode
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as WorkModeEnum)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as JobPostStatusEnum)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Annual Salary ($ USD)
              </label>
              <input
                type="number"
                value={salary || ''}
                onChange={(e) => setSalary(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 150000"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Detailed Job Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Specify requirements, tech stack, and benefits..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('my_jobs')}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingJob}
                className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition-colors"
              >
                {isSubmittingJob ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{editingJobId ? 'Save Changes' : 'Publish Job Post'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
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
            <div className="py-20 text-center text-slate-400 space-y-2 bg-slate-900/50 rounded-2xl border border-slate-800">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400" />
              <p className="text-xs">Loading owner job postings...</p>
            </div>
          ) : ownerJobs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Job Postings Yet</h3>
              <p className="text-xs text-slate-500">Create your first job listing to receive candidate applications.</p>
              <button
                onClick={() => setActiveTab('post_job')}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Create Job Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {ownerJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-100"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-white">{job.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center space-x-3">
                      <span>{job.location || 'Remote'}</span>
                      <span>•</span>
                      <span>{job.salary ? `$${job.salary.toLocaleString()}/yr` : 'Undisclosed'}</span>
                      <span>•</span>
                      <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleViewApplicants(job)}
                      className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View Applicants</span>
                    </button>

                    <button
                      onClick={() => handleEditClick(job)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Edit Job"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Job Applicants Drawer Modal */}
      {selectedJobForApps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-slate-100 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedJobForApps(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Applicants for "{selectedJobForApps.title}"</h2>
                <p className="text-xs text-slate-400">Endpoint: GET /applications/get-job-applications/&#123;job_id&#125;/</p>
              </div>
            </div>

            {loadingApps ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-400" />
                <p className="text-xs">Fetching applicants...</p>
              </div>
            ) : jobApps.length === 0 ? (
              <div className="py-12 text-center text-slate-400 italic bg-slate-900/40 rounded-xl border border-slate-800">
                No job applications submitted for this role yet.
              </div>
            ) : (
              <div className="space-y-3">
                {jobApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">Application #{app.id}</span>
                      <span className="text-slate-400 text-[11px]">
                        Submitted {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="capitalize font-semibold text-sky-400">{app.status}</span>
                      <button
                        onClick={() => handleOpenResponseModal(app.id)}
                        className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition-colors"
                      >
                        Respond
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Respond to Application Modal */}
      {respondingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setRespondingAppId(null);
                setAppDetail(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Respond to Application #{respondingAppId}</h2>
                <p className="text-xs text-slate-400">PATCH /applications/respond-to-application/&#123;id&#125;/</p>
              </div>
            </div>

            {appDetail && (
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Cover Letter:</span>
                  <p className="text-slate-300 italic">{appDetail.cover_letter || 'No cover letter provided.'}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Resume URL:</span>
                  <a
                    href={appDetail.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline break-all"
                  >
                    {appDetail.resume}
                  </a>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Update Application Status
                </label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value as ApplicationStatusEnum)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Custom Response Message
                </label>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. We are excited to invite you to an initial interview!"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setRespondingAppId(null);
                    setAppDetail(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResponse}
                  className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2"
                >
                  {isSubmittingResponse ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Status</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
