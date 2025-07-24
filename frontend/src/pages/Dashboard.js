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
      name: 'Vendors',
      value: summaryData.vendors ?? 0,
      icon: BuildingOfficeIcon,
      href: '/vendors',
      color: 'bg-blue-500',
    },
    {
      name: 'Products',
      value: summaryData.products ?? 0,
      icon: CubeIcon,
      href: '/products',
      color: 'bg-green-500',
    },
    {
      name: 'Detection Methods',
      value: summaryData.detection_methods ?? 0,
      icon: MagnifyingGlassIcon,
      href: '/methods',
      color: 'bg-purple-500',
    },
    {
      name: 'Setup Guides',
      value: summaryData.setup_guides ?? 0,
      icon: DocumentTextIcon,
      href: '/setup-guides',
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    {
      name: 'Add Vendor',
      href: '/vendors',
      icon: PlusIcon,
      description: 'Create a new vendor',
    },
    {
      name: 'Add Product',
      href: '/products',
      icon: PlusIcon,
      description: 'Add a new product',
    },
    {
      name: 'Add Detection Method',
      href: '/methods',
      icon: PlusIcon,
      description: 'Create detection logic',
    },
    {
      name: 'Search',
      href: '/search',
      icon: MagnifyingGlassIcon,
      description: 'Search across all data',
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
    <div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to VersionIntel - Version Detection Research Platform</p>
      </div>
      {/* Widget Toggles */}
      <div className="flex flex-wrap gap-4 my-4 items-center">
        <span className="font-semibold text-gray-700">Show/Hide Widgets:</span>
        {WIDGETS.map(w => (
          <label key={w.key} className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={widgetPrefs[w.key]}
              onChange={() => handleWidgetToggle(w.key)}
              className="accent-blue-600"
            />
            {w.label}
          </label>
        ))}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="stat-card group"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color} rounded-xl p-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 truncate uppercase tracking-wide">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {/* Products per Vendor Chart */}
      {widgetPrefs.productsPerVendor && (
        <div className="my-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Products per Vendor</h2>
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productsPerVendor} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e40af', color: 'white', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="count" fill="url(#blueGradient)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="count" position="top" />
                </Bar>
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1e40af" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Detection Methods per Product Chart */}
      {widgetPrefs.methodsPerProduct && (
        <div className="my-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detection Methods per Product</h2>
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl border border-orange-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={methodsPerProduct} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ea580c', color: 'white', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="count" fill="url(#orangeGradient)" radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="count" position="top" />
                </Bar>
                <defs>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Setup Guide Coverage Donut Chart */}
      {widgetPrefs.setupGuideCoverage && (
        <div className="my-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Setup Guide Coverage</h2>
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl border border-green-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center">
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
                >
                  {/* Custom colors */}
                  {setupGuideCoverageData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx === 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#065f46', color: 'white', borderRadius: '8px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 flex gap-6">
              <span className="flex items-center bg-green-100 px-3 py-1 rounded-full">
                <span className="inline-block w-3 h-3 rounded-full mr-2 bg-green-500"></span>
                <span className="text-sm font-medium text-green-800">With Setup Guide</span>
              </span>
              <span className="flex items-center bg-red-100 px-3 py-1 rounded-full">
                <span className="inline-block w-3 h-3 rounded-full mr-2 bg-red-500"></span>
                <span className="text-sm font-medium text-red-800">Without Setup Guide</span>
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Recent Trends Line Chart */}
      {widgetPrefs.recentTrends && (
        <div className="my-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Trends (Last 8 Weeks)</h2>
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl border border-purple-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#7c3aed', color: 'white', borderRadius: '8px', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="Products" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="Methods" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }} />
                <Line type="monotone" dataKey="Guides" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* User Registrations Line Chart */}
      {widgetPrefs.userRegistrations && user && user.role === 'admin' && (
        <div className="my-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">User Registrations (Last 8 Weeks)</h2>
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl border border-indigo-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userTrendsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="Users" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="stat-card group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="my-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          {activityLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading recent activity...</p>
            </div>
          ) : activityError ? (
            <div className="text-center py-8">
              <div className="bg-red-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Failed to load recent activity</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No recent activity to display</p>
              <p className="text-sm text-gray-400 mt-2">
                Start by adding vendors, products, or detection methods
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {activities.map((activity, idx) => (
                <li key={idx} className="flex items-center justify-between py-4 px-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-4">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">{activity.type}:</span>{' '}
                      <span className="text-gray-700">{activity.name}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
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