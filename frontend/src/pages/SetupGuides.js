import React, { useEffect, useState } from "react";
import api from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import Modal from "../components/Modal";

export default function SetupGuides() {
  const [guides, setGuides] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: "", instructions: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [modalContent, setModalContent] = useState({ isOpen: false, title: '', content: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchGuides();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (e) {
      setError("Failed to load products");
    }
  };

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const res = await api.get("/setup-guides");
      setGuides(res.data);
    } catch (e) {
      setError("Failed to load setup guides");
    }
    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const addGuide = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.product_id || !form.instructions) {
      setError("Product and instructions are required");
      return;
    }
    try {
      await api.post("/setup-guides", form);
      setForm({ product_id: "", instructions: "" });
      setSuccess("Setup guide added!");
      fetchGuides();
    } catch (e) {
      setError("Failed to add setup guide");
    }
  };

  const deleteGuide = async (id) => {
    if (!window.confirm("Delete this setup guide?")) return;
    setError(""); setSuccess("");
    try {
      await api.delete(`/setup-guides/${id}`);
      setSuccess("Setup guide deleted.");
      fetchGuides();
    } catch (e) {
      setError("Failed to delete setup guide");
    }
  };

  // Filtering and searching
  const filteredGuides = guides.filter(g => {
    const productMatch = !filterProduct || String(g.product_id) === String(filterProduct);
    const searchMatch = !search || g.instructions.toLowerCase().includes(search.toLowerCase());
    return productMatch && searchMatch;
  });

  const getProduct = (id) => products.find(p => p.id === id) || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Setup Guides</h1>
          <p className="text-gray-600">Manage your setup guides for product configuration and onboarding</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? 'Cancel' : '+ Add Setup Guide'}
          </button>
        )}
      </div>
      {user?.role === 'admin' && showAddForm && (
        <form onSubmit={addGuide} className="bg-white p-8 rounded-2xl mb-8 w-full shadow-xl border border-blue-100">
          <div className="flex justify-between items-start mb-6">
            <div className="font-semibold text-lg">Add Setup Guide</div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" type="submit">Add Setup Guide</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product *</label>
                <select
                  className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium mb-1">Instructions * (Markdown supported)</label>
                <textarea
                  className="w-full border px-3 py-2 rounded h-40 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="instructions"
                  value={form.instructions}
                  onChange={handleFormChange}
                  placeholder={`Setup instructions (markdown supported)\n\nExample:\n# Setup Steps\n1. Install dependencies\n2. Configure settings\n3. Run the application\n\n**Important:** Make sure to...`}
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
        </form>
      )}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
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
          placeholder="Search instructions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded border">{error}</div>}
      {success && <div className="text-green-700 mb-2 p-2 bg-green-50 rounded border">{success}</div>}
      {loading ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading setup guides...</p>
        </div>
      ) : filteredGuides.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium text-lg">No setup guides found</p>
          <p className="text-gray-400 text-sm mt-2">Add your first setup guide using the button above</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Product</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Category</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Description</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Instructions</th>
                  {user?.role === 'admin' && <th className="p-4 text-center font-semibold text-gray-700 uppercase tracking-wide text-sm">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredGuides.map(g => {
                  const product = getProduct(g.product_id);
                  const isExpanded = expanded[g.id];
                  return (
                    <tr key={g.id} className="border-t align-top">
                      <td className="p-4 font-medium">{product.name || "-"}</td>
                      <td className="p-4">{product.category || <span className="text-gray-400">-</span>}</td>
                      <td className="p-4 max-w-xs">
                        {product.description ? (
                          <span className="text-xs text-gray-700">{product.description.length > 60 ? product.description.slice(0, 60) + "..." : product.description}</span>
                        ) : <span className="text-gray-400 text-xs">-</span>}
                      </td>
                      <td className="p-4 max-w-md">
                        <div>
                          <MarkdownRenderer 
                            content={g.instructions.length < 200 && !isExpanded
                              ? g.instructions
                              : g.instructions.slice(0, 200) + '...'}
                          />
                        </div>
                        {g.instructions.length > 200 && (
                          <button
                            className="text-blue-600 text-xs mt-1 underline"
                            onClick={() => setModalContent({
                              isOpen: true,
                              title: `${product.name || ''} - Full Instructions`,
                              content: g.instructions
                            })}
                          >
                            Show More
                          </button>
                        )}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="p-4 flex gap-2">
                          <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => navigate(`/setup-guides/${g.id}/edit`)}>Edit</button>
                          <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => deleteGuide(g.id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Modal
        isOpen={modalContent.isOpen}
        onClose={() => setModalContent({ isOpen: false, title: '', content: '' })}
        title={modalContent.title}
      >
        <MarkdownRenderer content={modalContent.content} />
      </Modal>
    </div>
  );
} 