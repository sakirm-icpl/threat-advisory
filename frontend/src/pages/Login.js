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
  const [showLegacyForm, setShowLegacyForm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imagePaths] = useState([
    '/infologo.png',
    './infologo.png', 
    '/static/infologo.png',
    '/public/infologo.png'
  ]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const { login, loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  const handleGitHubLogin = () => {
    loginWithGitHub();
  };

  const handleLegacyLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid credentials. Please use GitHub OAuth for authentication.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Floating code elements */}
        <div className="absolute top-20 left-20 text-blue-400/20 font-mono text-sm animate-pulse">
          <div>version: "2.1.4"</div>
          <div>build: 20240115</div>
        </div>
        
        <div className="absolute top-40 right-32 text-indigo-400/20 font-mono text-xs animate-pulse delay-1000">
          <div>HTTP/1.1 200 OK</div>
          <div>Server: nginx/1.18.0</div>
        </div>
        
        <div className="absolute bottom-32 left-16 text-purple-400/20 font-mono text-xs animate-pulse delay-2000">
          <div>regex: /(\d+\.\d+\.\d+)/</div>
          <div>match: true</div>
        </div>
        
        <div className="absolute bottom-20 right-20 text-cyan-400/20 font-mono text-sm animate-pulse delay-500">
          <div>Apache/2.4.41</div>
          <div>OpenSSL/1.1.1</div>
        </div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-500/20 rounded-lg rotate-45 animate-spin-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-indigo-500/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/6 w-16 h-16 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg animate-bounce-slow"></div>
        
        {/* Network connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse"/>
          <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="url(#lineGradient)" strokeWidth="1" className="animate-pulse delay-1000"/>
          <circle cx="15%" cy="25%" r="3" fill="rgb(59, 130, 246)" fillOpacity="0.2" className="animate-ping"/>
          <circle cx="85%" cy="75%" r="2" fill="rgb(147, 51, 234)" fillOpacity="0.2" className="animate-ping delay-500"/>
        </svg>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30"></div>
      </div>
      <div className="relative bg-slate-800/90 backdrop-blur-xl max-w-md w-full p-10 shadow-2xl rounded-3xl border border-slate-700 mx-4 glass-effect">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg mb-4 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-2 w-2 h-2 bg-slate-400/30 rounded-full"></div>
              <div className="absolute top-4 right-4 w-1 h-1 bg-slate-300/40 rounded-full"></div>
              <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-slate-500/25 rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-slate-400/35 rounded-full"></div>
            </div>
            
            {/* Logo content - Try to load original Infopercept logo */}
            <div className="relative z-10 flex items-center justify-center">
              {!imageError ? (
                <div className="bg-slate-800 rounded-lg p-3 shadow-lg border border-slate-700">
                  <img 
                    src={imagePaths[currentPathIndex]}
                    alt="Infopercept Logo" 
                    className="h-12 w-auto object-contain"
                    onError={() => {
                      if (currentPathIndex < imagePaths.length - 1) {
                        // Try next path
                        setCurrentPathIndex(currentPathIndex + 1);
                      } else {
                        // All paths failed, show fallback
                        setImageError(true);
                      }
                    }}
                  />
                </div>
              ) : (
                /* Fallback when original logo fails */
                <div className="text-center">
                  <div className="text-white text-2xl font-bold tracking-wider">
                    INFOPERCEPT
                  </div>
                  <div className="text-white/80 text-xs font-medium mt-1 tracking-widest">
                    VERSION INTEL
                  </div>
                </div>
              )}
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center">
            Sign in to VersionIntel
          </h2>
          <p className="text-sm text-slate-300 text-center mt-2 font-medium">
            Version Detection Research Platform
          </p>
        </div>

        {/* Primary GitHub OAuth Login */}
        <div className="space-y-4">
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-4 px-6 border border-cyber-500/50 text-lg font-medium rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-200 mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Continue with GitHub'
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">or</span>
            </div>
          </div>

          {/* Legacy Login Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowLegacyForm(!showLegacyForm)}
              className="text-cyber-400 hover:text-cyber-300 text-sm font-medium transition-colors duration-200"
            >
              {showLegacyForm ? 'Hide legacy login' : 'Use legacy username/password'}
            </button>
          </div>
        </div>

        {/* Legacy Login Form (Hidden by default) */}
        {showLegacyForm && (
          <div className="mt-6 border-t border-slate-700 pt-6">
            <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-800/50 rounded-md">
              <p className="text-yellow-300 text-sm">
                <strong>⚠️ Legacy Login:</strong> This method is deprecated. Please use GitHub OAuth for secure authentication.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleLegacyLogin} autoComplete="off">
            <div>
              <label htmlFor="username" className="label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="input pr-12"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-9 p-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-800/50 text-red-300 px-4 py-3 rounded-xl text-center text-sm font-medium">
                <div className="flex items-center justify-center">
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center text-lg py-3 mt-8"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-200 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in (Legacy)'
                )}
              </button>
            </form>
          </div>
        )}
        <div className="mt-8 text-xs text-slate-400 text-center select-none font-medium">
          <p className="mb-2">
            By signing in, you agree to collaborate on security research
          </p>
          &copy; {new Date().getFullYear()} Infopercept. All rights reserved.
        </div>
      </div>
    </div>
  );
} 