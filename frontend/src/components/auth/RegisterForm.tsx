import React, { useState } from 'react';
import { User, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthMode } from '../AuthModal';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onResetAlerts();

    if (password !== passwordConfirm) {
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
      onError(err.message || 'Registration failed. Please try again.');
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
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. alex_dev"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
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
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Alex"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
            Last Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Rivera"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
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
            <span>Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
