import React, { useState, useEffect } from 'react';

export default function ApiDocs() {
  const [apiDocs, setApiDocs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiDocs();
  }, []);

  const loadApiDocs = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api`);
      const data = await response.json();
      setApiDocs(data);
    } catch (error) {
      console.error('Error loading API docs:', error);
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {apiDocs && (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{apiDocs.title}</h1>
              <p className="text-gray-600 mb-6">Version {apiDocs.version}</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Base URL</h2>
                <code className="text-blue-700 font-mono">{apiDocs.base_url}</code>
              </div>

              {/* Authentication */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Authentication</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">
                    <strong>Type:</strong> {apiDocs.authentication.type}
                  </p>
                  <p className="text-gray-700 mb-2">{apiDocs.authentication.description}</p>
                  <p className="text-gray-700">
                    <strong>Login Endpoint:</strong> 
                    <code className="ml-2 px-2 py-1 bg-white rounded">
                      POST {apiDocs.authentication.login_endpoint}
                    </code>
                  </p>
                </div>
              </div>

              {/* Endpoints */}
              <div className="space-y-8">
                {apiDocs.endpoints.map((category, index) => (
                  <div key={index}>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                      {category.category}
                    </h2>
                    <div className="space-y-4">
                      {category.endpoints.map((endpoint, endpointIndex) => (
                        <div key={endpointIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium mr-3 ${
                              endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                              endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                              endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-gray-800 font-mono">{endpoint.path}</code>
                            {endpoint.auth_required && (
                              <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                Auth Required
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{endpoint.description}</p>
                          
                          {endpoint.parameters && (
                            <div>
                              <h4 className="font-medium text-gray-800 mb-2">Parameters:</h4>
                              <div className="space-y-2">
                                {endpoint.parameters.map((param, paramIndex) => (
                                  <div key={paramIndex} className="flex items-start space-x-3">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                      {param.name}
                                    </code>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {param.type}
                                    </span>
                                    <span className="text-sm text-gray-600">{param.description}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Example Usage */}
              <div className="mt-12">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Example Usage</h2>
                <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm">
{`// Login and get access token
const loginResponse = await fetch('${apiDocs.base_url}/auth/github/login');
const { auth_url } = await loginResponse.json();

// Search for patterns
const searchResponse = await fetch('${apiDocs.base_url}/search?q=apache&page=1');
const searchResults = await searchResponse.json();

// Submit a pattern (requires authentication)
const token = localStorage.getItem('access_token');
const submitResponse = await fetch('${apiDocs.base_url}/submit/pattern', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    title: 'Apache Version Detection',
    description: 'Detects Apache HTTP Server version from headers',
    pattern_regex: 'Server: Apache/([0-9.]+)',
    sample_text: 'Server: Apache/2.4.41 (Ubuntu)',
    product_name: 'Apache HTTP Server',
    vendor_name: 'Apache Software Foundation'
  })
});`}
                  </pre>
                </div>
              </div>

              {/* Rate Limits */}
              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Rate Limits</h3>
                <p className="text-yellow-700">
                  API requests are limited to 1000 requests per hour per IP address for unauthenticated requests, 
                  and 5000 requests per hour for authenticated users.
                </p>
              </div>

              {/* Response Format */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Response Format</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-2">All API responses are in JSON format:</p>
                  <pre className="text-sm bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
{`// Success Response
{
  "data": { ... },
  "message": "Success"
}

// Error Response  
{
  "error": "Error message",
  "code": 400
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}