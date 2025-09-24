import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  GiftIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function Community() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/community/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching community stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🌟 VersionIntel Community
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Join thousands of security professionals making the internet safer through collaborative vulnerability intelligence.
        </p>
      </div>

      {/* Community Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Contributors</p>
                <p className="text-3xl font-bold">{stats.total_contributors}</p>
              </div>
              <UserGroupIcon className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          <div className="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Contributions</p>
                <p className="text-3xl font-bold">{stats.total_contributions}</p>
              </div>
              <ChatBubbleLeftRightIcon className="h-12 w-12 text-green-200" />
            </div>
          </div>

          <div className="stat-card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold">{stats.approved_contributions}</p>
              </div>
              <HandThumbUpIcon className="h-12 w-12 text-purple-200" />
            </div>
          </div>

          <div className="stat-card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold">{stats.pending_contributions}</p>
              </div>
              <GiftIcon className="h-12 w-12 text-orange-200" />
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/community/contribute"
          className="group bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
              <GiftIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">Submit Contribution</h3>
          </div>
          <p className="text-gray-600">
            Share detection patterns, documentation, or improvements with the community.
          </p>
        </Link>

        <Link
          to="/community/contributors"
          className="group bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-green-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-100 rounded-lg p-3 group-hover:bg-green-200 transition-colors">
              <TrophyIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">Top Contributors</h3>
          </div>
          <p className="text-gray-600">
            Discover our amazing community members and their contributions.
          </p>
        </Link>

        <Link
          to="/community/guidelines"
          className="group bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-purple-300"
        >
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 rounded-lg p-3 group-hover:bg-purple-200 transition-colors">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="ml-4 text-lg font-semibold text-gray-900">Guidelines</h3>
          </div>
          <p className="text-gray-600">
            Learn about our community standards and contribution process.
          </p>
        </Link>
      </div>

      {/* Top Contributors */}
      {stats && stats.top_contributors && stats.top_contributors.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏆 Top Contributors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.top_contributors.slice(0, 6).map((contributor, index) => (
              <div key={contributor.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <img
                  src={contributor.github_avatar_url || '/default-avatar.png'}
                  alt={contributor.display_name}
                  className="h-12 w-12 rounded-full border-2 border-gray-200"
                />
                <div className="ml-4 flex-1">
                  <p className="font-medium text-gray-900">{contributor.display_name}</p>
                  <p className="text-sm text-gray-500">@{contributor.github_username}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {contributor.reputation_score} points
                    </span>
                    {index < 3 && (
                      <span className="ml-2 text-xs">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Contributions */}
      {stats && stats.recent_contributions && stats.recent_contributions.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Recent Contributions</h2>
          <div className="space-y-4">
            {stats.recent_contributions.slice(0, 5).map(contribution => (
              <div key={contribution.id} className="flex items-start p-4 bg-gray-50 rounded-lg">
                <img
                  src={contribution.github_avatar_url || '/default-avatar.png'}
                  alt={contribution.github_username}
                  className="h-10 w-10 rounded-full border border-gray-200"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{contribution.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contribution.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : contribution.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {contribution.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{contribution.description}</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>by @{contribution.github_username}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(contribution.created_at).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <HandThumbUpIcon className="h-3 w-3 mr-1" />
                      {contribution.upvotes || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              to="/community/contributions"
              className="btn btn-secondary"
            >
              View All Contributions
            </Link>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
        <p className="text-xl mb-6 text-blue-100">
          Join our community of security professionals and help make the internet safer.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/community/contribute"
            className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
          >
            Start Contributing
          </Link>
          <Link
            to="/community/guidelines"
            className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}