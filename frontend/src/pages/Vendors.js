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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600">Manage your vendor catalog for product association</p>
        </div>
        {/* Allow both admin and contributor to add vendors */}
        <button
          onClick={() => setEditingId(editingId === 'add' ? null : 'add')}
          className="btn btn-primary"
        >
          {editingId === 'add' ? 'Cancel' : '+ Add Vendor'}
        </button>
      </div>
      {/* Allow both admin and contributor to see the add form */}
      {editingId === 'add' && (
        <form onSubmit={addVendor} className="bg-white p-8 rounded-2xl mb-8 w-full flex flex-col gap-6 shadow-xl border border-blue-100">
          <label className="block text-sm font-medium mb-2">Vendor Name *</label>
          <div className="flex items-end gap-4">
            <input
              className="flex-1 border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Vendor name"
              required
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" type="submit">Add Vendor</button>
          </div>
        </form>
      )}
      {error && <div className="text-red-600 mb-2 p-2 bg-red-50 rounded border">{error}</div>}
      {loading ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading vendors...</p>
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium text-lg">No vendors found</p>
          <p className="text-gray-400 text-sm mt-2">Add your first vendor using the button above</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Name</th>
                  <th className="p-4 text-left font-semibold text-gray-700 uppercase tracking-wide text-sm">Created By</th>
                  <th className="p-4 text-center font-semibold text-gray-700 uppercase tracking-wide text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="border-t align-top">
                    <td className="p-4 font-medium">
                      {editingId === v.id ? (
                        <input
                          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                        />
                      ) : (
                        v.name
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {v.creator ? (
                        <div className="flex items-center">
                          {v.creator.avatar_url ? (
                            <img 
                              src={v.creator.avatar_url} 
                              alt={v.creator.github_username || v.creator.username}
                              className="h-6 w-6 rounded-full mr-2"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center mr-2 text-xs font-semibold">
                              {(v.creator.github_username || v.creator.username || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          {v.creator.github_username || v.creator.username}
                        </div>
                      ) : (
                        'Unknown'
                      )}
                    </td>
                    <td className="p-4 flex gap-2 justify-center">
                      {editingId === v.id ? (
                        <>
                          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => saveEdit(v.id)}>Save</button>
                          <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={() => setEditingId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          {/* Allow edit/delete if user is admin OR owns the record */}
                          {(user?.role === 'admin' || v.created_by === user?.id) && (
                            <>
                              <button className="btn btn-warning btn-sm" onClick={() => startEdit(v)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => deleteVendor(v.id)}>Delete</button>
                            </>
                          )}
                          {/* Show view-only indicator for records user doesn't own */}
                          {user?.role === 'contributor' && v.created_by !== user?.id && (
                            <span className="text-xs text-gray-500 italic">View Only</span>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 