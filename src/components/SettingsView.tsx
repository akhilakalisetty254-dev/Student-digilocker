import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Shield, 
  KeyRound, 
  Clock, 
  HardDrive, 
  AlertTriangle, 
  Check, 
  Save, 
  LogOut, 
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { UserProfile, LockerDocument } from '../types';
import { StorageService, formatBytes } from '../services/storageService';

interface SettingsViewProps {
  currentUser: UserProfile;
  documents: LockerDocument[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  documents,
  onUpdateUser,
  onLogout,
  onShowToast
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'storage' | 'danger'>('profile');

  // Profile form state
  const [name, setName] = useState(currentUser.name);
  const [college, setCollege] = useState(currentUser.college);
  const [major, setMajor] = useState(currentUser.major);
  const [graduationYear, setGraduationYear] = useState(currentUser.graduationYear || '2026');

  // PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Security question state
  const [secQuestion, setSecQuestion] = useState(currentUser.securityQuestion || "What is your primary school's name?");
  const [secAnswer, setSecAnswer] = useState('');

  const stats = StorageService.getStorageStats();
  const activeSession = StorageService.getActiveSession();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('error', 'Profile Update Error', 'Full Name cannot be empty.');
      return;
    }

    const updated = StorageService.updateUserProfile({
      name: name.trim(),
      college: college.trim(),
      major: major.trim(),
      graduationYear
    });

    if (updated) {
      onUpdateUser(updated);
      onShowToast('success', 'Profile Updated', 'Your student credentials have been saved.');
    }
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPin !== currentUser.pin) {
      onShowToast('error', 'PIN Update Failed', 'Current security PIN is incorrect.');
      return;
    }
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      onShowToast('error', 'PIN Update Failed', 'New PIN must be exactly 4 digits.');
      return;
    }
    if (newPin !== confirmPin) {
      onShowToast('error', 'PIN Update Failed', 'New PIN and confirmation do not match.');
      return;
    }

    const updated = StorageService.updateUserProfile({ pin: newPin });
    if (updated) {
      onUpdateUser(updated);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      onShowToast('success', 'Security PIN Changed', 'Your new 4-digit PIN is now active.');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.isDemo) {
      onShowToast('warning', 'Demo Mode', 'Password change is disabled in demo mode.');
      return;
    }

    if (currentUser.password && oldPassword !== currentUser.password) {
      onShowToast('error', 'Password Error', 'Current password does not match.');
      return;
    }

    if (newPassword.length < 8) {
      onShowToast('error', 'Password Error', 'New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      onShowToast('error', 'Password Error', 'New password and confirmation do not match.');
      return;
    }

    const updated = StorageService.updateUserProfile({ password: newPassword });
    if (updated) {
      onUpdateUser(updated);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('success', 'Password Updated', 'Your login password has been changed.');
    }
  };

  const handleUpdateSecurityQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secAnswer.trim()) {
      onShowToast('error', 'Security Question', 'Security answer cannot be blank.');
      return;
    }

    const updated = StorageService.updateUserProfile({
      securityQuestion: secQuestion,
      securityAnswer: secAnswer.trim()
    });

    if (updated) {
      onUpdateUser(updated);
      setSecAnswer('');
      onShowToast('success', 'Recovery Hint Updated', 'Your security question and answer are updated.');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Settings className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              Locker Settings & Security
              {currentUser.isDemo && (
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                  Demo Account
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your student profile, 4-digit PIN, authentication keys, and active session boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel max-w-fit overflow-x-auto">
        {[
          { id: 'profile', label: 'Student Profile', icon: User },
          { id: 'security', label: 'Security & PIN', icon: Lock },
          { id: 'storage', label: 'Storage & Session', icon: HardDrive },
          { id: 'danger', label: 'Account Actions', icon: AlertTriangle }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. STUDENT PROFILE */}
      {activeSection === 'profile' && (
        <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Student Identification
            </h2>
            <p className="text-xs text-slate-500">
              Personalized details stamped on generated manifest bundles and credentials.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University Email Address (Read-Only)
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  University / College
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Degree / Major
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Graduation Year
              </label>
              <input
                type="text"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </form>
        </div>
      )}

      {/* 2. SECURITY & PIN */}
      {activeSection === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change PIN Card */}
          <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                Change 4-Digit Security PIN
              </h2>
              <p className="text-xs text-slate-500">
                Required to reveal sensitive credentials in your Personal Info Vault.
              </p>
            </div>

            <form onSubmit={handleUpdatePin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current PIN (Demo: 1234)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm font-mono text-center tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm font-mono text-center tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm font-mono text-center tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Update Security PIN
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-500" />
                Change Master Password
              </h2>
              <p className="text-xs text-slate-500">
                Update the primary master password used to authenticate on this device.
              </p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-600/25 transition-all cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Recovery Question & Answer Card */}
          <div className="md:col-span-2 p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-500" />
                PIN & Account Recovery Question
              </h2>
              <p className="text-xs text-slate-500">
                Used to restore access if you forget your 4-digit PIN.
              </p>
            </div>

            <form onSubmit={handleUpdateSecurityQuestion} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Security Question
                </label>
                <input
                  type="text"
                  value={secQuestion}
                  onChange={(e) => setSecQuestion(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Security Answer
                </label>
                <input
                  type="text"
                  value={secAnswer}
                  onChange={(e) => setSecAnswer(e.target.value)}
                  placeholder="Enter secret answer"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  Save Recovery Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. STORAGE & ACTIVE SESSION */}
      {activeSection === 'storage' && (
        <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Locker Storage & Session Lifecycle
            </h2>
            <p className="text-xs text-slate-500">
              Overview of storage consumption, quotas, and active session boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Total Storage Used</span>
              <p className="text-xl font-bold font-heading text-slate-900 dark:text-white tabular-nums mt-1">
                {stats.formattedUsed}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Capacity: {stats.formattedLimit}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Inactivity Timeout</span>
              <p className="text-xl font-bold font-heading text-indigo-600 dark:text-indigo-400 mt-1">
                30 Minutes
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Auto-logout enabled</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Remember Me Setting</span>
              <p className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
                {activeSession?.rememberMe ? 'Persistent (Device)' : 'Session-Only'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeSession?.rememberMe ? 'Stored in localStorage' : 'Cleared on tab close'}
              </p>
            </div>
          </div>

          {/* Session Token Info */}
          {activeSession && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Active Session Token</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{activeSession.token.slice(0, 16)}••••</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Session Started</span>
                <span className="text-slate-800 dark:text-slate-200">{new Date(activeSession.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>Last Active Interaction</span>
                <span className="text-slate-800 dark:text-slate-200">{new Date(activeSession.lastActivity).toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. DANGER ZONE */}
      {activeSection === 'danger' && (
        <div className="p-6 rounded-3xl glass-card border border-rose-200 dark:border-rose-900/40 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold font-heading text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Account & Session Actions
            </h2>
            <p className="text-xs text-slate-500">
              Irreversible actions related to your session and personal locker.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Sign Out of Locker</p>
                <p className="text-[11px] text-slate-500">Clears your session token and cached documents.</p>
              </div>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Sign Out Now
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-rose-700 dark:text-rose-300">Purge Recycle Bin</p>
                <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">Permanently delete all soft-deleted files right now.</p>
              </div>
              <button
                onClick={() => {
                  if (confirm('Permanently purge all items currently in your Recycle Bin?')) {
                    StorageService.emptyRecycleBin();
                    onShowToast('info', 'Recycle Bin Emptied');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Purge Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
