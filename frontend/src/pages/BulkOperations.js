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
} from '@heroicons/react/24/outline';

export default function BulkOperations() {
  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState('json');
  const [exportCompleteFormat, setExportCompleteFormat] = useState('json');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [vendorExportFormat, setVendorExportFormat] = useState('json');
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
    try {
      const res = await endpoints.exportVendorData(selectedVendor, vendorExportFormat);
      const data = res.data;
      const blob = new Blob([
        vendorExportFormat === 'json' ? JSON.stringify(data, null, 2) : data
      ], { type: vendorExportFormat === 'json' ? 'application/json' : (vendorExportFormat === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `versionintel_vendor_export.${vendorExportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Vendor export failed.');
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

  // Export All data
  const handleExportAll = async () => {
    setExportAllError(null);
    try {
      const res = await endpoints.exportAllData(exportAllFormat);
      if (exportAllFormat === 'docx' || exportAllFormat === 'pdf') {
        if (res.data && res.data.error) {
          setExportAllError(res.data.error);
          return;
        }
      }
      const data = res.data;
      const blob = new Blob([
        exportAllFormat === 'json' ? JSON.stringify(data, null, 2) : data
      ], { type: exportAllFormat === 'json' ? 'application/json' : (exportAllFormat === 'csv' ? 'text/csv' : (exportAllFormat === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf')) });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `versionintel_export_all.${exportAllFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportAllError('Export All failed.');
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Export */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DocumentArrowDownIcon className="h-5 w-5" />
                Basic Export
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Format:</label>
                  <select 
                    value={exportFormat} 
                    onChange={e => setExportFormat(e.target.value)} 
                    className="input input-bordered flex-1"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV (vendors only)</option>
                  </select>
                </div>
                <button className="btn btn-primary w-full" onClick={handleExport}>
                  Export Basic Data
                </button>
                <p className="text-xs text-gray-500">
                  CSV export currently includes only vendors. JSON export includes all data.
                </p>
              </div>
            </div>

            {/* Export All Complete */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export All Complete
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Format:</label>
                  <select 
                    value={exportCompleteFormat} 
                    onChange={e => setExportCompleteFormat(e.target.value)} 
                    className="input input-bordered flex-1"
                  >
                    <option value="json">JSON (complete)</option>
                    <option value="csv">CSV (complete)</option>
                    <option value="docx">Word (DOCX)</option>
                  </select>
                </div>
                <button className="btn btn-primary w-full" onClick={handleExportComplete}>
                  Export All Complete Data
                </button>
                <p className="text-xs text-gray-500">
                  Exports all vendors with their complete products, methods, and guides.
                </p>
              </div>
            </div>

            {/* Export Specific Vendor */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export Specific Vendor
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Vendor:</label>
                  <select 
                    value={selectedVendor} 
                    onChange={e => setSelectedVendor(e.target.value)} 
                    className="input input-bordered w-full mt-1"
                    disabled={vendorsLoading}
                  >
                    <option value="">
                      {vendorsLoading ? 'Loading vendors...' : 'Choose a vendor...'}
                    </option>
                    {vendorsData?.data && Array.isArray(vendorsData.data) && vendorsData.data.length > 0 ? (
                      vendorsData.data.map(vendor => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))
                    ) : (
                      !vendorsLoading && <option value="" disabled>No vendors available</option>
                    )}
                  </select>
                  {vendorsError && (
                    <div className="text-red-500 text-xs mt-1">
                      Error loading vendors: {vendorsError?.response?.data?.error || vendorsError?.message}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Format:</label>
                  <select 
                    value={vendorExportFormat} 
                    onChange={e => setVendorExportFormat(e.target.value)} 
                    className="input input-bordered flex-1"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="docx">Word (DOCX)</option>
                  </select>
                </div>
                <button 
                  className="btn btn-primary w-full" 
                  onClick={handleExportVendor}
                  disabled={!selectedVendor}
                >
                  Export Vendor Data
                </button>
                <p className="text-xs text-gray-500">
                  Exports selected vendor with all their products, methods, and guides.
                </p>
              </div>
            </div>

            {/* Export All (Original) */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DocumentArrowDownIcon className="h-5 w-5" />
                Export All (Original)
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Format:</label>
                  <select 
                    value={exportAllFormat} 
                    onChange={e => setExportAllFormat(e.target.value)} 
                    className="input input-bordered flex-1"
                  >
                    <option value="json">JSON (nested, all details)</option>
                    <option value="csv">CSV (flattened)</option>
                    <option value="docx">Word (DOCX)</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <button className="btn btn-primary w-full" onClick={handleExportAll}>
                  Export All Data
                </button>
                {exportAllError && <div className="text-red-500 text-sm">{exportAllError}</div>}
                <p className="text-xs text-gray-500">
                  Exports all vendors, their products, detection methods, and setup guides.
                </p>
              </div>
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
    </div>
  );
} 