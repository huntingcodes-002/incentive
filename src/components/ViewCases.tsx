'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, FileText, Filter, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { listDockets, DocketUpload, getAllStates, getUserStateBranches, State, Branch } from '@/lib/incentive-api';
import { useToast } from '@/hooks/useToast';

interface ViewCasesProps {
  userRole: string;
}

export function ViewCases({ userRole }: ViewCasesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dockets, setDockets] = useState<DocketUpload[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [selectedCase, setSelectedCase] = useState<DocketUpload | null>(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  
  // Filters
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedBatchId, setSelectedBatchId] = useState('all');
  
  // Location data from API
  const [states, setStates] = useState<State[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  
  const { error } = useToast();

  useEffect(() => {
    fetchDockets();
  }, [page, searchTerm, selectedBranch, selectedState, selectedBatchId]);

  // Fetch states and branches
  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        // Fetch all states
        const statesResponse = await getAllStates();
        if (statesResponse.success && statesResponse.data) {
          setStates(statesResponse.data);
        }

        // Fetch branches based on selected state
        if (selectedState !== 'all') {
          const branchesResponse = await getUserStateBranches(selectedState);
          if (branchesResponse.success && branchesResponse.data) {
            setBranches(branchesResponse.data.branches);
          }
        } else {
          // If no state selected, get user's state branches (if available)
          const branchesResponse = await getUserStateBranches();
          if (branchesResponse.success && branchesResponse.data) {
            setBranches(branchesResponse.data.branches);
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch locations:', err);
        // Don't show error toast for location fetch failures, just log
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [selectedState]);

  const fetchDockets = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page,
        page_size: 20,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (selectedBranch !== 'all') {
        params.branch_name = selectedBranch;
      }
      if (selectedState !== 'all') {
        params.state = selectedState;
      }
      if (selectedBatchId !== 'all') {
        params.upload_batch_id = selectedBatchId;
      }

      const response = await listDockets(params);

      if (response.success && response.data) {
        setDockets(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(!!response.data.next);
        setHasPrevious(!!response.data.previous);
      } else {
        throw new Error(response.message || 'Failed to fetch dockets');
      }
    } catch (err: any) {
      error(err.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters from current results
  // Note: These are limited to current page results. For production, consider fetching all unique values separately
  const getUniqueBranches = () => {
    // Use API branches if available
    if (branches.length > 0) {
      return branches.map(b => b.name).sort();
    }
    // Otherwise extract from dockets data
    const branchSet = new Set<string>();
    dockets.forEach(docket => {
      if (docket.branch_name) branchSet.add(docket.branch_name);
    });
    return Array.from(branchSet).sort();
  };

  const getUniqueStates = () => {
    // Use API states if available
    if (states.length > 0) {
      return states.map(s => s.name).sort();
    }
    // Otherwise extract from dockets data
    const stateSet = new Set<string>();
    dockets.forEach(docket => {
      if (docket.state_name) stateSet.add(docket.state_name);
    });
    return Array.from(stateSet).sort();
  };

  const getUniqueBatchIds = () => {
    const batchIds = new Set<string>();
    dockets.forEach(docket => {
      if (docket.upload_batch_id) batchIds.add(docket.upload_batch_id);
    });
    return Array.from(batchIds).sort();
  };

  const handleViewCase = (docket: DocketUpload) => {
    setSelectedCase(docket);
    setShowCaseModal(true);
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-indigo-800 mb-2 text-2xl font-semibold">View Cases</h1>
        <p className="text-slate-400">View and manage docket cases</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-indigo-200 rounded-lg p-4 mb-4 shadow-sm">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by Application ID, Customer Name, Loan Account No, or Customer ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Filters:</span>
            </div>
            
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedBranch('all'); // Reset branch when state changes
                setPage(1);
              }}
              disabled={loadingLocations}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="all">All States</option>
              {getUniqueStates().map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setPage(1);
              }}
              disabled={selectedState === 'all' || loadingLocations}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <option value="all">All Branches</option>
              {loadingLocations ? (
                <option disabled>Loading branches...</option>
              ) : (
                getUniqueBranches().map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))
              )}
            </select>

            <select
              value={selectedBatchId}
              onChange={(e) => {
                setSelectedBatchId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Upload Batches</option>
              {getUniqueBatchIds().map(batchId => (
                <option key={batchId} value={batchId}>{batchId}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white border border-indigo-200 rounded-lg shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : dockets.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No cases found"
            description={searchTerm || selectedBranch !== 'all' || selectedState !== 'all' || selectedBatchId !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'No docket cases have been uploaded yet'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-indigo-50 border-b border-indigo-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">Application ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">Customer Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">Product Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">Loan Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">State</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">Disbursal Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">Upload Batch</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-indigo-800">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dockets.map((docket, index) => (
                    <tr key={docket.upload_id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{docket.application_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{docket.customer_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{docket.product_type || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {docket.requested_loan_amount
                          ? `₹${parseFloat(docket.requested_loan_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{docket.branch_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{docket.state_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {docket.disbursal_date
                          ? new Date(docket.disbursal_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-xs">{docket.upload_batch_id || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleViewCase(docket)}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
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
                  Showing {dockets.length} of {totalCount} records
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

      {/* Case Detail Sidebar */}
      {showCaseModal && selectedCase && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
            onClick={() => {
              setShowCaseModal(false);
              setSelectedCase(null);
            }}
          />
          {/* Sidebar Panel */}
          <div className="fixed right-0 top-0 h-screen w-[500px] bg-white shadow-xl z-50 overflow-y-auto border-l border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h3 className="text-gray-900 font-semibold text-lg">Case Details</h3>
              <button
                onClick={() => {
                  setShowCaseModal(false);
                  setSelectedCase(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Case Summary */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="text-gray-900 font-semibold mb-3">Case Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Application ID:</span>
                    <span className="text-sm font-medium text-indigo-600">{selectedCase.application_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer Name:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.customer_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Product Type:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.product_type || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loan Amount:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedCase.requested_loan_amount
                        ? `₹${parseFloat(selectedCase.requested_loan_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Branch:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.branch_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">State:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.state_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Disbursal Date:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedCase.disbursal_date
                        ? new Date(selectedCase.disbursal_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Month:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.month || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-gray-900 font-semibold mb-3">Loan Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loan Account No:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.loan_account_no || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer ID:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.customer_id || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Days:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.days || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ageing:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedCase.ageing || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Docket Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-gray-900 font-semibold mb-3">Docket Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Docket Final Remarks:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedCase.docket_final_remarks || '-'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Observation:</span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{selectedCase.observation || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Upload Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-gray-900 font-semibold mb-3">Upload Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Upload Batch ID:</span>
                    <span className="text-sm font-medium text-gray-900 break-all text-right ml-2">{selectedCase.upload_batch_id || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">File Name:</span>
                    <span className="text-sm font-medium text-gray-900 break-all text-right ml-2">{selectedCase.file_name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uploaded By:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedCase.uploaded_by_name || selectedCase.uploaded_by_code || selectedCase.uploaded_by || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uploaded At:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedCase.created_at
                        ? new Date(selectedCase.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Modified:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedCase.modified_at
                        ? new Date(selectedCase.modified_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

