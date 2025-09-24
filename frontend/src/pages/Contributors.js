import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  UserGroupIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function Contributors() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchContributors();
  }, [page]);

  const fetchContributors = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/community/contributors?page=${page}&per_page=20`);
      setContributors(response.data.contributors);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContributorLevelColor = (level) => {
    switch (level) {
      case 'Maintainer':
        return 'bg-purple-100 text-purple-800';
      case 'Trusted Contributor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getContributorIcon = (level) => {
    switch (level) {
      case 'Maintainer':
        return '👑';
      case 'Trusted Contributor':
        return '⭐';
      default:
        return '👤';
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">🏆 Community Contributors</h1>
        <p className="text-gray-600 mt-2">
          Meet the amazing people making VersionIntel better every day.
        </p>
      </div>

      {/* Contributors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.id}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            {/* Header with avatar and name */}
            <div className="flex items-center mb-4">
              <div className="relative">
                <img
                  src={contributor.github_avatar_url || '/default-avatar.png'}
                  alt={contributor.display_name}
                  className="h-16 w-16 rounded-full border-2 border-gray-200"
                />
                <span className="absolute -top-1 -right-1 text-lg">
                  {getContributorIcon(contributor.contributor_level)}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {contributor.display_name || contributor.github_username}
                </h3>
                <p className="text-sm text-gray-500">@{contributor.github_username}</p>
                <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${getContributorLevelColor(contributor.contributor_level)}`}>
                  {contributor.contributor_level}
                </span>
              </div>
            </div>

            {/* Bio */}
            {contributor.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {contributor.bio}
              </p>
            )}

            {/* Location and Company */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
              {contributor.location && (
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{contributor.location}</span>
                </div>
              )}
              {contributor.company && (
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  <span>{contributor.company}</span>
                </div>
              )}
              {contributor.website && (
                <div className="flex items-center">
                  <GlobeAltIcon className="h-4 w-4 mr-1" />
                  <a
                    href={contributor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{contributor.reputation_score}</p>
                <p className="text-xs text-gray-500">Reputation</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{contributor.total_contributions}</p>
                <p className="text-xs text-gray-500">Contributions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{contributor.total_upvotes}</p>
                <p className="text-xs text-gray-500">Upvotes</p>
              </div>
            </div>

            {/* Badges */}
            {contributor.badges && contributor.badges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Badges</p>
                <div className="flex flex-wrap gap-1">
                  {contributor.badges.slice(0, 3).map((badge, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                  {contributor.badges.length > 3 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      +{contributor.badges.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {[...Array(Math.min(5, totalPages))].map((_, idx) => {
            const pageNum = Math.max(1, Math.min(totalPages, page - 2 + idx));
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  page === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {contributors.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Contributors Yet</h3>
          <p className="text-gray-500">
            Be the first to contribute to our community!
          </p>
        </div>
      )}
    </div>
  );
}