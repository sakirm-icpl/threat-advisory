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
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Vendors', href: '/vendors', icon: BuildingOfficeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Detection Methods', href: '/methods', icon: MagnifyingGlassIcon },
  { name: 'Setup Guides', href: '/setup-guides', icon: DocumentTextIcon },
  { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
  { name: 'CVE Search', href: '/cve-search', icon: ShieldExclamationIcon },
  { name: 'Bulk Operations', href: '/bulk', icon: CogIcon },
];

const adminNavigation = [
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'Admin Panel', href: '/admin', icon: ShieldCheckIcon },
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar (slide-in) */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-700 ease-in-out ${sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className={`fixed inset-0 bg-gray-600 transition-opacity duration-700 ease-in-out ${sidebarOpen ? 'bg-opacity-75' : 'bg-opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 flex w-64 flex-col bg-white transform transition-transform duration-700 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Infopercept VersionIntel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            {user?.role === 'admin' && adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar (slide-in) */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col sidebar-bg transform transition-transform duration-700 ease-in-out lg:w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}> 
        <div className="flex flex-col flex-grow">
          <div className="sidebar-header flex items-center justify-between">
            <span>Infopercept VersionIntel</span>
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10"
              aria-label="Toggle sidebar"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item${isActive ? ' active' : ''}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            {user?.role === 'admin' && adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item${isActive ? ' active' : ''}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}>
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 lg:px-8">
          {/* Show opener only when sidebar is closed */}
          {!sidebarOpen && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
          {/* Spacer to push content to the right */}
          <div className="flex-1" />
          {/* User Avatar and Dropdown on far right */}
          <div className="flex items-center gap-x-4 lg:gap-x-6 relative" ref={profileRef}>
            {/* Role Badge */}
            {user?.role && (
              <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                user.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200'
              }`}>
                {user.role === 'admin' ? 'Admin' : 'Contributor'}
              </div>
            )}
            {user?.github_username && (
              <span className="text-base font-medium text-gray-700 mr-2 hidden sm:inline">
                {user.github_username || user.username}
              </span>
            )}
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setProfileOpen((open) => !open)}
            >
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.github_username || user.username}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-lg">
                  {(user?.github_username || user?.username || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            {/* Dropdown menu */}
            {profileOpen && (
              <div className="absolute left-1/2 top-full mt-3 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50 transform -translate-x-1/2 max-h-60 overflow-y-auto">
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 