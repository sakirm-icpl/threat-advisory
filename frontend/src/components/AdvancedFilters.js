import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  availableFilters = [],
  className = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});

  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters };
    if (value === '' || value === null || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(localFilters).filter(key => 
      localFilters[key] !== '' && 
      localFilters[key] !== null && 
      !(Array.isArray(localFilters[key]) && localFilters[key].length === 0)
    ).length;
  };

  const renderFilterInput = (filter) => {
    const value = localFilters[filter.key] || '';

    switch (filter.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyber-500 focus:border-transparent bg-slate-800 text-slate-200"
          >
            <option value="">All {filter.label}</option>
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {filter.options.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFilterChange(filter.key, newValues);
                  }}
                  className="rounded border-slate-600 text-cyber-500 focus:ring-cyber-500 bg-slate-800"
                />
                <span className="ml-2 text-sm text-slate-300">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyber-500 focus:border-transparent bg-slate-800 text-slate-200"
          />
        );

      case 'daterange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              placeholder="From"
              value={value.from || ''}
              onChange={(e) => handleFilterChange(filter.key, { ...value, from: e.target.value })}
              className="px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyber-500 focus:border-transparent bg-slate-800 text-slate-200"
            />
            <input
              type="date"
              placeholder="To"
              value={value.to || ''}
              onChange={(e) => handleFilterChange(filter.key, { ...value, to: e.target.value })}
              className="px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyber-500 focus:border-transparent bg-slate-800 text-slate-200"
            />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyber-500 focus:border-transparent bg-slate-800 text-slate-200"
          />
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyber-500 focus:border-transparent bg-slate-800 text-slate-200"
          />
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline flex items-center space-x-2"
      >
        <FunnelIcon className="h-5 w-5 text-slate-400" />
        <span className="text-sm font-medium text-slate-300">Filters</span>
        {getActiveFilterCount() > 0 && (
          <span className="bg-cyber-500 text-slate-100 text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {getActiveFilterCount()}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-100">Filters</h3>
              <div className="flex items-center space-x-2">
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-cyber-400 hover:text-cyber-300"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {availableFilters.map(filter => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}