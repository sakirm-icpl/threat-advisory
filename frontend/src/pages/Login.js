import React, { useState } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);
  const [imagePaths] = useState([
    '/infologo.png',
    './infologo.png', 
    '/static/infologo.png',
    '/public/infologo.png'
  ]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get GitHub OAuth URL from backend
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/auth/github/login`);
      const data = await response.json();
      
      if (data.auth_url) {
        // Redirect to GitHub OAuth
        window.location.href = data.auth_url;
      } else {
        setError('GitHub OAuth not configured');
      }
    } catch (error) {
      setError('Failed to initiate GitHub login');
    } finally {
      setLoading(false);
    }
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
      <div className="relative bg-white/10 backdrop-blur-xl max-w-md w-full p-10 shadow-2xl rounded-3xl border border-white/30 mx-4 glass-effect">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-2xl shadow-lg mb-4 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20"></div>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-2 w-2 h-2 bg-white/30 rounded-full"></div>
              <div className="absolute top-4 right-4 w-1 h-1 bg-white/40 rounded-full"></div>
              <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-white/25 rounded-full"></div>
              <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/35 rounded-full"></div>
            </div>
            
            {/* Logo content - Try to load original Infopercept logo */}
            <div className="relative z-10 flex items-center justify-center">
              {!imageError ? (
                <div className="bg-white rounded-lg p-3 shadow-lg">
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
            Infopercept VersionIntel
          </h2>
          <p className="text-sm text-gray-300 text-center mt-2 font-medium">Version Detection Research Platform</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
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
                className="absolute right-3 top-9 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm font-medium">
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
              className="btn btn-primary w-full flex justify-center items-center text-lg py-3 mt-8"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          {/* GitHub OAuth Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="mt-6 w-full flex justify-center items-center px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Sign in with GitHub
            </button>
          </div>
        <div className="mt-8 text-xs text-gray-400 text-center select-none font-medium">
          &copy; {new Date().getFullYear()} Infopercept. All rights reserved.
        </div>
      </div>
    </div>
  );
} 