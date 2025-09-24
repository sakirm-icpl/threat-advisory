import React, { useState, useEffect } from 'react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/analytics?days=${dateRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        {analytics && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-blue-600">{analytics.overview.total_users}</p>
                <p className="text-sm text-gray-500 mt-1">
                  +{analytics.overview.recent_users} this period
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Contributions</h3>
                <p className="text-3xl font-bold text-green-600">{analytics.overview.total_contributions}</p>
                <p className="text-sm text-gray-500 mt-1">
                  +{analytics.overview.recent_contributions} this period
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Products</h3>
                <p className="text-3xl font-bold text-purple-600">{analytics.overview.total_products}</p>
                <p className="text-sm text-gray-500 mt-1">{analytics.overview.total_vendors} vendors</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Detection Methods</h3>
                <p className="text-3xl font-bold text-orange-600">{analytics.overview.total_detection_methods}</p>
                <p className="text-sm text-gray-500 mt-1">Active patterns</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Activity Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Activity</h3>
                <div className="h-64 flex items-end justify-between space-x-1">
                  {analytics.daily_activity.map((day, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="flex space-x-1 mb-2">
                        <div
                          className="bg-blue-500 rounded-t"
                          style={{
                            height: `${Math.max(4, (day.contributions / Math.max(...analytics.daily_activity.map(d => d.contributions), 1)) * 200)}px`,
                            width: '8px'
                          }}
                          title={`${day.contributions} contributions`}
                        ></div>
                        <div
                          className="bg-green-500 rounded-t"
                          style={{
                            height: `${Math.max(4, (day.new_users / Math.max(...analytics.daily_activity.map(d => d.new_users), 1)) * 200)}px`,
                            width: '8px'
                          }}
                          title={`${day.new_users} new users`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 transform rotate-45 origin-left">
                        {new Date(day.date).getMonth() + 1}/{new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-4 mt-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                    Contributions
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    New Users
                  </div>
                </div>
              </div>

              {/* Contribution Types */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contribution Types</h3>
                <div className="space-y-4">
                  {analytics.contribution_types.map((type, index) => {
                    const total = analytics.contribution_types.reduce((sum, t) => sum + t.count, 0);
                    const percentage = total > 0 ? (type.count / total) * 100 : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {type.type.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">{type.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Contributors</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Contributor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Reputation</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Contributions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.top_contributors.map((contributor, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img
                              src={contributor.avatar_url || '/default-avatar.png'}
                              alt={contributor.username}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <span className="font-medium text-gray-900">{contributor.username}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-orange-600 font-semibold">
                            {contributor.reputation_score}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-gray-700">{contributor.total_contributions}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}