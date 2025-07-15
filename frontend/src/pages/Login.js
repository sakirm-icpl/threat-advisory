import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid username or password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="card max-w-md w-full p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <img src="/infologo.png" alt="Infopercept Logo" className="h-16 w-auto object-contain mb-2" />
          <h2 className="text-2xl font-bold text-gray-900 text-center">Infopercept VersionIntel</h2>
          <p className="text-sm text-gray-500 text-center mt-1">Infopercept Version Detection Research Platform</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <div>
            <label htmlFor="username" className="label-text mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="input input-bordered"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="label-text mb-1">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              className="input input-bordered pr-10"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
          {error && (
            <div className="alert alert-warning text-center text-sm mb-2">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex justify-center items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        <div className="mt-8 text-xs text-gray-400 text-center select-none">
          &copy; {new Date().getFullYear()} Infopercept. All rights reserved.
        </div>
      </div>
    </div>
  );
} 