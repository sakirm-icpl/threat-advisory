import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { endpoints } from '../services/api';
import {
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ServerStackIcon,
  ClipboardIcon,
  CheckIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

// Reusable PreviewModal Component
function PreviewModal({ isOpen, onClose, title, content, downloadFileName = 'export.json' }) {
  const [copyStatus, setCopyStatus] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    setCopyStatus('Copied');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([typeof content === 'string' ? content : JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8 relative h-[80vh] flex flex-col">
        <button
          className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <pre className="bg-gray-100 rounded p-4 overflow-x-auto overflow-y-auto text-xs flex-1">
          {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
        </pre>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="hover:bg-gray-200 rounded-full p-2 transition"
            onClick={handleCopy}
            title="Copy"
          >
            {copyStatus === 'Copied' ? (
              <CheckIcon className="h-6 w-6 text-green-500 transition-transform duration-200 scale-110" />
            ) : (
              <ClipboardIcon className="h-6 w-6 text-gray-700 transition-transform duration-200" />
            )}
          </button>
          <button
            className="hover:bg-gray-200 rounded-full p-2 transition"
            onClick={handleDownload}
            title="Download"
          >
            <ArrowDownTrayIcon className="h-6 w-6 text-blue-500" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading spinner component
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
  );
}

// Helper to recursively remove created_at and updated_at keys
function removeTimestamps(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeTimestamps);
  } else if (obj && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (key !== 'created_at' && key !== 'updated_at') {
        newObj[key] = removeTimestamps(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// Sample JSON structure for import
  const sampleJson = {
  "vendor": {
    "name": "Sample Vendor",
    "products": [
      {
        "name": "Sample Product",
        "category": "Web Application",
        "description": "Sample product description.",
        "detection_methods": [
          {
            "name": "Sample Method",
            "technique": "HTTP Response Analysis",
            "regex_python": "pattern",
            "regex_ruby": "pattern",
            "curl_command": "curl ...",
            "expected_response": "Sample",
            "requires_auth": false
          }
        ],
        "setup_guides": [
          {
            "title": "Sample Guide",
            "content": "Guide content goes here."
            }
          ]
        }
      ]
    }
  };

export default function BulkOperations() {
  // State management
  const [activeTab, setActiveTab] = useState('export');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [vendorsList, setVendorsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);
  const [importFileJson, setImportFileJson] = useState(null);
  const [importFileRaw, setImportFileRaw] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importCompareResult, setImportCompareResult] = useState(null);
  const [importFileInputKey, setImportFileInputKey] = useState(Date.now());
  const [showUserGuide, setShowUserGuide] = useState(false);

  // Modal states
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [rawJsonModalOpen, setRawJsonModalOpen] = useState(false);
  const [rawJson, setRawJson] = useState(null);

  // Refs
  const importFileRef = useRef();
  const importJsonRef = useRef();
  const queryClient = useQueryClient();

  // Queries
  const { data: vendorsData, error: vendorsError, isLoading: vendorsLoading } = useQuery('vendors', endpoints.getVendors, {
    refetchOnWindowFocus: false,
    retry: 1,
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
      setRawJson(data);
      setRawJsonModalOpen(true);
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
      setRawJson(data);
      setRawJsonModalOpen(true);
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
      setRawJson(data);
      setRawJsonModalOpen(true);
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
      const payload = { data: json };
      const previewRes = await endpoints.importPreview(payload);
      const preview = previewRes.data;
      setImportCompareResult(preview);
      
      if (preview.error) {
        setImportError(preview.error);
      } else {
        setImportError(null);
      }
    } catch (err) {
      let msg = err?.response?.data?.error || 'Import failed.';
      if (msg && msg.toLowerCase().includes('duplicate key value violates unique constraint')) {
        msg = 'Data already exists.';
      }
      setImportError(msg);
    } finally {
      setImporting(false);
      importFileRef.current.value = '';
    }
  };

  // Confirm import after preview (Add or Replace)
  const confirmImport = async (mode) => {
    if (!importCompareResult || !importFile) return;
    setImporting(true);
    try {
      const text = await importFile.text();
      const json = JSON.parse(text);
      const payload = { data: json, mode };
      const res = await endpoints.importData(payload);
      setImportResult('Import successful!');
      setImportFileJson(null);
      setImportFileRaw('');
      setImportFile(null);
      setImportCompareResult(null);
      setImportError(null);
      setImportFileInputKey(Date.now());
      if (importFileRef.current) importFileRef.current.value = '';
      queryClient.invalidateQueries(['health-check', 'statistics']);
    } catch (err) {
      let msg = err?.response?.data?.error || 'Import failed.';
      if (msg && msg.toLowerCase().includes('duplicate key value violates unique constraint')) {
        msg = 'Data already exists.';
      }
      setImportError(msg);
    } finally {
      setImporting(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: 'export', name: 'Export', icon: DocumentArrowDownIcon },
    { id: 'import', name: 'Import', icon: DocumentArrowUpIcon },
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
          
          {/* Right column: Export All Data card */}
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
        <div className="flex flex-col items-center w-full">
          <div className="card p-6 w-[70%] mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
              <DocumentArrowUpIcon className="h-5 w-5" />
              Import Data
              </h2>
              <div className="flex items-center gap-3">
              <button
                  className="btn btn-outline btn-sm"
                onClick={() => setSampleModalOpen(true)}
                  type="button"
              >
                Sample JSON
              </button>
                <button
                  className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                  style={{ minWidth: 32, minHeight: 32 }}
                  onClick={() => setShowUserGuide(true)}
                  type="button"
                  title="Show Import User Guide"
                >
                  <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {/* File input */}
              <div className="flex items-center gap-4">
                <input
                  key={importFileInputKey}
                  type="file"
                  accept="application/json"
                  ref={importFileRef}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    setImportResult(null);
                    setImportError(null);
                    setImportCompareResult(null);
                    setImportFileJson(null);
                    setImportFileRaw('');
                    setImportFile(null);
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const json = JSON.parse(text);
                      setImportFileJson(json);
                      setImportFileRaw(JSON.stringify(json, null, 2));
                      setImportFile(file);
                      setImporting(true);
                      const payload = { data: json };
                      const previewRes = await endpoints.importPreview(payload);
                      const preview = previewRes.data;
                      setImportCompareResult(preview);
                      
                      if (preview.error) {
                        setImportError(preview.error);
                      } else {
                        setImportError(null);
                      }
                    } catch (err) {
                      let msg = err?.response?.data?.error || 'Import failed.';
                      if (msg && msg.toLowerCase().includes('duplicate key value violates unique constraint')) {
                        msg = 'Data already exists.';
                      }
                      setImportError(msg);
                    } finally {
                      setImporting(false);
                      if (importFileRef.current) importFileRef.current.value = '';
                    }
                  }}
                  disabled={importing}
                  className="file-input file-input-bordered flex-1"
                />
              </div>
              
              {/* Import error message */}
              {importError && (
                <div className="card bg-red-50 p-4 mb-4">
                  <h3 className="font-semibold text-red-800 mb-2">Import Error</h3>
                  <div className="text-sm text-red-700">{importError}</div>
                </div>
              )}
              
              {/* Show raw JSON preview if file is selected */}
              {importFileJson && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Selected File Preview</h3>
                  <pre ref={importJsonRef} className="bg-gray-100 rounded p-4 max-h-96 overflow-auto text-xs mb-4">{importFileRaw}</pre>
                  
                  {/* Show Add/Replace buttons if no error */}
                  {!importError && (
                  <div className="flex gap-4 mb-4">
                      {importCompareResult && (
                        <>
                          {importCompareResult.can_add && (
                    <button
                      className="btn btn-primary"
                              onClick={() => confirmImport('add')}
                      disabled={importing}
                            >
                              Add
                            </button>
                          )}
                          {importCompareResult.can_replace && (
                    <button
                      className="btn btn-warning"
                                onClick={() => confirmImport('replace')}
                      disabled={importing}
                              >
                                Replace
                </button>
                            )}
                        </>
          )}
        </div>
      )}
        </div>
      )}

              {/* Show import result message */}
              {importResult && (
                <div className="card bg-green-50 p-4">
                  <h3 className="font-semibold mb-2 text-green-800">Import Complete</h3>
                  <div className="text-sm text-green-700">{importResult}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unified Preview Modals */}
      <PreviewModal
        isOpen={rawJsonModalOpen}
        onClose={() => setRawJsonModalOpen(false)}
        title="Export Preview"
        content={rawJson}
        downloadFileName="export.json"
      />

      <PreviewModal
        isOpen={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        title="Sample JSON Structure"
        content={sampleJson}
        downloadFileName="sample.json"
      />

      {/* User Guide Modal */}
      {showUserGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
              <button 
              className="absolute top-3 right-3 btn btn-sm btn-circle btn-ghost text-2xl"
              onClick={() => setShowUserGuide(false)}
              aria-label="Close"
            >
              &times;
              </button>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <InformationCircleIcon className="h-7 w-7 text-blue-500" />
              Import User Guide
            </h2>
            <div className="prose max-w-none text-base">
              <h3 className="mt-4 mb-2 text-lg font-semibold">Add Mode</h3>
              <ul className="mb-4 text-sm space-y-1 list-disc pl-5">
                <li><b>If vendor doesn't exist:</b> Create vendor + all products + all methods + all guides</li>
                <li><b>If vendor exists but product doesn't:</b> Create product + all methods + all guides</li>
                <li><b>If vendor and product exist:</b> Only add new methods/guides <span className="italic">(don't overwrite existing)</span></li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-semibold">Replace Mode</h3>
              <ul className="mb-4 text-sm space-y-1 list-disc pl-5">
                <li><b>If vendor doesn't exist:</b> <code>Error "Cannot replace because vendor does not exist"</code></li>
                <li><b>If vendor exists but product doesn't exist:</b> <code>Error "Cannot replace because product does not exist"</code></li>
                <li><b>If vendor and product exist:</b> Replace all methods and guides with new ones</li>
              </ul>
              <h3 className="mt-4 mb-2 text-lg font-semibold">Preview Logic</h3>
              <ul className="mb-4 text-sm space-y-1 list-disc pl-5">
                <li>If <b>ALL</b> data exists and matches exactly: <code>Show "Data already exists" error</code></li>
                <li>If <b>ANY</b> data is new or different: <code>Show preview with Add/Replace options</code></li>
                <li><b>Replace</b> button only enabled if vendor+product exist <b>AND</b> there are actual differences</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 