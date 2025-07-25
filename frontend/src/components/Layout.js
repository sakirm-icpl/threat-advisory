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
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Infopercept VersionIntel</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
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

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col sidebar-bg">
        <div className="flex flex-col flex-grow">
          <div className="sidebar-header">
            Infopercept VersionIntel
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
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 lg:px-8">
          {/* Logo on far left, bigger size */}
          <div className="flex items-center justify-start flex-shrink-0" style={{ minWidth: '72px' }}>
            {/* Empty, logo is now in header above */}
          </div>
          {/* Spacer to push content to the right */}
          <div className="flex-1" />
          {/* User Avatar and Dropdown on far right */}
          <div className="flex items-center gap-x-4 lg:gap-x-6 relative" ref={profileRef}>
            {user?.username && (
              <span className="text-base font-medium text-gray-700 mr-2 hidden sm:inline">{user.username}</span>
            )}
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold text-lg">
                {user?.username ? user.username[0].toUpperCase() : '?'}
              </div>
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