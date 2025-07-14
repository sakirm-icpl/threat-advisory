import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function SetupGuides() {
  const [guides, setGuides] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: "", instructions: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});

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

  const startEdit = (guide) => {
    setEditingId(guide.id);
    setEditingForm({ ...guide });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingForm(f => ({ ...f, [name]: value }));
  };

  const saveEdit = async (id) => {
    setError(""); setSuccess("");
    try {
      await api.put(`/setup-guides/${id}`, editingForm);
      setEditingId(null);
      setEditingForm({});
      setSuccess("Setup guide updated!");
      fetchGuides();
    } catch (e) {
      setError("Failed to update setup guide");
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
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Setup Guides</h2>
      <form onSubmit={addGuide} className="bg-gray-50 p-4 rounded-lg mb-6 flex flex-col md:flex-row gap-2 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Product *</label>
          <select
            className="w-full border px-3 py-2 rounded"
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
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Instructions *</label>
          <textarea
            className="w-full border px-3 py-2 rounded h-20"
            name="instructions"
            value={form.instructions}
            onChange={handleFormChange}
            placeholder="Setup instructions (markdown supported)"
            required
          />
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" type="submit">Add</button>
      </form>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
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
        <p>Loading...</p>
      ) : filteredGuides.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No setup guides found.</div>
      ) : (
        <table className="w-full border text-sm bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Instructions</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuides.map(g => {
              const product = getProduct(g.product_id);
              const isExpanded = expanded[g.id];
              return (
                <tr key={g.id} className="border-t align-top">
                  <td className="p-2 font-medium">{product.name || "-"}</td>
                  <td className="p-2">{product.category || <span className="text-gray-400">-</span>}</td>
                  <td className="p-2 max-w-xs">
                    {product.description ? (
                      <span className="text-xs text-gray-700">{product.description.length > 60 ? product.description.slice(0, 60) + "..." : product.description}</span>
                    ) : <span className="text-gray-400 text-xs">-</span>}
                  </td>
                  <td className="p-2 max-w-md">
                    {editingId === g.id ? (
                      <textarea
                        className="border px-2 py-1 w-full"
                        name="instructions"
                        value={editingForm.instructions}
                        onChange={handleEditChange}
                        rows={4}
                      />
                    ) : (
                      <>
                        <div className="whitespace-pre-line">
                          {isExpanded || g.instructions.length < 120
                            ? g.instructions
                            : g.instructions.slice(0, 120) + "..."}
                        </div>
                        {g.instructions.length > 120 && (
                          <button
                            className="text-blue-600 text-xs mt-1 underline"
                            onClick={() => setExpanded(e => ({ ...e, [g.id]: !isExpanded }))}
                          >
                            {isExpanded ? "Show Less" : "Show More"}
                          </button>
                        )}
                      </>
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    {editingId === g.id ? (
                      <>
                        <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => saveEdit(g.id)}>Save</button>
                        <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => startEdit(g)}>Edit</button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => deleteGuide(g.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
} 