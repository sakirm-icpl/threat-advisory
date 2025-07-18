import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from '../hooks/useAuth';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/vendors");
      setVendors(res.data);
    } catch (e) {
      setError("Failed to load vendors");
    }
    setLoading(false);
  };

  const addVendor = async (e) => {
    e.preventDefault();
    if (!name) return;
    try {
      await api.post("/vendors", { name });
      setName("");
      fetchVendors();
    } catch (e) {
      setError("Failed to add vendor");
    }
  };

  const startEdit = (vendor) => {
    setEditingId(vendor.id);
    setEditingName(vendor.name);
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/vendors/${id}`, { name: editingName });
      setEditingId(null);
      setEditingName("");
      fetchVendors();
    } catch (e) {
      setError("Failed to update vendor");
    }
  };

  const deleteVendor = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;
    try {
      await api.delete(`/vendors/${id}`);
      fetchVendors();
    } catch (e) {
      setError("Failed to delete vendor");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Vendors</h2>
      {user?.role === 'admin' && (
        <form onSubmit={addVendor} className="flex gap-2 mb-4">
          <input
            className="border px-2 py-1 flex-1"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Vendor name"
          />
          <button className="bg-blue-600 text-white px-4 py-1 rounded" type="submit">Add</button>
        </form>
      )}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Name</th>
              {user?.role === 'admin' && <th className="p-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {vendors.map(v => (
              <tr key={v.id} className="border-t">
                <td className="p-2">
                  {editingId === v.id ? (
                    <input
                      className="border px-2 py-1"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                    />
                  ) : (
                    v.name
                  )}
                </td>
                {user?.role === 'admin' && (
                  <td className="p-2 flex gap-2">
                    {editingId === v.id ? (
                      <>
                        <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => saveEdit(v.id)}>Save</button>
                        <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditingId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => startEdit(v)}>Edit</button>
                        <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => deleteVendor(v.id)}>Delete</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 