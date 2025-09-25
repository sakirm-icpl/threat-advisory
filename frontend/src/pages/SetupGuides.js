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
  const [expandedProducts, setExpandedProducts] = useState(new Set());
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
      setShowAddForm(false);
      setSuccess("Setup guide added!");
      fetchGuides();
    } catch (e) {
      setError("Failed to add setup guide");
    }
  };

  const resetForm = () => {
    setForm({ product_id: "", instructions: "" });
    setShowAddForm(false);
    setError("");
    setSuccess("");
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
  
  // Group guides by product
  const groupedGuides = filteredGuides.reduce((acc, guide) => {
    const productId = guide.product_id;
    if (!acc[productId]) {
      acc[productId] = {
        product_id: productId,
        product_name: products.find(p => p.id === productId)?.name || "Unknown Product",
        product_info: products.find(p => p.id === productId) || {},
        guides: []
      };
    }
    acc[productId].guides.push(guide);
    return acc;
  }, {});

  const getProduct = (id) => products.find(p => p.id === id) || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Setup Guides</h1>
          <p className="text-gray-600">Manage your setup guides for product configuration and onboarding</p>
        </div>
        {/* Allow both admin and contributor to add setup guides */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Setup Guide'}
        </button>
      </div>
      {/* Allow both admin and contributor to see the add form */}
      {showAddForm && (
        <form onSubmit={addGuide} className="bg-white p-8 rounded-2xl mb-8 w-full shadow-xl border border-blue-100">
          <div className="flex justify-between items-start mb-6">
            <div className="font-semibold text-lg">Add Setup Guide</div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" type="submit">Add Setup Guide</button>
              <button 
                type="button" 
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
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
                  className="w-full border px-3 py-2 rounded h-60 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="instructions"
                  value={form.instructions}
                  onChange={handleFormChange}
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
        </form>
      )}
      {!showAddForm && (
        <>
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
          ) : Object.keys(groupedGuides).length === 0 ? (
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
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Setup Guides</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(groupedGuides).map(productGroup => {
                  const isExpanded = expandedProducts.has(productGroup.product_id);
                  const displayGuides = isExpanded ? productGroup.guides : productGroup.guides.slice(0, 2);
                  const hiddenGuidesCount = productGroup.guides.length - displayGuides.length;
                  
                  return (
                    <tr key={productGroup.product_id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{productGroup.product_name}</span>
                          <span className="text-xs text-gray-500">
                            {productGroup.guides.length} guide{productGroup.guides.length !== 1 ? 's' : ''}
                          </span>
                          {productGroup.product_info.category && (
                            <span className="text-xs text-gray-400 mt-1">
                              {productGroup.product_info.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="space-y-3">
                          {displayGuides.map((guide, idx) => (
                            <div key={guide.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 mb-2">Setup Guide #{idx + 1}</div>
                                  <div className="prose prose-sm max-w-none">
                                    <MarkdownRenderer 
                                      content={guide.instructions.length > 150 
                                        ? guide.instructions.slice(0, 150) + '...' 
                                        : guide.instructions
                                      }
                                    />
                                  </div>
                                  {guide.instructions.length > 150 && (
                                    <button
                                      className="text-blue-600 text-xs mt-2 underline hover:text-blue-800"
                                      onClick={() => setModalContent({
                                        isOpen: true,
                                        title: `${productGroup.product_name} - Setup Guide #${idx + 1}`,
                                        content: guide.instructions
                                      })}
                                    >
                                      Show Full Instructions
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-1 ml-3">
                                  {/* Allow edit/delete if user is admin OR owns the record */}
                                  {(user?.role === 'admin' || guide.created_by === user?.id) && (
                                    <>
                                      <button 
                                        className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors" 
                                        onClick={() => navigate(`/setup-guides/${guide.id}/edit`)}
                                      >
                                        Edit
                                      </button>
                                      <button 
                                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors" 
                                        onClick={() => deleteGuide(guide.id)}
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                  {/* Show view-only indicator for records user doesn't own */}
                                  {user?.role === 'contributor' && guide.created_by !== user?.id && (
                                    <span className="text-xs text-gray-500 italic">View Only</span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Created By Information */}
                              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center">
                                <span>Created by: </span>
                                {guide.creator ? (
                                  <div className="flex items-center ml-1">
                                    {guide.creator.avatar_url ? (
                                      <img 
                                        src={guide.creator.avatar_url} 
                                        alt={guide.creator.github_username || guide.creator.username}
                                        className="h-4 w-4 rounded-full mr-1"
                                      />
                                    ) : (
                                      <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center mr-1 text-[8px] font-semibold">
                                        {(guide.creator.github_username || guide.creator.username || '?').charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="font-medium">
                                      {guide.creator.github_username || guide.creator.username}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-medium">Unknown</span>
                                )}
                              </div>
                              
                              <div className="text-xs text-gray-500 mt-2">
                                Created: {new Date(guide.created_at).toLocaleDateString()}
                                {guide.updated_at && guide.updated_at !== guide.created_at && (
                                  <span className="ml-2">• Updated: {new Date(guide.updated_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {hiddenGuidesCount > 0 && (
                            <div className="text-center">
                              <button 
                                className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                                onClick={() => {
                                  const newExpanded = new Set(expandedProducts);
                                  newExpanded.add(productGroup.product_id);
                                  setExpandedProducts(newExpanded);
                                }}
                              >
                                Show {hiddenGuidesCount} more guide{hiddenGuidesCount !== 1 ? 's' : ''}
                              </button>
                            </div>
                          )}
                          
                          {isExpanded && productGroup.guides.length > 2 && (
                            <div className="text-center">
                              <button 
                                className="text-xs text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                                onClick={() => {
                                  const newExpanded = new Set(expandedProducts);
                                  newExpanded.delete(productGroup.product_id);
                                  setExpandedProducts(newExpanded);
                                }}
                              >
                                Show less
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
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