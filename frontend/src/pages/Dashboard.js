import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { endpoints } from '../services/api';
import {
  BuildingOfficeIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PlusIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  EyeIcon,
  CogIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useAuth } from '../hooks/useAuth';

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
}

const WIDGETS = [
  { key: 'productsPerVendor', label: 'Products per Vendor' },
  { key: 'methodsPerProduct', label: 'Detection Methods per Product' },
  { key: 'setupGuideCoverage', label: 'Setup Guide Coverage' },
  { key: 'recentTrends', label: 'Recent Trends' },
  { key: 'userRegistrations', label: 'User Registrations' },
];

function getInitialWidgetPrefs() {
  const saved = localStorage.getItem('dashboardWidgets');
  if (saved) return JSON.parse(saved);
  return Object.fromEntries(WIDGETS.map(w => [w.key, true]));
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary } = useQuery(
    'dashboard-summary',
    endpoints.getDashboardSummary,
    { refetchInterval: 5000 }
  );
  console.log('Dashboard summary:', summary);
  const { data: activityData, isLoading: activityLoading, error: activityError } = useQuery('recent-activity', () => endpoints.getRecentActivity().then(res => res.data));
  const activities = activityData?.activities || [];

  // Fetch vendors and products for the chart
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [methods, setMethods] = useState([]);
  const [users, setUsers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let interval;
    const fetchData = async () => {
      try {
        setFetchError(null);
        const promises = [
          endpoints.getVendors().then(res => res.data),
          endpoints.getProducts().then(res => res.data),
          endpoints.getMethods().then(res => res.data),
          endpoints.getSetupGuides().then(res => res.data)
        ];
        // Only fetch users if admin
        if (user && user.role === 'admin') {
          promises.push(
            endpoints.getUsers()
              .then(res => res.data)
              .catch(err => {
                // If unauthorized, treat as empty users
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                  return [];
                }
                throw err;
              })
          );
        }
        const [v, p, m, g, u] = await Promise.all(promises);
        setVendors(v);
        setProducts(p);
        setMethods(m);
        setGuides(g);
        if (user && user.role === 'admin') {
          setUsers(u);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        setFetchError(error.message || 'Failed to fetch dashboard data');
      }
    };
    fetchData();
    interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Aggregate products per vendor
  const productsPerVendor = vendors.map(vendor => ({
    name: vendor.name,
    count: products.filter(p => p.vendor_id === vendor.id).length
  }));

  // Aggregate detection methods per product
  const methodsPerProduct = products.map(product => ({
    name: product.name,
    count: methods.filter(m => m.product_id === product.id).length
  }));

  // Setup Guide Coverage - Fixed to use guides data instead of assuming products have setup_guides
  const productsWithGuides = products.filter(product => 
    guides.some(guide => guide.product_id === product.id)
  ).length;
  const productsWithoutGuides = products.length - productsWithGuides;
  const setupGuideCoverageData = [
    { name: 'With Setup Guide', value: productsWithGuides },
    { name: 'Without Setup Guide', value: productsWithoutGuides },
  ];

  // Recent Trends: new products, methods, guides per week (last 8 weeks)
  function getWeek(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const week = Math.ceil((((d - new Date(year,0,1)) / 86400000) + new Date(year,0,1).getDay()+1)/7);
    return `${year}-W${week}`;
  }
  const now = new Date();
  const weeks = Array.from({length: 8}, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (7 * (7-i)));
    const year = d.getFullYear();
    const week = Math.ceil((((d - new Date(year,0,1)) / 86400000) + new Date(year,0,1).getDay()+1)/7);
    return `${year}-W${week}`;
  });
  function countByWeek(arr, dateKey) {
    const counts = {};
    arr.forEach(item => {
      if (item && item[dateKey]) {
        const week = getWeek(item[dateKey]);
        if (week) {
          counts[week] = (counts[week] || 0) + 1;
        }
      }
    });
    return counts;
  }
  const productCounts = countByWeek(products, 'created_at');
  const methodCounts = countByWeek(methods, 'created_at');
  const guideCounts = countByWeek(guides, 'created_at');
  const trendsData = weeks.map(week => ({
    week,
    Products: productCounts[week] || 0,
    Methods: methodCounts[week] || 0,
    Guides: guideCounts[week] || 0,
  }));

  // User registrations per week
  const userCounts = countByWeek(users, 'created_at');
  const userTrendsData = weeks.map(week => ({
    week,
    Users: userCounts[week] || 0,
  }));

  const summaryData = summary?.data?.data || {};
  const stats = [
    {
      name: 'Security Vendors',
      value: summaryData.vendors ?? 0,
      icon: BuildingOfficeIcon,
      href: '/vendors',
      color: 'infopercept-secondary',
      description: 'Trusted Partners',
      status: 'Active',
    },
    {
      name: 'Security Products',
      value: summaryData.products ?? 0,
      icon: ShieldCheckIcon,
      href: '/products',
      color: 'security-success',
      description: 'Monitored Solutions',
      status: 'Scanning',
    },
    {
      name: 'Detection Methods',
      value: summaryData.detection_methods ?? 0,
      icon: EyeIcon,
      href: '/methods',
      color: 'matrix-darkGreen',
      description: 'Threat Signatures',
      status: 'Updated',
    },
    {
      name: 'Setup Guides',
      value: summaryData.setup_guides ?? 0,
      icon: DocumentTextIcon,
      href: '/setup-guides',
      color: 'security-info',
      description: 'Implementation Docs',
      status: 'Ready',
    },
  ];

  const quickActions = [
    {
      name: 'Deploy Security Vendor',
      href: '/vendors',
      icon: BuildingOfficeIcon,
      description: 'Onboard cybersecurity partner',
      color: 'infopercept-secondary',
      status: 'Ready',
    },
    {
      name: 'Add Security Product',
      href: '/products',
      icon: ShieldCheckIcon,
      description: 'Register security solution',
      color: 'security-success',
      status: 'Active',
    },
    {
      name: 'Create Detection Rule',
      href: '/methods',
      icon: EyeIcon,
      description: 'Build threat signature',
      color: 'matrix-darkGreen',
      status: 'Updated',
    },
    {
      name: 'Threat Intelligence',
      href: '/search',
      icon: MagnifyingGlassIcon,
      description: 'Search security database',
      color: 'security-info',
      status: 'Online',
    },
  ];

  const [widgetPrefs, setWidgetPrefs] = useState(getInitialWidgetPrefs());
  const handleWidgetToggle = (key) => {
    setWidgetPrefs(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('dashboardWidgets', JSON.stringify(updated));
      return updated;
    });
  };

  // Show error message if there's a fetch error
  if (fetchError) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Dashboard Data Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{fetchError}</p>
                <p className="mt-1">The dashboard will retry automatically in 30 seconds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-cyber-600/30 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src="/Infopercept_idJrlnvSvX_2.svg" 
                alt="Infopercept" 
                className="h-12 w-auto filter brightness-0 invert"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="h-8 w-px bg-white/30"></div>
              <div>
                <h1 className="hero-title text-3xl lg:text-4xl">
                  Welcome back, <span className="gradient-text-security">{user?.github_username || user?.username || 'Analyst'}</span>
                </h1>
              </div>
            </div>
            <p className="hero-subtitle mb-6">
              Advanced cybersecurity research platform for version detection and vulnerability analysis
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-security-success rounded-full animate-pulse"></div>
                System Operational
              </div>
              <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-cyber-400 rounded-full animate-pulse delay-300"></div>
                Real-time Monitoring
              </div>
              <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse delay-600"></div>
                Threat Intelligence Active
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 card-glass flex items-center justify-center border border-cyber-600/30">
              <ChartBarIcon className="h-16 w-16 text-cyber-400" />
            </div>
          </div>
        </div>
      </div>
      {/* Widget Controls */}
      <div className="card-cyber">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <CogIcon className="h-5 w-5 text-cyber-400" />
          <span className="gradient-text">Analytics Configuration</span>
        </h3>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="font-medium text-gray-300">Intelligence Modules:</span>
          {WIDGETS.map(w => (
            <label key={w.key} className="flex items-center gap-2 glass-effect hover:bg-cyber-600/20 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer border border-cyber-600/30">
              <input
                type="checkbox"
                checked={widgetPrefs[w.key]}
                onChange={() => handleWidgetToggle(w.key)}
                className="checkbox"
              />
              <span className="text-sm font-medium text-gray-300">{w.label}</span>
            </label>
          ))}
        </div>
      </div>
      {/* Security Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
          <BoltIcon className="h-8 w-8 text-cyber-400" />
          <span className="gradient-text">Threat Intelligence Dashboard</span>
        </h2>
        <div className="dashboard-grid">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              to={stat.href}
              className="metric-card group hover:scale-105 hover:shadow-cyber-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-${stat.color}/20 border border-${stat.color}/30 rounded-xl p-4 shadow-cyber group-hover:shadow-glow transition-all duration-300`}>
                  <stat.icon className={`h-8 w-8 text-${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="metric-value text-cyber-400">{stat.value}</div>
                  <div className={`status-${stat.status.toLowerCase()} text-xs mt-1`}>{stat.status}</div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-200 group-hover:text-cyber-400 transition-colors duration-200">
                  {stat.name}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{stat.description}</p>
                <div className="w-full bg-dark-700 rounded-full h-2 mt-3">
                  <div 
                    className={`bg-${stat.color} h-2 rounded-full transition-all duration-500 shadow-glow`}
                    style={{ width: `${Math.min(100, (stat.value / 10) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Products per Vendor & Detection Methods per Product - side by side */}
      {(widgetPrefs.productsPerVendor || widgetPrefs.methodsPerProduct) && (
        <div className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetPrefs.productsPerVendor && (
            <div className="card-cyber">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 shadow-glow">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Security Products per Vendor</h2>
                  <p className="text-slate-400 text-sm">Distribution analysis across security vendors</p>
                </div>
              </div>
              <div className="card-glass p-6 border border-slate-600">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productsPerVendor} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '8px', border: '1px solid #475569' }} />
                    <Bar dataKey="count" fill="url(#cyberBlueGradient)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="count" position="top" style={{ fill: '#60a5fa' }} />
                    </Bar>
                    <defs>
                      <linearGradient id="cyberBlueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {widgetPrefs.methodsPerProduct && (
            <div className="card-cyber">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 shadow-glow">
                  <EyeIcon className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Detection Methods per Product</h2>
                  <p className="text-slate-400 text-sm">Threat signature coverage analysis</p>
                </div>
              </div>
              <div className="card-glass p-6 border border-slate-600">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={methodsPerProduct} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '8px', border: '1px solid #475569' }} />
                    <Bar dataKey="count" fill="url(#cyberGreenGradient)" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="count" position="top" style={{ fill: '#4ade80' }} />
                    </Bar>
                    <defs>
                      <linearGradient id="cyberGreenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Setup Guide Coverage Donut Chart */}
      {widgetPrefs.setupGuideCoverage && (
        <div className="my-8 card-cyber">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 shadow-glow">
              <DocumentTextIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Setup Guide Coverage</h2>
              <p className="text-slate-400 text-sm">Implementation guide availability across products</p>
            </div>
          </div>
          <div className="card-glass p-6 border border-slate-600 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={setupGuideCoverageData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelStyle={{ fill: '#e2e8f0', fontSize: '12px' }}
                >
                  {/* Custom colors */}
                  {setupGuideCoverageData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx === 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '8px', border: '1px solid #475569' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 flex gap-6">
              <span className="flex items-center bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-lg">
                <span className="inline-block w-3 h-3 rounded-full mr-2 bg-green-400"></span>
                <span className="text-sm font-medium text-green-300">With Setup Guide</span>
              </span>
              <span className="flex items-center bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-lg">
                <span className="inline-block w-3 h-3 rounded-full mr-2 bg-red-400"></span>
                <span className="text-sm font-medium text-red-300">Without Setup Guide</span>
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Recent Trends & User Registrations - side by side */}
      {(widgetPrefs.recentTrends || (widgetPrefs.userRegistrations && user && user.role === 'admin')) && (
        <div className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgetPrefs.recentTrends && (
            <div className="card-cyber">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 shadow-glow">
                  <ChartBarIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">Recent Trends (Last 8 Weeks)</h2>
                  <p className="text-slate-400 text-sm">Security intelligence growth patterns</p>
                </div>
              </div>
              <div className="card-glass p-6 border border-slate-600">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="week" angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '8px', border: '1px solid #475569' }} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="Products" stroke="#60a5fa" strokeWidth={3} dot={{ fill: '#60a5fa', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="Methods" stroke="#4ade80" strokeWidth={3} dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="Guides" stroke="#a78bfa" strokeWidth={3} dot={{ fill: '#a78bfa', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          {widgetPrefs.userRegistrations && user && user.role === 'admin' && (
            <div className="card-cyber">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-3 shadow-glow">
                  <UserIcon className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">User Registrations (Last 8 Weeks)</h2>
                  <p className="text-slate-400 text-sm">Security analyst onboarding trends</p>
                </div>
              </div>
              <div className="card-glass p-6 border border-slate-600">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userTrendsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="week" angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', color: '#e2e8f0', borderRadius: '8px', border: '1px solid #475569' }} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="Users" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Operations Center */}
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-3">
          <BoltIcon className="h-8 w-8 text-cyber-400" />
          <span className="gradient-text">Security Operations Center</span>
        </h2>
        <div className="dashboard-grid">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="group card-cyber hover:shadow-cyber-lg hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`bg-${action.color}/20 border border-${action.color}/30 rounded-xl p-4 shadow-glow group-hover:shadow-cyber transition-all duration-300 mb-4`}>
                  <action.icon className={`h-8 w-8 text-${action.color}`} />
                </div>
                <h3 className="font-semibold text-gray-200 group-hover:text-cyber-400 transition-colors duration-200 mb-2">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-400 mb-3">{action.description}</p>
                <div className={`status-${action.status.toLowerCase()} mb-4`}>
                  {action.status}
                </div>
                <div className="w-full">
                  <div className="bg-dark-700 hover:bg-cyber-500 rounded-lg px-4 py-2 text-xs font-medium text-gray-400 group-hover:text-white transition-all duration-200 border border-dark-600 group-hover:border-cyber-500">
                    Execute Operation →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="my-8 card-cyber">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-xl p-3 shadow-glow">
            <BoltIcon className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Recent Security Activity</h2>
            <p className="text-slate-400 text-sm">Latest operations and system events</p>
          </div>
        </div>
        <div className="card-glass p-6 border border-slate-600">
          {activityLoading ? (
            <div className="text-center py-8">
              <div className="loading-spinner mx-auto mb-4"></div>
              <p className="text-slate-300">Loading security activity...</p>
            </div>
          ) : activityError ? (
            <div className="text-center py-8">
              <div className="bg-red-500/20 border border-red-500/30 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-400 font-medium">Failed to load security activity</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-600/50 border border-slate-500 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-slate-300 font-medium">No recent security activity</p>
              <p className="text-sm text-slate-500 mt-2">
                Start by deploying vendors, products, or detection methods
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-700">
              {activities.map((activity, idx) => (
                <li key={idx} className="flex items-center justify-between py-4 px-2 hover:bg-slate-700/30 rounded-lg transition-all duration-200">
                  <div className="flex items-center">
                    <div className="bg-cyan-500/20 border border-cyan-500/30 rounded-full p-2 mr-4">
                      <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200">{activity.type}:</span>{' '}
                      <span className="text-slate-300">{activity.name}</span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 bg-slate-700/50 border border-slate-600 px-3 py-1 rounded-full">
                    {formatDate(activity.created_at)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}