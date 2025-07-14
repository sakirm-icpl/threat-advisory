import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { endpoints } from '../services/api';

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

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="border rounded px-3 py-2 bg-white"
        >
          <option value="all">All</option>
          <option value="vendor">Vendor</option>
          <option value="product">Product</option>
        </select>
        <input
          type="text"
          className="border rounded px-3 py-2 flex-1"
          placeholder={`Search for ${searchType === 'all' ? 'vendors, products, detection methods, guides...' : searchType === 'vendor' ? 'vendor names...' : 'product names...'}`}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </form>
      {isLoading && <div>Loading...</div>}
      {error && <div className="text-red-600">Error: {error.message}</div>}
      {data && (
        <div className="space-y-8">
          {/* Vendors with their products */}
          {data.vendors && data.vendors.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Vendors</h2>
              <ul className="ml-6">
                {data.vendors.map(v => (
                  <li key={v.id} className="mb-8">
                    <div className="font-bold text-base mb-2">{v.name}</div>
                    {v.products && v.products.length > 0 ? (
                      <ul className="ml-4">
                        {v.products.map(p => (
                          <li key={p.id} className="mb-6">
                            <div className="font-medium mb-1">{p.name}</div>
                            {p.category && (
                              <div className="text-sm text-blue-600 mb-1">Category: {p.category}</div>
                            )}
                            {p.description && (
                              <div className="text-sm text-gray-600 mb-2">{p.description}</div>
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
                              <div className="ml-4 mt-1">
                                <div className="text-sm font-semibold">Setup Guides:</div>
                                <ul className="list-disc ml-6">
                                  {p.setup_guides.map(g => (
                                    <li key={g.id} className="text-sm">
                                      <a
                                        href={`/setup-guides?product=${p.id}`}
                                        className="text-blue-600 underline hover:text-blue-800"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        View Setup Guide
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-500 ml-4">No products found for this vendor.</div>
                    )}
                  </li>
                ))}
              </ul>
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
              <div>
                <h2 className="text-lg font-semibold mb-2">Products</h2>
                <ul className="ml-6">
                  {filteredProducts.map(p => (
                    <li key={p.id} className="mb-6">
                      <div className="font-medium mb-1">{p.name}</div>
                      {p.category && (
                        <div className="text-sm text-blue-600 mb-1">Category: {p.category}</div>
                      )}
                      {p.description && (
                        <div className="text-sm text-gray-600 mb-2">{p.description}</div>
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
                        <div className="ml-4 mt-1">
                          <div className="text-sm font-semibold">Setup Guides:</div>
                          <ul className="list-disc ml-6">
                            {p.setup_guides.map(g => (
                              <li key={g.id} className="text-sm">
                                <a
                                  href={`/setup-guides?product=${p.id}`}
                                  className="text-blue-600 underline hover:text-blue-800"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Setup Guide
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}
          
          {/* Detection Methods not under matched products */}
          {data.methods && data.methods.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Detection Methods</h2>
              <ul className="list-disc ml-6">
                {data.methods.map(m => (
                  <li key={m.id} className="mb-1">{m.name} ({m.technique})</li>
                ))}
              </ul>
            </div>
          )}
          {/* Setup Guides not under matched products */}
          {data.guides && data.guides.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Setup Guides</h2>
              <ul className="list-disc ml-6">
                {data.guides.map(g => (
                  <li key={g.id} className="mb-1">{g.instructions?.slice(0, 60)}...</li>
                ))}
              </ul>
            </div>
          )}
          {/* No results */}
          {(!data.vendors?.length && !data.products?.length && !data.methods?.length && !data.guides?.length) && (
            <div className="text-gray-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}