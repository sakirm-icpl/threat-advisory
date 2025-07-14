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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="card hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Products per Vendor</h2>
          <div className="bg-white rounded-lg border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productsPerVendor} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb">
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Detection Methods per Product Chart */}
      {widgetPrefs.methodsPerProduct && (
        <div className="my-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Detection Methods per Product</h2>
          <div className="bg-white rounded-lg border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={methodsPerProduct} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e42">
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Setup Guide Coverage Donut Chart */}
      {widgetPrefs.setupGuideCoverage && (
        <div className="my-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Setup Guide Coverage</h2>
          <div className="bg-white rounded-lg border p-4 flex flex-col items-center">
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
                    <Cell key={`cell-${idx}`} fill={idx === 0 ? '#34d399' : '#f87171'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex gap-4">
              <span className="flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2" style={{background:'#34d399'}}></span>With Setup Guide</span>
              <span className="flex items-center"><span className="inline-block w-3 h-3 rounded-full mr-2" style={{background:'#f87171'}}></span>Without Setup Guide</span>
            </div>
          </div>
        </div>
      )}
      {/* Recent Trends Line Chart */}
      {widgetPrefs.recentTrends && (
        <div className="my-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Trends (Last 8 Weeks)</h2>
          <div className="bg-white rounded-lg border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Products" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="Methods" stroke="#f59e42" strokeWidth={2} />
                <Line type="monotone" dataKey="Guides" stroke="#34d399" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* User Registrations Line Chart */}
      {widgetPrefs.userRegistrations && user && user.role === 'admin' && (
        <div className="my-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">User Registrations (Last 8 Weeks)</h2>
          <div className="bg-white rounded-lg border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userTrendsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" angle={-20} textAnchor="end" interval={0} height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Users" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                  <action.icon className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">
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
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="card">
          {activityLoading ? (
            <div className="text-center py-8 text-gray-500">Loading recent activity...</div>
          ) : activityError ? (
            <div className="text-center py-8 text-red-500">Failed to load recent activity</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity to display</p>
              <p className="text-sm text-gray-400 mt-2">
                Start by adding vendors, products, or detection methods
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activities.map((activity, idx) => (
                <li key={idx} className="flex items-center justify-between py-4 px-6">
                  <div>
                    <span className="font-medium text-gray-800">{activity.type}:</span>{' '}
                    <span className="text-gray-700">{activity.name}</span>
                  </div>
                  <div className="text-sm text-gray-500">{formatDate(activity.created_at)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}