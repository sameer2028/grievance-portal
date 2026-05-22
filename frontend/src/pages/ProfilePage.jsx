import { useState, useEffect } from 'react';
import { userApi } from '@/api/userApi';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/ui/Spinner';
import { getInitials, snakeToTitle, formatDate } from '@/utils/helpers';
import { DEPARTMENT_LABELS } from '@/utils/constants';

const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await userApi.getProfile();
        setProfile(data.data.user);
        setProfileForm({ name: data.data.user.name, phone: data.data.user.phone || '' });
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await userApi.updateProfile(profileForm);
      setProfile(data.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const validatePassword = () => {
    const e = {};
    if (!passwordForm.currentPassword) e.currentPassword = 'Required';
    if (passwordForm.newPassword.length < 4) e.newPassword = 'Min 4 characters';
    // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword))
    //   e.newPassword = 'Must include upper, lower, and number';
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length) { setPasswordErrors(errs); return; }
    setPasswordErrors({});
    setSavingPassword(true);
    try {
      await userApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!profile) return null;

  const TABS = [
    { id: 'profile',  label: 'Profile Info' },
    { id: 'password', label: 'Change Password' },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile card */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold shrink-0">
          {getInitials(profile.name)}
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="badge bg-primary-100 text-primary-700 capitalize">
              {snakeToTitle(profile.role)}
            </span>
            {profile.department && (
              <span className="badge bg-gray-100 text-gray-600">
                {DEPARTMENT_LABELS[profile.department] || profile.department}
              </span>
            )}
            <span className="badge bg-gray-100 text-gray-500">
              Joined {formatDate(profile.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <div className="card animate-fade-in">
          <h2 className="font-semibold text-gray-900 mb-5">Personal Information</h2>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="input"
                minLength={2}
                maxLength={80}
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                value={profile.email}
                disabled
                className="input bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="label">Mobile Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  className="input rounded-l-none"
                  maxLength={10}
                  placeholder="10-digit number"
                />
              </div>
            </div>
            {profile.jurisdiction?.length > 0 && (
              <div>
                <label className="label">Jurisdiction</label>
                <p className="text-sm text-gray-600">{profile.jurisdiction.join(', ')}</p>
                <p className="text-xs text-gray-400 mt-1">Contact admin to update jurisdiction.</p>
              </div>
            )}
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <><Spinner size="sm" /> Saving…</> : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <div className="card animate-fade-in">
          <h2 className="font-semibold text-gray-900 mb-5">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }));
                  setPasswordErrors((p) => ({ ...p, currentPassword: '' }));
                }}
                className={`input ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                placeholder="Your current password"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((p) => ({ ...p, newPassword: e.target.value }));
                  setPasswordErrors((p) => ({ ...p, newPassword: '' }));
                }}
                className={`input ${passwordErrors.newPassword ? 'input-error' : ''}`}
                placeholder="Min 4 chars"
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }));
                  setPasswordErrors((p) => ({ ...p, confirmPassword: '' }));
                }}
                className={`input ${passwordErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Re-enter new password"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <button type="submit" disabled={savingPassword} className="btn-primary">
              {savingPassword ? <><Spinner size="sm" /> Updating…</> : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
