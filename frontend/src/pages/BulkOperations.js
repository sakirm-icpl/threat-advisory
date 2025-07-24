import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { endpoints } from '../services/api';
import {
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  CogIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ServerStackIcon,
  XMarkIcon,
  ClipboardIcon,
  CheckIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

// Add a loading spinner component
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  );
}

export default function BulkOperations() {
  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState('json');
  const [exportCompleteFormat, setExportCompleteFormat] = useState('json');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [vendorsList, setVendorsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const [backupResult, setBackupResult] = useState(null);
  const [backupError, setBackupError] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState(null);
  const [restoreError, setRestoreError] = useState(null);
  const [exportAllFormat, setExportAllFormat] = useState('json');
  const [exportAllError, setExportAllError] = useState(null);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [selectedCleanupTypes, setSelectedCleanupTypes] = useState([]);
  const [bulkDeleteData, setBulkDeleteData] = useState({});
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  
  const importFileRef = useRef();
  const restoreFileRef = useRef();
  const queryClient = useQueryClient();
  const previewJsonRef = useRef();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewJson, setPreviewJson] = useState(null);
  const [copyStatus, setCopyStatus] = useState('Copy');

  // Queries
  const { data: vendorsData, error: vendorsError, isLoading: vendorsLoading } = useQuery('vendors', endpoints.getVendors, {
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Mutations
  const cleanupMutation = useMutation(endpoints.cleanupData, {
    onSuccess: () => {
      // Refresh data if needed
    },
  });

  const bulkDeleteMutation = useMutation(endpoints.bulkDelete, {
    onSuccess: () => {
      setShowBulkDeleteConfirm(false);
    },
  });

  // Fetch vendors and products for dropdowns
  useEffect(() => {
    endpoints.getVendors().then(res => setVendorsList(res.data)).catch(() => setVendorsList([]));
    endpoints.getProducts().then(res => setProductsList(res.data)).catch(() => setProductsList([]));
  }, []);

  // Filter products by selected vendor
  useEffect(() => {
    if (selectedVendor) {
      setFilteredProducts(productsList.filter(p => p.vendor_id === parseInt(selectedVendor)));
    } else {
      setFilteredProducts([]);
    }
    setSelectedProduct('');
  }, [selectedVendor, productsList]);

  // Helper to show preview modal
  const showPreview = (json) => {
    setPreviewJson(json);
    setPreviewModalOpen(true);
    setCopyStatus('Copy');
  };

  // Copy JSON to clipboard
  const handleCopy = () => {
    if (previewJsonRef.current) {
      navigator.clipboard.writeText(JSON.stringify(previewJson, null, 2));
      setCopyStatus('Copied');
      setTimeout(() => setCopyStatus('Copy'), 2000);
    }
  };

  // Download JSON
  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(previewJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export data
  const handleExport = async () => {
    try {
      const res = await endpoints.exportData(exportFormat);
      const data = res.data;
      const blob = new Blob([
        exportFormat === 'json' ? JSON.stringify(data, null, 2) : data
      ], { type: exportFormat === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `versionintel_export.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed.');
    }
  };

  // Export complete data
  const handleExportComplete = async () => {
    try {
      const res = await endpoints.exportAllComplete(exportCompleteFormat);
      const data = res.data;
      const blob = new Blob([
        exportCompleteFormat === 'json' ? JSON.stringify(data, null, 2) : data
      ], { type: exportCompleteFormat === 'json' ? 'application/json' : (exportCompleteFormat === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `versionintel_complete_export.${exportCompleteFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Complete export failed.');
    }
  };

  // Export vendor data
  const handleExportVendor = async () => {
    if (!selectedVendor) {
      alert('Please select a vendor.');
      return;
    }
    setExportLoading(true);
    try {
      const res = await endpoints.exportVendor(selectedVendor);
      let data = res.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      showPreview(data);
    } finally {
      setExportLoading(false);
    }
  };

  // Export product data
  const handleExportProduct = async () => {
    if (!selectedProduct) {
      alert('Please select a product.');
      return;
    }
    setExportLoading(true);
    try {
      const res = await endpoints.exportProduct(selectedProduct);
      let data = res.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      showPreview(data);
    } finally {
      setExportLoading(false);
    }
  };

  // Export All data
  const handleExportAll = async () => {
    setExportLoading(true);
    try {
      const res = await endpoints.exportAllData();
      let data = res.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      showPreview(data);
    } finally {
      setExportLoading(false);
    }
  };

  // Import data
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setImportError(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      if (showImportPreview) {
        const previewRes = await endpoints.importPreview(json);
        setImportPreviewData(previewRes.data);
        setShowImportPreview(false);
      } else {
      const res = await endpoints.importData(json);
      setImportResult(res.data);
        queryClient.invalidateQueries(['health-check', 'statistics']);
      }
    } catch (err) {
      setImportError('Import failed. Make sure the file is valid JSON.');
    } finally {
      setImporting(false);
      importFileRef.current.value = '';
    }
  };

  // Confirm import after preview
  const confirmImport = async () => {
    if (!importPreviewData) return;
    setImporting(true);
    try {
      const text = await importFileRef.current.files[0].text();
      const json = JSON.parse(text);
      const res = await endpoints.importData(json);
      setImportResult(res.data);
      setImportPreviewData(null);
      queryClient.invalidateQueries(['health-check', 'statistics']);
    } catch (err) {
      setImportError('Import failed.');
    } finally {
      setImporting(false);
    }
  };

  // Backup
  const handleBackup = async () => {
    setBackupResult(null);
    setBackupError(null);
    try {
      const res = await endpoints.createBackup();
      const data = res.data;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `versionintel_backup.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupResult('Backup downloaded.');
    } catch (err) {
      setBackupError('Backup failed.');
    }
  };

  // Restore
  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRestoring(true);
    setRestoreResult(null);
    setRestoreError(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await endpoints.restoreBackup(json);
      setRestoreResult(res.data);
      queryClient.invalidateQueries(['health-check', 'statistics']);
    } catch (err) {
      setRestoreError('Restore failed. Make sure the file is a valid backup JSON.');
    } finally {
      setRestoring(false);
      restoreFileRef.current.value = '';
    }
  };

  // Cleanup data
  const handleCleanup = async () => {
    if (selectedCleanupTypes.length === 0) {
      alert('Please select at least one cleanup type.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to clean up: ${selectedCleanupTypes.join(', ')}?`)) {
      return;
    }
    
    cleanupMutation.mutate({ types: selectedCleanupTypes });
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (Object.keys(bulkDeleteData).length === 0) {
      alert('Please select items to delete.');
      return;
    }
    
    bulkDeleteMutation.mutate({ types: bulkDeleteData });
  };

  const tabs = [
    { id: 'export', name: 'Export', icon: DocumentArrowDownIcon },
    { id: 'import', name: 'Import', icon: DocumentArrowUpIcon },
    { id: 'backup', name: 'Backup/Restore', icon: CloudArrowUpIcon },
    { id: 'cleanup', name: 'Cleanup', icon: CogIcon },
    { id: 'bulk-delete', name: 'Bulk Delete', icon: TrashIcon },
  ];

  const cleanupOptions = [
    { id: 'orphaned_products', label: 'Orphaned Products', description: 'Products without valid vendors' },
    { id: 'orphaned_methods', label: 'Orphaned Methods', description: 'Detection methods without valid products' },
    { id: 'orphaned_guides', label: 'Orphaned Guides', description: 'Setup guides without valid products' },
    { id: 'empty_vendors', label: 'Empty Vendors', description: 'Vendors without any products' },
  ];



  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Operations</h1>
        <p className="text-gray-600">Comprehensive data management tools for VersionIntel</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="flex flex-col lg:flex-row gap-16 items-start w-full justify-center">
          {/* Left column: Vendor and Product cards */}
          <div className="flex flex-col gap-10 w-full lg:w-1/2 items-center">
            {/* Export by Vendor Card */}
            <div className="card p-6 shadow-xl rounded-lg bg-blue-50 max-w-md w-full flex flex-col gap-4 items-center transition-transform duration-200 hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex items-center gap-2 mb-2">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-500" />
                <h2 className="text-lg font-semibold">Export by Vendor</h2>
              </div>
              <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} className="input input-bordered w-full mb-2">
                <option value="">Select Vendor</option>
                {vendorsList.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <button className="btn btn-primary w-full flex items-center justify-center" onClick={handleExportVendor} disabled={!selectedVendor || exportLoading}>
                {exportLoading ? <Spinner /> : 'Export Vendor'}
              </button>
            </div>
            {/* Export by Product Card */}
            <div className="card p-6 shadow-xl rounded-lg bg-blue-50 max-w-md w-full flex flex-col gap-4 items-center transition-transform duration-200 hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex items-center gap-2 mb-2">
                <CubeIcon className="h-6 w-6 text-green-500" />
                <h2 className="text-lg font-semibold">Export by Product</h2>
              </div>
              <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} className="input input-bordered w-full mb-2">
                <option value="">Select Vendor</option>
                {vendorsList.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className="input input-bordered w-full mb-2" disabled={!selectedVendor}>
                <option value="">Select Product</option>
                {filteredProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <button className="btn btn-primary w-full flex items-center justify-center" onClick={handleExportProduct} disabled={!selectedProduct || exportLoading}>
                {exportLoading ? <Spinner /> : 'Export Product'}
              </button>
            </div>
          </div>
          {/* Right column: Export All Data card (no divider, flush left) */}
          <div className="flex flex-col items-start w-full lg:w-1/2">
            <div className="card p-6 shadow-xl rounded-lg bg-blue-50 max-w-md w-full flex flex-col gap-4 items-center self-start transition-transform duration-200 hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex items-center gap-2 mb-2">
                <ServerStackIcon className="h-6 w-6 text-purple-500" />
                <h2 className="text-lg font-semibold">Export All Data</h2>
              </div>
              <button className="btn btn-primary w-full flex items-center justify-center" onClick={handleExportAll} disabled={exportLoading}>
                {exportLoading ? <Spinner /> : 'Export All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DocumentArrowUpIcon className="h-5 w-5" />
              Import Data
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="application/json" 
                  ref={importFileRef} 
                  onChange={handleImport} 
                  disabled={importing} 
                  className="file-input file-input-bordered flex-1"
                />
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={showImportPreview} 
                    onChange={e => setShowImportPreview(e.target.checked)}
                    className="checkbox"
                  />
                  <span className="text-sm">Preview before import</span>
                </label>
      </div>

                {importing && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    {showImportPreview ? 'Analyzing import data...' : 'Importing...'}
                  </div>
                )}

                {importPreviewData && (
                  <div className="card bg-blue-50 p-4">
                    <h3 className="font-semibold mb-2">Import Preview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Vendors:</span>
                        <div>New: {importPreviewData.vendors.new}</div>
                        <div>Existing: {importPreviewData.vendors.existing}</div>
                      </div>
                      <div>
                        <span className="font-medium">Products:</span>
                        <div>New: {importPreviewData.products.new}</div>
                        <div>Existing: {importPreviewData.products.existing}</div>
                      </div>
                      <div>
                        <span className="font-medium">Methods:</span>
                        <div>New: {importPreviewData.methods.new}</div>
                        <div>Existing: {importPreviewData.methods.existing}</div>
                      </div>
                      <div>
                        <span className="font-medium">Guides:</span>
                        <div>New: {importPreviewData.guides.new}</div>
                        <div>Existing: {importPreviewData.guides.existing}</div>
                      </div>
                    </div>
                    {importPreviewData.warnings.length > 0 && (
                      <div className="mt-2">
                        <span className="font-medium text-orange-600">Warnings:</span>
                        <ul className="list-disc list-inside text-sm text-orange-600">
                          {importPreviewData.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button className="btn btn-primary btn-sm" onClick={confirmImport}>
                        Confirm Import
                      </button>
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => setImportPreviewData(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {importResult && (
                  <div className="card bg-green-50 p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Import Complete</h3>
                    <div className="text-sm text-green-700">
                      <pre>{JSON.stringify(importResult, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {importError && (
                  <div className="card bg-red-50 p-4">
                    <h3 className="font-semibold text-red-800 mb-2">Import Error</h3>
                    <div className="text-sm text-red-700">{importError}</div>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Import expects a JSON file in the same format as exported data. 
                  Use preview mode to see what will be imported before confirming.
                </p>
              </div>
            </div>
        </div>
      )}

      {/* Backup/Restore Tab */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Backup */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CloudArrowUpIcon className="h-5 w-5" />
              Create Backup
            </h2>
            <div className="space-y-4">
              <button className="btn btn-secondary w-full" onClick={handleBackup}>
                Download Complete Backup
              </button>
              {backupResult && (
                <div className="text-green-600 text-sm">{backupResult}</div>
              )}
              {backupError && (
                <div className="text-red-500 text-sm">{backupError}</div>
              )}
              <p className="text-xs text-gray-500">
                Backup includes all data and can be restored below.
              </p>
            </div>
      </div>

      {/* Restore */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CloudArrowDownIcon className="h-5 w-5" />
              Restore Backup
            </h2>
            <div className="space-y-4">
              <input 
                type="file" 
                accept="application/json" 
                ref={restoreFileRef} 
                onChange={handleRestore} 
                disabled={restoring} 
                className="file-input file-input-bordered w-full"
              />
              {restoring && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Restoring...
                </div>
              )}
              {restoreResult && (
                <div className="text-green-600 text-sm">
                  Restore complete: {JSON.stringify(restoreResult)}
                </div>
              )}
              {restoreError && (
                <div className="text-red-500 text-sm">{restoreError}</div>
              )}
              <p className="text-xs text-gray-500">
                Restore expects a backup JSON file exported from this system.
              </p>
            </div>
          </div>
        </div>
      )}







      {/* Cleanup Tab */}
      {activeTab === 'cleanup' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CogIcon className="h-5 w-5" />
              Data Cleanup
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cleanupOptions.map((option) => (
                  <label key={option.id} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedCleanupTypes.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCleanupTypes([...selectedCleanupTypes, option.id]);
                        } else {
                          setSelectedCleanupTypes(selectedCleanupTypes.filter(id => id !== option.id));
                        }
                      }}
                      className="checkbox mt-1"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <button 
                className="btn btn-warning w-full" 
                onClick={handleCleanup}
                disabled={selectedCleanupTypes.length === 0 || cleanupMutation.isLoading}
              >
                {cleanupMutation.isLoading ? 'Cleaning...' : 'Clean Selected Issues'}
              </button>

              {cleanupMutation.isSuccess && (
                <div className="card bg-green-50 p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Cleanup Complete</h3>
                  <div className="text-sm text-green-700">
                    <pre>{JSON.stringify(cleanupMutation.data.data, null, 2)}</pre>
                  </div>
                </div>
              )}

              {cleanupMutation.isError && (
                <div className="card bg-red-50 p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Cleanup Error</h3>
                  <div className="text-sm text-red-700">
                    {cleanupMutation.error?.response?.data?.error || 'An error occurred during cleanup'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Tab */}
      {activeTab === 'bulk-delete' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrashIcon className="h-5 w-5" />
              Bulk Delete
            </h2>
            
            <div className="space-y-4">
              <div className="alert alert-warning">
                <div>
                  <h3 className="font-medium">⚠️ Warning</h3>
                  <div className="text-sm">
                    Bulk delete operations are irreversible. Please be careful when selecting items to delete.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text">Vendor IDs (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="1,2,3"
                    className="input input-bordered w-full"
                    onChange={(e) => {
                      const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                      setBulkDeleteData({...bulkDeleteData, vendor_ids: ids});
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text">Product IDs (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="1,2,3"
                    className="input input-bordered w-full"
                    onChange={(e) => {
                      const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                      setBulkDeleteData({...bulkDeleteData, product_ids: ids});
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text">Method IDs (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="1,2,3"
                    className="input input-bordered w-full"
                    onChange={(e) => {
                      const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                      setBulkDeleteData({...bulkDeleteData, method_ids: ids});
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="label">
                    <span className="label-text">Guide IDs (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="1,2,3"
                    className="input input-bordered w-full"
                    onChange={(e) => {
                      const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                      setBulkDeleteData({...bulkDeleteData, guide_ids: ids});
                    }}
                  />
                </div>
              </div>

              <button 
                className="btn btn-error w-full" 
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={Object.keys(bulkDeleteData).length === 0 || bulkDeleteMutation.isLoading}
              >
                {bulkDeleteMutation.isLoading ? 'Deleting...' : 'Delete Selected Items'}
              </button>

              {bulkDeleteMutation.isSuccess && (
                <div className="card bg-green-50 p-4">
                  <h3 className="font-semibold text-green-800 mb-2">Delete Complete</h3>
                  <div className="text-sm text-green-700">
                    <pre>{JSON.stringify(bulkDeleteMutation.data.data, null, 2)}</pre>
                  </div>
                </div>
              )}

              {bulkDeleteMutation.isError && (
                <div className="card bg-red-50 p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Delete Error</h3>
                  <div className="text-sm text-red-700">
                    {bulkDeleteMutation.error?.response?.data?.error || 'An error occurred during deletion'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          {showBulkDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="card p-6 max-w-md mx-4">
                <h3 className="font-semibold text-lg mb-4">Confirm Bulk Delete</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the selected items? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-error flex-1" 
                    onClick={handleBulkDelete}
                  >
                    Confirm Delete
                  </button>
                  <button 
                    className="btn btn-outline flex-1" 
                    onClick={() => setShowBulkDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
      )}
      {/* Preview Modal */}
      {previewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            {/* Cancel Icon in top right */}
            <button
              title="Cancel"
              className="absolute top-4 right-4 hover:bg-gray-200 rounded-full p-2 transition"
              onClick={() => setPreviewModalOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-red-500" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Export Preview</h3>
            <pre ref={previewJsonRef} className="bg-gray-100 rounded p-4 max-h-96 overflow-auto text-xs mb-4">{JSON.stringify(previewJson, null, 2)}</pre>
            <div className="flex gap-4 justify-end items-center">
              {/* Copy Icon (now left) */}
              <button
                title={copyStatus === 'Copied' ? 'Copied!' : 'Copy'}
                className="hover:bg-gray-200 rounded-full p-2 transition"
                onClick={handleCopy}
                disabled={copyStatus === 'Copied'}
              >
                {copyStatus === 'Copied' ? (
                  <CheckIcon className="h-6 w-6 text-green-500 transition-transform duration-200 scale-110" />
                ) : (
                  <ClipboardIcon className="h-6 w-6 text-gray-700 transition-transform duration-200" />
                )}
              </button>
              {/* Download Icon (now right) */}
              <button title="Download" className="hover:bg-gray-200 rounded-full p-2 transition" onClick={handleDownload}>
                <ArrowDownTrayIcon className="h-6 w-6 text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 