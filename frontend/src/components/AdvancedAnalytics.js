import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  TrendingUpIcon, 
  TrendingDownIcon, 
  EyeIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdvancedAnalytics({ data, timeRange = '7d' }) {
  const [selectedMetric, setSelectedMetric] = useState('detections');
  const [comparisonData, setComparisonData] = useState(null);

  // Calculate key metrics
  const calculateMetrics = () => {
    if (!data) return {};

    const totalDetections = data.methods?.length || 0;
    const totalProducts = data.products?.length || 0;
    const totalVendors = data.vendors?.length || 0;
    const successRate = data.methods ? 
      (data.methods.filter(m => m.success_rate > 80).length / totalDetections * 100).toFixed(1) : 0;

    // Calculate trends (mock data for now)
    const trends = {
      detections: { value: totalDetections, change: 12.5, direction: 'up' },
      products: { value: totalProducts, change: 8.3, direction: 'up' },
      vendors: { value: totalVendors, change: -2.1, direction: 'down' },
      successRate: { value: successRate, change: 5.7, direction: 'up' }
    };

    return trends;
  };

  const metrics = calculateMetrics();

  // Generate time series data
  const generateTimeSeriesData = () => {
    const days = timeRange === '30d' ? 30 : timeRange === '7d' ? 7 : 1;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        detections: Math.floor(Math.random() * 50) + 20,
        success_rate: Math.floor(Math.random() * 20) + 75,
        new_products: Math.floor(Math.random() * 5) + 1,
        vulnerabilities: Math.floor(Math.random() * 10) + 5
      });
    }
    
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Detection method distribution
  const methodDistribution = data?.methods ? 
    data.methods.reduce((acc, method) => {
      const type = method.method_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) : {};

  const distributionData = Object.entries(methodDistribution).map(([name, value]) => ({
    name,
    value
  }));

  // Top performing products
  const topProducts = data?.products ? 
    data.products
      .map(product => ({
        name: product.name,
        methods: data.methods?.filter(m => m.product_id === product.id).length || 0,
        success_rate: Math.floor(Math.random() * 30) + 70 // Mock success rate
      }))
      .sort((a, b) => b.methods - a.methods)
      .slice(0, 10) : [];

  const MetricCard = ({ title, value, change, direction, icon: Icon }) => (
    <div className="stat-card card-cyber">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {direction === 'up' ? (
          <TrendingUpIcon className="h-4 w-4 text-green-400" />
        ) : (
          <TrendingDownIcon className="h-4 w-4 text-red-400" />
        )}
        <span className={`text-sm font-medium ml-1 ${
          direction === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-slate-500 ml-1">vs last period</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Advanced Analytics</h2>
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-slate-400" />
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-slate-600 rounded-lg px-3 py-2 bg-slate-800 text-slate-200"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Detections"
          value={metrics.detections?.value || 0}
          change={metrics.detections?.change || 0}
          direction={metrics.detections?.direction || 'up'}
          icon={ChartBarIcon}
        />
        <MetricCard
          title="Products Monitored"
          value={metrics.products?.value || 0}
          change={metrics.products?.change || 0}
          direction={metrics.products?.direction || 'up'}
          icon={EyeIcon}
        />
        <MetricCard
          title="Active Vendors"
          value={metrics.vendors?.value || 0}
          change={metrics.vendors?.change || 0}
          direction={metrics.vendors?.direction || 'down'}
          icon={TrendingUpIcon}
        />
        <MetricCard
          title="Success Rate"
          value={`${metrics.successRate?.value || 0}%`}
          change={metrics.successRate?.change || 0}
          direction={metrics.successRate?.direction || 'up'}
          icon={TrendingUpIcon}
        />
      </div>

      {/* Time Series Chart */}
      <div className="card-cyber p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-100">Detection Trends</h3>
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-slate-600 rounded px-3 py-1 bg-slate-800 text-slate-200"
          >
            <option value="detections">Detections</option>
            <option value="success_rate">Success Rate</option>
            <option value="new_products">New Products</option>
            <option value="vulnerabilities">Vulnerabilities</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#e2e8f0'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke="#60a5fa" 
              fill="#60a5fa" 
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method Distribution */}
        <div className="card-cyber p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Detection Method Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performing Products */}
        <div className="card-cyber p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Top Performing Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
              <Bar dataKey="methods" fill="#60a5fa" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="card-cyber">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">Performance Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Methods
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {topProducts.slice(0, 5).map((product, index) => (
                <tr key={index} className="hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-200">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {product.methods}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {product.success_rate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.success_rate > 85 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : product.success_rate > 70
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {product.success_rate > 85 ? 'Excellent' : product.success_rate > 70 ? 'Good' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}