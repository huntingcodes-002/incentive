'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, FileText } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { listSalaries, Salary, SalaryListResponse } from '@/lib/incentive-api';
import { useToast } from '@/hooks/useToast';

export function ViewSalary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const { error } = useToast();

  useEffect(() => {
    fetchSalaries();
  }, [page, searchTerm]);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const response = await listSalaries({
        search: searchTerm || undefined,
        page: page,
        page_size: 20,
      });

      if (response.success && response.data) {
        setSalaries(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(!!response.data.next);
        setHasPrevious(!!response.data.previous);
      } else {
        throw new Error(response.message || 'Failed to fetch salaries');
      }
    } catch (err: any) {
      error(err.message || 'Failed to load salaries');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSalaries();
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-1 text-2xl font-semibold">View Salary</h1>
        <p className="text-gray-500 text-sm">View and manage employee salary records</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Employee Code or Name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Salary Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : salaries.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No salary records found"
            description={searchTerm ? 'Try adjusting your search criteria' : 'No salary data has been uploaded yet'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Employee Code</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Employee Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Monthly Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Uploaded By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Updated At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salaries.map((salary, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{salary.employee_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {salary.employee_name || salary.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₹{salary.monthly_salary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {salary.uploaded_by_name || salary.uploaded_by_code || salary.uploaded_by || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {salary.modified_at
                          ? new Date(salary.modified_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(hasNext || hasPrevious) && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {salaries.length} of {totalCount} records
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={!hasPrevious}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {page}</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasNext}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

