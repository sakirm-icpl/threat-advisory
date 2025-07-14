import React, { useState, useRef } from 'react';
import { endpoints } from '../services/api';

export default function BulkOperations() {
  const [exportFormat, setExportFormat] = useState('json');
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
  const importFileRef = useRef();
  const restoreFileRef = useRef();

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
      const res = await endpoints.importData(json);
      setImportResult(res.data);
    } catch (err) {
      setImportError('Import failed. Make sure the file is valid JSON.');
    } finally {
      setImporting(false);
      importFileRef.current.value = '';
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

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Bulk Operations</h1>

      {/* Export */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Export Data</h2>
        <div className="flex items-center gap-4 mb-2">
          <label>Format:</label>
          <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} className="input input-bordered">
            <option value="json">JSON</option>
            <option value="csv">CSV (vendors only)</option>
          </select>
          <button className="btn btn-primary" onClick={handleExport}>Export</button>
        </div>
        <p className="text-xs text-gray-500">CSV export currently includes only vendors. JSON export includes all data.</p>
      </div>

      {/* Export All */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Export All (Vendors, Products, Methods, Guides)</h2>
        <div className="flex items-center gap-4 mb-2">
          <label>Format:</label>
          <select value={exportAllFormat} onChange={e => setExportAllFormat(e.target.value)} className="input input-bordered">
            <option value="json">JSON (nested, all details)</option>
            <option value="csv">CSV (flattened)</option>
            <option value="docx">Word (DOCX)</option>
            <option value="pdf">PDF</option>
          </select>
          <button className="btn btn-primary" onClick={handleExportAll}>Export All</button>
        </div>
        {exportAllError && <div className="text-red-500 mt-2">{exportAllError}</div>}
        <p className="text-xs text-gray-500">Exports all vendors, their products, detection methods, and setup guides. DOCX/PDF coming soon.</p>
      </div>

      {/* Import */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Import Data</h2>
        <input type="file" accept="application/json" ref={importFileRef} onChange={handleImport} disabled={importing} />
        {importing && <div className="text-blue-500">Importing...</div>}
        {importResult && <div className="text-green-600 mt-2">Import complete: {JSON.stringify(importResult)}</div>}
        {importError && <div className="text-red-500 mt-2">{importError}</div>}
        <p className="text-xs text-gray-500 mt-1">Import expects a JSON file in the same format as exported data.</p>
      </div>

      {/* Backup */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Create Backup</h2>
        <button className="btn btn-secondary" onClick={handleBackup}>Download Backup</button>
        {backupResult && <div className="text-green-600 mt-2">{backupResult}</div>}
        {backupError && <div className="text-red-500 mt-2">{backupError}</div>}
        <p className="text-xs text-gray-500 mt-1">Backup includes all data and can be restored below.</p>
      </div>

      {/* Restore */}
      <div className="card p-4">
        <h2 className="text-lg font-semibold mb-2">Restore Backup</h2>
        <input type="file" accept="application/json" ref={restoreFileRef} onChange={handleRestore} disabled={restoring} />
        {restoring && <div className="text-blue-500">Restoring...</div>}
        {restoreResult && <div className="text-green-600 mt-2">Restore complete: {JSON.stringify(restoreResult)}</div>}
        {restoreError && <div className="text-red-500 mt-2">{restoreError}</div>}
        <p className="text-xs text-gray-500 mt-1">Restore expects a backup JSON file exported from this system.</p>
      </div>
    </div>
  );
} 