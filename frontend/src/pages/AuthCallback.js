import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGitHubCallback } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setError('GitHub authentication was cancelled or failed');
      return;
    }

    if (!code) {
      setError('Invalid authentication response');
      return;
    }

    if (!state) {
      setError('Missing state parameter - security validation failed');
      return;
    }

    // Handle GitHub callback
    handleGitHubCallback(code, state)
      .then((result) => {
        if (result.success) {
          navigate('/dashboard', { replace: true });
        } else {
          setError(result.error);
        }
      })
      .catch(() => {
        setError('Authentication failed. Please try again.');
      });
  }, [searchParams, handleGitHubCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="max-w-md w-full space-y-8 text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/30 mx-4">
          <div className="flex justify-center">
            <svg className="h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Authentication Error</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/30">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Completing authentication...
        </h2>
        <p className="text-gray-300">
          Please wait while we verify your GitHub account
        </p>
      </div>
    </div>
  );
}