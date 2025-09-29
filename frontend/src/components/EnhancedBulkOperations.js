import React, { useState, useRef } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentArrowDownIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  XMarkIcon,
  ServerStackIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function EnhancedBulkOperations() {
  const [activeOperation, setActiveOperation] = useState(null);
  const [progress, setProgress] = useState(0);

  const operations = [
    {
      id: 'import',
      title: 'Import Data',
      description: 'Bulk import data from JSON file',
      icon: CloudArrowUpIcon,
      color: 'blue'
    },
    {
      id: 'export',
      title: 'Export Data',
      description: 'Bulk export data to various formats',
      icon: DocumentArrowDownIcon,
      color: 'green'
    },
    {
      id: 'sync',
      title: 'Sync with Database',
      description: 'Synchronize data with the database',
      icon: ArrowPathIcon,
      color: 'purple'
    }
  ];

  const handleOperation = (operationId) => {
    setActiveOperation(operationId);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveOperation(null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto bg-gradient-to-br from-cyber-500/20 to-cyber-600/20 border border-cyber-500/30 rounded-2xl p-4 w-24 h-24 flex items-center justify-center mb-6 shadow-glow">
            <ServerStackIcon className="h-12 w-12 text-cyber-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Bulk Operations</h2>
          <p className="text-slate-400">Manage your data with bulk import and export operations</p>
        </div>

        {/* Operations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operations.map((operation) => (
            <div key={operation.id} className="card-cyber hover:shadow-cyber-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-cyber-500/20 to-cyber-600/20 border border-cyber-500/30 rounded-xl p-3 shadow-glow">
                    <operation.icon className="h-6 w-6 text-cyber-400" />
                  </div>
                  {operation.status && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      operation.status === 'completed' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : operation.status === 'failed' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {operation.status}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-slate-200">{operation.title}</h3>
                <p className="text-sm text-slate-400">{operation.description}</p>
                
                {operation.id === 'import' && (
                  <div className="mt-4 space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".json"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        <ArrowUpTrayIcon className="h-4 w-4" />
                        Select JSON File
                      </button>
                    </div>
                    
                    {selectedFile && (
                      <div className="text-sm text-slate-300 bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{selectedFile.name}</span>
                          <XMarkIcon 
                            className="h-4 w-4 text-slate-400 hover:text-slate-200 cursor-pointer" 
                            onClick={() => setSelectedFile(null)}
                          />
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleImport}
                      disabled={!selectedFile || isProcessing}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <CloudArrowUpIcon className="h-4 w-4" />
                      Import Data
                    </button>
                  </div>
                )}
                
                {operation.id === 'export' && (
                  <div className="mt-4 space-y-3">
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full input"
                    >
                      <option value="json">JSON Format</option>
                      <option value="csv">CSV Format</option>
                    </select>
                    
                    <button
                      onClick={handleExport}
                      disabled={isProcessing}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Export Data
                    </button>
                  </div>
                )}
                
                {operation.id === 'sync' && (
                  <div className="mt-4">
                    <button
                      onClick={handleSync}
                      disabled={isProcessing}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                      Sync with Database
                    </button>
                  </div>
                )}
                
                {isProcessing && currentOperation === operation.id && (
                  <div className="mt-4 space-y-2">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-cyber-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-slate-400">Processing... {progress}%</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Status Messages */}
        {statusMessage && (
          <div className={`rounded-lg p-4 border ${
            statusMessage.type === 'success' 
              ? 'bg-green-900/30 border-green-800/50 text-green-300' 
              : statusMessage.type === 'error' 
                ? 'bg-red-900/30 border-red-800/50 text-red-300' 
                : 'bg-blue-900/30 border-blue-800/50 text-blue-300'
          }`}>
            <div className="flex items-center">
              {statusMessage.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 mr-2" />
              ) : statusMessage.type === 'error' ? (
                <XCircleIcon className="h-5 w-5 mr-2" />
              ) : (
                <InformationCircleIcon className="h-5 w-5 mr-2" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 