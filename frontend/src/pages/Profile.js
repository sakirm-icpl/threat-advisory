import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';

export default function Profile() {
  const { user, refreshToken } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [emailMsg, setEmailMsg] = useState('');
  const [pwForm, setPwForm] = useState({ old: '', new1: '', new2: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);

  if (!user) return <div>Loading...</div>;

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailMsg('');
    setEmailLoading(true);
    try {
      await api.put('/auth/me', { email });
      setEmailMsg('Email updated successfully!');
      refreshToken();
    } catch (e) {
      setEmailMsg(e.response?.data?.error || 'Failed to update email');
    }
    setEmailLoading(false);
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (pwForm.new1 !== pwForm.new2) {
      setPwMsg('New passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await api.post('/auth/me/change-password', {
        old_password: pwForm.old,
        new_password: pwForm.new1,
      });
      setPwMsg('Password changed successfully!');
      setPwForm({ old: '', new1: '', new2: '' });
      setTimeout(() => {
        setPwModalOpen(false);
        setPwMsg('');
      }, 1200);
    } catch (e) {
      setPwMsg(e.response?.data?.error || 'Failed to change password');
    }
    setPwLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-slate-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative flex items-center gap-6">
          <div className="glass-effect p-4 rounded-xl border border-slate-600">
            <UserIcon className="h-12 w-12 text-blue-400" />
          </div>
          <div>
            <h1 className="hero-title text-3xl lg:text-4xl mb-2">
              <span className="gradient-text">Security Profile</span>
            </h1>
            <p className="hero-subtitle">
              Manage your cybersecurity analyst profile and credentials
            </p>
          </div>
        </div>
      </div>

      <div className="relative card-cyber p-8 mb-8 flex flex-col sm:flex-row items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.github_username || user.username}
              className="h-20 w-20 rounded-full"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-3xl">
              {(user?.github_username || user?.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-lg font-semibold text-slate-100">{user.github_username || user.username}</div>
          {user.github_id && (
            <div className="text-xs text-blue-400 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              GitHub User
            </div>
          )}
        </div>
        <div className="flex-1 w-full">
          <div className="mb-2 text-slate-200"><span className="font-semibold text-slate-100">Email:</span> {user.email}</div>
          <div className="mb-2 text-slate-200"><span className="font-semibold text-slate-100">Role:</span> {user.role === 'admin' ? 'Security Administrator' : 'Security Analyst'}</div>
          {user.name && <div className="mb-2 text-slate-200"><span className="font-semibold text-slate-100">Full Name:</span> {user.name}</div>}
          <div className="mb-2 text-slate-200"><span className="font-semibold text-slate-100">Created At:</span> {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</div>
          <div className="mb-2 text-slate-200"><span className="font-semibold text-slate-100">Last Login:</span> {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</div>
        </div>
        {/* Only show change password for legacy users */}
        {!user.github_id && (
          <button
            className="absolute top-4 right-4 btn-primary"
            onClick={() => setPwModalOpen(true)}
          >
            Change Password
          </button>
        )}
      </div>
      <div className="card-cyber p-8 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-slate-100">Update Email</h3>
        <form onSubmit={handleEmailUpdate} className="flex flex-col sm:flex-row gap-2 items-end">
          <input
            type="email"
            className="input flex-1"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={emailLoading}>
            {emailLoading ? 'Saving...' : 'Update Email'}
          </button>
        </form>
        {emailMsg && <div className="mt-2 text-sm text-blue-400">{emailMsg}</div>}
      </div>
      <Modal isOpen={pwModalOpen} onClose={() => setPwModalOpen(false)} title="Change Password" customClass="w-[500px]">
        <form onSubmit={handlePwChange} className="space-y-3 p-2">
          <div className="relative">
            <input
              type="password"
              className="input pl-10"
              placeholder="Old password"
              value={pwForm.old}
              onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))}
              required
            />
            <LockClosedIcon className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <input
              type="password"
              className="input pl-10"
              placeholder="New password"
              value={pwForm.new1}
              onChange={e => setPwForm(f => ({ ...f, new1: e.target.value }))}
              required
            />
            <LockClosedIcon className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <input
              type="password"
              className="input pl-10"
              placeholder="Confirm new password"
              value={pwForm.new2}
              onChange={e => setPwForm(f => ({ ...f, new2: e.target.value }))}
              required
            />
            <LockClosedIcon className="h-4 w-4 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={pwLoading}>
            {pwLoading ? 'Saving...' : 'Change Password'}
          </button>
          {pwMsg && <div className={`mt-2 text-sm ${pwMsg.includes('success') ? 'text-green-700' : 'text-red-600'}`}>{pwMsg}</div>}
        </form>
      </Modal>
    </div>
  );
}
