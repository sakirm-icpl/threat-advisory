import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
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



  const handleGitHubLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get GitHub OAuth URL from backend
      const apiUrl = process.env.REACT_APP_API_URL || 'http://172.17.14.65:8000';
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
          <p className="text-xs text-gray-400 text-center mt-4 max-w-sm">Secure authentication with your GitHub account. Click below to sign in and access the platform.</p>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm font-medium mb-6">
            <div className="flex items-center justify-center">
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        {/* GitHub OAuth Login */}
        <div className="space-y-4">
          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full flex justify-center items-center px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl border border-gray-700 group"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Connecting to GitHub...
              </div>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-lg font-medium">Sign in with GitHub</span>
              </>
            )}
          </button>
          
          {/* Additional Info */}
          <div className="text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              Sign in with your GitHub account to access VersionIntel.<br/>
              Your GitHub account will be used for secure authentication.
            </p>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center select-none font-medium">
          &copy; {new Date().getFullYear()} Infopercept. All rights reserved.
        </div>
      </div>
    </div>
  );
} 