import React, { useEffect, useState } from "react";
import api from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalContent, setModalContent] = useState({ isOpen: false, title: "", content: "" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog and version detection targets</p>
        </div>
        {/* Allow both admin and contributor to add products */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>
      {/* Allow both admin and contributor to see the add form */}
      {showAddForm && (
        <form onSubmit={addProduct} className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-2xl mb-8 w-full flex flex-col gap-6 shadow-xl border border-blue-100">
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
              <button className="btn btn-primary w-full" type="submit">Add Product</button>
            </div>
          </div>
          <div>
            <label className="label">Description (Markdown supported)</label>
            <textarea
              className="input h-32 font-mono text-sm resize-none"
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
        </form>
      )}
      {error && (
        <div className="alert alert-warning mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}
      {loading ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Vendor Name</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Product Name</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Category</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Description</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Created By</th>
                  <th className="p-4 text-center font-semibold text-gray-700 uppercase tracking-wide text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="table-row-hover border-b border-gray-100">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-800">{vendors.find(v => v.id === p.vendor_id)?.name || ""}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <a
                        href={`/methods?product=${p.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors duration-200 hover:underline"
                      >
                        {p.name}
                      </a>
                    </td>
                    <td className="p-4">
                        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {p.category || "Not specified"}
                        </span>
                    </td>
                    <td className="p-4">
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
                                  className="text-blue-600 text-xs mt-2 px-2 py-1 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors duration-200"
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
                            <span className="text-gray-400 text-xs italic">No description</span>
                          )}
                        </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {p.creator ? (
                        <div className="flex items-center">
                          {p.creator.avatar_url ? (
                            <img 
                              src={p.creator.avatar_url} 
                              alt={p.creator.github_username || p.creator.username}
                              className="h-6 w-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-2 text-xs font-semibold">
                              {(p.creator.github_username || p.creator.username || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          {p.creator.github_username || p.creator.username}
                        </div>
                      ) : (
                        'Unknown'
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-2 justify-center">
                        {/* Allow edit/delete if user is admin OR owns the record */}
                        {(user?.role === 'admin' || p.created_by === user?.id) && (
                          <>
                            <button 
                              className="btn btn-warning btn-sm" 
                              onClick={() => navigate(`/products/${p.id}/edit`)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => deleteProduct(p.id)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {/* Show view-only indicator for records user doesn't own */}
                        {user?.role === 'contributor' && p.created_by !== user?.id && (
                          <span className="text-xs text-gray-500 italic">View Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {products.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-2">Add your first product using the button above</p>
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