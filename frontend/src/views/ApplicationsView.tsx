import React, { useState, useEffect } from 'react';
import { FileCheck, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, FileText, ExternalLink } from 'lucide-react';
import { ApplicationList, ApplicationDetail, ApplicationStatusEnum, JobPost } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

  const getStatusBadge = (status: ApplicationStatusEnum) => {
    switch (status) {
      case 'accepted':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accepted</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center"><XCircle className="w-3.5 h-3.5 mr-1" /> Rejected</span>;
      case 'reviewed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Reviewed</span>;
      case 'withdrawn':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center">Withdrawn</span>;
      case 'pending':
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center">
            <FileCheck className="w-6 h-6 mr-2.5 text-sky-400" />
            My Submitted Applications
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track the status of your applications via DRF REST endpoints</p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatusEnum | '')}
            className="px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All Application Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <button
            onClick={loadUserApplications}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400" />
          <p className="text-xs">Fetching applications list...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs text-center space-y-2">
          <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
          <p>{error}</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-2xl border border-slate-800">
          <FileCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Applications Found</h3>
          <p className="text-xs text-slate-500">You haven't submitted any job applications under this status filter yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => handleSelectApplication(app.id)}
              className="bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-xl p-5 cursor-pointer transition-all hover:bg-slate-900/90 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500">App #{app.id}</span>
                {getStatusBadge(app.status)}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block">Target Job ID</span>
                <span className="text-sm font-bold text-white">Job Post #{app.job_id}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between">
                <span>Applied: {new Date(app.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(app.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Detail View Modal */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setSelectedAppDetail(null);
                setSelectedJob(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Application #{selectedAppDetail.id}</h2>
                <p className="text-xs text-slate-400">
                  Applied on {new Date(selectedAppDetail.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Status:</span>
                {getStatusBadge(selectedAppDetail.status)}
              </div>
              {selectedJob && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 block">Target Job Title:</span>
                  <span className="font-bold text-white text-sm">{selectedJob.title}</span>
                  <span className="text-slate-400 block mt-0.5">{selectedJob.location || 'Remote'}</span>
                </div>
              )}
            </div>

            {selectedAppDetail.cover_letter && (
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
                  Cover Letter Submitted
                </span>
                <p className="p-3 bg-slate-900/60 rounded-xl text-xs text-slate-300 leading-relaxed border border-slate-800">
                  {selectedAppDetail.cover_letter}
                </p>
              </div>
            )}

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-1">
                Attached Resume
              </span>
              <a
                href={selectedAppDetail.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs font-mono border border-slate-800 transition-colors"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="truncate max-w-[260px]">{selectedAppDetail.resume}</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setSelectedAppDetail(null);
                  setSelectedJob(null);
                }}
                className="px-5 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
