import React, { useEffect, useState } from "react";
import api from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";
import Modal from "../components/Modal";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingVendorId, setEditingVendorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalContent, setModalContent] = useState({ isOpen: false, title: "", content: "" });

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get("/vendors");
      setVendors(res.data);
    } catch (e) {
      setError("Failed to load vendors");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (e) {
      setError("Failed to load products");
    }
    setLoading(false);
  };

  const addProduct = async (e) => {
    e.preventDefault();
    if (!name || !vendorId) return;
    try {
      await api.post("/products", { 
        name, 
        category, 
        description, 
        vendor_id: vendorId 
      });
      setName("");
      setCategory("");
      setDescription("");
      setVendorId("");
      fetchProducts();
    } catch (e) {
      setError("Failed to add product");
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setEditingName(product.name);
    setEditingCategory(product.category || "");
    setEditingDescription(product.description || "");
    setEditingVendorId(product.vendor_id);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/products/${id}`, { 
        name: editingName, 
        category: editingCategory,
        description: editingDescription,
        vendor_id: editingVendorId 
      });
      setEditingId(null);
      setEditingName("");
      setEditingCategory("");
      setEditingDescription("");
      setEditingVendorId("");
      fetchProducts();
    } catch (e) {
      setError("Failed to update product");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (e) {
      setError("Failed to delete product");
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <form onSubmit={addProduct} className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" type="submit">Add Product</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description (Markdown supported)</label>
          <textarea
            className="w-full border px-3 py-2 rounded h-32 font-mono text-sm"
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
            <div className="mt-2 p-3 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500 mb-2">Preview:</div>
              <MarkdownRenderer content={description} />
            </div>
          )}
        </div>
      </form>
      {error && <div className="text-red-600 mb-2 p-3 bg-red-50 rounded border">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left font-medium">Vendor Name</th>
                  <th className="p-3 text-left font-medium">Product Name</th>
                  <th className="p-3 text-left font-medium">Category</th>
                  <th className="p-3 text-left font-medium">Description</th>
                  <th className="p-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {editingId === p.id ? (
                        <select
                          className="w-full border px-2 py-1 rounded"
                          value={editingVendorId}
                          onChange={e => setEditingVendorId(e.target.value)}
                        >
                          <option value="">Select vendor</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium">{vendors.find(v => v.id === p.vendor_id)?.name || ""}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === p.id ? (
                        <input
                          className="w-full border px-2 py-1 rounded"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                        />
                      ) : (
                        <a
                          href={`/methods?product=${p.id}`}
                          className="text-blue-600 underline hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          {p.name}
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === p.id ? (
                        <input
                          className="w-full border px-2 py-1 rounded"
                          value={editingCategory}
                          onChange={e => setEditingCategory(e.target.value)}
                        />
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {p.category || "Not specified"}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === p.id ? (
                        <div>
                          <textarea
                            className="w-full border px-2 py-1 rounded h-20 text-sm font-mono"
                            value={editingDescription}
                            onChange={e => setEditingDescription(e.target.value)}
                            placeholder="Markdown supported..."
                          />
                          {editingDescription && (
                            <div className="mt-1 p-2 bg-gray-50 rounded border">
                              <div className="text-xs text-gray-500 mb-1">Preview:</div>
                              <MarkdownRenderer content={editingDescription} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-xs">
                          {p.description ? (
                            <div className="text-sm">
                              <MarkdownRenderer 
                                content={p.description.length > 200 
                                  ? p.description.substring(0, 200) + "..." 
                                  : p.description
                                } 
                              />
                              {p.description.length > 200 && (
                                <button 
                                  className="text-blue-600 text-xs mt-1 underline"
                                  onClick={() => {
                                    setModalContent({
                                      isOpen: true,
                                      title: `${p.name} - Full Description`,
                                      content: p.description
                                    });
                                  }}
                                >
                                  Show More
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No description</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {editingId === p.id ? (
                        <div className="flex gap-2 justify-center">
                          <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700" onClick={() => saveEdit(p.id)}>Save</button>
                          <button className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-center">
                          <button className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600" onClick={() => startEdit(p)}>Edit</button>
                          <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700" onClick={() => deleteProduct(p.id)}>Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found. Add your first product above.
            </div>
          )}
        </div>
      )}
      
      <Modal
        isOpen={modalContent.isOpen}
        onClose={() => setModalContent({ isOpen: false, title: "", content: "" })}
        title={modalContent.title}
      >
        <MarkdownRenderer content={modalContent.content} />
      </Modal>
    </div>
  );
} 