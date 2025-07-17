import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MagnifyingGlassIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const CVESearch = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search states
  const [vendor, setVendor] = useState('');
  const [product, setProduct] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  
  // Recent CVEs states
  const [recentCves, setRecentCves] = useState([]);
  const [recentDays, setRecentDays] = useState(7);
  
  // Database search states
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [databaseResults, setDatabaseResults] = useState([]);
  
  // Stats states
  const [stats, setStats] = useState(null);
  
  // Daily check state
  const [dailyCheckDone, setDailyCheckDone] = useState(false);
  
 // 'nvd' or 'circl'
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('access_token');
    console.log('CVE Search - Token check:', token ? 'Token present' : 'No token found');
    
    if (!token) {
      setError('No authentication token found. Please log in first.');
      return;
    }
    
    loadVendors();
    loadRecentCves();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedVendorId) {
      loadProducts(selectedVendorId);
    } else {
      setProducts([]);
    }
  }, [selectedVendorId]);

  const loadVendors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const loadProducts = async (vendorId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/products?vendor_id=${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadRecentCves = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/cve/recent?days=${recentDays}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.error) {
        setError(response.data.error);
        setRecentCves([]);
      } else {
        setRecentCves(response.data.results || []);
        setError('');
      }
    } catch (error) {
      console.error('Error loading recent CVEs:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        setError('Recent CVEs endpoint not found. Please check the backend configuration.');
      } else {
        setError(`Failed to load recent CVEs: ${error.response?.data?.detail || error.message}`);
      }
      setRecentCves([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE_URL}/api/cve/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Enhanced vendor/product search using NVD with CPE matching
  const handleVendorProductSearch = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      
      const actualPage = page || currentPage;
      const startIndex = (actualPage - 1) * resultsPerPage;
      
      // Use enhanced NVD vendor/product search with CPE matching
      const response = await axios.get(`${API_BASE_URL}/api/cve/search/vendor-product`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          vendor,
          product,
          limit: resultsPerPage,
          start_index: startIndex
        }
      });
      
      if (response.data.error) {
        setError(response.data.error);
        setSearchResults([]);
        setTotalResults(0);
      } else {
        setSearchResults(response.data.results || []);
        setTotalResults(response.data.total_results || 0);
        setCurrentPage(actualPage);
        setError('');
      }
    } catch (error) {
      console.error('Error searching CVEs:', error);
      setError('Failed to search CVEs. Please try again.');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordSearch = async (page = currentPage) => {
    if (!keyword.trim()) {
      setError('Please enter a keyword to search');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      
      const actualPage = page || currentPage;
      const startIndex = (actualPage - 1) * resultsPerPage;
      
      const response = await axios.get(`${API_BASE_URL}/api/cve/search/keyword`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          keyword,
          limit: resultsPerPage,
          start_index: startIndex
        }
      });

      if (response.data.error) {
        setError(response.data.error);
        setSearchResults([]);
        setTotalResults(0);
      } else {
        setSearchResults(response.data.results || []);
        setTotalResults(response.data.total_results || 0);
        setCurrentPage(actualPage);
        setError('');
      }
    } catch (error) {
      console.error('Error searching CVEs:', error);
      setError('Failed to search CVEs. Please try again.');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      
      // Check if vendor and product are selected
      if (!selectedVendorId || !selectedProductId) {
        setError('Please select both vendor and product');
        return;
      }
      
      // Get vendor and product names from the selected IDs
      const selectedVendor = vendors.find(v => String(v.id) === String(selectedVendorId));
      const selectedProduct = products.find(p => String(p.id) === String(selectedProductId));
      
      if (!selectedVendor || !selectedProduct) {
        setError('Selected vendor or product not found. Please try selecting again.');
        return;
      }
      
      // Use the same NVD vendor/product search endpoint with enhanced CPE matching
      // Always use the same limit logic as Vendor/Product Search
      const limit = resultsPerPage === -1 ? 5000 : resultsPerPage;
      const response = await axios.get(`${API_BASE_URL}/api/cve/search/vendor-product`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          vendor: selectedVendor.name,
          product: selectedProduct.name,
          limit: limit,
          start_index: 0
        }
      });

      if (response.data.error) {
        setError(response.data.error);
        setDatabaseResults([]);
      } else {
        // Format the results to match the expected structure
        const formattedResults = [{
          vendor: selectedVendor.name,
          product: selectedProduct.name,
          cve_results: response.data
        }];
        setDatabaseResults(formattedResults);
        setSuccess(`Found ${response.data.total_results} CVEs for ${selectedVendor.name}/${selectedProduct.name} using NVD Enhanced Search`);
      }
    } catch (error) {
      console.error('Error searching CVEs:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to search CVEs. Please try again.');
      }
      setDatabaseResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Trigger new search with updated page
    if (activeTab === 0 && (vendor || product)) {
      handleVendorProductSearch(newPage);
    } else if (activeTab === 1 && keyword) {
      handleKeywordSearch(newPage);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    setError('');
    setSuccess('');
    // Reset daily check when switching tabs
    if (newValue !== 3) {
      setDailyCheckDone(false);
    }
  };

  const handleCancelSearch = () => {
    setSearchResults([]);
    setTotalResults(0);
    setDatabaseResults([]);
    setError('');
    setSuccess('');
    setVendor('');
    setProduct('');
    setKeyword('');
    setSelectedVendorId('');
    setSelectedProductId('');
    setDailyCheckDone(false);
  };

  const handleDailyCheck = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/api/cve/recent`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          days: 1,
          limit: 50
        }
      });
      
      if (response.data.error) {
        setError(response.data.error);
      } else {
        const recentCves = response.data.results || [];
        const criticalCves = recentCves.filter(cve => 
          cve.severity?.toLowerCase() === 'critical' || 
          (cve.cvss_score && cve.cvss_score >= 9.0)
        );
        
        if (criticalCves.length > 0) {
          setError(`⚠️ DAILY CHECK: Found ${criticalCves.length} critical CVEs in the last 24 hours! Please review immediately.`);
        } else {
          setSuccess(`✅ Daily Check Complete: ${recentCves.length} CVEs published in last 24 hours. No critical vulnerabilities found.`);
        }
        
        setDailyCheckDone(true);
        setRecentCves(recentCves);
        setRecentDays(1);
      }
    } catch (error) {
      console.error('Error in daily check:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        setError('Daily check endpoint not found. Please check the backend configuration.');
      } else {
        setError(`Failed to perform daily check: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { name: 'Vendor/Product Search', icon: MagnifyingGlassIcon },
    { name: 'Keyword Search', icon: MagnifyingGlassIcon },
    { name: 'Database Search', icon: ExclamationTriangleIcon },
    { name: 'Recent CVEs', icon: ChevronDownIcon },
    { name: 'Statistics', icon: InformationCircleIcon }
  ];

  const renderCVEList = (cves, title) => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {title} ({cves.length})
      </h3>
      {cves.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">No CVEs found</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {cves.map((cve, index) => (
            <div key={index} className="bg-white shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-blue-600 mb-2">
                      {cve.cve_id}
                    </h4>
                    <p className="text-gray-600 mb-3">
                      {cve.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(cve.severity)}`}>
                        {cve.severity}
                      </span>
                      {cve.cvss_score > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          CVSS: {cve.cvss_score}
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Published: {formatDate(cve.published_date)}
                      </span>
                    </div>
                    {cve.vendors_products && cve.vendors_products.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Affected: {cve.vendors_products.map(vp => 
                          `${vp.vendor}/${vp.product}`
                        ).join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => window.open(cve.url, '_blank')}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600"
                    title="View on NVD"
                  >
                    <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDatabaseResults = () => (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Database Search Results
      </h3>
      {databaseResults.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <p className="text-sm text-blue-700">No results found</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {databaseResults.map((search, index) => (
            <div key={index} className="bg-white shadow rounded-lg border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    {search.vendor} / {search.product}
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {search.cve_results.total_results} CVEs
                  </span>
                </div>
                {search.cve_results.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-700">{search.cve_results.error}</p>
                  </div>
                ) : (
                  renderCVEList(search.cve_results.results, 'CVEs')
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldExclamationIcon className="h-8 w-8 text-blue-600" />
            CVE Search Tool
          </h1>
          <p className="mt-2 text-gray-600">
            Search for Common Vulnerabilities and Exposures (CVEs) using the National Vulnerability Database
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab, index) => (
                <button
                  key={tab.name}
                  onClick={() => handleTabChange(index)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === index
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Vendor/Product Search Tab */}
            {activeTab === 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Search CVEs by Vendor and Product
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Enhanced NVD Search:</strong> Using CPE (Common Platform Enumeration) matching for comprehensive vendor/product vulnerability coverage.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="e.g., Apache, Microsoft, Oracle"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder="e.g., httpd, Windows, Java"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Results
                    </label>
                    <select
                      value={resultsPerPage}
                      onChange={(e) => setResultsPerPage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={500}>500</option>
                      <option value={1000}>1000</option>
                      <option value={-1}>All</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleVendorProductSearch}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <MagnifyingGlassIcon className="h-4 w-4" />
                      )}
                      Search
                    </button>
                    {(searchResults.length > 0 || vendor || product) && (
                      <button
                        onClick={handleCancelSearch}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-8">
                    {renderCVEList(searchResults, 'Search Results')}
                    {totalResults > resultsPerPage && (
                      <div className="mt-6 flex justify-center">
                        <nav className="flex items-center space-x-2">
                          {/* Previous button */}
                          {currentPage > 1 && (
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              className="px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            >
                              Previous
                            </button>
                          )}
                          
                          {/* Page numbers */}
                          {(() => {
                            const totalPages = Math.ceil(totalResults / resultsPerPage);
                            const maxVisiblePages = 5;
                            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                            
                            if (endPage - startPage + 1 < maxVisiblePages) {
                              startPage = Math.max(1, endPage - maxVisiblePages + 1);
                            }
                            
                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(i);
                            }
                            
                            return pages.map(page => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ));
                          })()}
                          
                          {/* Next button */}
                          {currentPage < Math.ceil(totalResults / resultsPerPage) && (
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              className="px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            >
                              Next
                            </button>
                          )}
                        </nav>
                        
                        {/* Results info */}
                        <div className="mt-4 text-center text-sm text-gray-600">
                          Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
                        </div>
                      </div>
                    )}
                     {searchResults.length > 0 && (
                       <div className="mb-4 text-xs text-gray-500">
                         Showing results from: <span className="font-semibold">NVD (Enhanced CPE Matching)</span>
                       </div>
                     )}
                  </div>
                )}
              </div>
            )}

            {/* Keyword Search Tab */}
            {activeTab === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Search CVEs by Keyword
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Keyword
                    </label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g., log4j, heartbleed, shellshock"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Results
                    </label>
                    <select
                      value={resultsPerPage}
                      onChange={(e) => setResultsPerPage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={500}>500</option>
                      <option value={1000}>1000</option>
                      <option value={-1}>All</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 flex gap-2">
                    <button
                      onClick={handleKeywordSearch}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <MagnifyingGlassIcon className="h-4 w-4" />
                      )}
                      Search
                    </button>
                    {(searchResults.length > 0 || keyword) && (
                      <button
                        onClick={handleCancelSearch}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-8">
                    {renderCVEList(searchResults, 'Search Results')}
                    {totalResults > resultsPerPage && (
                      <div className="mt-6 flex justify-center">
                        <nav className="flex items-center space-x-2">
                          {/* Previous button */}
                          {currentPage > 1 && (
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              className="px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            >
                              Previous
                            </button>
                          )}
                          
                          {/* Page numbers */}
                          {(() => {
                            const totalPages = Math.ceil(totalResults / resultsPerPage);
                            const maxVisiblePages = 5;
                            let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                            
                            if (endPage - startPage + 1 < maxVisiblePages) {
                              startPage = Math.max(1, endPage - maxVisiblePages + 1);
                            }
                            
                            const pages = [];
                            for (let i = startPage; i <= endPage; i++) {
                              pages.push(i);
                            }
                            
                            return pages.map(page => (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            ));
                          })()}
                          
                          {/* Next button */}
                          {currentPage < Math.ceil(totalResults / resultsPerPage) && (
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              className="px-3 py-2 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            >
                              Next
                            </button>
                          )}
                        </nav>
                        
                        {/* Results info */}
                        <div className="mt-4 text-center text-sm text-gray-600">
                          Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, totalResults)} of {totalResults} results
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Database Search Tab */}
            {activeTab === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Search CVEs with Dropdown Selection
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>NVD Enhanced Search:</strong> Select from your vendor/product list to search the National Vulnerability Database with comprehensive CPE matching.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendor
                    </label>
                    <select
                      value={selectedVendorId}
                      onChange={(e) => {
                        setSelectedVendorId(e.target.value);
                        setSelectedProductId(''); // Reset product selection when vendor changes
                        setError(''); // Clear error when user makes a selection
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a Vendor</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setError(''); // Clear error when user makes a selection
                      }}
                      disabled={!selectedVendorId}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select a Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Results
                    </label>
                    <select
                      value={resultsPerPage}
                      onChange={(e) => setResultsPerPage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={500}>500</option>
                      <option value={1000}>1000</option>
                      <option value={-1}>All</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDatabaseSearch}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <MagnifyingGlassIcon className="h-4 w-4" />
                      )}
                      Search NVD
                    </button>
                    {(databaseResults.length > 0 || selectedVendorId || selectedProductId) && (
                      <button
                        onClick={handleCancelSearch}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                {databaseResults.length > 0 && (
                  <div className="mt-8">
                    {renderDatabaseResults()}
                  </div>
                )}
              </div>
            )}

            {/* Recent CVEs Tab */}
            {activeTab === 3 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent CVEs
                  </h3>
                  <div className="flex gap-2 items-center">
                    <select
                      value={recentDays}
                      onChange={(e) => setRecentDays(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>Last 24 hours</option>
                      <option value={7}>Last 7 days</option>
                      <option value={30}>Last 30 days</option>
                      <option value={90}>Last 90 days</option>
                    </select>
                    <button
                      onClick={loadRecentCves}
                      disabled={loading}
                      className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Daily Check Section */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-yellow-800 flex items-center gap-2">
                        <ShieldExclamationIcon className="h-5 w-5" />
                        Daily Security Check
                      </h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Check for critical CVEs published in the last 24 hours
                      </p>
                    </div>
                    <button
                      onClick={handleDailyCheck}
                      disabled={loading || dailyCheckDone}
                      className={`px-4 py-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        dailyCheckDone
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                          Checking...
                        </div>
                      ) : dailyCheckDone ? (
                        <div className="flex items-center gap-2">
                          <CheckIcon className="h-4 w-4" />
                          Checked Today
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ShieldExclamationIcon className="h-4 w-4" />
                          Daily Check
                        </div>
                      )}
                    </button>
                  </div>
                </div>
                
                {renderCVEList(recentCves, 'Recent CVEs')}
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 4 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  CVE Statistics
                </h3>
                {stats ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ShieldExclamationIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Recent CVEs (7 days)</p>
                          <p className="text-2xl font-semibold text-gray-900">{stats.recent_cves_7_days}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200 md:col-span-2">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Severity Distribution</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(stats.severity_distribution).map(([severity, count]) => (
                          <span key={severity} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(severity)}`}>
                            {severity}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg border border-gray-200 md:col-span-3">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Top Affected Vendor/Products</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor/Product</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CVE Count</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {stats.top_vendor_products.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.vendor_product}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">Loading statistics...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVESearch; 