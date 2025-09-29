import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { 
  EyeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-cyber-600/30 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="glass-effect p-4 rounded-xl border border-cyber-600/30">
              <EyeIcon className="h-12 w-12 text-cyber-400" />
            </div>
            <div>
              <h1 className="hero-title text-3xl lg:text-4xl mb-2">
                <span className="gradient-text">Detection Methods</span>
              </h1>
              <p className="hero-subtitle mb-4">
                Advanced threat signatures and version detection techniques
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-400 rounded-full animate-pulse"></div>
                  {methods.length} Detection Signatures
                </div>
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-security-success rounded-full animate-pulse delay-300"></div>
                  Real-time Scanning
                </div>
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse delay-600"></div>
                  Threat Intelligence Active
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4"
          >
            <PlusIcon className="h-6 w-6" />
            {showAddForm ? "Cancel Operation" : "Add Detection Method"}
          </button>
        </div>
      </div>
      {/* Allow both admin and contributor to see the add form */}
      {showAddForm && (
        <div className="card-cyber">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-xl p-3 shadow-glow">
              <PlusIcon className="h-6 w-6 text-cyber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Add Detection Method</h2>
              <p className="text-slate-400">Create a new threat signature for version detection</p>
            </div>
          </div>
        <form onSubmit={addMethod} className="form-group">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="label">Security Product *</label>
                <select
                  className="input"
                  name="product_id"
                  value={form.product_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select security product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Detection Method Name *</label>
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g., HTTP Header Detection, Version Banner Grab"
                  required
                />
              </div>
              <div>
                <label className="label">Protocol *</label>
                <input
                  className="input"
                  name="protocol"
                  value={form.protocol}
                  onChange={handleFormChange}
                  placeholder="e.g., HTTP, SSH, SNMP, TCP"
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
                <div key={index} className="mb-4 p-4 border border-slate-600 rounded-lg bg-slate-800/30">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-slate-200">Snippet #{index + 1}</h4>
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
                      <label className="label">Programming Language</label>
                      <select
                        className="input text-sm"
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
                      <label className="label">Code Content</label>
                      <textarea
                        className="input h-32 font-mono text-sm"
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
              <label className="label">Expected Response/Output</label>
              <textarea
                className="input h-20 font-mono text-sm"
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
              <div className="flex gap-4 pt-6">
                <button 
                  type="submit" 
                  className="btn-primary flex items-center gap-2"
                >
                  <EyeIcon className="h-5 w-5" />
                  Deploy Detection Method
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel Operation
                </button>
              </div>
            </div>
        </form>
        </div>
      )}

      {!showAddForm && (
        <>
          {/* Search and Filter Controls */}
          <div className="card-cyber p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-xl p-3 shadow-glow">
                <MagnifyingGlassIcon className="h-6 w-6 text-cyber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">Threat Intelligence Search</h3>
                <p className="text-slate-400 text-sm">Filter and search detection methods</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <select
                  className="input w-full md:w-auto"
                  value={filterProduct}
                  onChange={e => setFilterProduct(e.target.value)}
                >
                  <option value="">🛡️ All Security Products</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  className="input pl-10 w-full"
                  placeholder="Search detection methods, protocols, signatures..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert-error mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-security-critical/20 rounded-full p-2 border border-security-critical/30">
                  <ExclamationTriangleIcon className="h-5 w-5 text-security-critical" />
                </div>
                <div>
                  <h3 className="font-semibold text-security-critical">Security Operation Failed</h3>
                  <p className="text-security-critical/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="card-cyber text-center py-16">
              <div className="loading-spinner mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-slate-100 mb-2">Scanning Detection Methods</h3>
              <p className="text-slate-400">Analyzing threat signatures and detection rules...</p>
              <div className="mt-4 flex justify-center">
                <div className="terminal text-xs">
                  <div className="text-matrix-green">$ nmap -sV detection-methods.db</div>
                  <div className="text-cyber-400">Scanning... Please wait</div>
                </div>
              </div>
            </div>
          ) : Object.keys(groupedMethods).length === 0 ? (
            <div className="card-cyber text-center py-20">
              <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-glow">
                <EyeIcon className="h-10 w-10 text-cyber-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">No Detection Methods Found</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Initialize your threat detection arsenal by deploying advanced signature-based detection methods
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <PlusIcon className="h-5 w-5" />
                Deploy First Detection Method
              </button>
            </div>
          ) : (
            <div className="table-modern">
              <div className="overflow-x-auto scrollbar-cyber">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="table-cell text-left">
                        <div className="flex items-center gap-2">
                          <CubeIcon className="h-5 w-5 text-cyber-400" />
                          <span className="gradient-text">Security Product</span>
                        </div>
                      </th>
                      <th className="table-cell text-left">
                        <div className="flex items-center gap-2">
                          <EyeIcon className="h-5 w-5 text-cyber-400" />
                          <span className="gradient-text">Detection Methods</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedMethods).map(productGroup => {
                      const isExpanded = expandedProducts.has(productGroup.product_id);
                      const displayMethods = isExpanded ? productGroup.methods : productGroup.methods.slice(0, 2);
                      const hiddenMethodsCount = productGroup.methods.length - displayMethods.length;
                      
                      return (
                        <tr key={productGroup.product_id} className="table-row-hover border-b border-slate-700 last:border-b-0">
                          <td className="table-cell align-top">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <div className="bg-gradient-to-br from-cyber-500/20 to-cyber-600/20 border border-cyber-500/30 rounded-xl p-2 mr-3 shadow-glow">
                                  <CubeIcon className="h-4 w-4 text-cyber-400" />
                                </div>
                                <span className="text-lg font-semibold text-slate-200">{productGroup.product_name}</span>
                              </div>
                              <span className="text-sm text-blue-400 font-medium ml-11">
                                {productGroup.methods.length} detection method{productGroup.methods.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell align-top">
                            <div className="space-y-3">
                              {displayMethods.map((method, idx) => (
                                <div key={method.id} className="card-glass border border-slate-600 rounded-xl p-4 shadow-cyber hover:border-cyber-500/50 transition-all duration-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm text-slate-200">{method.name}</span>
                                      <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs border border-blue-500/30">
                                        {method.protocol}
                                      </span>
                                      <span className={`px-2 py-1 rounded text-xs border ${
                                        method.requires_auth 
                                          ? "bg-red-500/20 text-red-300 border-red-500/30" 
                                          : "bg-green-500/20 text-green-300 border-green-500/30"
                                      }`}>
                                        {method.requires_auth ? "Auth Required" : "No Auth"}
                                      </span>
                                    </div>
                                    <div className="flex gap-1">
                                      {/* Allow edit/delete if user is admin OR owns the record */}
                                      {(user?.role === 'admin' || method.created_by === user?.id) && (
                                        <>
                                          <button 
                                            className="btn-outline btn-sm flex items-center gap-1 text-cyber-400 border-cyber-500/50 hover:bg-cyber-500 hover:text-white" 
                                            onClick={() => navigate(`/methods/${method.id}/edit`)}
                                          >
                                            <PencilIcon className="h-3 w-3" />
                                            Modify
                                          </button>
                                          <button 
                                            className="btn-outline btn-sm flex items-center gap-1 text-security-critical border-security-critical/50 hover:bg-security-critical hover:text-white" 
                                            onClick={() => deleteMethod(method.id)}
                                          >
                                            <TrashIcon className="h-3 w-3" />
                                            Remove
                                          </button>
                                        </>
                                      )}
                                      {/* Show view-only indicator for records user doesn't own */}
                                      {user?.role === 'contributor' && method.created_by !== user?.id && (
                                        <span className="text-xs text-slate-500 italic">View Only</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Created By Information */}
                                  <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-slate-400 flex items-center">
                                    <span>Created by: </span>
                                    {method.creator ? (
                                      <div className="flex items-center ml-1">
                                        {method.creator.avatar_url ? (
                                          <img 
                                            src={method.creator.avatar_url} 
                                            alt={method.creator.github_username || method.creator.username}
                                            className="h-4 w-4 rounded-full mr-1 border border-slate-600"
                                          />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full bg-slate-700 flex items-center justify-center mr-1 text-[8px] font-semibold text-slate-300 border border-slate-600">
                                            {(method.creator.github_username || method.creator.username || '?').charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="font-medium text-cyber-400">
                                          {method.creator.github_username || method.creator.username}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="font-medium text-slate-500">Unknown</span>
                                    )}
                                  </div>
                                  
                                  {/* Code Snippets Preview */}
                                  <div className="text-xs text-slate-400 mt-2">
                                    {method.code_snippets && method.code_snippets.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        <span className="text-slate-500">Languages:</span>
                                        {method.code_snippets.slice(0, 3).map((snippet, snippetIdx) => (
                                          <span key={snippetIdx} className="bg-green-500/20 text-green-300 px-1 py-0.5 rounded border border-green-500/30">
                                            {snippet.code_language || "Unknown"}
                                          </span>
                                        ))}
                                        {method.code_snippets.length > 3 && (
                                          <span className="text-slate-500">+{method.code_snippets.length - 3} more</span>
                                        )}
                                      </div>
                                    ) : method.code_language ? (
                                      <div className="flex items-center gap-1">
                                        <span className="text-slate-500">Language:</span>
                                        <span className="bg-green-500/20 text-green-300 px-1 py-0.5 rounded border border-green-500/30">
                                          {method.code_language}
                                        </span>
                                        <span className="bg-yellow-500/20 text-yellow-300 px-1 py-0.5 rounded border border-yellow-500/30">
                                          Legacy
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">No code snippets</span>
                                    )}
                                  </div>
                                  
                                  {/* Expected Response Preview */}
                                  {method.expected_response && (
                                    <div className="mt-2 text-xs">
                                      <span className="text-slate-500">Expected: </span>
                                      <span className="bg-slate-700 px-1 py-0.5 rounded font-mono text-slate-300 border border-slate-600">
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
                                    className="text-xs text-cyber-400 hover:text-cyber-300 bg-cyber-500/20 hover:bg-cyber-500/30 border border-cyber-500/30 px-3 py-1 rounded-lg transition-colors"
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
                                    className="text-xs text-slate-400 hover:text-slate-300 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 px-3 py-1 rounded-lg transition-colors"
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