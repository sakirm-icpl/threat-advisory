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
  const [form, setForm] = useState({
    product_id: "",
    name: "",
    technique: "",
    regex_python: "",
    regex_ruby: "",
    curl_command: "",
    expected_response: "",
    requires_auth: false,
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

  const addMethod = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.name || !form.technique) {
      setError("Product, name, and technique are required");
      return;
    }
    try {
      await api.post("/methods", form);
      setForm({ 
        product_id: "", 
        name: "", 
        technique: "", 
        regex_python: "", 
        regex_ruby: "", 
        curl_command: "",
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
      technique: "", 
      regex_python: "", 
      regex_ruby: "", 
      curl_command: "",
      expected_response: "",
      requires_auth: false 
    });
    setShowAddForm(false);
    setError("");
  };

  // Filtering
  const filteredMethods = methods.filter(m => {
    const productMatch = !filterProduct || String(m.product_id) === String(filterProduct);
    const searchMatch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.technique.toLowerCase().includes(search.toLowerCase());
    return productMatch && searchMatch;
  });

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium mb-1">Technique *</label>
                <input
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  name="technique"
                  value={form.technique}
                  onChange={handleFormChange}
                  placeholder="e.g., HTTP, SSH, SNMP"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Python Regex Code</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32 font-mono text-sm"
                  name="regex_python"
                  value={form.regex_python}
                  onChange={handleFormChange}
                  placeholder="Enter Python regex code here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ruby Regex Code</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32 font-mono text-sm"
                  name="regex_ruby"
                  value={form.regex_ruby}
                  onChange={handleFormChange}
                  placeholder="Enter Ruby regex code here..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Curl Command</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 h-20 font-mono text-sm"
                name="curl_command"
                value={form.curl_command}
                onChange={handleFormChange}
                placeholder="e.g., curl -s http://target.com/ | grep -i version"
              />
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="requires_auth"
                  checked={form.requires_auth}
                  onChange={handleFormChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium">Requires Authentication</label>
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

      {/* Methods List */}
      {loading ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading detection methods...</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Product</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Name</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Technique</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Created By</th>
                  <th className="p-4 text-center font-semibold text-gray-700 uppercase tracking-wide text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMethods.map(m => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      {products.find(p => p.id === m.product_id)?.name || ""}
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{m.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {m.technique}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {m.creator ? (
                        <div className="flex items-center">
                          {m.creator.avatar_url ? (
                            <img 
                              src={m.creator.avatar_url} 
                              alt={m.creator.github_username || m.creator.username}
                              className="h-6 w-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-2 text-xs font-semibold">
                              {(m.creator.github_username || m.creator.username || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          {m.creator.github_username || m.creator.username}
                        </div>
                      ) : (
                        'Unknown'
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        {/* Allow edit/delete if user is admin OR owns the record */}
                        {(user?.role === 'admin' || m.created_by === user?.id) && (
                          <>
                            <button 
                              className="btn btn-warning btn-sm" 
                              onClick={() => navigate(`/methods/${m.id}/edit`)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => deleteMethod(m.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {/* Show view-only indicator for records user doesn't own */}
                        {user?.role === 'contributor' && m.created_by !== user?.id && (
                          <span className="text-xs text-gray-500 italic">View Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMethods.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium text-lg">No detection methods found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first detection method using the button above</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 