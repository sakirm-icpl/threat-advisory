import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchVendors();
    fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors");
      setVendors(res.data);
    } catch (e) {
      setError("Failed to load vendors");
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      setName(res.data.name);
      setCategory(res.data.category || "");
      setDescription(res.data.description || "");
      setVendorId(res.data.vendor_id);
    } catch (e) {
      setError("Failed to load product");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !vendorId) return;
    try {
      await api.put(`/products/${id}`, {
        name,
        category,
        description,
        vendor_id: vendorId,
      });
      navigate("/products");
    } catch (e) {
      setError("Failed to update product");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Product name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              className="w-full border px-3 py-2 rounded"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g., Web Application, Service, OS"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor *</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              required
            >
              <option value="">Select vendor</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (Markdown supported)</label>
          <textarea
            className="w-full border px-3 py-2 rounded h-32 font-mono text-sm"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={`Describe what this product does, its features, etc.\n\nYou can use Markdown formatting:\n**Bold text**\n*Italic text*\n- Bullet points\n1. Numbered lists\n\`\`\`code blocks\`\`\`\n[Links](https://example.com)`}
          />
          {description && (
            <div className="mt-2 p-3 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500 mb-2">Preview:</div>
              <MarkdownRenderer content={description} />
            </div>
          )}
        </div>
        {error && <div className="text-red-600 mb-2 p-3 bg-red-50 rounded border">{error}</div>}
        <div className="mt-4 flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Save</button>
          <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => navigate("/products")}>Cancel</button>
        </div>
      </form>
    </div>
  );
} 