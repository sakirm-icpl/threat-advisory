import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { endpoints } from '../services/api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { 
  MagnifyingGlassIcon, 
  BuildingOfficeIcon, 
  CubeIcon, 
  DocumentTextIcon,
  BeakerIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');

  const { data, isLoading, error } = useQuery(
    ['search', searchTerm, searchType],
    () => endpoints.search({ q: searchTerm, type: searchType }).then(res => res.data),
    { enabled: !!searchTerm }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(query.trim());
  };

  const getResultsCount = () => {
    if (!data) return 0;
    return (data.vendors?.length || 0) + 
           (data.products?.length || 0) + 
           (data.methods?.length || 0) + 
           (data.guides?.length || 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
        <p className="text-gray-600">Search across vendors, products, detection methods, and setup guides</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border border-blue-100 p-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="input w-full md:w-auto"
              >
                <option value="all">🔍 All Categories</option>
                <option value="vendor">🏢 Vendors</option>
                <option value="product">📦 Products</option>
                <option value="method">🔬 Methods</option>
                <option value="guide">📖 Guides</option>
              </select>
            </div>
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder={`Search for ${searchType === 'all' ? 'vendors, products, detection methods, guides...' : searchType === 'vendor' ? 'vendor names...' : searchType === 'product' ? 'product names...' : searchType === 'method' ? 'detection methods...' : 'setup guides...'}`}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search
            </button>
          </div>
        </div>
      </form>
      {/* Loading State */}
      {isLoading && (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Searching...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
            <div>
              <h3 className="font-medium text-red-800">Search Error</h3>
              <p className="text-red-600 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {data && searchTerm && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <p className="text-gray-700">
              Found <span className="font-bold text-blue-600">{getResultsCount()}</span> results for 
              <span className="font-medium"> "{searchTerm}"</span>
              {searchType !== 'all' && <span className="text-gray-500"> in {searchType}s</span>}
            </p>
          </div>
        </div>
      )}
      {data && (
        <div className="space-y-8">
          {/* Vendors with their products */}
          {data.vendors && data.vendors.length > 0 && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-lg">
              <div className="flex items-center mb-6">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Vendors ({data.vendors.length})</h2>
              </div>
              <div className="space-y-6">
                {data.vendors.map(v => (
                  <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="font-bold text-lg mb-4 text-gray-900 flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-2" />
                      {v.name}
                    </div>
                    {v.products && v.products.length > 0 ? (
                      <div className="space-y-4">
                        {v.products.map(p => (
                          <div key={p.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="font-medium mb-1">{p.name}</div>
                            {p.category && (
                              <div className="text-sm text-blue-600 mb-1">Category: {p.category}</div>
                            )}
                            {p.description && (
                              <div className="text-sm mb-2">
                                <MarkdownRenderer content={p.description} />
                              </div>
                            )}
                            {/* Detection Methods Table */}
                            {p.detection_methods && p.detection_methods.length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="min-w-full border text-sm mb-2">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="border px-2 py-1">Product</th>
                                      <th className="border px-2 py-1">Name</th>
                                      <th className="border px-2 py-1">Technique</th>
                                      <th className="border px-2 py-1">Python Regex</th>
                                      <th className="border px-2 py-1">Ruby Regex</th>
                                      <th className="border px-2 py-1">Curl Command</th>
                                      <th className="border px-2 py-1">Expected Response</th>
                                      <th className="border px-2 py-1">Auth</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {p.detection_methods.map(m => (
                                      <tr key={m.id}>
                                        <td className="border px-2 py-1">{p.name}</td>
                                        <td className="border px-2 py-1">{m.name}</td>
                                        <td className="border px-2 py-1">{m.technique}</td>
                                        <td className="border px-2 py-1">{m.regex_python}</td>
                                        <td className="border px-2 py-1">{m.regex_ruby}</td>
                                        <td className="border px-2 py-1">{m.curl_command}</td>
                                        <td className="border px-2 py-1">{m.expected_response}</td>
                                        <td className="border px-2 py-1">{m.auth ? 'Yes' : 'No'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                            {/* Related Setup Guides */}
                            {p.setup_guides && p.setup_guides.length > 0 && (
                              <div className="mt-3">
                                <div className="text-sm font-semibold text-gray-700 mb-2">Setup Guides:</div>
                                <div className="flex flex-wrap gap-2">
                                  {p.setup_guides.map(g => (
                                    <a
                                      key={g.id}
                                      href={`/setup-guides?product=${p.id}`}
                                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors duration-200"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <DocumentTextIcon className="h-3 w-3 mr-1" />
                                      View Setup Guide
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-4 italic">No products found for this vendor.</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Products not under vendors */}
          {(() => {
            // Collect all product IDs shown under vendors
            const vendorProductIds = new Set();
            if (data.vendors) {
              data.vendors.forEach(v => {
                if (v.products) {
                  v.products.forEach(p => vendorProductIds.add(p.id));
                }
              });
            }
            // Filter products not already shown under vendors
            const filteredProducts = (data.products || []).filter(p => !vendorProductIds.has(p.id));
            if (filteredProducts.length === 0) return null;
            return (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-lg">
                <div className="flex items-center mb-6">
                  <CubeIcon className="h-6 w-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Products ({filteredProducts.length})</h2>
                </div>
                <div className="space-y-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="font-medium mb-1">{p.name}</div>
                      {p.category && (
                        <div className="text-sm text-blue-600 mb-1">Category: {p.category}</div>
                      )}
                      {p.description && (
                        <div className="text-sm mb-2">
                          <MarkdownRenderer content={p.description} />
                        </div>
                      )}
                      {/* Detection Methods Table */}
                      {p.detection_methods && p.detection_methods.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border text-sm mb-2">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border px-2 py-1">Product</th>
                                <th className="border px-2 py-1">Name</th>
                                <th className="border px-2 py-1">Technique</th>
                                <th className="border px-2 py-1">Python Regex</th>
                                <th className="border px-2 py-1">Ruby Regex</th>
                                <th className="border px-2 py-1">Curl Command</th>
                                <th className="border px-2 py-1">Expected Response</th>
                                <th className="border px-2 py-1">Auth</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.detection_methods.map(m => (
                                <tr key={m.id}>
                                  <td className="border px-2 py-1">{p.name}</td>
                                  <td className="border px-2 py-1">{m.name}</td>
                                  <td className="border px-2 py-1">{m.technique}</td>
                                  <td className="border px-2 py-1">{m.regex_python}</td>
                                  <td className="border px-2 py-1">{m.regex_ruby}</td>
                                  <td className="border px-2 py-1">{m.curl_command}</td>
                                  <td className="border px-2 py-1">{m.expected_response}</td>
                                  <td className="border px-2 py-1">{m.auth ? 'Yes' : 'No'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {/* Related Setup Guides */}
                      {p.setup_guides && p.setup_guides.length > 0 && (
                        <div className="mt-3">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Setup Guides:</div>
                          <div className="flex flex-wrap gap-2">
                            {p.setup_guides.map(g => (
                              <a
                                key={g.id}
                                href={`/setup-guides?product=${p.id}`}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full hover:bg-blue-200 transition-colors duration-200"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <DocumentTextIcon className="h-3 w-3 mr-1" />
                                View Setup Guide
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          
          {/* Detection Methods not under matched products */}
          {data.methods && data.methods.length > 0 && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-lg">
              <div className="flex items-center mb-6">
                <BeakerIcon className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Detection Methods ({data.methods.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.methods.map(m => (
                  <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center mb-2">
                      <BeakerIcon className="h-4 w-4 text-purple-600 mr-2" />
                      <span className="font-medium text-gray-900">{m.name}</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      {m.technique}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setup Guides not under matched products */}
          {data.guides && data.guides.length > 0 && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 shadow-lg">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Setup Guides ({data.guides.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.guides.map(g => (
                  <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-center mb-2">
                      <DocumentTextIcon className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="font-medium text-gray-900">Setup Guide</span>
                    </div>
                    <p className="text-sm text-gray-600">{g.instructions?.slice(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {(!data.vendors?.length && !data.products?.length && !data.methods?.length && !data.guides?.length) && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-lg">No results found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}