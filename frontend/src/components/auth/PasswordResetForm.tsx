import React, { useState } from 'react';
import { Mail, Loader2, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';
import { FieldError } from '../common/FieldError';

interface PasswordResetFormProps {
  onSuccess: (msg: string) => void;
  onError: (err: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onResetAlerts: () => void;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  onResetAlerts,
}) => {
  const [email, setEmail] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const clearFieldError = (key: string) => {
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onResetAlerts();
    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await apiService.resetPassword({ email });
      onSuccess(res.detail || 'Password reset email sent if account exists.');
    } catch (err: any) {
      if (err.fieldErrors && typeof err.fieldErrors === 'object') {
        setFieldErrors(err.fieldErrors);
        if (err.fieldErrors.non_field_errors) {
          onError(err.fieldErrors.non_field_errors.join(' '));
        } else {
          onError(err.message || 'Failed to request password reset.');
        }
      } else {
        onError(err.message || 'Failed to request password reset.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
            placeholder="alex@example.com"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
              fieldErrors.email ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
          />
        </div>
        <FieldError error={fieldErrors.email} />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-colors"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>Send Reset Email</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
