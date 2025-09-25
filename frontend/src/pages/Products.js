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
  const [expandedVendors, setExpandedVendors] = useState(new Set());
  const [filterVendor, setFilterVendor] = useState("");
  const [search, setSearch] = useState("");
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

  // Filtering and grouping
  const filteredProducts = products.filter(p => {
    const vendorMatch = !filterVendor || String(p.vendor_id) === String(filterVendor);
    const searchMatch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return vendorMatch && searchMatch;
  });
  
  // Group products by vendor
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const vendorId = product.vendor_id;
    if (!acc[vendorId]) {
      acc[vendorId] = {
        vendor_id: vendorId,
        vendor_name: vendors.find(v => v.id === vendorId)?.name || "Unknown Vendor",
        products: []
      };
    }
    acc[vendorId].products.push(product);
    return acc;
  }, {});

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
        </form>
      )}
      
      {!showAddForm && (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-2">
            <select
              className="border px-3 py-2 rounded"
              value={filterVendor}
              onChange={e => setFilterVendor(e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            <input
              className="border px-3 py-2 rounded flex-1"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
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
                      <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Vendor</th>
                      <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Products</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedProducts).map(vendorGroup => {
                      const isExpanded = expandedVendors.has(vendorGroup.vendor_id);
                      const displayProducts = isExpanded ? vendorGroup.products : vendorGroup.products.slice(0, 2);
                      const hiddenProductsCount = vendorGroup.products.length - displayProducts.length;
                      
                      return (
                        <tr key={vendorGroup.vendor_id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium align-top">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <div className="bg-blue-100 rounded-full p-2 mr-3">
                                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <span className="text-sm font-semibold">{vendorGroup.vendor_name}</span>
                              </div>
                              <span className="text-xs text-gray-500 ml-11">
                                {vendorGroup.products.length} product{vendorGroup.products.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 align-top">
                            <div className="space-y-3">
                              {displayProducts.map((product, idx) => (
                                <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={`/methods?product=${product.id}`}
                                        className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer transition-colors duration-200 hover:underline text-sm"
                                      >
                                        {product.name}
                                      </a>
                                      {product.category && (
                                        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                          {product.category}
                                        </span>
                                      )}
                                    </div>
                                    {(user?.role === 'admin' || product.created_by === user?.id) && (
                                      <div className="flex gap-1">
                                        <button 
                                          className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors" 
                                          onClick={() => navigate(`/products/${product.id}/edit`)}
                                        >
                                          Edit
                                        </button>
                                        <button 
                                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors" 
                                          onClick={() => deleteProduct(product.id)}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                    {/* Show view-only indicator for records user doesn't own */}
                                    {user?.role === 'contributor' && product.created_by !== user?.id && (
                                      <span className="text-xs text-gray-500 italic">View Only</span>
                                    )}
                                  </div>
                                  
                                  {/* Description Preview */}
                                  {product.description ? (
                                    <div className="text-xs text-gray-600">
                                      <MarkdownRenderer 
                                        content={product.description.length > 150 
                                          ? product.description.substring(0, 150) + "..." 
                                          : product.description
                                        } 
                                      />
                                      {product.description.length > 150 && (
                                        <button 
                                          className="text-blue-600 text-xs mt-1 px-2 py-0.5 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors duration-200"
                                          onClick={() => {
                                            setModalContent({
                                              isOpen: true,
                                              title: `${product.name} - Full Description`,
                                              content: product.description
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
                                  
                                  {/* Created By Information */}
                                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center">
                                    <span>Created by: </span>
                                    {product.creator ? (
                                      <div className="flex items-center ml-1">
                                        {product.creator.avatar_url ? (
                                          <img 
                                            src={product.creator.avatar_url} 
                                            alt={product.creator.github_username || product.creator.username}
                                            className="h-4 w-4 rounded-full mr-1"
                                          />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center mr-1 text-[8px] font-semibold">
                                            {(product.creator.github_username || product.creator.username || '?').charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="font-medium">
                                          {product.creator.github_username || product.creator.username}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="font-medium">Unknown</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              {hiddenProductsCount > 0 && (
                                <div className="text-center">
                                  <button 
                                    className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors"
                                    onClick={() => {
                                      const newExpanded = new Set(expandedVendors);
                                      newExpanded.add(vendorGroup.vendor_id);
                                      setExpandedVendors(newExpanded);
                                    }}
                                  >
                                    Show {hiddenProductsCount} more product{hiddenProductsCount !== 1 ? 's' : ''}
                                  </button>
                                </div>
                              )}
                              
                              {isExpanded && vendorGroup.products.length > 2 && (
                                <div className="text-center">
                                  <button 
                                    className="text-xs text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded transition-colors"
                                    onClick={() => {
                                      const newExpanded = new Set(expandedVendors);
                                      newExpanded.delete(vendorGroup.vendor_id);
                                      setExpandedVendors(newExpanded);
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
              {Object.keys(groupedProducts).length === 0 && (
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
        </>
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