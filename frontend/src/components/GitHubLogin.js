import React from 'react';
import { useAuth } from '../hooks/useAuth';

export default function GitHubLogin() {
  const { loginWithGitHub, loading } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-cyber">
      {/* Cybersecurity animated background */}
      <div className="absolute inset-0">
        {/* Matrix-style grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20"></div>
        
        {/* Floating cybersecurity elements */}
        <div className="absolute top-20 left-20 text-cyber-400/30 font-mono text-sm animate-cyber-pulse">
          <div>CVE-2024-0001</div>
          <div>CVSS: 9.8 CRITICAL</div>
          <div>Status: PATCHED</div>
        </div>
        
        <div className="absolute top-40 right-32 text-matrix-green/30 font-mono text-xs animate-pulse delay-1000">
          <div>$ nmap -sV target.com</div>
          <div>22/tcp open ssh OpenSSH 8.9</div>
          <div>80/tcp open http nginx/1.18</div>
        </div>
        
        <div className="absolute bottom-32 left-16 text-cyber-600/30 font-mono text-xs animate-pulse delay-2000">
          <div>regex: /Apache\/(\d+\.\d+\.\d+)/</div>
          <div>match: Apache/2.4.41</div>
          <div>confidence: 95%</div>
        </div>
        
        <div className="absolute bottom-20 right-20 text-security-info/30 font-mono text-sm animate-pulse delay-500">
          <div>Threat Level: LOW</div>
          <div>Last Scan: 2024-01-15</div>
          <div>Vulnerabilities: 0</div>
        </div>
        
        {/* Cybersecurity geometric shapes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyber-500/20 rounded-lg rotate-45 animate-spin-slow"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-matrix-green/20 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/6 w-16 h-16 bg-gradient-to-r from-cyber-500/10 to-security-info/10 rounded-lg animate-bounce-gentle"></div>
        
        {/* Network connection visualization */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2"/>
              <stop offset="50%" stopColor="rgb(6, 182, 212)" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="rgb(0, 255, 65)" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="url(#cyberGradient)" strokeWidth="2" className="animate-pulse"/>
          <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="url(#cyberGradient)" strokeWidth="1" className="animate-pulse delay-1000"/>
          <circle cx="15%" cy="25%" r="4" fill="rgb(59, 130, 246)" fillOpacity="0.3" className="animate-ping"/>
          <circle cx="85%" cy="75%" r="3" fill="rgb(0, 255, 65)" fillOpacity="0.3" className="animate-ping delay-500"/>
          <circle cx="50%" cy="30%" r="2" fill="rgb(6, 182, 212)" fillOpacity="0.4" className="animate-ping delay-1500"/>
        </svg>
        
        {/* Scan line effect */}
        <div className="absolute inset-0 scan-line"></div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-dark-900/60"></div>
      </div>

      <div className="relative card-glass max-w-xl w-full p-12 mx-4 border border-cyber-600/30">
        <div className="flex flex-col items-center mb-10">
          {/* Infopercept Logo Integration */}
          <div className="bg-gradient-to-br from-dark-800 to-dark-900 p-8 rounded-2xl shadow-cyber mb-8 relative overflow-hidden border border-cyber-600/30">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-500/5 to-infopercept-primary/10"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-3 left-3 w-2 h-2 bg-cyber-400/40 rounded-full animate-pulse"></div>
              <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-matrix-green/50 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-4 left-6 w-2 h-2 bg-infopercept-secondary/40 rounded-full animate-pulse delay-700"></div>
              <div className="absolute bottom-3 right-3 w-1.5 h-1.5 bg-cyber-600/50 rounded-full animate-pulse delay-1000"></div>
            </div>
            
            {/* Logo content with actual Infopercept branding */}
            <div className="relative z-10 flex flex-col items-center">
              <img 
                src="/Infopercept_idJrlnvSvX_2.svg" 
                alt="Infopercept Logo" 
                className="h-16 w-auto mb-4 filter brightness-0 invert"
                onError={(e) => {
                  // Fallback to text logo if image fails
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
              <div className="text-center hidden">
                <div className="infopercept-brand text-2xl font-bold tracking-wider">
                  INFOPERCEPT
                </div>
              </div>
              <div className="text-center mt-2">
                <div className="gradient-text text-xl font-bold tracking-wider">
                  VERSION INTEL
                </div>
                <div className="text-xs text-gray-400 mt-2 font-medium">
                  Cybersecurity Research Platform
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="text-center space-y-4">
            <h1 className="hero-title text-4xl font-display">
              <span className="gradient-text">Secure</span> Access Portal
            </h1>
            <p className="text-lg text-gray-300 font-light max-w-md">
              Advanced version detection and vulnerability research platform
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-security-success rounded-full animate-pulse"></div>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyber-400 rounded-full animate-pulse delay-300"></div>
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse delay-600"></div>
                <span>Protected</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* GitHub Login Button */}
          <button
            onClick={loginWithGitHub}
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-4 px-8 bg-gradient-to-r from-dark-800 to-dark-700 border border-cyber-600/50 text-lg font-semibold rounded-lg text-gray-100 hover:from-cyber-600 hover:to-cyber-700 hover:border-cyber-500 focus:outline-none focus:ring-2 focus:ring-cyber-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-cyber hover:shadow-cyber-lg"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            {loading ? (
              <div className="flex items-center">
                <div className="loading-spinner mr-3"></div>
                <span>Authenticating...</span>
              </div>
            ) : (
              <span>Continue with GitHub</span>
            )}
          </button>
          
          {/* Security Information */}
          <div className="text-center">
            <div className="card-glass p-4 border border-cyber-600/30">
              <div className="flex items-center justify-center mb-3">
                <div className="flex items-center gap-2 text-security-success">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-semibold">Enterprise Security</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                OAuth 2.0 secure authentication with GitHub
              </p>
              <p className="text-xs text-gray-500">
                Your credentials are never stored. We only access your public profile for identification.
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="card-glass p-3 border border-cyber-600/20">
              <div className="text-cyber-400 mb-2">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 font-medium">CVE Research</p>
            </div>
            <div className="card-glass p-3 border border-cyber-600/20">
              <div className="text-matrix-green mb-2">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 font-medium">Version Detection</p>
            </div>
            <div className="card-glass p-3 border border-cyber-600/20">
              <div className="text-security-info mb-2">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 font-medium">Threat Intel</p>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-8 space-y-4">
          <p className="text-sm text-gray-400 font-medium">
            By signing in, you agree to collaborate on cybersecurity research and contribute to the open-source security community
          </p>
          
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span>🔒 End-to-End Encrypted</span>
            <span>🛡️ SOC 2 Compliant</span>
            <span>⚡ Real-time Updates</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs text-gray-500">Powered by</span>
            <span className="infopercept-brand text-sm">Infopercept</span>
          </div>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Infopercept Consulting Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}