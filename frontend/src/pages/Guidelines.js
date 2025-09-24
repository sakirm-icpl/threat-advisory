import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  CheckBadgeIcon,
  InformationCircleIcon,
  HandThumbUpIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function Guidelines() {
  const [guidelines, setGuidelines] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuidelines = async () => {
      try {
        const response = await api.get('/community/guidelines');
        setGuidelines(response.data);
      } catch (error) {
        console.error('Error fetching guidelines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuidelines();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📋 Community Guidelines
        </h1>
        <p className="text-xl text-gray-600">
          Our shared values and standards for building a thriving security community
        </p>
      </div>

      {/* Quick Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start">
          <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">TL;DR</h3>
            <p className="text-blue-800">
              Be respectful, contribute quality content, help others learn, and follow responsible disclosure practices. 
              We're all here to make the internet safer together! 🛡️
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines Sections */}
      {guidelines && guidelines.sections && (
        <div className="space-y-6">
          {guidelines.sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="bg-green-100 rounded-lg p-2">
                    <CheckBadgeIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {section.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contribution Guidelines */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <HandThumbUpIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Contribution Best Practices</h3>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Test your detection patterns thoroughly before submitting</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Include clear examples and sample outputs</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Write descriptive titles and detailed descriptions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Reference sources and credit original research</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Update contributions based on community feedback</span>
            </li>
          </ul>
        </div>

        {/* Community Interaction */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Community Interaction</h3>
          </div>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Provide constructive feedback in reviews</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Help newcomers learn and improve</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Acknowledge others' work and contributions</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Share knowledge and explain your expertise</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 mt-1">✓</span>
              <span>Celebrate community successes and milestones</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Contributor Levels */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">🏆 Contributor Recognition Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-4xl mb-2">👤</div>
            <h4 className="font-semibold text-blue-900 mb-2">Community Member</h4>
            <p className="text-sm text-blue-700">
              New contributors joining our community. Everyone starts here!
            </p>
            <div className="mt-3 text-xs text-blue-600">
              Requirements: Join the community
            </div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-4xl mb-2">⭐</div>
            <h4 className="font-semibold text-green-900 mb-2">Trusted Contributor</h4>
            <p className="text-sm text-green-700">
              Experienced contributors with quality submissions and peer review privileges.
            </p>
            <div className="mt-3 text-xs text-green-600">
              Requirements: 20+ approved contributions
            </div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-4xl mb-2">👑</div>
            <h4 className="font-semibold text-purple-900 mb-2">Maintainer</h4>
            <p className="text-sm text-purple-700">
              Core team members with merge permissions and project governance rights.
            </p>
            <div className="mt-3 text-xs text-purple-600">
              Requirements: 100+ contributions + community trust
            </div>
          </div>
        </div>
      </div>

      {/* Contact and Support */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help or Have Questions?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📧 Platform Support</h4>
            <p className="text-sm text-gray-600">
              Use the in-platform help system for technical questions and assistance.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🛡️ Security Issues</h4>
            <p className="text-sm text-gray-600">
              Report security vulnerabilities through our responsible disclosure process.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Contribute?</h3>
        <p className="text-blue-100 mb-6">
          Join our community and help make cybersecurity tools more accessible to everyone.
        </p>
        <div className="space-x-4">
          <button className="btn bg-white text-blue-600 hover:bg-gray-100 font-semibold px-6 py-3">
            Start Contributing
          </button>
          <button className="btn border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-6 py-3">
            Browse Contributions
          </button>
        </div>
      </div>
    </div>
  );
}