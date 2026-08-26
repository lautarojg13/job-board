import React, { useState } from 'react';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';
import { AuthMode } from '../AuthModal';
import { FieldError } from '../common/FieldError';

interface PasswordConfirmFormProps {
  onSuccess: (msg: string) => void;
  onError: (err: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSwitchMode: (mode: AuthMode) => void;
  onResetAlerts: () => void;
}

export const PasswordConfirmForm: React.FC<PasswordConfirmFormProps> = ({
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  onSwitchMode,
  onResetAlerts,
}) => {
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [resetUid, setResetUid] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
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

    if (password !== passwordConfirm) {
      setFieldErrors({ new_password2: ['Passwords do not match.'] });
      onError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiService.resetPasswordConfirm({
        new_password1: password,
        new_password2: passwordConfirm,
        uid: resetUid,
        token: resetToken,
      });
      onSuccess(res.detail || 'Password reset confirmed.');
      setTimeout(() => onSwitchMode('login'), 1500);
    } catch (err: any) {
      if (err.fieldErrors && typeof err.fieldErrors === 'object') {
        setFieldErrors(err.fieldErrors);
        if (err.fieldErrors.non_field_errors) {
          onError(err.fieldErrors.non_field_errors.join(' '));
        } else {
          onError(err.message || 'Failed to confirm password reset.');
        }
      } else {
        onError(err.message || 'Failed to confirm password reset.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          New Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError('new_password1');
            }}
            placeholder="••••••••"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
              fieldErrors.new_password1 ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
          />
        </div>
        <FieldError error={fieldErrors.new_password1} />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              clearFieldError('new_password2');
            }}
            placeholder="••••••••"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
              fieldErrors.new_password2 ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
          />
        </div>
        <FieldError error={fieldErrors.new_password2} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            UID
          </label>
          <input
            type="text"
            required
            value={resetUid}
            onChange={(e) => {
              setResetUid(e.target.value);
              clearFieldError('uid');
            }}
            placeholder="UID String"
            className={`w-full px-3 py-2 bg-slate-900 border ${
              fieldErrors.uid ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white focus:outline-none focus:ring-1`}
          />
          <FieldError error={fieldErrors.uid} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Token
          </label>
          <input
            type="text"
            required
            value={resetToken}
            onChange={(e) => {
              setResetToken(e.target.value);
              clearFieldError('token');
            }}
            placeholder="Reset Token"
            className={`w-full px-3 py-2 bg-slate-900 border ${
              fieldErrors.token ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white focus:outline-none focus:ring-1`}
          />
          <FieldError error={fieldErrors.token} />
        </div>
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
            <span>Confirm Reset</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
