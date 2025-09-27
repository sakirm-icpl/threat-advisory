import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function EditSetupGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: "", instructions: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchGuide();
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

  const fetchGuide = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/setup-guides/${id}`);
      setForm({
        product_id: res.data.product_id || "",
        instructions: res.data.instructions || "",
      });
    } catch (e) {
      setError("Failed to load setup guide");
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.instructions) return;
    try {
      await api.put(`/setup-guides/${id}`, form);
      navigate("/setup-guides");
    } catch (e) {
      setError("Failed to update setup guide");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Setup Guide</h1>
          <p className="text-gray-600">Update your setup guide instructions and configuration</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl mb-8 w-full shadow-xl border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product *</label>
          <select
            className="w-full border px-3 py-2 rounded"
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
              <label className="block text-sm font-medium mb-1">Instructions * (Markdown supported)</label>
              <textarea
                className="w-full border px-3 py-2 rounded h-60 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                placeholder={`Setup instructions (markdown supported)

Example:
# Setup Steps
1. Install dependencies
2. Configure settings
3. Run the application

**Important:** Make sure to...`}
                required
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded border p-4 h-full overflow-auto">
            <div className="text-xs text-gray-500 mb-1 font-semibold">Live Preview:</div>
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer content={form.instructions || 'Nothing to preview yet.'} />
            </div>
          </div>
        </div>
        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded border">{error}</div>}
        <div className="flex gap-2 justify-end mt-6">
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700" type="submit">Save Changes</button>
          <button type="button" className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600" onClick={() => navigate("/setup-guides")}>Cancel</button>
        </div>
      </form>
    </div>
  );
} 