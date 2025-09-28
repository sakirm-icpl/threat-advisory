import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import InviteFriendModal from '../components/InviteFriendModal';
import {
  UsersIcon,
  UserIcon,
  CalendarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Collaborators = () => {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [error, setError] = useState('');
  const [invitesError, setInvitesError] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [activeTab, setActiveTab] = useState('collaborators'); // 'collaborators' or 'invited'
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCollaborators();
    fetchInvitedUsers();
  }, []);

  useEffect(() => {
    // Refetch collaborators when showInactive toggle changes
    fetchCollaborators();
  }, [showInactive]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/auth/collaborators?show_inactive=${showInactive}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setCollaborators(response.data);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      if (error.response?.status === 403) {
        setError('You do not have permission to view collaborators.');
      } else {
        setError('Failed to load collaborators. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitedUsers = async () => {
    try {
      setInvitesLoading(true);
      setInvitesError('');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setInvitesError('No authentication token found. Please log in again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/invites/my-invites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.invites) {
        setInvitedUsers(response.data.invites);
      }
    } catch (error) {
      console.error('Error fetching invited users:', error);
      if (error.response?.status === 403) {
        setInvitesError('You do not have permission to view invitations.');
      } else {
        setInvitesError('Failed to load invitations. Please try again.');
      }
    } finally {
      setInvitesLoading(false);
    }
  };

  const withdrawInvitation = async (inviteId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setInvitesError('No authentication token found. Please log in again.');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/invites/cancel/${inviteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the invited users list
      await fetchInvitedUsers();
    } catch (error) {
      console.error('Error withdrawing invitation:', error);
      setInvitesError('Failed to withdraw invitation. Please try again.');
    }
  };

  const handleInviteModalClose = () => {
    setIsInviteModalOpen(false);
    // Refresh the invited users list when modal closes
    fetchInvitedUsers();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    const isAdmin = role === 'admin';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isAdmin 
          ? 'bg-red-100 text-red-800 border border-red-200' 
          : 'bg-blue-100 text-blue-800 border border-blue-200'
      }`}>
        <ShieldCheckIcon className="h-3 w-3 mr-1" />
        {isAdmin ? 'Administrator' : 'Contributor'}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
        <div className={`w-2 h-2 rounded-full mr-1 ${isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getInviteStatusBadge = (status, isExpired) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon,
        text: isExpired ? 'Expired' : 'Pending'
      },
      accepted: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon,
        text: 'Accepted'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XMarkIcon,
        text: 'Cancelled'
      },
      expired: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: ExclamationTriangleIcon,
        text: 'Expired'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const filteredCollaborators = collaborators.filter(collaborator => 
    showInactive || collaborator.is_active
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-cyber relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative text-center">
          <div className="loading-spinner mx-auto mb-6 h-16 w-16"></div>
          <h3 className="text-2xl font-bold text-gray-100 mb-2">Loading Collaborators</h3>
          <p className="text-gray-400">Fetching team member information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-cyber-600/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
          <div className="absolute inset-0 scan-line"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="glass-effect p-4 rounded-xl border border-cyber-600">
                <UsersIcon className="h-12 w-12 text-red-400" />
              </div>
              <div>
                <h1 className="hero-title text-3xl lg:text-4xl mb-2">
                  <span className="gradient-text">Collaborators</span>
                </h1>
                <p className="hero-subtitle">
                  Team member access denied
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-cyber">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="bg-red-500/20 border border-red-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UsersIcon className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">Access Denied</h3>
              <p className="text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-cyber-600/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="glass-effect p-4 rounded-xl border border-cyber-600">
              <UsersIcon className="h-12 w-12 text-blue-400" />
            </div>
            <div>
              <h1 className="hero-title text-3xl lg:text-4xl mb-2">
                <span className="gradient-text">Collaborators</span>
              </h1>
              <p className="hero-subtitle">
                Team members and their access levels
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              {filteredCollaborators.length} Active Members
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card-cyber">
        <div className="p-6">
          <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('collaborators')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'collaborators'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              <UsersIcon className="h-5 w-5" />
              Team Members ({collaborators.length})
            </button>
            <button
              onClick={() => setActiveTab('invited')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'invited'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
              }`}
            >
              <UserPlusIcon className="h-5 w-5" />
              Invited Users ({invitedUsers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card-cyber">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-100">
                {activeTab === 'collaborators' ? 'Team Members' : 'Invited Users'}
              </h2>
              {activeTab === 'collaborators' && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Show inactive users:</span>
                  <button
                    onClick={() => setShowInactive(!showInactive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      showInactive ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        showInactive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {activeTab === 'collaborators' ? (
                  <>Total: {collaborators.length} | Active: {collaborators.filter(c => c.is_active).length}</>
                ) : (
                  <>Pending: {invitedUsers.filter(i => i.status === 'pending' && !i.is_expired).length} | Total: {invitedUsers.length}</>
                )}
              </div>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="btn-primary flex items-center gap-2 px-4 py-2"
              >
                <UserPlusIcon className="h-4 w-4" />
                Invite Friend
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="card-cyber">
        <div className="p-6">
          {activeTab === 'collaborators' ? (
            // Collaborators Tab
            <>
              {loading ? (
                <div className="text-center py-12">
                  <div className="loading-spinner mx-auto mb-4 h-8 w-8"></div>
                  <p className="text-gray-400">Loading collaborators...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <UsersIcon className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Collaborators</h3>
                  <p className="text-gray-400">{error}</p>
                </div>
              ) : filteredCollaborators.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-500/20 border border-gray-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <UsersIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">No Collaborators Found</h3>
                  <p className="text-gray-400">
                    {showInactive ? 'No users found matching the current filters.' : 'No active collaborators found.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Joined</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCollaborators.map((collaborator) => (
                        <tr key={collaborator.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {collaborator.avatar_url ? (
                                <img 
                                  src={collaborator.avatar_url} 
                                  alt={collaborator.github_username || collaborator.username}
                                  className="h-10 w-10 rounded-lg border border-slate-600"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                  {(collaborator.github_username || collaborator.username || '?').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-200">
                                  {collaborator.github_username || collaborator.username || 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {collaborator.name || 'No name provided'}
                                </div>
                                {collaborator.github_username && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <GlobeAltIcon className="h-3 w-3" />
                                    @{collaborator.github_username}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                              <span className="truncate max-w-xs">{collaborator.email}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {getRoleBadge(collaborator.role)}
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(collaborator.is_active)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              <span>{formatDate(collaborator.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-400">
                              {collaborator.last_login ? formatDate(collaborator.last_login) : 'Never'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            // Invited Users Tab
            <>
              {invitesLoading ? (
                <div className="text-center py-12">
                  <div className="loading-spinner mx-auto mb-4 h-8 w-8"></div>
                  <p className="text-gray-400">Loading invitations...</p>
                </div>
              ) : invitesError ? (
                <div className="text-center py-12">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <UserPlusIcon className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Invitations</h3>
                  <p className="text-gray-400">{invitesError}</p>
                </div>
              ) : invitedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-500/20 border border-gray-500/30 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <UserPlusIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">No Invitations Sent</h3>
                  <p className="text-gray-400">You haven't sent any invitations yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Invited</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Expires</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invitedUsers.map((invite) => (
                        <tr key={invite.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                                {invite.email.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-200">
                                  {invite.email}
                                </div>
                                <div className="text-sm text-gray-400">
                                  Invited User
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {getRoleBadge(invite.role)}
                          </td>
                          <td className="py-4 px-4">
                            {getInviteStatusBadge(invite.status, invite.is_expired)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <CalendarIcon className="h-4 w-4 text-gray-400" />
                              <span>{formatDate(invite.created_at)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {invite.expires_at ? (
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <ClockIcon className="h-4 w-4 text-gray-400" />
                                <span>{formatDate(invite.expires_at)}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No expiry</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {invite.status === 'pending' && !invite.is_expired && (
                              <button
                                onClick={() => withdrawInvitation(invite.id)}
                                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                              >
                                <XMarkIcon className="h-3 w-3" />
                                Withdraw
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTab === 'collaborators' ? (
          <>
            <div className="card-cyber">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 shadow-glow">
                    <UsersIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Total Members</h3>
                    <p className="text-2xl font-bold text-blue-400">{collaborators.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-cyber">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 shadow-glow">
                    <UserIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Active Members</h3>
                    <p className="text-2xl font-bold text-green-400">
                      {collaborators.filter(c => c.is_active).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-cyber">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 shadow-glow">
                    <ShieldCheckIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Administrators</h3>
                    <p className="text-2xl font-bold text-red-400">
                      {collaborators.filter(c => c.role === 'admin').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card-cyber">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3 shadow-glow">
                    <ClockIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Pending Invites</h3>
                    <p className="text-2xl font-bold text-yellow-400">
                      {invitedUsers.filter(i => i.status === 'pending' && !i.is_expired).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-cyber">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 shadow-glow">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Accepted</h3>
                    <p className="text-2xl font-bold text-green-400">
                      {invitedUsers.filter(i => i.status === 'accepted').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-cyber">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 shadow-glow">
                    <UserPlusIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200">Total Sent</h3>
                    <p className="text-2xl font-bold text-purple-400">{invitedUsers.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Invite Friend Modal */}
      <InviteFriendModal 
        isOpen={isInviteModalOpen} 
        onClose={handleInviteModalClose}
        currentUserRole={user?.role || 'contributor'}
      />
    </div>
  );
};

export default Collaborators;
