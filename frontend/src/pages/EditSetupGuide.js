import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function EditSetupGuide() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: "",
    instructions: "",
  });
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
          <h1 className="text-3xl font-bold text-slate-100">Edit Setup Guide</h1>
          <p className="text-slate-400">Update your setup guide instructions and configuration</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="card-cyber p-8 rounded-2xl mb-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-slate-300">Product *</label>
              <select
                className="w-full input"
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
              <label className="block text-sm font-medium mb-1 text-slate-300">Instructions (Markdown supported)</label>
              <textarea
                className="w-full input h-96 font-mono text-sm"
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                placeholder={`# Setup Guide

## Prerequisites
- List prerequisites here

## Installation Steps
1. First step
2. Second step
3. ...

## Configuration
\`\`\`yaml
# Configuration example
setting: value
\`\`\`

## Verification
- How to verify the setup worked`}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Preview</label>
            <div className="card-glass border border-slate-600 rounded-lg p-4 h-full overflow-auto">
              <div className="text-xs text-slate-400 mb-1 font-semibold">Live Preview:</div>
              <MarkdownRenderer content={form.instructions || "Nothing to preview yet."} />
            </div>
          </div>
        </div>
        {error && <div className="text-red-400 mb-4 p-3 bg-red-900/20 rounded border border-red-800/30">{error}</div>}
        <div className="flex gap-2 mt-6 justify-end">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate("/setup-guides")}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}