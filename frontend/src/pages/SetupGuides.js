import React, { useEffect, useState } from "react";
import api from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import Modal from "../components/Modal";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-slate-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="glass-effect p-4 rounded-xl border border-slate-600">
              <DocumentTextIcon className="h-12 w-12 text-blue-400" />
            </div>
            <div>
              <h1 className="hero-title text-3xl lg:text-4xl mb-2">
                <span className="gradient-text">Setup Guides</span>
              </h1>
              <p className="hero-subtitle">
                Implementation guides for cybersecurity product configuration
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4"
          >
            <DocumentTextIcon className="h-6 w-6" />
            {showAddForm ? 'Cancel Operation' : 'Add Setup Guide'}
          </button>
        </div>
      </div>
      {/* Add Setup Guide Form */}
      {showAddForm && (
        <div className="card-cyber">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 shadow-glow">
              <DocumentTextIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Add Implementation Guide</h2>
              <p className="text-slate-400">Create a new cybersecurity setup guide</p>
            </div>
          </div>
          <form onSubmit={addGuide} className="form-group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="label">Security Product *</label>
                  <select
                    className="input"
                    name="product_id"
                    value={form.product_id}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select security product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Implementation Instructions * (Markdown supported)</label>
                  <textarea
                    className="input h-60 font-mono text-sm resize-none"
                    name="instructions"
                    value={form.instructions}
                    onChange={handleFormChange}
                    placeholder={`Security implementation instructions (markdown supported)

Example:
# Security Setup Steps
1. Install security dependencies
2. Configure security settings
3. Deploy security measures
4. Verify security implementation

**Critical:** Ensure all security protocols are followed...`}
                    required
                  />
                </div>
              </div>
              <div className="card-glass p-4 h-full overflow-auto border border-slate-600">
                <div className="text-xs text-blue-400 mb-1 font-semibold">Security Guide Preview:</div>
                <div className="prose prose-sm max-w-none text-slate-300">
                  <MarkdownRenderer content={form.instructions || 'Nothing to preview yet.'} />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button className="btn-primary flex items-center gap-2" type="submit">
                <DocumentTextIcon className="h-5 w-5" />
                Deploy Setup Guide
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancel Operation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      {!showAddForm && (
        <>
          <div className="card-cyber mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-slate-500/20 border border-slate-500/30 rounded-xl p-3 shadow-glow">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Filter & Search</h2>
                <p className="text-slate-400">Locate specific security guides</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                className="input flex-1"
                value={filterProduct}
                onChange={e => setFilterProduct(e.target.value)}
              >
                <option value="">All Security Products</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                className="input flex-1"
                placeholder="Search implementation guides..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="alert-error mb-6">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="alert-success mb-6">
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}
          {loading ? (
            <div className="card-cyber text-center py-16">
              <div className="loading-spinner mx-auto mb-6"></div>
              <p className="text-slate-300 font-medium text-lg">Loading security guides...</p>
              <p className="text-slate-500 text-sm mt-2">Scanning implementation database</p>
            </div>
          ) : Object.keys(groupedGuides).length === 0 ? (
            <div className="card-cyber text-center py-16">
              <div className="glass-effect p-6 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-slate-600">
                <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-300 font-medium text-xl mb-2">No Security Guides Found</p>
              <p className="text-slate-500 mb-6">Deploy your first implementation guide to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Guide
              </button>
            </div>
          ) : (
            <div className="card-cyber overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/50 border-b border-slate-700">
                      <th className="p-6 text-left font-semibold text-slate-300 uppercase tracking-wide text-sm">Security Product</th>
                      <th className="p-6 text-left font-semibold text-slate-300 uppercase tracking-wide text-sm">Implementation Guides</th>
                    </tr>
                  </thead>
              <tbody>
                {Object.values(groupedGuides).map(productGroup => {
                  const isExpanded = expandedProducts.has(productGroup.product_id);
                  const displayGuides = isExpanded ? productGroup.guides : productGroup.guides.slice(0, 2);
                  const hiddenGuidesCount = productGroup.guides.length - displayGuides.length;

                  return (
                    <tr key={productGroup.product_id} className="border-b border-slate-700 hover:bg-slate-800/30 transition-colors">
                      <td className="p-6 font-medium align-top">
                        <div className="flex flex-col">
                          <span className="text-lg font-semibold text-slate-200">{productGroup.product_name}</span>
                          <span className="text-sm text-blue-400 font-medium">
                            {productGroup.guides.length} guide{productGroup.guides.length !== 1 ? 's' : ''}
                          </span>
                          {productGroup.product_info.category && (
                            <span className="text-xs text-slate-500 mt-1 px-2 py-1 bg-slate-700/50 rounded-md inline-block w-fit">
                              {productGroup.product_info.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-6 align-top">
                        <div className="space-y-3">
                          {displayGuides.map((guide, idx) => (
                            <div key={guide.id} className="card-glass border border-slate-600 rounded-xl p-6 shadow-cyber">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="text-base font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                    <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs font-bold">
                                      GUIDE #{idx + 1}
                                    </span>
                                  </div>
                                  <div className="prose prose-sm max-w-none text-slate-300">
                                    <MarkdownRenderer
                                      content={guide.instructions.length > 150
                                        ? guide.instructions.slice(0, 150) + '...'
                                        : guide.instructions
                                      }
                                    />
                                  </div>
                                  {guide.instructions.length > 150 && (
                                    <button
                                      className="text-blue-400 text-sm mt-3 hover:text-blue-300 transition-colors flex items-center gap-1 font-medium"
                                      onClick={() => setModalContent({
                                        isOpen: true,
                                        title: `${productGroup.product_name} - Setup Guide #${idx + 1}`,
                                        content: guide.instructions
                                      })}
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View Complete Guide
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  {/* Allow edit/delete if user is admin OR owns the record */}
                                  {(user?.role === 'admin' || guide.created_by === user?.id) && (
                                    <>
                                      <button
                                        className="btn-secondary-sm flex items-center gap-1"
                                        onClick={() => navigate(`/setup-guides/${guide.id}/edit`)}
                                      >
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit
                                      </button>
                                      <button
                                        className="btn-danger-sm flex items-center gap-1"
                                        onClick={() => deleteGuide(guide.id)}
                                      >
                                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete
                                      </button>
                                    </>
                                  )}
                                  {/* Show view-only indicator for records user doesn't own */}
                                  {user?.role === 'contributor' && guide.created_by !== user?.id && (
                                    <span className="text-xs text-slate-500 italic bg-slate-700/30 px-2 py-1 rounded">View Only</span>
                                  )}
                                </div>
                              </div>

                              {/* Created By Information */}
                              <div className="mt-4 pt-4 border-t border-slate-600 text-sm text-slate-400 flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="text-slate-500">Created by: </span>
                                  {guide.creator ? (
                                    <div className="flex items-center ml-2">
                                      {guide.creator.avatar_url ? (
                                        <img
                                          src={guide.creator.avatar_url}
                                          alt={guide.creator.github_username || guide.creator.username}
                                          className="h-5 w-5 rounded-full mr-2 border border-slate-600"
                                        />
                                      ) : (
                                        <div className="h-5 w-5 rounded-full bg-slate-600 flex items-center justify-center mr-2 text-xs font-semibold text-slate-300">
                                          {(guide.creator.github_username || guide.creator.username || '?').charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="font-medium text-slate-300">
                                        {guide.creator.github_username || guide.creator.username}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="font-medium text-slate-400">Unknown</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {new Date(guide.created_at).toLocaleDateString()}
                                  {guide.updated_at && guide.updated_at !== guide.created_at && (
                                    <span className="ml-2">• Updated: {new Date(guide.updated_at).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {hiddenGuidesCount > 0 && (
                            <div className="text-center">
                              <button
                                className="btn-secondary-sm flex items-center gap-2 mx-auto"
                                onClick={() => {
                                  const newExpanded = new Set(expandedProducts);
                                  newExpanded.add(productGroup.product_id);
                                  setExpandedProducts(newExpanded);
                                }}
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Show {hiddenGuidesCount} more guide{hiddenGuidesCount !== 1 ? 's' : ''}
                              </button>
                            </div>
                          )}

                          {isExpanded && productGroup.guides.length > 2 && (
                            <div className="text-center">
                              <button
                                className="btn-secondary-sm flex items-center gap-2 mx-auto"
                                onClick={() => {
                                  const newExpanded = new Set(expandedProducts);
                                  newExpanded.delete(productGroup.product_id);
                                  setExpandedProducts(newExpanded);
                                }}
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
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
    <div className="prose prose-sm max-w-none text-slate-300">
      <MarkdownRenderer content={modalContent.content} />
    </div>
  </Modal>
</div>
);
}