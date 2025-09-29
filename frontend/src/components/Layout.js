import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CogIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldExclamationIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Overview & Analytics' },
  { name: 'Vendors', href: '/vendors', icon: BuildingOfficeIcon, description: 'Vendor Management' },
  { name: 'Products', href: '/products', icon: CubeIcon, description: 'Product Catalog' },
  { name: 'Detection Methods', href: '/methods', icon: MagnifyingGlassIcon, description: 'Security Methods' },
  { name: 'Setup Guides', href: '/setup-guides', icon: DocumentTextIcon, description: 'Implementation Guides' },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon, description: 'Global Search' },
  { name: 'CVE Search', href: '/cve-search', icon: ShieldExclamationIcon, description: 'Vulnerability Database' },
  { name: 'Bulk Operations', href: '/bulk', icon: CogIcon, description: 'Batch Processing' },
];

const adminNavigation = [
  { name: 'Users', href: '/users', icon: UserGroupIcon, description: 'User Management' },
  { name: 'Admin Panel', href: '/admin', icon: ShieldCheckIcon, description: 'System Administration' },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Click-away handler for profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  return (
    <div className="min-h-screen bg-gradient-cyber">
      {/* Mobile sidebar (slide-in) */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-500 ease-in-out ${sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-in-out ${sidebarOpen ? 'bg-opacity-60' : 'bg-opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-80 flex-col sidebar-bg transform transition-transform duration-500 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="sidebar-header">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/green_logo.ico" 
                  alt="Infopercept" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-10 h-10 bg-gradient-to-br from-infopercept-secondary to-cyber-600 rounded-xl flex items-center justify-center shadow-lg hidden">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">VersionIntel</h1>
                <p className="text-xs text-slate-400">Security Intelligence Platform</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-slate-300 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item group ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-4 h-6 w-6 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${isActive ? 'text-infopercept-blue/70' : 'text-slate-500'} group-hover:text-slate-400`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
            {user?.role === 'admin' && (
              <>
                <div className="border-t border-slate-700/50 my-4"></div>
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administration
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`sidebar-item group ${isActive ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-4 h-6 w-6 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${isActive ? 'text-infopercept-blue/70' : 'text-slate-500'} group-hover:text-slate-400`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar (slide-in) */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col sidebar-bg transform transition-transform duration-500 ease-in-out lg:w-80 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}> 
        <div className="flex flex-col flex-grow">
          <div className="sidebar-header">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/green_logo.ico" 
                  alt="Infopercept" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div className="w-10 h-10 bg-gradient-to-br from-infopercept-secondary to-cyber-600 rounded-xl flex items-center justify-center shadow-lg hidden">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Threat Advisory</h1>
                <p className="text-xs text-slate-400">Cybersecurity Research Platform</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-slate-300 hover:text-slate-100 p-2 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item group ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="mr-4 h-6 w-6 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${isActive ? 'text-infopercept-blue/70' : 'text-slate-500'} group-hover:text-slate-400`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
            {user?.role === 'admin' && (
              <>
                <div className="border-t border-slate-700/50 my-6"></div>
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administration
                </div>
                {adminNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`sidebar-item group ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="mr-4 h-6 w-6 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className={`text-xs ${isActive ? 'text-infopercept-blue/70' : 'text-slate-500'} group-hover:text-slate-400`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={sidebarOpen ? 'lg:pl-80' : 'lg:pl-0'}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-4 border-b border-border-primary nav-modern px-6 shadow-cyber sm:gap-x-6 lg:px-8">
          {/* Show opener only when sidebar is closed */}
          {!sidebarOpen && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl p-3 text-slate-400 hover:bg-slate-700 hover:text-infopercept-secondary focus:outline-none transition-all duration-200"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
          
          {/* Breadcrumb or page title */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-100 capitalize">
                {location.pathname.split('/').pop() || 'Dashboard'}
              </h1>
              <div className="status-info">
                SECURE
              </div>
            </div>
          </div>
          
          {/* User Avatar and Dropdown on far right */}
          <div className="flex items-center gap-x-4 lg:gap-x-6 relative" ref={profileRef}>
            {/* Role Badge */}
            {user?.role && (
              <div className={`px-4 py-2 text-xs font-semibold rounded-full border-2 ${
                user.role === 'admin' 
                  ? 'bg-security-critical/10 text-security-critical border-security-critical/30' 
                  : 'bg-infopercept-secondary/10 text-infopercept-secondary border-infopercept-secondary/30'
              }`}>
                {user.role === 'admin' ? 'Administrator' : 'Contributor'}
              </div>
            )}
            
            {user?.github_username && (
              <span className="text-base font-medium text-slate-300 mr-2 hidden sm:inline">
                {user.github_username || user.username}
              </span>
            )}
            
            <button
              className="flex items-center gap-2 focus:outline-none group"
              onClick={() => setProfileOpen((open) => !open)}
            >
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.github_username || user.username}
                  className="h-12 w-12 rounded-2xl border-2 border-border-secondary group-hover:border-infopercept-secondary transition-all duration-200 shadow-md"
                />
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-infopercept-secondary to-cyber-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-200">
                  {(user?.github_username || user?.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            
            {/* Dropdown menu */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 bg-gradient-to-br from-infopercept-secondary to-cyber-600 text-white">
                  <div className="flex items-center gap-3">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={user.github_username || user.username}
                        className="h-10 w-10 rounded-xl"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                        {(user?.github_username || user?.username || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold">{user?.github_username || user?.username}</div>
                      <div className="text-xs text-white/70">{user?.role || 'User'}</div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-xl transition-all duration-200"
                    onClick={() => setProfileOpen(false)}
                  >
                    <UserIcon className="h-5 w-5" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-security-critical/10 hover:text-security-critical rounded-xl transition-all duration-200"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Page content */}
        <main className="section-padding">
          <div className="container-modern">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 