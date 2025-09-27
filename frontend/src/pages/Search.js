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
    <div className="space-y-8">
      {/* Header */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-border-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative flex items-center gap-6">
          <div className="glass-effect p-4 rounded-xl border border-border-secondary">
            <MagnifyingGlassIcon className="h-12 w-12 text-infopercept-secondary" />
          </div>
          <div>
            <h1 className="hero-title text-3xl lg:text-4xl mb-2">
              <span className="gradient-text">Threat Intelligence Search</span>
            </h1>
            <p className="hero-subtitle">
              Advanced search across security vendors, products, detection methods, and implementation guides
            </p>
          </div>
        </div>
      </div>

      {/* Search Interface */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="card-cyber p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="input w-full md:w-auto"
              >
                <option value="all">🔍 All Intelligence</option>
                <option value="vendor">🏢 Security Vendors</option>
                <option value="product">🛡️ Security Products</option>
                <option value="method">🔬 Detection Methods</option>
                <option value="guide">📖 Implementation Guides</option>
              </select>
            </div>
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder={`Search ${searchType === 'all' ? 'threat intelligence database...' : searchType === 'vendor' ? 'security vendor names...' : searchType === 'product' ? 'security product names...' : searchType === 'method' ? 'detection signatures...' : 'implementation guides...'}`}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Execute Search
            </button>
          </div>
          
          {/* Search Stats */}
          {searchTerm && (
            <div className="mt-4 flex items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-infopercept-secondary rounded-full animate-pulse"></div>
                <span>Query: "{searchTerm}"</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-matrix-darkGreen rounded-full animate-pulse delay-300"></div>
                <span>Results: {getResultsCount()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-security-info rounded-full animate-pulse delay-600"></div>
                <span>Category: {searchType}</span>
              </div>
            </div>
          )}
        </div>
      </form>
      {/* Loading State */}
      {isLoading && (
        <div className="card-cyber text-center py-16">
          <div className="loading-spinner mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Scanning Threat Intelligence</h3>
          <p className="text-text-muted">Analyzing security database...</p>
          <div className="mt-4 flex justify-center">
            <div className="terminal text-xs">
              <div className="text-matrix-green">$ grep -r "{searchTerm}" /threat-intel/</div>
              <div className="text-infopercept-secondary">Searching... Please wait</div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert-error">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-security-critical mr-3" />
            <div>
              <h3 className="font-medium text-security-critical">Search Operation Failed</h3>
              <p className="text-security-critical/80 text-sm mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {data && searchTerm && (
        <div className="mb-6">
          <div className="card-glass p-4 border border-cyber-600/30">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-security-success rounded-full animate-pulse"></div>
                <span className="text-gray-300">Scan Complete</span>
              </div>
              <div className="text-gray-300">
                Found <span className="font-bold text-cyber-400 font-mono">{getResultsCount()}</span> intelligence records for 
                <span className="font-medium text-matrix-green"> "{searchTerm}"</span>
                {searchType !== 'all' && <span className="text-gray-400"> in {searchType} category</span>}
              </div>
            </div>
          </div>
        </div>
      )}
      {data && (
        <div className="space-y-8">
          {/* Vendors with their products */}
          {data.vendors && data.vendors.length > 0 && (
            <div className="card-cyber p-6">
              <div className="flex items-center mb-6">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-400 mr-3" />
                <h2 className="text-xl font-bold text-slate-200">Vendors ({data.vendors.length})</h2>
              </div>
              <div className="space-y-6">
                {data.vendors.map(v => (
                  <div key={v.id} className="card-glass border border-slate-600 rounded-xl p-6 shadow-cyber hover:shadow-glow transition-all duration-200">
                    <div className="font-bold text-lg mb-4 text-slate-200 flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-blue-400 mr-2" />
                      {v.name}
                    </div>
                    {v.products && v.products.length > 0 ? (
                      <div className="space-y-4">
                        {v.products.map(p => (
                          <div key={p.id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                            <div className="font-medium mb-1 text-slate-200">{p.name}</div>
                            {p.category && (
                              <div className="text-sm text-blue-400 mb-1">Category: {p.category}</div>
                            )}
                            {p.description && (
                              <div className="text-sm mb-2">
                                <MarkdownRenderer content={p.description} />
                              </div>
                            )}
                            {/* Detection Methods Table */}
                            {p.detection_methods && p.detection_methods.length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="min-w-full border border-slate-600 text-sm mb-2">
                                  <thead className="bg-slate-800/50">
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
                                <div className="text-sm font-semibold text-slate-300 mb-2">Setup Guides:</div>
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
              <div className="card-cyber p-6">
                <div className="flex items-center mb-6">
                  <CubeIcon className="h-6 w-6 text-green-400 mr-3" />
                  <h2 className="text-xl font-bold text-slate-200">Products ({filteredProducts.length})</h2>
                </div>
                <div className="space-y-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="card-glass border border-slate-600 rounded-xl p-6 shadow-cyber hover:shadow-glow transition-all duration-200">
                      <div className="font-medium mb-1 text-slate-200">{p.name}</div>
                      {p.category && (
                        <div className="text-sm text-green-400 mb-1">Category: {p.category}</div>
                      )}
                      {p.description && (
                        <div className="text-sm mb-2">
                          <MarkdownRenderer content={p.description} />
                        </div>
                      )}
                      {/* Detection Methods Table */}
                      {p.detection_methods && p.detection_methods.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-slate-600 text-sm mb-2">
                            <thead className="bg-slate-800/50">
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
                          <div className="text-sm font-semibold text-slate-300 mb-2">Setup Guides:</div>
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