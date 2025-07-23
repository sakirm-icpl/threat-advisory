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
  const filteredMethods = filterProduct
    ? methods.filter(m => String(m.product_id) === String(filterProduct))
    : methods;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Detection Methods</h2>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showAddForm ? "Cancel" : "Add New Method"}
          </button>
        )}
      </div>
      <div className="mb-4 flex gap-2">
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
      </div>
      {/* Add Method Form */}
      {user?.role === 'admin' && showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6 border">
          <h3 className="text-lg font-semibold mb-4">Add New Detection Method</h3>
          <form onSubmit={addMethod} className="space-y-4">
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

            <div className="flex gap-2">
              <button 
                type="submit" 
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Method
              </button>
              <button 
                type="button" 
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded border">{error}</div>}

      {/* Methods List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading methods...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 text-left font-medium">Product</th>
                  <th className="p-3 text-left font-medium">Name</th>
                  <th className="p-3 text-left font-medium">Technique</th>
                  <th className="p-3 text-left font-medium">Python Regex</th>
                  <th className="p-3 text-left font-medium">Ruby Regex</th>
                  <th className="p-3 text-left font-medium">Curl Command</th>
                  <th className="p-3 text-left font-medium">Expected Response</th>
                  <th className="p-3 text-center font-medium">Auth</th>
                  {user?.role === 'admin' && (
                    <th className="p-3 text-center font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredMethods.map(m => (
                  <tr key={m.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {products.find(p => p.id === m.product_id)?.name || ""}
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{m.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {m.technique}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        {m.regex_python ? (
                          <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-hidden">
                            {m.regex_python.length > 50 
                              ? m.regex_python.substring(0, 50) + "..." 
                              : m.regex_python
                            }
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        {m.regex_ruby ? (
                          <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-hidden">
                            {m.regex_ruby.length > 50 
                              ? m.regex_ruby.substring(0, 50) + "..." 
                              : m.regex_ruby
                            }
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        {m.curl_command ? (
                          <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-hidden">
                            {m.curl_command.length > 50 
                              ? m.curl_command.substring(0, 50) + "..." 
                              : m.curl_command
                            }
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs">
                        {m.expected_response ? (
                          <div className="bg-gray-100 p-2 rounded text-xs font-mono overflow-hidden">
                            {m.expected_response.length > 50 
                              ? m.expected_response.substring(0, 50) + "..." 
                              : m.expected_response
                            }
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${
                        m.requires_auth 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      }`}>
                        {m.requires_auth ? "Yes" : "No"}
                      </span>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="p-3 text-center">
                        <div className="flex gap-1 justify-center">
                          <button 
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600" 
                            onClick={() => navigate(`/methods/${m.id}/edit`)}
                          >
                            Edit
                          </button>
                          <button 
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700" 
                            onClick={() => deleteMethod(m.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredMethods.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No detection methods found. Add your first method above.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 