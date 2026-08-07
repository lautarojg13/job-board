import React, { useState } from 'react';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';

interface PasswordChangeFormProps {
  onSuccess: (msg: string) => void;
  onError: (err: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onResetAlerts: () => void;
}

export const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  onResetAlerts,
}) => {
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onResetAlerts();

    if (password !== passwordConfirm) {
      onError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiService.changePassword({
        new_password1: password,
        new_password2: passwordConfirm,
      });
      onSuccess(res.detail || 'Password updated successfully.');
    } catch (err: any) {
      onError(err.message || 'Failed to update password.');
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
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
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
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
            <span>Change Password</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
