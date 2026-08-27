import React, { useState } from 'react';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthMode } from '../AuthModal';
import { FieldError } from '../common/FieldError';

interface RegisterFormProps {
  onSuccess: (msg: string) => void;
  onError: (err: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onSwitchMode: (mode: AuthMode) => void;
  onResetAlerts: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onError,
  isLoading,
  setIsLoading,
  onSwitchMode,
  onResetAlerts,
}) => {
  const { register } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
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
      setFieldErrors({ password2: ['Passwords do not match.'] });
      onError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const msg = await register({
        username,
        email,
        password1: password,
        password2: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
      });
      onSuccess(msg || 'Registration complete. You can now log in.');
      setTimeout(() => onSwitchMode('login'), 1500);
    } catch (err: any) {
      if (err.fieldErrors && typeof err.fieldErrors === 'object') {
        setFieldErrors(err.fieldErrors);
        // If there's non_field_errors or detail, present it at top level as well
        if (err.fieldErrors.non_field_errors) {
          onError(err.fieldErrors.non_field_errors.join(' '));
        } else {
          onError(err.message || 'Validation failed. Please check the fields below.');
        }
      } else {
        onError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          Username <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            required
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearFieldError('username');
            }}
            placeholder="e.g. alex_dev"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
              fieldErrors.username ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
          />
        </div>
        <FieldError error={fieldErrors.username} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            First Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearFieldError('first_name');
            }}
            placeholder="Alex"
            className={`w-full px-3.5 py-2.5 bg-slate-900 border ${
              fieldErrors.first_name ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
          />
          <FieldError error={fieldErrors.first_name} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Last Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearFieldError('last_name');
            }}
            placeholder="Rivera"
            className={`w-full px-3.5 py-2.5 bg-slate-900 border ${
              fieldErrors.last_name ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
          />
          <FieldError error={fieldErrors.last_name} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          Email Address <span className="text-rose-400">*</span>
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

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          Password <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError('password1');
              clearFieldError('password');
            }}
            placeholder="••••••••"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
              fieldErrors.password1 || fieldErrors.password ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
          />
        </div>
        <FieldError error={fieldErrors.password1 || fieldErrors.password} />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
          Confirm Password <span className="text-rose-400">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              clearFieldError('password2');
              clearFieldError('password_confirm');
            }}
            placeholder="••••••••"
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${
              fieldErrors.password2 || fieldErrors.password_confirm ? 'border-rose-500/80 focus:ring-rose-500' : 'border-slate-800 focus:ring-sky-500'
            } rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1`}
          />
        </div>
        <FieldError error={fieldErrors.password2 || fieldErrors.password_confirm} />
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
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
