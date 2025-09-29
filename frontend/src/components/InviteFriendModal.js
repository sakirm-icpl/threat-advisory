import React, { useState } from 'react';
import { XMarkIcon, UserPlusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const InviteFriendModal = ({ isOpen, onClose, currentUserRole }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('contributor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    // Check role permissions
    if (role === 'admin' && currentUserRole !== 'admin') {
      setError('Only administrators can invite other administrators');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const endpoint = '/api/invites/send';
      
      // Set a reasonable timeout for the request (10 seconds)
      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        {
          email: email.trim(),
          role: role
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.success) {
        setSuccess('Invitation sent successfully!');
        setEmail('');
        setRole('contributor');
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 2000);
      } else {
        setError(response.data.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setError('Request timed out. Please check your connection and try again.');
      } else if (error.response?.status === 403) {
        if (error.response.data?.error?.includes('admin')) {
          setError('Only administrators can invite other administrators');
        } else {
          setError('You do not have permission to send invitations');
        }
      } else if (error.response?.status === 400) {
        setError(error.response.data.error || 'Invalid request. Please check your input.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to send invitation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setRole('contributor');
      setError('');
      setSuccess('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-cyber max-w-md w-full border border-cyber-600/30 shadow-cyber-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-2 shadow-glow">
              <UserPlusIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Invite Friend</h2>
              <p className="text-slate-400 text-sm">Send invitation to join VersionIntel</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200 transition-colors duration-200 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Field */}
          <div>
            <label className="label flex items-center gap-2">
              <EnvelopeIcon className="h-4 w-4 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter friend's email address"
              className="input w-full"
              disabled={loading}
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input w-full"
              disabled={loading}
            >
              <option value="contributor">Contributor</option>
              <option value="admin" disabled={currentUserRole !== 'admin'}>
                Admin {currentUserRole !== 'admin' ? '(Admin only)' : ''}
              </option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Contributors can read all data and manage their own records. Admins have full access.
              {currentUserRole !== 'admin' && (
                <span className="block text-yellow-400 mt-1">
                  Only administrators can invite other administrators.
                </span>
              )}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert-error">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/20 rounded-full p-2 border border-red-500/30">
                  <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-400">Invitation Error</h3>
                  <p className="text-red-400/80 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="alert-success">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 rounded-full p-2 border border-green-500/30">
                  <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-green-400">Invitation Sent!</h3>
                  <p className="text-green-400/80 text-sm">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="loading-spinner h-4 w-4"></div>
                  Sending...
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteFriendModal;
