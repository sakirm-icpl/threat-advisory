import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { endpoints } from '../services/api';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [promoteUser, setPromoteUser] = useState('');
  const [promoteRole, setPromoteRole] = useState('admin');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchStats();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await endpoints.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await endpoints.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await endpoints.updateUserRole(userId, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user role');
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      await endpoints.updateUserStatus(userId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await endpoints.deleteUser(userId);
      toast.success('User deactivated');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handlePromoteUser = async (e) => {
    e.preventDefault();
    if (!promoteUser.trim()) {
      toast.error('Please enter a GitHub username');
      return;
    }

    try {
      await endpoints.promoteGitHubUser(promoteUser, promoteRole);
      toast.success(`GitHub user "${promoteUser}" promoted to ${promoteRole}`);
      setPromoteUser('');
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to promote user');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">You need admin privileges to access user management.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage user roles and permissions</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_users}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Users</h3>
            <p className="text-3xl font-bold text-green-600">{stats.active_users}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Admins</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.role_distribution.admin}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Contributors</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.role_distribution.contributor}</p>
          </div>
        </div>
      )}

      {/* Promote User Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Promote GitHub User</h2>
        <form onSubmit={handlePromoteUser} className="flex gap-4">
          <input
            type="text"
            placeholder="GitHub username"
            value={promoteUser}
            onChange={(e) => setPromoteUser(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={promoteRole}
            onChange={(e) => setPromoteRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="admin">Admin</option>
            <option value="contributor">Contributor</option>
            <option value="user">User</option>
          </select>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Promote
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-2">
          User must have logged in at least once via GitHub OAuth before promotion.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">All Users ({users.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((u) => (
                <tr key={u.id} className={!u.is_active ? 'bg-gray-50 opacity-75' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {u.github_avatar_url && (
                        <img 
                          src={u.github_avatar_url} 
                          alt={u.display_name} 
                          className="h-8 w-8 rounded-full mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {u.display_name || u.username}
                        </div>
                        <div className="text-sm text-gray-500">@{u.github_username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      disabled={u.id === user.id} // Prevent self-role change
                    >
                      <option value="user">User</option>
                      <option value="contributor">Contributor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => updateUserStatus(u.id, !u.is_active)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        u.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      disabled={u.id === user.id} // Prevent self-deactivation
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {u.id !== user.id && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Recent Logins */}
      {stats?.recent_logins && stats.recent_logins.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Logins</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {stats.recent_logins.map((login, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="font-medium">{login.display_name || login.github_username}</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      login.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      login.role === 'contributor' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {login.role}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {login.last_login ? new Date(login.last_login).toLocaleString() : 'Never'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
