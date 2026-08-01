import React, { useState } from 'react';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';

interface EmailVerificationFormProps {
  mode: 'resend_email' | 'verify_email';
  onSuccess: (msg: string) => void;
  onError: (err: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onResetAlerts: () => void;
}

export const EmailVerificationForm: React.FC<EmailVerificationFormProps> = ({
  mode,
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  onResetAlerts,
}) => {
  const [email, setEmail] = useState<string>('');
  const [verifyKey, setVerifyKey] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onResetAlerts();
    setIsLoading(true);

    try {
      if (mode === 'resend_email') {
        const res = await apiService.resendEmailVerification({ email });
        onSuccess(res.detail || 'Verification email resent.');
      } else {
        const res = await apiService.verifyEmail({ key: verifyKey });
        onSuccess(res.detail || 'Email verified successfully.');
      }
    } catch (err: any) {
      onError(err.message || 'Operation failed. Please check parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'resend_email' ? (
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Verification Key
          </label>
          <input
            type="text"
            required
            value={verifyKey}
            onChange={(e) => setVerifyKey(e.target.value)}
            placeholder="Verification key sent via email"
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>{mode === 'resend_email' ? 'Resend Email' : 'Verify Email'}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
