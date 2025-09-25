import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('product') || '';
}

export default function Methods() {
  const [methods, setMethods] = useState([]);
  const [products, setProducts] = useState([]);
  const [filterProduct, setFilterProduct] = useState(getProductIdFromUrl());
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState(new Set());
  const [form, setForm] = useState({ 
    product_id: "", 
    name: "", 
    protocol: "", 
    code_snippets: [{ code_language: "", code_content: "" }],
    expected_response: "",
    requires_auth: false 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchMethods();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (e) {
      setError("Failed to load products");
    }
  };

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await api.get("/methods");
      setMethods(res.data);
    } catch (e) {
      setError("Failed to load methods");
    }
    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  
  const handleCodeSnippetChange = (index, field, value) => {
    const updatedSnippets = [...form.code_snippets];
    updatedSnippets[index] = { ...updatedSnippets[index], [field]: value };
    setForm({
      ...form,
      code_snippets: updatedSnippets
    });
  };
  
  const addCodeSnippet = () => {
    setForm({
      ...form,
      code_snippets: [...form.code_snippets, { code_language: "", code_content: "" }]
    });
  };
  
  const removeCodeSnippet = (index) => {
    if (form.code_snippets.length > 1) {
      const updatedSnippets = form.code_snippets.filter((_, i) => i !== index);
      setForm({
        ...form,
        code_snippets: updatedSnippets
      });
    }
  };

  const addMethod = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.name || !form.protocol) {
      setError("Product, name, and protocol are required");
      return;
    }
    try {
      await api.post("/methods", form);
      setForm({ 
        product_id: "", 
        name: "", 
        protocol: "", 
        code_snippets: [{ code_language: "", code_content: "" }],
        expected_response: "",
        requires_auth: false 
      });
      setShowAddForm(false);
      setError("");
      fetchMethods();
    } catch (e) {
      setError("Failed to add method");
    }
  };

  const deleteMethod = async (id) => {
    if (!window.confirm("Delete this method?")) return;
    try {
      await api.delete(`/methods/${id}`);
      fetchMethods();
    } catch (e) {
      setError("Failed to delete method");
    }
  };

  const resetForm = () => {
    setForm({ 
      product_id: "", 
      name: "", 
      protocol: "", 
      code_snippets: [{ code_language: "", code_content: "" }],
      expected_response: "",
      requires_auth: false 
    });
    setShowAddForm(false);
    setError("");
  };

  // Filtering and grouping
  const filteredMethods = methods.filter(m => {
    const productMatch = !filterProduct || String(m.product_id) === String(filterProduct);
    const searchMatch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.protocol.toLowerCase().includes(search.toLowerCase());
    return productMatch && searchMatch;
  });
  
  // Group methods by product
  const groupedMethods = filteredMethods.reduce((acc, method) => {
    const productId = method.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        product_id: productId,
        product_name: products.find(p => p.id === productId)?.name || "Unknown Product",
        methods: []
      };
    }
    acc[productId].methods.push(method);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detection Methods</h1>
          <p className="text-gray-600">Manage your detection methods for product version detection</p>
        </div>
        {/* Allow both admin and contributor to add methods */}
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          {showAddForm ? "Cancel" : "+ Add Detection Method"}
        </button>
      </div>
      {/* Allow both admin and contributor to see the add form */}
      {showAddForm && (
        <form onSubmit={addMethod} className="bg-white p-8 rounded-2xl mb-8 w-full flex flex-col gap-6 shadow-xl border border-blue-100">
          <h3 className="text-lg font-semibold mb-4">Add Detection Method</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product *</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  name="product_id"
                  value={form.product_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Method Name *</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g., HTTP Header Detection"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Protocol *</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  name="protocol"
                  value={form.protocol}
                  onChange={handleFormChange}
                  placeholder="e.g., HTTP, SSH, SNMP"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Code Snippets</label>
                <button 
                  type="button" 
                  onClick={addCodeSnippet}
                  className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                >
                  + Add Another Snippet
                </button>
              </div>
              
              {form.code_snippets.map((snippet, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">Snippet #{index + 1}</h4>
                    {form.code_snippets.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeCodeSnippet(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1">
                      <label className="block text-sm font-medium mb-1">Programming Language</label>
                      <select
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        value={snippet.code_language}
                        onChange={(e) => handleCodeSnippetChange(index, 'code_language', e.target.value)}
                      >
                        <option value="">Select language</option>
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="php">PHP</option>
                        <option value="ruby">Ruby</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                        <option value="swift">Swift</option>
                        <option value="kotlin">Kotlin</option>
                        <option value="scala">Scala</option>
                        <option value="r">R</option>
                        <option value="matlab">MATLAB</option>
                        <option value="sql">SQL</option>
                        <option value="bash">Bash</option>
                        <option value="powershell">PowerShell</option>
                        <option value="shell">Shell</option>
                        <option value="yaml">YAML</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="scss">SCSS</option>
                        <option value="less">LESS</option>
                        <option value="dockerfile">Dockerfile</option>
                        <option value="makefile">Makefile</option>
                        <option value="ini">INI</option>
                        <option value="toml">TOML</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="lg:col-span-3">
                      <label className="block text-sm font-medium mb-1">Code Content</label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 h-32 font-mono text-sm"
                        value={snippet.code_content}
                        onChange={(e) => handleCodeSnippetChange(index, 'code_content', e.target.value)}
                        placeholder="Enter your code here..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Expected Response/Output</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 h-20 font-mono text-sm"
                name="expected_response"
                value={form.expected_response}
                onChange={handleFormChange}
                placeholder="Enter expected output or response format..."
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-2">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Requires Authentication:</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requires_auth"
                      value="true"
                      checked={form.requires_auth === true}
                      onChange={(e) => setForm({...form, requires_auth: e.target.value === "true"})}
                      className="mr-1"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="requires_auth"
                      value="false"
                      checked={form.requires_auth === false}
                      onChange={(e) => setForm({...form, requires_auth: e.target.value === "true"})}
                      className="mr-1"
                    />
                    No
                  </label>
                </div>
              </div>
              <div className="flex gap-2 md:ml-auto">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Add Method
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
        </form>
      )}

      {!showAddForm && (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-2">
            <select
              className="border px-3 py-2 rounded"
              value={filterProduct}
              onChange={e => setFilterProduct(e.target.value)}
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              className="border px-3 py-2 rounded flex-1"
              placeholder="Search methods..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded border">{error}</div>}

          {loading ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading detection methods...</p>
            </div>
          ) : Object.keys(groupedMethods).length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium text-lg">No detection methods found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first detection method using the button above</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Product</th>
                      <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Detection Methods</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedMethods).map(productGroup => {
                      const isExpanded = expandedProducts.has(productGroup.product_id);
                      const displayMethods = isExpanded ? productGroup.methods : productGroup.methods.slice(0, 2);
                      const hiddenMethodsCount = productGroup.methods.length - displayMethods.length;
                      
                      return (
                        <tr key={productGroup.product_id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium align-top">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{productGroup.product_name}</span>
                              <span className="text-xs text-gray-500">
                                {productGroup.methods.length} method{productGroup.methods.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="space-y-3">
                              {displayMethods.map((method, idx) => (
                                <div key={method.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm text-gray-900">{method.name}</span>
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                        {method.protocol}
                                      </span>
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        method.requires_auth 
                                          ? "bg-red-100 text-red-800" 
                                          : "bg-green-100 text-green-800"
                                      }`}>
                                        {method.requires_auth ? "Auth Required" : "No Auth"}
                                      </span>
                                    </div>
                                    <div className="flex gap-1">
                                      {/* Allow edit/delete if user is admin OR owns the record */}
                                      {(user?.role === 'admin' || method.created_by === user?.id) && (
                                        <>
                                          <button 
                                            className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors" 
                                            onClick={() => navigate(`/methods/${method.id}/edit`)}
                                          >
                                            Edit
                                          </button>
                                          <button 
                                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors" 
                                            onClick={() => deleteMethod(method.id)}
                                          >
                                            Delete
                                          </button>
                                        </>
                                      )}
                                      {/* Show view-only indicator for records user doesn't own */}
                                      {user?.role === 'contributor' && method.created_by !== user?.id && (
                                        <span className="text-xs text-gray-500 italic">View Only</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Created By Information */}
                                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center">
                                    <span>Created by: </span>
                                    {method.creator ? (
                                      <div className="flex items-center ml-1">
                                        {method.creator.avatar_url ? (
                                          <img 
                                            src={method.creator.avatar_url} 
                                            alt={method.creator.github_username || method.creator.username}
                                            className="h-4 w-4 rounded-full mr-1"
                                          />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center mr-1 text-[8px] font-semibold">
                                            {(method.creator.github_username || method.creator.username || '?').charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="font-medium">
                                          {method.creator.github_username || method.creator.username}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="font-medium">Unknown</span>
                                    )}
                                  </div>
                                  
                                  {/* Code Snippets Preview */}
                                  <div className="text-xs text-gray-600 mt-2">
                                    {method.code_snippets && method.code_snippets.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        <span className="text-gray-500">Languages:</span>
                                        {method.code_snippets.slice(0, 3).map((snippet, snippetIdx) => (
                                          <span key={snippetIdx} className="bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                            {snippet.code_language || "Unknown"}
                                          </span>
                                        ))}
                                        {method.code_snippets.length > 3 && (
                                          <span className="text-gray-500">+{method.code_snippets.length - 3} more</span>
                                        )}
                                      </div>
                                    ) : method.code_language ? (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Language:</span>
                                        <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                          {method.code_language}
                                        </span>
                                        <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
                                          Legacy
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">No code snippets</span>
                                    )}
                                  </div>
                                  
                                  {/* Expected Response Preview */}
                                  {method.expected_response && (
                                    <div className="mt-2 text-xs">
                                      <span className="text-gray-500">Expected: </span>
                                      <span className="bg-gray-100 px-1 py-0.5 rounded font-mono">
                                        {method.expected_response.length > 40 
                                          ? method.expected_response.substring(0, 40) + "..." 
                                          : method.expected_response
                                        }
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              {hiddenMethodsCount > 0 && (
                                <div className="text-center">
                                  <button 
                                    className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                                    onClick={() => {
                                      const newExpanded = new Set(expandedProducts);
                                      newExpanded.add(productGroup.product_id);
                                      setExpandedProducts(newExpanded);
                                    }}
                                  >
                                    Show {hiddenMethodsCount} more method{hiddenMethodsCount !== 1 ? 's' : ''}
                                  </button>
                                </div>
                              )}
                              
                              {isExpanded && productGroup.methods.length > 2 && (
                                <div className="text-center">
                                  <button 
                                    className="text-xs text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                                    onClick={() => {
                                      const newExpanded = new Set(expandedProducts);
                                      newExpanded.delete(productGroup.product_id);
                                      setExpandedProducts(newExpanded);
                                    }}
                                  >
                                    Show less
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}