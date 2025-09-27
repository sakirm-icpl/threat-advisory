import React, { useEffect, useState } from "react";
import api from "../services/api";
import MarkdownRenderer from "../components/MarkdownRenderer";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { 
  ShieldCheckIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-cyber-600/30 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="glass-effect p-4 rounded-xl border border-cyber-600/30">
              <ShieldCheckIcon className="h-12 w-12 text-cyber-400" />
            </div>
            <div>
              <h1 className="hero-title text-3xl lg:text-4xl mb-2">
                <span className="gradient-text">Security Products</span>
              </h1>
              <p className="hero-subtitle mb-4">
                Manage your cybersecurity product catalog and version detection targets
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-400 rounded-full animate-pulse"></div>
                  {products.length} Security Products
                </div>
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-security-success rounded-full animate-pulse delay-300"></div>
                  Version Detection Ready
                </div>
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse delay-600"></div>
                  Threat Intelligence Active
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4"
          >
            <PlusIcon className="h-6 w-6" />
            {showAddForm ? 'Cancel Operation' : 'Add Security Product'}
          </button>
        </div>
      </div>
      {/* Add Product Form */}
      {showAddForm && (
        <div className="card-cyber">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-xl p-3 shadow-glow">
              <PlusIcon className="h-6 w-6 text-cyber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-100">Add New Security Product</h2>
              <p className="text-gray-400">Register a new cybersecurity product for version detection</p>
            </div>
          </div>
        <form onSubmit={addProduct} className="form-group">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="label">Security Product Name *</label>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Apache HTTP Server, Nginx, WordPress"
                required
              />
            </div>
            <div>
              <label className="label">Product Category</label>
              <input
                className="input"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g., Web Server, CMS, Database, Firewall"
              />
            </div>
            <div>
              <label className="label">Security Vendor *</label>
              <select
                className="input"
                value={vendorId}
                onChange={e => setVendorId(e.target.value)}
                required
              >
                <option value="">Select security vendor</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn-primary w-full flex items-center justify-center gap-2" type="submit">
                <ShieldCheckIcon className="h-5 w-5" />
                Deploy Product
              </button>
            </div>
          </div>
          <div>
            <label className="label">Product Description (Markdown supported)</label>
            <textarea
              className="input h-48 font-mono text-sm resize-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={`Describe the security product, its features, vulnerabilities, etc.

You can use Markdown formatting:
**Bold text** - for important security notes
*Italic text* - for emphasis
- Bullet points for features
1. Numbered lists for procedures
\`\`\`code blocks\`\`\` - for configuration examples
[Links](https://example.com) - for documentation`}
            />
            {description && (
              <div className="mt-4 card-glass p-4 border border-cyber-600/30">
                <div className="text-xs font-semibold text-cyber-400 mb-3 uppercase tracking-wide">Security Intelligence Preview:</div>
                <MarkdownRenderer content={description} />
              </div>
            )}
          </div>
        </form>
        </div>
      )}
      
      {!showAddForm && (
        <>
          {/* Search and Filter Controls */}
          <div className="card-cyber p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-xl p-3 shadow-glow">
                <MagnifyingGlassIcon className="h-6 w-6 text-cyber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-100">Threat Intelligence Search</h3>
                <p className="text-gray-400 text-sm">Filter and search security products</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <select
                  className="input w-full md:w-auto"
                  value={filterVendor}
                  onChange={e => setFilterVendor(e.target.value)}
                >
                  <option value="">🏢 All Security Vendors</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className="input pl-10 w-full"
                  placeholder="Search security products, categories, descriptions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
          {/* Error Alert */}
          {error && (
            <div className="alert-error">
              <div className="flex items-center gap-3">
                <div className="bg-security-critical/20 rounded-full p-2 border border-security-critical/30">
                  <ExclamationTriangleIcon className="h-5 w-5 text-security-critical" />
                </div>
                <div>
                  <h3 className="font-semibold text-security-critical">Security Operation Failed</h3>
                  <p className="text-security-critical/80">{error}</p>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="card-cyber text-center py-16">
              <div className="loading-spinner mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-gray-100 mb-2">Scanning Security Products</h3>
              <p className="text-gray-400">Analyzing cybersecurity product catalog...</p>
              <div className="mt-4 flex justify-center">
                <div className="terminal text-xs">
                  <div className="text-matrix-green">$ nmap -sV security-products.db</div>
                  <div className="text-cyber-400">Scanning... Please wait</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="table-modern">
              <div className="overflow-x-auto scrollbar-cyber">
                <table className="w-full">
                  <thead>
                    <tr className="table-header">
                      <th className="table-cell text-left">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="h-5 w-5 text-cyber-400" />
                          <span className="gradient-text">Security Vendor</span>
                        </div>
                      </th>
                      <th className="table-cell text-left">
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="h-5 w-5 text-cyber-400" />
                          <span className="gradient-text">Security Products</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedProducts).map(vendorGroup => {
                      const isExpanded = expandedVendors.has(vendorGroup.vendor_id);
                      const displayProducts = isExpanded ? vendorGroup.products : vendorGroup.products.slice(0, 2);
                      const hiddenProductsCount = vendorGroup.products.length - displayProducts.length;
                      
                      return (
                        <tr key={vendorGroup.vendor_id} className="table-row-hover border-b border-dark-700/50 last:border-b-0">
                          <td className="table-cell align-top">
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <div className="bg-gradient-to-br from-cyber-500/20 to-cyber-600/20 border border-cyber-500/30 rounded-xl p-2 mr-3 shadow-glow">
                                  <BuildingOfficeIcon className="h-4 w-4 text-cyber-400" />
                                </div>
                                <span className="text-sm font-semibold text-gray-200">{vendorGroup.vendor_name}</span>
                              </div>
                              <span className="text-xs text-gray-400 ml-11">
                                {vendorGroup.products.length} security product{vendorGroup.products.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                          <td className="table-cell align-top">
                            <div className="space-y-3">
                              {displayProducts.map((product, idx) => (
                                <div key={product.id} className="card-glass border border-cyber-600/30 rounded-lg p-3 shadow-glow hover:border-cyber-500/50 transition-all duration-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={`/methods?product=${product.id}`}
                                        className="text-cyber-400 hover:text-cyber-300 font-semibold cursor-pointer transition-colors duration-200 hover:underline text-sm flex items-center gap-1"
                                      >
                                        <CubeIcon className="h-4 w-4" />
                                        {product.name}
                                      </a>
                                      {product.category && (
                                        <span className="status-info text-xs">
                                          {product.category}
                                        </span>
                                      )}
                                    </div>
                                    {(user?.role === 'admin' || product.created_by === user?.id) && (
                                      <div className="flex gap-1">
                                        <button 
                                          className="btn-outline btn-sm flex items-center gap-1 text-cyber-400 border-cyber-500/50 hover:bg-cyber-500 hover:text-white" 
                                          onClick={() => navigate(`/products/${product.id}/edit`)}
                                        >
                                          <PencilIcon className="h-3 w-3" />
                                          Modify
                                        </button>
                                        <button 
                                          className="btn-outline btn-sm flex items-center gap-1 text-security-critical border-security-critical/50 hover:bg-security-critical hover:text-white" 
                                          onClick={() => deleteProduct(product.id)}
                                        >
                                          <TrashIcon className="h-3 w-3" />
                                          Remove
                                        </button>
                                      </div>
                                    )}
                                    {/* Show view-only indicator for records user doesn't own */}
                                    {user?.role === 'contributor' && product.created_by !== user?.id && (
                                      <div className="status-info">
                                        🔒 Read-Only Access
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Description Preview */}
                                  {product.description ? (
                                    <div className="text-xs text-gray-300">
                                      <MarkdownRenderer 
                                        content={product.description.length > 150 
                                          ? product.description.substring(0, 150) + "..." 
                                          : product.description
                                        } 
                                      />
                                      {product.description.length > 150 && (
                                        <button 
                                          className="text-cyber-400 text-xs mt-1 px-2 py-0.5 bg-cyber-500/20 border border-cyber-500/30 rounded-full hover:bg-cyber-500/30 transition-colors duration-200"
                                          onClick={() => {
                                            setModalContent({
                                              isOpen: true,
                                              title: `${product.name} - Security Intelligence`,
                                              content: product.description
                                            });
                                          }}
                                        >
                                          Show Intelligence
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 text-xs italic">No security intelligence available</span>
                                  )}
                                  
                                  {/* Created By Information */}
                                  <div className="mt-2 pt-2 border-t border-cyber-600/30 text-xs text-gray-400 flex items-center">
                                    <span>Security Analyst: </span>
                                    {product.creator ? (
                                      <div className="flex items-center ml-1">
                                        {product.creator.avatar_url ? (
                                          <img 
                                            src={product.creator.avatar_url} 
                                            alt={product.creator.github_username || product.creator.username}
                                            className="h-4 w-4 rounded-full mr-1 border border-cyber-600/30"
                                          />
                                        ) : (
                                          <div className="h-4 w-4 rounded-full bg-gradient-to-br from-cyber-500 to-cyber-600 flex items-center justify-center mr-1 text-[8px] font-semibold text-white">
                                            {(product.creator.github_username || product.creator.username || '?').charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <span className="font-medium text-cyber-400">
                                          {product.creator.github_username || product.creator.username}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="font-medium text-gray-500">System User</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              {hiddenProductsCount > 0 && (
                                <div className="text-center">
                                  <button 
                                    className="text-xs text-cyber-400 hover:text-cyber-300 bg-cyber-500/20 hover:bg-cyber-500/30 border border-cyber-500/30 px-3 py-1 rounded-lg transition-colors"
                                    onClick={() => {
                                      const newExpanded = new Set(expandedVendors);
                                      newExpanded.add(vendorGroup.vendor_id);
                                      setExpandedVendors(newExpanded);
                                    }}
                                  >
                                    Show {hiddenProductsCount} more security product{hiddenProductsCount !== 1 ? 's' : ''}
                                  </button>
                                </div>
                              )}
                              
                              {isExpanded && vendorGroup.products.length > 2 && (
                                <div className="text-center">
                                  <button 
                                    className="text-xs text-gray-400 hover:text-gray-300 bg-dark-700/50 hover:bg-dark-700 border border-dark-600 px-3 py-1 rounded-lg transition-colors"
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
                <div className="text-center py-20">
                  <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-glow">
                    <ShieldCheckIcon className="h-10 w-10 text-cyber-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-100 mb-2">No Security Products Detected</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Initialize your cybersecurity product catalog by registering security solutions for version detection
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Deploy First Security Product
                  </button>
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