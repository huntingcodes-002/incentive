import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  onClear?: () => void;
}

export function FilterPanel({ filters, onClear }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasActiveFilters = filters.some(f => f.value !== 'all');

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-900 hover:text-indigo-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
              {filters.filter(f => f.value !== 'all').length} active
            </span>
          )}
        </button>
        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {filter.label}
              </label>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All {filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
