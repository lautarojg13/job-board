import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileDetailsForm } from '../components/profile/ProfileDetailsForm';
import { ProfilePasswordForm } from '../components/profile/ProfilePasswordForm';

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
      <ProfileHeader user={user} onLogout={logout} />

      {/* Edit Profile Form */}
      <ProfileDetailsForm
        username={username}
        setUsername={setUsername}
        firstName={firstName}
        setFirstName={setFirstName}
        lastName={lastName}
        setLastName={setLastName}
        isUpdating={isUpdating}
        profileMsg={profileMsg}
        profileError={profileError}
        onSubmit={handleProfileSubmit}
      />

      {/* Change Password Form */}
      <ProfilePasswordForm
        newPassword1={newPassword1}
        setNewPassword1={setNewPassword1}
        newPassword2={newPassword2}
        setNewPassword2={setNewPassword2}
        isChangingPass={isChangingPass}
        passMsg={passMsg}
        passError={passError}
        onSubmit={handleChangePassword}
      />
    </div>
  );
};
