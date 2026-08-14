import React, { useState } from 'react';
import { Send, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { JobPost } from '../types';
import { apiService } from '../services/api';
import { Modal } from './common/Modal';

interface ApplyModalProps {
  job: JobPost | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, onClose, onSuccess }) => {
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string>('');
  const [useFile, setUseFile] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setError(null);

    const resumeToSubmit = useFile ? resumeFile : resumeUrl;
    if (!resumeToSubmit) {
      setError('Please attach a resume file or enter a valid resume URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.applyToJob(job.id, {
        cover_letter: coverLetter || null,
        resume: resumeToSubmit
      });
      setSuccessMsg(`Application for "${job.title}" submitted successfully!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit job application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(job)}
      onClose={onClose}
      maxWidth="lg"
      title={job ? job.title : ''}
      subtitle="Job Application"
    >
      {job && (
        <>
          {successMsg ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-emerald-300">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Resume Upload section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Resume Document <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseFile(!useFile)}
                    className="text-[11px] text-sky-400 hover:underline font-bold"
                  >
                    {useFile ? 'Switch to URL input' : 'Switch to File Upload'}
                  </button>
                </div>

                {useFile ? (
                  <div className="border border-dashed border-slate-800 hover:border-sky-500/50 rounded-xl p-4 text-center bg-slate-900/60 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <Upload className="w-6 h-6 text-sky-400" />
                      <p className="text-xs text-slate-300">
                        {resumeFile ? (
                          <span className="font-bold text-sky-300">{resumeFile.name}</span>
                        ) : (
                          'Click or drag PDF/Word document here'
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://example.com/my-resume.pdf"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                )}
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
                  Cover Letter / Intro Note
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="Explain briefly why you are a great fit for this position..."
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center space-x-2 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </Modal>
  );
};
