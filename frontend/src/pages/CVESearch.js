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
  CheckIcon,
  BuildingOfficeIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

const CVESearch = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search states
  const [unifiedQuery, setUnifiedQuery] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  const [searchType, setSearchType] = useState('');
  
  // Recent CVEs states
  const [recentCves, setRecentCves] = useState([]);
  const [recentDays, setRecentDays] = useState(7);
  const [recentTotal, setRecentTotal] = useState(0);
  const [recentPage, setRecentPage] = useState(1);
  const [recentPerPage, setRecentPerPage] = useState(10);
  
  // Database search states
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [databaseResults, setDatabaseResults] = useState([]);
  
  // Stats states
  const [stats, setStats] = useState(null);
  // AI remediation states
  const [aiCveId, setAiCveId] = useState('');
  const [aiResult, setAiResult] = useState(null);
  
  // Daily check state
  const [dailyCheckDone, setDailyCheckDone] = useState(false);
  
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

  // Handle results per page changes
  useEffect(() => {
    // If we have search results and the user changes results per page, trigger a new search
    if (searchResults.length > 0 && (unifiedQuery || keyword)) {
      setCurrentPage(1); // Reset to first page
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        if (activeTab === 0 && unifiedQuery) {
          handleUnifiedSearch(1);
        } else if (activeTab === 1 && keyword) {
          handleKeywordSearch(1);
        }
      }, 0);
    }
  }, [resultsPerPage]);

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
      const response = await axios.get(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { vendor_id: vendorId }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadRecentCves = async (daysParam = recentDays, pageParam = recentPage, perPageParam = recentPerPage) => {
    try {
      const token = localStorage.getItem('access_token');
      const startIndex = ((pageParam || 1) - 1) * (perPageParam || 10);
      const response = await axios.get(`${API_BASE_URL}/api/cve/recent`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { days: daysParam, limit: perPageParam, start_index: startIndex }
      });
      const items = response.data.results || [];
      items.sort((a, b) => new Date(b.published_date || b.last_modified_date || 0) - new Date(a.published_date || a.last_modified_date || 0));
      setRecentCves(items);
      setRecentTotal(response.data.total_results || (response.data.results || []).length);
    } catch (error) {
      console.error('Error loading recent CVEs:', error);
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
      console.error('Error loading CVE stats:', error);
    }
  };

  // Enhanced unified search using NVD with intelligent query detection
  const handleUnifiedSearch = async (page = currentPage) => {
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
      
      // Use unified search endpoint
      const response = await axios.get(`${API_BASE_URL}/api/cve/search/unified`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          query: unifiedQuery,
          limit: resultsPerPage,
          start_index: startIndex
        }
      });
      
      if (response.data.error) {
        setError(response.data.error);
        setSearchResults([]);
        setTotalResults(0);
        setSearchType('');
      } else {
        setSearchResults(response.data.results || []);
        setTotalResults(response.data.total_results || 0);
        setCurrentPage(actualPage);
        setSearchType(response.data.search_type || '');
        setError('');
      }
    } catch (error) {
      console.error('Error searching CVEs:', error);
      setError('Failed to search CVEs. Please try again.');
      setSearchResults([]);
      setTotalResults(0);
      setSearchType('');
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
      if (!selectedVendorId) {
        setError('Please select a vendor');
        setLoading(false);
        return;
      }

      const selectedVendor = vendors.find(v => v.id === parseInt(selectedVendorId));
      const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

      if (!selectedVendor) {
        setError('Selected vendor not found');
        setLoading(false);
        return;
      }

      let response;
      if (selectedProduct) {
        // Search for specific vendor + product
        response = await axios.get(`${API_BASE_URL}/api/cve/search/vendor-product`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            vendor: selectedVendor.name,
            product: selectedProduct.name,
            limit: resultsPerPage
          }
        });
      } else {
        // Search for vendor only
        response = await axios.get(`${API_BASE_URL}/api/cve/search/vendor`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            vendor: selectedVendor.name,
            limit: resultsPerPage
          }
        });
      }

      if (response.data.error) {
        setError(response.data.error);
        setDatabaseResults([]);
      } else {
        setDatabaseResults(response.data.results || []);
        setError('');
      }
    } catch (error) {
      console.error('Error searching database CVEs:', error);
      setError('Failed to search CVEs. Please try again.');
      setDatabaseResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    // Calculate total pages to prevent going beyond available data
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    
    // Ensure we don't go beyond the total pages
    if (newPage < 1 || newPage > totalPages) {
      console.warn(`Page ${newPage} is out of range (1-${totalPages})`);
      return;
    }
    
    if (activeTab === 0 && unifiedQuery) {
      handleUnifiedSearch(newPage);
    } else if (activeTab === 1 && keyword) {
      handleKeywordSearch(newPage);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setError('');
    setSearchType('');
  };

  const handleCancelSearch = () => {
    setUnifiedQuery('');
    setKeyword('');
    setSearchResults([]);
    setTotalResults(0);
    setCurrentPage(1);
    setError('');
    setSearchType('');
    setDatabaseResults([]);
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

      // Get recent CVEs from the last 24 hours
      const response = await axios.get(`${API_BASE_URL}/api/cve/recent`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { days: 1, limit: 50 }
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        const recentCves = response.data.results || [];
        setSuccess(`Daily check completed! Found ${recentCves.length} new CVEs in the last 24 hours.`);
        setDailyCheckDone(true);
        
        // Auto-refresh recent CVEs
        loadRecentCves();
      }
    } catch (error) {
      console.error('Error during daily check:', error);
      setError('Failed to perform daily check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAiRemediation = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setAiResult(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }
      if (!aiCveId || !/^CVE-\d{4}-\d{4,}$/i.test(aiCveId.trim())) {
        setError('Enter a valid CVE ID, e.g., CVE-2021-44228');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/api/cve/ai/remediation/${aiCveId.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.data) {
        setAiResult(response.data.data);
      } else if (response.data?.error) {
        setError(response.data.error);
      } else {
        setError('Unexpected AI response');
      }
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to generate AI remediation.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Normalize list items like "Step 1: ..." or "1. ..." -> just the text
  const normalizeStepText = (s) => {
    if (!s || typeof s !== 'string') return s;
    return s.replace(/^\s*(?:step\s*\d+\s*:|\d+\.\s*)\s*/i, '');
  };

  const renderModernPagination = (currentPage, totalResults, resultsPerPage, onPageChange) => {
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * resultsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * resultsPerPage, totalResults)}
              </span>{' '}
              of <span className="font-medium">{totalResults}</span> results
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <ChevronDownIcon className="h-5 w-5 transform rotate-90" aria-hidden="true" />
              </button>
              
              {getVisiblePages().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                  disabled={page === '...'}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : page === '...'
                      ? 'bg-white border-gray-300 text-gray-700 cursor-default'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <ChevronDownIcon className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  const renderCVEList = (cves, title, totalCount = null) => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
          {totalCount !== null && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {totalCount} results
            </span>
          )}
        </div>
        
        {cves.length === 0 ? (
          <div className="text-center py-8">
            <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No CVEs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or check back later for new vulnerabilities.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cves.map((cve, index) => (
              <div key={cve.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        <a 
                          href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1"
                        >
                          <span>{cve.id}</span>
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </a>
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(cve.severity)}`}>
                        {cve.severity || 'UNKNOWN'}
                      </span>
                      {cve.cvss_score && (
                        <span className="text-xs text-gray-500">
                          CVSS: {cve.cvss_score}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {cve.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Published: {formatDate(cve.published_date)}</span>
                      <span>Modified: {formatDate(cve.last_modified_date)}</span>
                    </div>
                    
                    {cve.vendors_products && cve.vendors_products.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {cve.vendors_products.slice(0, 3).map((vp, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                            {vp.vendor}
                            {vp.product && (
                              <>
                                <CubeIcon className="h-3 w-3 mx-1" />
                                {vp.product}
                              </>
                            )}
                          </span>
                        ))}
                        {cve.vendors_products.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{cve.vendors_products.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDatabaseResults = () => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Database Search Results</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {databaseResults.length} results
          </span>
        </div>
        
        {databaseResults.length === 0 ? (
          <div className="text-center py-8">
            <ShieldExclamationIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No CVEs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try selecting a different vendor or product combination.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {databaseResults.map((cve, index) => (
              <div key={cve.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-blue-600 hover:text-blue-800">
                        <a 
                          href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1"
                        >
                          <span>{cve.id}</span>
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </a>
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(cve.severity)}`}>
                        {cve.severity || 'UNKNOWN'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {cve.description || 'No description available'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Published: {formatDate(cve.published_date)}</span>
                      <span>Modified: {formatDate(cve.last_modified_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSearchExamples = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800 mb-2">Search Examples</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Vendor Only:</strong> "apache" - Returns all CVEs affecting any Apache products (httpd, tomcat, struts, etc.)</p>
            <p><strong>Vendor + Product (Explicit):</strong> "Ethereum@Go Ethereum" - Returns CVEs specifically for Go Ethereum by Ethereum</p>
            <p><strong>Vendor + Product (Legacy):</strong> "apache tomcat" - Returns CVEs specifically affecting Apache Tomcat</p>
            <p><strong>CVE ID:</strong> "CVE-2021-44228" - Returns specific CVE details</p>
            <p><strong>Keyword:</strong> "log4j" - Returns CVEs containing the keyword</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">CVE Search</h2>
            <button
              onClick={handleDailyCheck}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Daily Check
            </button>
          </div>

          {renderSearchExamples()}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 0, name: 'Unified Search', icon: MagnifyingGlassIcon },
                { id: 1, name: 'Keyword Search', icon: MagnifyingGlassIcon },
                { id: 2, name: 'Database Search', icon: BuildingOfficeIcon },
                { id: 3, name: 'Recent CVEs', icon: ShieldExclamationIcon },
                { id: 4, name: 'Statistics', icon: InformationCircleIcon },
                { id: 5, name: 'AI Remediation', icon: InformationCircleIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 0 && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={unifiedQuery}
                    onChange={(e) => setUnifiedQuery(e.target.value)}
                    placeholder="Enter vendor, Vendor@Product, CVE ID, or keyword..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleUnifiedSearch()}
                  />
                </div>
                <button
                  onClick={() => handleUnifiedSearch()}
                  disabled={loading || !unifiedQuery.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                  Search
                </button>
                <button
                  onClick={handleCancelSearch}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>

              {searchType && (
                <div className="text-sm text-gray-600">
                  Search type: <span className="font-medium">{searchType}</span>
                </div>
              )}

              {searchResults.length > 0 && (
                <>
                  {renderCVEList(searchResults, 'Search Results', totalResults)}
                  {renderModernPagination(currentPage, totalResults, resultsPerPage, handlePageChange)}
                </>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter keyword to search..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleKeywordSearch()}
                  />
                </div>
                <button
                  onClick={() => handleKeywordSearch()}
                  disabled={loading || !keyword.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                  Search
                </button>
              </div>

              {searchResults.length > 0 && (
                <>
                  {renderCVEList(searchResults, 'Keyword Search Results', totalResults)}
                  {renderModernPagination(currentPage, totalResults, resultsPerPage, handlePageChange)}
                </>
              )}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor
                  </label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product (Optional)
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={!selectedVendorId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">All products</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleDatabaseSearch}
                  disabled={loading || !selectedVendorId}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                  Search Database
                </button>
                <button
                  onClick={() => {
                    setSelectedVendorId('');
                    setSelectedProductId('');
                    setDatabaseResults([]);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>

              {databaseResults.length > 0 && renderDatabaseResults()}
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent CVEs</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={recentPerPage}
                    onChange={(e) => {
                      const newSize = parseInt(e.target.value);
                      setRecentPerPage(newSize);
                      setRecentPage(1);
                      loadRecentCves(recentDays, 1, newSize);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  <select
                    value={recentDays}
                    onChange={(e) => {
                      const newDays = parseInt(e.target.value);
                      setRecentDays(newDays);
                      setRecentPage(1);
                      loadRecentCves(newDays, 1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>Last 24 hours</option>
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                  </select>
                  <button
                    onClick={() => loadRecentCves()}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {renderCVEList(recentCves, `Recent CVEs (Last ${recentDays} days)`, recentTotal)}

              {renderModernPagination(recentPage, recentTotal, recentPerPage, (newPage) => {
                setRecentPage(newPage);
                loadRecentCves(recentDays, newPage);
              })}
            </div>
          )}

          {activeTab === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">CVE Statistics</h3>
              
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800">Total Count of CVEs reported in last 30 days</h4>
                    <p className="text-2xl font-bold text-blue-900">{stats.total_recent_cves}</p>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800">Severity Distribution</h4>
                    <div className="space-y-1 mt-2">
                      {Object.entries(stats.severity_distribution || {}).map(([severity, count]) => (
                        <div key={severity} className="flex justify-between text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(severity)}`}>
                            {severity}
                          </span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-800">Top Vendors</h4>
                    <div className="space-y-1 mt-2">
                      {(stats.top_vendors || []).slice(0, 5).map(([vendor, count]) => (
                        <div key={vendor} className="flex justify-between text-sm">
                          <span className="truncate">{vendor}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No statistics available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Statistics will be available after performing searches.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 5 && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">AI Remediation & Patching Guidance</h3>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVE ID</label>
                      <input
                        type="text"
                        value={aiCveId}
                        onChange={(e) => setAiCveId(e.target.value)}
                        placeholder="e.g., CVE-2021-44228"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleAiRemediation}
                      disabled={loading || !aiCveId}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      Generate Guidance
                    </button>
                  </div>

                  {aiResult && (
                    <div className="mt-4 space-y-6">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-wrap items-center gap-3">
                        <div className="text-lg font-semibold text-gray-900">{aiResult.cve_id || aiCveId}</div>
                        {aiResult.severity && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(aiResult.severity)}`}>
                            {aiResult.severity}
                          </span>
                        )}
                        {aiResult.cvss_score && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            CVSS: {aiResult.cvss_score}
                          </span>
                        )}
                      </div>

                      {/* Impact */}
                      {aiResult.impact && (
                        <div className="card">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Impact</h4>
                          <p className="text-sm text-gray-700">{aiResult.impact}</p>
                        </div>
                      )}

                      {/* Affected systems */}
                      {Array.isArray(aiResult.affected_systems) && aiResult.affected_systems.length > 0 && (
                        <div className="card">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Affected Systems</h4>
                          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {aiResult.affected_systems.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Patching steps */}
                      {Array.isArray(aiResult.patching_steps) && aiResult.patching_steps.length > 0 && (
                        <div className="card">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Patching Steps</h4>
                          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                            {aiResult.patching_steps.map((s, idx) => (
                              <li key={idx}>{normalizeStepText(s)}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Remediation guide */}
                      {aiResult.remediation_guide && (
                        <div className="card space-y-4">
                          <h4 className="text-sm font-semibold text-gray-800">Remediation Guide</h4>
                          {aiResult.remediation_guide.prerequisites && (
                            <div>
                              <div className="text-xs font-semibold text-gray-600 mb-1">Prerequisites</div>
                              <p className="text-sm text-gray-700">{aiResult.remediation_guide.prerequisites}</p>
                            </div>
                          )}
                          {Array.isArray(aiResult.remediation_guide.steps) && aiResult.remediation_guide.steps.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold text-gray-600 mb-1">Steps</div>
                              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                                {aiResult.remediation_guide.steps.map((s, idx) => (
                                  <li key={idx}>{normalizeStepText(s)}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {aiResult.remediation_guide.verification && (
                            <div>
                              <div className="text-xs font-semibold text-gray-600 mb-1">Verification</div>
                              <p className="text-sm text-gray-700">{aiResult.remediation_guide.verification}</p>
                            </div>
                          )}
                          {aiResult.remediation_guide.rollback && (
                            <div>
                              <div className="text-xs font-semibold text-gray-600 mb-1">Rollback</div>
                              <p className="text-sm text-gray-700">{aiResult.remediation_guide.rollback}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional resources */}
                      {Array.isArray(aiResult.additional_resources) && aiResult.additional_resources.length > 0 && (
                        <div className="card">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Additional Resources</h4>
                          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                            {aiResult.additional_resources.map((u, idx) => (
                              <li key={idx}>
                                <a className="underline" href={u} target="_blank" rel="noopener noreferrer">{u}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Notes */}
                      {aiResult.notes && (
                        <div className="card">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">Notes</h4>
                          <p className="text-sm text-gray-700">{aiResult.notes}</p>
                        </div>
                      )}

                      {/* CLI Commands */}
                      {aiResult.cli_commands && (
                        <div className="card space-y-3">
                          <h4 className="text-sm font-semibold text-gray-800">CLI Commands</h4>
                          {Object.entries(aiResult.cli_commands).map(([section, list]) => (
                            Array.isArray(list) && list.length > 0 ? (
                              <div key={section}>
                                <div className="text-xs font-semibold text-gray-600 mb-1 capitalize">{section}</div>
                                <div className="space-y-2">
                                  {list.map((cmd, i) => (
                                    <div key={`${section}-${i}`} className="bg-gray-100 rounded border px-3 py-2 flex items-center justify-between gap-3">
                                      <code className="text-xs text-gray-800 break-all">{cmd}</code>
                                      <button
                                        onClick={() => navigator.clipboard.writeText(cmd)}
                                        className="btn btn-sm btn-outline"
                                        title="Copy"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : null
                          ))}
                        </div>
                      )}

                      {/* Raw JSON (toggle) */}
                      <details className="bg-gray-50 border rounded p-3">
                        <summary className="cursor-pointer text-sm text-gray-700">Show raw JSON</summary>
                        <div className="overflow-auto text-xs mt-3">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(aiResult, null, 2)}</pre>
                        </div>
                      </details>
                    </div>
                  )}

                  {!aiResult && (
                    <div className="text-sm text-gray-500">
                      Enter a CVE ID and click Generate Guidance to get remediation steps, patching instructions, verification and rollback guidance.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVESearch; 