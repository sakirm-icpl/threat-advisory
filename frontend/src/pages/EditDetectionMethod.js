import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function EditDetectionMethod() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchMethod();
    // eslint-disable-next-line
  }, [id]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (e) {
      setError("Failed to load products");
    }
  };

  const fetchMethod = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/methods/${id}`);
      setForm({
        product_id: res.data.product_id || "",
        name: res.data.name || "",
        technique: res.data.technique || "",
        regex_python: res.data.regex_python || "",
        regex_ruby: res.data.regex_ruby || "",
        curl_command: res.data.curl_command || "",
        expected_response: res.data.expected_response || "",
        requires_auth: !!res.data.requires_auth,
      });
    } catch (e) {
      setError("Failed to load detection method");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.name || !form.technique) return;
    try {
      await api.put(`/methods/${id}`, form);
      navigate("/methods");
    } catch (e) {
      setError("Failed to update detection method");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Detection Method</h2>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product *</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              name="product_id"
              value={form.product_id}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Enter Python regex code here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ruby Regex Code</label>
            <textarea
              className="w-full border border-gray-300 rounded px-3 py-2 h-32 font-mono text-sm"
              name="regex_ruby"
              value={form.regex_ruby}
              onChange={handleChange}
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
            onChange={handleChange}
            placeholder="e.g., curl -s http://target.com/ | grep -i version"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expected Response/Output</label>
          <textarea
            className="w-full border border-gray-300 rounded px-3 py-2 h-20 font-mono text-sm"
            name="expected_response"
            value={form.expected_response}
            onChange={handleChange}
            placeholder="Enter expected output or response format..."
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="requires_auth"
            checked={form.requires_auth}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">Requires Authentication</label>
        </div>
        {error && <div className="text-red-600 mb-2 p-3 bg-red-50 rounded border">{error}</div>}
        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save</button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => navigate("/methods")}>Cancel</button>
        </div>
      </form>
    </div>
  );
} 