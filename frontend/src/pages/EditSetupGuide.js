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
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Setup Guide</h2>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-4 flex flex-col gap-6">
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
            className="w-full border px-3 py-2 rounded h-56 font-mono text-sm resize-vertical"
            name="instructions"
            value={form.instructions}
            onChange={handleChange}
            placeholder={`Setup instructions (markdown supported)\n\nExample:\n# Setup Steps\n1. Install dependencies\n2. Configure settings\n3. Run the application\n\n**Important:** Make sure to...`}
            required
          />
          {form.instructions && (
            <div className="mt-2 p-2 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500 mb-1">Preview:</div>
              <MarkdownRenderer content={form.instructions} />
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" type="submit">Save</button>
          <button type="button" className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500" onClick={() => navigate("/setup-guides")}>Cancel</button>
        </div>
        {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded border">{error}</div>}
      </form>
    </div>
  );
} 