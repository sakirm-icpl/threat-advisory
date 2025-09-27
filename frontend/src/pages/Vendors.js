import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from '../hooks/useAuth';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="hero-section rounded-2xl p-8 text-white shadow-cyber border border-cyber-600/30 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="glass-effect p-4 rounded-xl border border-cyber-600/30">
              <BuildingOfficeIcon className="h-12 w-12 text-cyber-400" />
            </div>
            <div>
              <h1 className="hero-title text-3xl lg:text-4xl mb-2">
                <span className="gradient-text">Security Vendors</span>
              </h1>
              <p className="hero-subtitle mb-4">
                Manage your trusted cybersecurity partner ecosystem
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-400 rounded-full animate-pulse"></div>
                  {vendors.length} Active Partners
                </div>
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-security-success rounded-full animate-pulse delay-300"></div>
                  Enterprise Security
                </div>
                <div className="glass-effect px-4 py-2 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-matrix-green rounded-full animate-pulse delay-600"></div>
                  Real-time Monitoring
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditingId(editingId === 'add' ? null : 'add')}
            className="btn-primary flex items-center gap-3 text-lg px-8 py-4"
          >
            <PlusIcon className="h-6 w-6" />
            {editingId === 'add' ? 'Cancel Operation' : 'Add Security Vendor'}
          </button>
        </div>
      </div>
      {/* Add Vendor Form */}
      {editingId === 'add' && (
        <div className="card-cyber">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-xl p-3 shadow-glow">
              <PlusIcon className="h-6 w-6 text-cyber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-100">Add New Security Vendor</h2>
              <p className="text-gray-400">Onboard a new cybersecurity technology partner</p>
            </div>
          </div>
          <form onSubmit={addVendor} className="form-group">
            <div>
              <label className="label">Security Vendor Name *</label>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., CrowdStrike, Palo Alto Networks, Fortinet, SentinelOne"
                required
              />
              <p className="text-sm text-gray-400 mt-2">
                Enter the official name of the cybersecurity vendor or technology provider
              </p>
            </div>
            <div className="flex gap-4 pt-6">
              <button className="btn-primary flex items-center gap-2" type="submit">
                <ShieldCheckIcon className="h-5 w-5" />
                Deploy Security Vendor
              </button>
              <button 
                type="button"
                onClick={() => setEditingId(null)}
                className="btn-secondary"
              >
                Cancel Operation
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Error Alert */}
      {error && (
        <div className="alert-error">
          <div className="flex items-center gap-3">
            <div className="bg-security-critical/20 rounded-full p-2 border border-security-critical/30">
              <svg className="h-5 w-5 text-security-critical" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-security-critical">Security Operation Failed</h3>
              <p className="text-security-critical/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="card-cyber text-center py-16">
          <div className="loading-spinner mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-100 mb-2">Scanning Security Vendors</h3>
          <p className="text-gray-400">Analyzing your cybersecurity partner ecosystem...</p>
          <div className="mt-4 flex justify-center">
            <div className="terminal text-xs">
              <div className="text-matrix-green">$ nmap -sV security-vendors.db</div>
              <div className="text-cyber-400">Scanning... Please wait</div>
            </div>
          </div>
        </div>
      ) : vendors.length === 0 ? (
        /* Empty State */
        <div className="card-cyber text-center py-20">
          <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-glow">
            <BuildingOfficeIcon className="h-10 w-10 text-cyber-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mb-2">No Security Vendors Detected</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Initialize your cybersecurity ecosystem by deploying trusted technology vendors and security partners
          </p>
          <button
            onClick={() => setEditingId('add')}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <PlusIcon className="h-5 w-5" />
            Deploy First Security Vendor
          </button>
        </div>
      ) : (
        /* Security Vendors Table */
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
                      <UserIcon className="h-5 w-5 text-cyber-400" />
                      <span className="gradient-text">Security Analyst</span>
                    </div>
                  </th>
                  <th className="table-cell text-center">
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheckIcon className="h-5 w-5 text-cyber-400" />
                      <span className="gradient-text">Operations</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="table-row-hover border-b border-slate-700 last:border-b-0">
                    <td className="table-cell">
                      {editingId === v.id ? (
                        <div className="flex items-center gap-3">
                          <div className="bg-cyber-500/20 border border-cyber-500/30 rounded-xl p-2 shadow-glow">
                            <PencilIcon className="h-4 w-4 text-cyber-400" />
                          </div>
                          <input
                            className="input flex-1"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            placeholder="Enter security vendor name"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-cyber-500/20 to-cyber-600/20 border border-cyber-500/30 rounded-xl p-2 shadow-glow">
                            <BuildingOfficeIcon className="h-4 w-4 text-cyber-400" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-200">{v.name}</div>
                            <div className="text-xs text-gray-400">Cybersecurity Technology Partner</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      {v.creator ? (
                        <div className="flex items-center gap-3">
                          {v.creator.avatar_url ? (
                            <img 
                              src={v.creator.avatar_url} 
                              alt={v.creator.github_username || v.creator.username}
                              className="h-8 w-8 rounded-xl border-2 border-cyber-600/30 shadow-glow"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyber-500 to-cyber-600 flex items-center justify-center text-white text-sm font-semibold shadow-glow">
                              {(v.creator.github_username || v.creator.username || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-200">
                              {v.creator.github_username || v.creator.username}
                            </div>
                            <div className="text-xs text-cyber-400">Security Researcher</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-400">Unknown</div>
                            <div className="text-xs text-slate-500">System User</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2 justify-center">
                        {editingId === v.id ? (
                          <>
                            <button 
                              className="btn-success btn-sm flex items-center gap-1" 
                              onClick={() => saveEdit(v.id)}
                            >
                              <ShieldCheckIcon className="h-4 w-4" />
                              Deploy
                            </button>
                            <button 
                              className="btn-secondary btn-sm" 
                              onClick={() => setEditingId(null)}
                            >
                              Abort
                            </button>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            {(user?.role === 'admin' || v.created_by === user?.id) && (
                              <>
                                <button 
                                  className="btn-outline btn-sm flex items-center gap-1 text-cyber-400 border-cyber-500/50 hover:bg-cyber-500 hover:text-white" 
                                  onClick={() => startEdit(v)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                  Modify
                                </button>
                                <button 
                                  className="btn-outline btn-sm flex items-center gap-1 text-security-critical border-security-critical/50 hover:bg-security-critical hover:text-white" 
                                  onClick={() => deleteVendor(v.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                  Remove
                                </button>
                              </>
                            )}
                            {user?.role === 'contributor' && v.created_by !== user?.id && (
                              <div className="status-info">
                                🔒 Read-Only Access
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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