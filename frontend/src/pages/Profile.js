import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export default function Profile() {
  const { user, refreshToken } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [emailMsg, setEmailMsg] = useState('');
  const [pwForm, setPwForm] = useState({ old: '', new1: '', new2: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

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
    } catch (e) {
      setPwMsg(e.response?.data?.error || 'Failed to change password');
    }
    setPwLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-8">
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4 text-blue-900">Profile</h2>
        <div className="mb-2"><span className="font-semibold">Username:</span> {user.username}</div>
        <div className="mb-2"><span className="font-semibold">Email:</span> {user.email}</div>
        <div className="mb-2"><span className="font-semibold">Role:</span> {user.role}</div>
        <div className="mb-2"><span className="font-semibold">Created At:</span> {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</div>
        <div className="mb-2"><span className="font-semibold">Last Login:</span> {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</div>
      </div>
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Update Email</h3>
        <form onSubmit={handleEmailUpdate} className="flex gap-2 items-end">
          <input
            type="email"
            className="input-field flex-1"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={emailLoading}>
            {emailLoading ? 'Saving...' : 'Update Email'}
          </button>
        </form>
        {emailMsg && <div className="mt-2 text-sm text-blue-700">{emailMsg}</div>}
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Change Password</h3>
        <form onSubmit={handlePwChange} className="space-y-2">
          <input
            type="password"
            className="input-field"
            placeholder="Old password"
            value={pwForm.old}
            onChange={e => setPwForm(f => ({ ...f, old: e.target.value }))}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="New password"
            value={pwForm.new1}
            onChange={e => setPwForm(f => ({ ...f, new1: e.target.value }))}
            required
          />
          <input
            type="password"
            className="input-field"
            placeholder="Confirm new password"
            value={pwForm.new2}
            onChange={e => setPwForm(f => ({ ...f, new2: e.target.value }))}
            required
          />
          <button type="submit" className="btn-primary" disabled={pwLoading}>
            {pwLoading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
        {pwMsg && <div className="mt-2 text-sm text-blue-700">{pwMsg}</div>}
      </div>
    </div>
  );
}
