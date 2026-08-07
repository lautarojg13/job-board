import React, { useState } from 'react';
import { User, Mail, Shield, Lock, Save, CheckCircle2, AlertCircle, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, logout, isAuthenticated } = useAuth();

  const [username, setUsername] = useState<string>(user?.username || '');
  const [firstName, setFirstName] = useState<string>(user?.first_name || '');
  const [lastName, setLastName] = useState<string>(user?.last_name || '');

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [newPassword1, setNewPassword1] = useState<string>('');
  const [newPassword2, setNewPassword2] = useState<string>('');
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setProfileMsg(null);
    setProfileError(null);

    try {
      await updateProfile({
        username,
        first_name: firstName,
        last_name: lastName
      });
      setProfileMsg('User profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update user profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword1 !== newPassword2) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    setPassMsg(null);
    setPassError(null);

    try {
      const res = await apiService.changePassword({
        new_password1: newPassword1,
        new_password2: newPassword2
      });
      setPassMsg(res.detail || 'Password updated successfully!');
      setNewPassword1('');
      setNewPassword2('');
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4">
        <User className="w-12 h-12 text-slate-600 mx-auto" />
        <h2 className="text-xl font-bold text-white">Not Authenticated</h2>
        <p className="text-xs text-slate-400">Please sign in to view and manage your account details.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-slate-100">
      {/* Account Overview Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold text-xl">
            {user?.first_name?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              {user?.first_name} {user?.last_name} ({user?.username})
            </h1>
            <p className="text-xs text-slate-400 flex items-center mt-0.5">
              <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {user?.email}
              <span className="mx-2">•</span>
              <Shield className="w-3.5 h-3.5 mr-1 text-sky-400" />
              Role: <span className="font-semibold text-sky-300 ml-1">{user?.role || 'USER'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/80 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Edit Profile Form */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <User className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white">Update Personal Details</h2>
        </div>

        {profileMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{profileMsg}</span>
          </div>
        )}

        {profileError && (
          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-2 transition-colors"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
          <Lock className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white">Change Account Password</h2>
        </div>

        {passMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{passMsg}</span>
          </div>
        )}

        {passError && (
          <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword1}
                onChange={(e) => setNewPassword1(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isChangingPass}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-lg flex items-center space-x-2 transition-colors"
            >
              {isChangingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
