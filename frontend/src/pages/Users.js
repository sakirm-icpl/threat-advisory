import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { endpoints } from '../services/api';
import {
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

export default function Users() {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordReset, setShowPasswordReset] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    github_username: '',
    username: '',
    email: '',
    password: '',
    role: '', // Default to empty so placeholder is shown
    userType: 'github' // 'github' or 'legacy'
  });
  const [resetPassword, setResetPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const queryClient = useQueryClient();

  // Fetch users
  const { data, isLoading, error } = useQuery('users', endpoints.getUsers);
  // Fix: Extract users array from Axios response
  const users = Array.isArray(data?.data) ? data.data : [];

  // Debug: Log users data
  console.log('Users data from API:', data);
  console.log('Users array for table:', users);

  // Mutations
  const createUserMutation = useMutation(endpoints.createUser, {
    onSuccess: (response) => {
      console.log('User created successfully:', response.data);
      queryClient.invalidateQueries('users');
      setShowAddForm(false);
      setFormData({ username: '', email: '', password: '', role: 'user' });
      setErrors({});
      setSuccessMessage('User created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      console.error('Error creating user:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Failed to create user';
      setErrors({ general: errorMessage });
      setSuccessMessage('');
    },
  });

  const updateUserMutation = useMutation(
    (data) => endpoints.updateUser(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setEditingUser(null);
        setErrors({});
        setSuccessMessage('User updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to update user';
        setErrors({ general: errorMessage });
        setSuccessMessage('');
      },
    }
  );

  const deleteUserMutation = useMutation(endpoints.deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      setSuccessMessage('User deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to delete user';
      setErrors({ general: errorMessage });
      setSuccessMessage('');
    },
  });

  const resetPasswordMutation = useMutation(
    (data) => endpoints.resetUserPassword(data.id, { new_password: data.password }),
    {
      onSuccess: () => {
        setShowPasswordReset(null);
        setResetPassword('');
        setErrors({});
        setSuccessMessage('Password reset successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to reset password';
        setErrors({ password: errorMessage });
        setSuccessMessage('');
      },
    }
  );

  if (!Array.isArray(data) && data && typeof data === 'object' && data.error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-100 text-red-800 rounded shadow">
        <h2 className="text-xl font-bold mb-2">Error loading users</h2>
        <p>{data.error}</p>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.userType === 'github') {
      // GitHub OAuth user validation
      if (!formData.github_username?.trim()) newErrors.github_username = 'GitHub username is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.role) newErrors.role = 'Role is required';
    } else {
      // Legacy user validation
      if (!formData.username?.trim()) newErrors.username = 'Username is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = 'Password must contain at least one special character';
      if (!formData.role) newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    console.log('Submitting user data:', formData);
    createUserMutation.mutate(formData);
  };

  const handleUpdate = (userData) => {
    if (!userData.username.trim()) {
      setErrors({ username: 'Username is required' });
      return;
    }
    updateUserMutation.mutate(userData);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handlePasswordReset = (userId) => {
    if (!resetPassword || resetPassword.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      return;
    }
    resetPasswordMutation.mutate({ id: userId, password: resetPassword });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'contributor': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-slate-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="glass-effect p-4 rounded-xl border border-slate-600">
              <UserGroupIcon className="h-12 w-12 text-blue-400" />
            </div>
            <div>
              <h1 className="hero-title text-3xl lg:text-4xl mb-2">
                <span className="gradient-text">User Management</span>
              </h1>
              <p className="hero-subtitle">
                Manage security analyst accounts, roles, and permissions
              </p>
            </div>
          </div>
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center gap-3 text-lg px-8 py-4"
            >
              <UserPlusIcon className="h-6 w-6" />
              Add Security Analyst
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mt-4 bg-green-900/30 border border-green-800/50 rounded-md p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-300">Success</h3>
              <div className="mt-2 text-sm text-green-400">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-900/30 border border-red-800/50 rounded-md p-4">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-300">Error loading users</h3>
              <div className="mt-2 text-sm text-red-400">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* General Error Display */}
      {errors.general && (
        <div className="mt-4 bg-red-900/30 border border-red-800/50 rounded-md p-4">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-300">Error</h3>
              <div className="mt-2 text-sm text-red-400">{errors.general}</div>
            </div>
          </div>
        </div>
      )}

      {user?.role === 'admin' && showAddForm && (
        <div className="mt-6 card-cyber p-6">
          <h3 className="text-lg font-medium text-slate-100 mb-4">Add New Security Analyst</h3>
          
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="label mb-2">User Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="github"
                  checked={formData.userType === 'github'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-slate-600 bg-slate-800"
                />
                <span className="ml-2 text-sm text-slate-300">GitHub OAuth User (Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="legacy"
                  checked={formData.userType === 'legacy'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-500 border-slate-600 bg-slate-800"
                />
                <span className="ml-2 text-sm text-slate-300">Legacy User (Username/Password)</span>
              </label>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {formData.userType === 'github' ? (
                <>
                  <div>
                    <label className="label">GitHub Username</label>
                    <input
                      type="text"
                      name="github_username"
                      value={formData.github_username}
                      onChange={handleInputChange}
                      className={`input ${errors.github_username ? 'border-red-500' : ''}`}
                      placeholder="Enter GitHub username"
                    />
                    {errors.github_username && <p className="mt-1 text-sm text-red-400">{errors.github_username}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Enter email address"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="label">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`input ${errors.username ? 'border-red-500' : ''}`}
                      placeholder="Enter username"
                    />
                    {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`input ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="Enter email address"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {formData.userType === 'legacy' && (
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`input pr-12 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 focus:outline-none hover:bg-slate-700 rounded transition"
                      style={{ minWidth: 40, height: 44 }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-6 w-6 text-slate-400 hover:text-slate-300 transition" />
                      ) : (
                        <EyeIcon className="h-6 w-6 text-slate-400 hover:text-slate-300 transition" />
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                </div>
              )}
              <div>
                <label className="label">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`input ${errors.role ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="" disabled>Select the role</option>
                  <option value="admin">Admin</option>
                  <option value="contributor">Contributor</option>
                </select>
                {errors.role && <p className="mt-1 text-sm text-red-400">{errors.role}</p>}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ github_username: '', username: '', email: '', password: '', role: '', userType: 'github' });
                  setErrors({});
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createUserMutation.isLoading}
                className="inline-flex justify-center py-2 px-4 border border-cyber-500/50 shadow-sm text-sm font-medium rounded-md text-slate-200 bg-cyber-500/20 hover:bg-cyber-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyber-500 disabled:opacity-50 transition-colors duration-200"
              >
                {createUserMutation.isLoading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((userRow) => (
                      <tr key={userRow.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center border border-slate-500">
                                <span className="text-sm font-medium text-slate-200">
                                  {(userRow.github_username || userRow.username).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-200">
                                {editingUser?.id === userRow.id ? (
                                  <input
                                    type="text"
                                    value={editingUser.github_username || editingUser.username}
                                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                                    className="input"
                                  />
                                ) : (
                                  userRow.github_username || userRow.username
                                )}
                              </div>
                              <div className="text-sm text-slate-400">
                                {editingUser?.id === userRow.id ? (
                                  <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                    className="input"
                                  />
                                ) : (
                                  userRow.email
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser?.id === userRow.id ? (
                            <select
                              value={editingUser.role}
                              onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                              className="input"
                            >
                              <option value="contributor">Contributor</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userRow.role)}`}>
                              {userRow.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingUser?.id === userRow.id ? (
                            <select
                              value={editingUser.is_active ? 'true' : 'false'}
                              onChange={(e) => setEditingUser({...editingUser, is_active: e.target.value === 'true'})}
                              className="input"
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              userRow.is_active ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}>
                              {userRow.is_active ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(userRow.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {user?.role === 'admin' ? (
                            editingUser?.id === userRow.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdate(editingUser)}
                                  className="text-green-400 hover:text-green-300 p-1 rounded hover:bg-green-500/20 transition-colors"
                                >
                                  <CheckIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="text-slate-400 hover:text-slate-300 p-1 rounded hover:bg-slate-500/20 transition-colors"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditingUser(userRow)}
                                  className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/20 transition-colors"
                                >
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => setShowPasswordReset(userRow.id)}
                                  className="text-yellow-400 hover:text-yellow-300 p-1 rounded hover:bg-yellow-500/20 transition-colors"
                                >
                                  <KeyIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(userRow.id)}
                                  className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/20 transition-colors"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            )
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {user?.role === 'admin' && showPasswordReset && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-slate-600 w-96 shadow-lg rounded-md bg-slate-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-slate-100 mb-4">Reset Password</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter new password"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPasswordReset(null);
                    setResetPassword('');
                    setErrors({});
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePasswordReset(showPasswordReset)}
                  className="btn-primary"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 