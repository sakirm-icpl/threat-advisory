import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { githubLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('GitHub authentication failed: ' + errorParam);
          setLoading(false);
          return;
        }

        if (!code) {
          setError('No authorization code received from GitHub');
          setLoading(false);
          return;
        }

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const response = await fetch(apiUrl + '/auth/github/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            code,
            state: searchParams.get('state')
          }),
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
          // Use the GitHub login function from auth hook
          const success = await githubLogin(data.access_token, data.refresh_token);
          
          if (success) {
            // Redirect to dashboard
            navigate('/dashboard');
          } else {
            setError('Failed to complete authentication');
            setLoading(false);
          }
        } else {
          console.error('Auth response error:', data);
          setError(data.error || data.message || 'OAuth callback failed');
          setLoading(false);
        }
      } catch (error) {
        console.error('GitHub callback error:', error);
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const loadingView = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-white mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-3">Authenticating with GitHub</h2>
        <p className="text-blue-200 text-lg">Securely connecting your account...</p>
      </div>
    </div>
  );

  const errorView = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-md w-full p-8 bg-white bg-opacity-10 backdrop-blur-xl rounded-3xl border border-white border-opacity-30 mx-4 shadow-2xl">
        <div className="text-center">
          <div className="bg-red-500 bg-opacity-20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Authentication Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return loadingView;
  if (error) return errorView;
  return null;
}