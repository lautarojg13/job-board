import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Key, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export type AuthMode =
  | 'login'
  | 'register'
  | 'password_reset'
  | 'password_confirm'
  | 'password_change'
  | 'resend_email'
  | 'verify_email';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose
}) => {
  const { login, register, isAuthenticated, logout } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form Fields
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [resetUid, setResetUid] = useState<string>('');
  const [resetToken, setResetToken] = useState<string>('');
  const [verifyKey, setVerifyKey] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    resetFormState();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({ username, email, password });
        setSuccessMsg('Logged in successfully!');
        setTimeout(onClose, 800);
      } else if (mode === 'register') {
        if (password !== passwordConfirm) {
          throw new Error('Passwords do not match');
        }
        const msg = await register({
          username,
          email,
          password1: password,
          password2: passwordConfirm,
          first_name: firstName,
          last_name: lastName
        });
        setSuccessMsg(msg || 'Registration complete. You can now log in.');
        setTimeout(() => handleModeSwitch('login'), 1500);
      } else if (mode === 'password_reset') {
        const res = await apiService.resetPassword({ email });
        setSuccessMsg(res.detail || 'Password reset email sent if account exists.');
      } else if (mode === 'password_confirm') {
        const res = await apiService.resetPasswordConfirm({
          new_password1: password,
          new_password2: passwordConfirm,
          uid: resetUid,
          token: resetToken
        });
        setSuccessMsg(res.detail || 'Password reset confirmed.');
        setTimeout(() => handleModeSwitch('login'), 1500);
      } else if (mode === 'password_change') {
        const res = await apiService.changePassword({
          new_password1: password,
          new_password2: passwordConfirm
        });
        setSuccessMsg(res.detail || 'Password updated successfully.');
      } else if (mode === 'resend_email') {
        const res = await apiService.resendEmailVerification({ email });
        setSuccessMsg(res.detail || 'Verification email resent.');
      } else if (mode === 'verify_email') {
        const res = await apiService.verifyEmail({ key: verifyKey });
        setSuccessMsg(res.detail || 'Email verified successfully.');
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please check parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 text-slate-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white capitalize">
            {mode === 'login' && 'Sign In to JobBoard'}
            {mode === 'register' && 'Create Account'}
            {mode === 'password_reset' && 'Reset Password'}
            {mode === 'password_confirm' && 'Confirm Password Reset'}
            {mode === 'password_change' && 'Change Password'}
            {mode === 'resend_email' && 'Resend Email Verification'}
            {mode === 'verify_email' && 'Verify Email Address'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Django REST Auth Security Gateway</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* LOGIN or REGISTER: Username */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Username {mode === 'register' && <span className="text-rose-400">*</span>}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  required={mode === 'register'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. alex_dev"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* First Name & Last Name (REGISTER) */}
          {mode === 'register' && (
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
          )}

          {/* EMAIL */}
          {(mode === 'register' || mode === 'password_reset' || mode === 'resend_email' || (mode === 'login' && !username)) && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required={mode !== 'login'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* PASSWORD */}
          {(mode === 'login' || mode === 'register' || mode === 'password_confirm' || mode === 'password_change') && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Password
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
          )}

          {/* CONFIRM PASSWORD */}
          {(mode === 'register' || mode === 'password_confirm' || mode === 'password_change') && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Confirm Password
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
          )}

          {/* RESET CONFIRM PARAMS (UID & TOKEN) */}
          {mode === 'password_confirm' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">UID</label>
                <input
                  type="text"
                  required
                  value={resetUid}
                  onChange={(e) => setResetUid(e.target.value)}
                  placeholder="UID String"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Reset Token"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* VERIFY EMAIL KEY */}
          {mode === 'verify_email' && (
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
                <span>Submit</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Links Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap gap-2 justify-center">
          {mode === 'login' ? (
            <>
              <span>Need an account?</span>
              <button onClick={() => handleModeSwitch('register')} className="text-sky-400 font-bold hover:underline">
                Register
              </button>
              <span>•</span>
              <button onClick={() => handleModeSwitch('password_reset')} className="text-slate-400 hover:text-white">
                Forgot password?
              </button>
            </>
          ) : mode === 'register' ? (
            <>
              <span>Already registered?</span>
              <button onClick={() => handleModeSwitch('login')} className="text-sky-400 font-bold hover:underline">
                Sign In
              </button>
              <span>•</span>
              <button onClick={() => handleModeSwitch('resend_email')} className="text-slate-400 hover:text-white">
                Resend Verification
              </button>
            </>
          ) : (
            <button onClick={() => handleModeSwitch('login')} className="text-sky-400 font-bold hover:underline">
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
