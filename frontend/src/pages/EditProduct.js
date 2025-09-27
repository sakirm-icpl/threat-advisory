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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update your product information and configuration</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl mb-8 w-full flex flex-col gap-6 shadow-xl border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="label">Product Name *</label>
            <input
              className="input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Product name"
              required
            />
          </div>
          <div>
            <label className="label">Category</label>
            <input
              className="input"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g., Web Application, Service, OS"
            />
          </div>
          <div>
            <label className="label">Vendor *</label>
            <select
              className="input"
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
          <div className="flex items-end">
            <button className="btn btn-primary w-full" type="submit">Save Changes</button>
          </div>
        </div>
        <div>
          <label className="label">Description (Markdown supported)</label>
          <textarea
            className="input h-48 font-mono text-sm resize-none"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={`Describe what this product does, its features, etc.

You can use Markdown formatting:
**Bold text**
*Italic text*
- Bullet points
1. Numbered lists
\`\`\`code blocks\`\`\`
[Links](https://example.com)`}
          />
          {description && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Preview:</div>
              <MarkdownRenderer content={description} />
            </div>
          )}
        </div>
        {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded border">{error}</div>}
        <div className="flex gap-2 mt-4 justify-end">
          <button className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600" type="button" onClick={() => navigate("/products")}>Cancel</button>
        </div>
      </form>
    </div>
  );
} 