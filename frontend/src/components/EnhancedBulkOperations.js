import React, { useState } from 'react';
import { 
  CloudArrowUpIcon, 
  DocumentArrowDownIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function EnhancedBulkOperations() {
  const [activeOperation, setActiveOperation] = useState(null);
  const [progress, setProgress] = useState(0);

  const operations = [
    {
      id: 'import_products',
      title: 'Import Products',
      description: 'Bulk import products from CSV/JSON file',
      icon: CloudArrowUpIcon,
      color: 'blue'
    },
    {
      id: 'import_methods',
      title: 'Import Detection Methods',
      description: 'Bulk import detection methods',
      icon: CloudArrowUpIcon,
      color: 'green'
    },
    {
      id: 'export_all',
      title: 'Export All Data',
      description: 'Export all data to various formats',
      icon: DocumentArrowDownIcon,
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Operations</h2>
        <p className="text-gray-600">Manage your data with bulk import and export operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {operations.map((operation) => (
          <div key={operation.id} className="stat-card">
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-xl bg-${operation.color}-100 mr-4`}>
                <operation.icon className={`h-6 w-6 text-${operation.color}-600`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{operation.title}</h3>
                <p className="text-sm text-gray-600">{operation.description}</p>
              </div>
            </div>
            
            {activeOperation === operation.id ? (
              <div className="space-y-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${operation.color}-600 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">Processing... {progress}%</p>
              </div>
            ) : (
              <button
                onClick={() => handleOperation(operation.id)}
                className="btn btn-primary w-full"
              >
                Start {operation.title}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Status Messages */}
      <div className="mt-8 space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <h4 className="font-medium text-green-800">Operation Completed</h4>
            <p className="text-sm text-green-600">Last bulk operation completed successfully</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Notice</h4>
            <p className="text-sm text-yellow-600">Always backup your data before performing bulk operations</p>
          </div>
        </div>
      </div>
    </div>
  );
} 