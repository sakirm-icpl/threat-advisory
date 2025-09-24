import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function SubmitPattern() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pattern_regex: '',
    sample_text: '',
    product_name: '',
    vendor_name: '',
    technique: '',
    curl_command: '',
    expected_response: '',
    requires_auth: false
  });
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/submit/pattern`);
      const data = await response.json();
      
      if (response.ok) {
        setVendors(data.vendors || []);
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const testRegex = async () => {
    if (!formData.pattern_regex || !formData.sample_text) {
      setError('Please provide both regex pattern and sample text to test');
      return;
    }

    setTesting(true);
    setError('');
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/submit/test-regex`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pattern: formData.pattern_regex,
          text: formData.sample_text
        })
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setError('Error testing regex pattern');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${apiUrl}/submit/pattern`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Pattern submitted successfully! It will be reviewed by the community.');
        setFormData({
          title: '',
          description: '',
          pattern_regex: '',
          sample_text: '',
          product_name: '',
          vendor_name: '',
          technique: '',
          curl_command: '',
          expected_response: '',
          requires_auth: false
        });
        setTestResult(null);
      } else {
        setError(data.error || 'Failed to submit pattern');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit Detection Pattern</h1>
          
          <p className="text-gray-600 mb-8">
            Share your version detection knowledge with the community. Submit patterns that help identify software versions from headers, banners, or responses.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pattern Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Apache HTTP Server Version Detection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detection Technique
                </label>
                <input
                  type="text"
                  name="technique"
                  value={formData.technique}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HTTP Header Analysis, Banner Grabbing"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  name="vendor_name"
                  value={formData.vendor_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Apache Software Foundation"
                  list="vendors-list"
                />
                <datalist id="vendors-list">
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={formData.product_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Apache HTTP Server"
                  list="products-list"
                />
                <datalist id="products-list">
                  {products.map(product => (
                    <option key={product.id} value={product.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this pattern detects and how it works..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Expression Pattern *
              </label>
              <textarea
                name="pattern_regex"
                value={formData.pattern_regex}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Server: Apache/([0-9.]+)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use Python regex syntax. Capture groups will be used to extract version numbers.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Text for Testing *
              </label>
              <textarea
                name="sample_text"
                value={formData.sample_text}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Server: Apache/2.4.41 (Ubuntu)"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Provide real example text that your regex should match against.
                </p>
                <button
                  type="button"
                  onClick={testRegex}
                  disabled={testing}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test Pattern'}
                </button>
              </div>
            </div>

            {testResult && (
              <div className={`p-4 rounded-lg ${
                testResult.valid 
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h4 className="font-medium mb-2">
                  {testResult.valid ? '✅ Pattern Test Results' : '❌ Pattern Test Failed'}
                </h4>
                {testResult.valid ? (
                  <div>
                    <p className="text-sm mb-2">Found {testResult.match_count} matches:</p>
                    <ul className="text-sm font-mono bg-white p-2 rounded border max-h-32 overflow-y-auto">
                      {testResult.matches.map((match, index) => (
                        <li key={index} className="text-green-700">• "{match}"</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-red-700">{testResult.error}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  cURL Command (optional)
                </label>
                <textarea
                  name="curl_command"
                  value={formData.curl_command}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="curl -I http://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Response (optional)
                </label>
                <textarea
                  name="expected_response"
                  value={formData.expected_response}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="HTTP/1.1 200 OK"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="requires_auth"
                checked={formData.requires_auth}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                This detection method requires authentication
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Pattern'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}