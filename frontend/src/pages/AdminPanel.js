import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '../services/api';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  UserIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const { user } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const queryClient = useQueryClient();

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin access required');
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery(
    'admin-users',
    () => api.get('/auth/users').then(res => res.data),
    { enabled: user?.role === 'admin' }
  );

  // Promote user mutation
  const promoteUserMutation = useMutation(
    (userId) => api.post(`/auth/users/${userId}/promote`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User promoted to admin successfully!');
        setShowConfirmDialog(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to promote user');
        setShowConfirmDialog(null);
      }
    }
  );

  // Demote user mutation
  const demoteUserMutation = useMutation(
    (userId) => api.post(`/auth/users/${userId}/demote`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users');
        toast.success('User demoted to contributor successfully!');
        setShowConfirmDialog(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to demote user');
        setShowConfirmDialog(null);
      }
    }
  );

  const handlePromoteUser = (targetUser) => {
    setShowConfirmDialog({
      type: 'promote',
      user: targetUser,
      title: 'Promote to Admin',
      message: `Are you sure you want to promote ${targetUser.github_username || targetUser.username} to admin? This will give them full system access.`,
      confirmText: 'Promote',
      action: () => promoteUserMutation.mutate(targetUser.id)
    });
  };

  const handleDemoteUser = (targetUser) => {
    setShowConfirmDialog({
      type: 'demote',
      user: targetUser,
      title: 'Demote to Contributor',
      message: `Are you sure you want to demote ${targetUser.github_username || targetUser.username} to contributor? They will lose admin privileges.`,
      confirmText: 'Demote',
      action: () => demoteUserMutation.mutate(targetUser.id)
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'contributor': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ShieldCheckIcon className="h-8 w-8 mr-3 text-red-600" />
          Admin Panel
        </h1>
        <p className="mt-2 text-gray-600">
          Manage users and roles in the RBAC system
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            User Management
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Promote contributors to admin or demote admins to contributors
          </p>
        </div>
        
        {usersLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersData?.map((userRow) => (
                  <tr key={userRow.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {userRow.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={userRow.avatar_url}
                              alt={userRow.github_username || userRow.username}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {userRow.github_username || userRow.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {userRow.email}
                          </div>
                          {userRow.github_id && (
                            <div className="text-xs text-blue-600 flex items-center mt-1">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                              </svg>
                              GitHub
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(userRow.role)}`}>
                        {userRow.role === 'admin' ? 'Admin' : 'Contributor'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userRow.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {userRow.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userRow.last_login 
                        ? new Date(userRow.last_login).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {userRow.id !== user.id ? (
                        <div className="flex justify-end space-x-2">
                          {userRow.role === 'contributor' ? (
                            <button
                              onClick={() => handlePromoteUser(userRow)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                            >
                              <ChevronUpIcon className="h-3 w-3 mr-1" />
                              Promote
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDemoteUser(userRow)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                            >
                              <ChevronDownIcon className="h-3 w-3 mr-1" />
                              Demote
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${showConfirmDialog.type === 'promote' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {showConfirmDialog.type === 'promote' ? (
                    <ChevronUpIcon className="h-6 w-6" />
                  ) : (
                    <ChevronDownIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {showConfirmDialog.title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {showConfirmDialog.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showConfirmDialog.action}
                  className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    showConfirmDialog.type === 'promote'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                  }`}
                >
                  {showConfirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}