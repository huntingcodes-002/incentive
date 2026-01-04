'use client';
import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Eye, Filter, FileText, Clock, CheckSquare } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal, ConfirmModal } from '@/components/ui/Modal';
import { SummaryCard, SummaryCardGrid } from '@/components/ui/SummaryCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { getDeviationInboxSummary, DeviationInboxSummary, listDeviations, Deviation, DeviationListResponse, approveRejectDeviation, getAllStates, getUserStateBranches, State, Branch } from '@/lib/incentive-api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';

interface DeviationApprovalProps {
  userRole: string;
}

export function DeviationApproval({ userRole }: DeviationApprovalProps) {
  const [selectedDeviation, setSelectedDeviation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviationTypeFilter, setDeviationTypeFilter] = useState<string>('all');
  const [approvalComments, setApprovalComments] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState<string[]>([]);
  const [inboxSummary, setInboxSummary] = useState<DeviationInboxSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [loadingDeviations, setLoadingDeviations] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  
  // Multi-tier filters
  const [selectedState, setSelectedState] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRM, setSelectedRM] = useState('all');
  
  // Location data from API
  const [states, setStates] = useState<State[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Determine which hierarchy the approver belongs to
  const isNBH = userRole === 'NBH'; // National Business Head
  const isNCH = userRole === 'NCH'; // National Credit Head

  const { error: showError, success: showSuccess } = useToast();

  // Fetch inbox summary for NBH/NCH
  useEffect(() => {
    if (isNBH || isNCH) {
      const fetchSummary = async () => {
        setLoadingSummary(true);
        try {
          const response = await getDeviationInboxSummary();
          if (response.success && response.data) {
            setInboxSummary(response.data);
          } else {
            throw new Error(response.message || 'Failed to fetch inbox summary');
          }
        } catch (err: any) {
          console.error('Failed to fetch inbox summary:', err);
          showError(err.message || 'Failed to load inbox summary');
        } finally {
          setLoadingSummary(false);
        }
      };

      fetchSummary();
    }
  }, [isNBH, isNCH, showError]);

  // Fetch deviations list for NBH/NCH
  useEffect(() => {
    if (isNBH || isNCH) {
      const fetchDeviations = async () => {
        setLoadingDeviations(true);
        try {
          const params: any = {};

          // Only add filters if explicitly selected by user
          // Add status filter (API expects lowercase: pending, approved, rejected)
          if (statusFilter !== 'all') {
            const statusMap: Record<string, string> = {
              'Pending': 'pending',
              'Approved': 'approved',
              'Rejected': 'rejected',
            };
            params.status = statusMap[statusFilter] || statusFilter.toLowerCase();
          }

          // Add search filter
          if (searchTerm) {
            params.search = searchTerm;
          }

          // Filter by deviation type (only if user explicitly selects)
          if (deviationTypeFilter !== 'all') {
            params.deviation_type = deviationTypeFilter as 'mapping_business' | 'mapping_credit' | 'tagging' | 'other';
          }

          // Add pagination only if we have filters or if not on first page
          // Default API call should be without any query params
          if (Object.keys(params).length > 0 || page > 1) {
            params.page = page;
            params.page_size = 50;
          }

          // Make API call - if no params, pass undefined for clean URL (no query params)
          const response = await listDeviations(Object.keys(params).length > 0 ? params : undefined);
          
          if (response.success && response.data) {
            setDeviations(response.data.results);
            setTotalCount(response.data.count);
            setHasNext(!!response.data.next);
            setHasPrevious(!!response.data.previous);
          } else {
            throw new Error(response.message || 'Failed to fetch deviations');
          }
        } catch (err: any) {
          console.error('Failed to fetch deviations:', err);
          showError(err.message || 'Failed to load deviations');
        } finally {
          setLoadingDeviations(false);
        }
      };

      fetchDeviations();
    }
  }, [isNBH, isNCH, page, statusFilter, deviationTypeFilter, searchTerm, showError]);

  // Fetch states and branches for NBH/NCH
  useEffect(() => {
    if (!isNBH && !isNCH) return;

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
  }, [isNBH, isNCH, selectedState]);

  // Mock deviation data - separated by hierarchy (fallback for non-NBH/NCH roles)
  const mockAllDeviations = [
    // Business Hierarchy Deviations (RM & BM changes)
    {
      deviationId: 'DEV2025001',
      applicationId: 'APP2025003',
      customerName: 'Suresh Reddy',
      raisedBy: 'Priya Sharma (SH Business)',
      raisedOn: '2025-01-23',
      state: 'Karnataka',
      area: 'South',
      branch: 'Bangalore East',
      hierarchy: 'Business',
      oldRM: 'Deepak Rao',
      proposedRM: 'Amit Sharma',
      oldBM: 'Priya Singh',
      proposedBM: 'Anjali Mehta',
      oldBCM: null,
      proposedBCM: null,
      oldCSO: null,
      proposedCSO: null,
      reason: 'RM transfer - employee moved to different territory',
      comments: 'Deepak Rao has been transferred to Chennai branch. Amit Sharma is now handling this territory.',
      status: 'Pending'
    },
    {
      deviationId: 'DEV2025003',
      applicationId: 'APP2025008',
      customerName: 'Mohammed Rizwan',
      raisedBy: 'Priya Sharma (SH Business)',
      raisedOn: '2025-01-21',
      state: 'Maharashtra',
      area: 'West',
      branch: 'Mumbai Central',
      hierarchy: 'Business',
      oldRM: 'Sneha Kulkarni',
      proposedRM: 'Vikram Joshi',
      oldBM: 'Priya Singh',
      proposedBM: 'Rohit Desai',
      oldBCM: null,
      proposedBCM: null,
      oldCSO: null,
      proposedCSO: null,
      reason: 'Branch reorganization',
      comments: 'Branch structure changed - reporting hierarchy updated for business team.',
      status: 'Approved'
    },
    // Credit Hierarchy Deviations (BCM & CSO changes)
    {
      deviationId: 'DEV2025002',
      applicationId: 'APP2025012',
      customerName: 'Kavita Menon',
      raisedBy: 'Rajesh Kumar (SH Credit)',
      raisedOn: '2025-01-22',
      state: 'Delhi',
      area: 'North',
      branch: 'Delhi North',
      hierarchy: 'Credit',
      oldRM: null,
      proposedRM: null,
      oldBM: null,
      proposedBM: null,
      oldBCM: 'Ravi Verma',
      proposedBCM: 'Sanjay Kumar',
      oldCSO: 'Sunita Reddy',
      proposedCSO: 'Kavita Sharma',
      reason: 'BCM transfer - employee moved to different region',
      comments: 'Ravi Verma transferred to South region. Sanjay Kumar taking over credit operations in North.',
      status: 'Pending'
    },
    {
      deviationId: 'DEV2025004',
      applicationId: 'APP2025015',
      customerName: 'Anita Patel',
      raisedBy: 'Rajesh Kumar (SH Credit)',
      raisedOn: '2025-01-20',
      state: 'Tamil Nadu',
      area: 'South',
      branch: 'Chennai South',
      hierarchy: 'Credit',
      oldRM: null,
      proposedRM: null,
      oldBM: null,
      proposedBM: null,
      oldBCM: 'Ravi Verma',
      proposedBCM: 'Manoj Jain',
      oldCSO: 'Sunita Reddy',
      proposedCSO: 'Neeta Rao',
      reason: 'Credit workload redistribution',
      comments: 'High loan volume in this area requires redistribution of credit officers.',
      status: 'Rejected'
    }
  ];

  // Transform API deviations to component format
  // Helper function to get display value: name if available and not empty, otherwise SF ID
  const getDisplayValue = (name: string | null | undefined, id: string | null | undefined): string | null => {
    // If name exists and is not empty string, return name
    if (name && name.trim() !== '') {
      return name;
    }
    // Otherwise return the ID (SF ID) if available
    return id || null;
  };

  const transformDeviation = (deviation: Deviation) => {
    const mapping = deviation.mapping || {};
    const status = deviation.status === 'pending' ? 'Pending' : 
                   deviation.status === 'approved' ? 'Approved' : 
                   deviation.status === 'rejected' ? 'Rejected' : 'Pending';

    return {
      deviationId: `DEV${deviation.deviation_id}`,
      applicationId: deviation.case?.application_number || deviation.case_id,
      customerName: deviation.case?.customer_name || 'N/A',
      raisedBy: deviation.raised_by ? `${deviation.raised_by.name} (${deviation.raised_by.employee_code})` : 'Unknown',
      raisedOn: deviation.raised_at || deviation.created_at,
      state: 'N/A', // Not available in API response
      area: 'N/A', // Not available in API response
      branch: 'N/A', // Not available in API response
      hierarchy: deviation.deviation_type === 'mapping_business' ? 'Business' : 'Credit',
      oldRM: getDisplayValue(mapping.sourcing_rm_name, mapping.sourcing_rm),
      proposedRM: getDisplayValue(mapping.proposed_rm_name, mapping.proposed_rm),
      oldBM: getDisplayValue(mapping.sourcing_bm_name, mapping.sourcing_bm),
      proposedBM: getDisplayValue(mapping.proposed_bm_name, mapping.proposed_bm),
      oldBCM: getDisplayValue(mapping.sourcing_bcm_name, mapping.sourcing_bcm),
      proposedBCM: getDisplayValue(mapping.proposed_bcm_name, mapping.proposed_bcm),
      oldCSO: getDisplayValue(mapping.sourcing_co_name, mapping.sourcing_co),
      proposedCSO: getDisplayValue(mapping.proposed_co_name, mapping.proposed_co),
      reason: deviation.reason || '',
      comments: deviation.reason || '', // Using reason as comments
      status: status,
      deviation: deviation, // Keep original for detail view
    };
  };

  // Use API data if available, otherwise fall back to mock data
  const allDeviations: any[] = (isNBH || isNCH) && deviations.length > 0 
    ? deviations.map(transformDeviation)
    : mockAllDeviations.filter(d => {
        if (isNBH) return d.hierarchy === 'Business';
        if (isNCH) return d.hierarchy === 'Credit';
        return true;
      });

  // Filter deviations based on user role (hierarchy) - this is the final list to use
  const mockDeviations: any[] = allDeviations;

  // Get unique values for cascading filters
  const getAvailableStates = () => {
    // For NBH/NCH, use API states
    if ((isNBH || isNCH) && states.length > 0) {
      return states.map(s => s.name).sort();
    }
    // For other roles, extract from mock data
    const mockStates = [...new Set(mockDeviations.map(d => d.state))];
    return mockStates.sort();
  };

  const getAvailableAreas = () => {
    // Note: Areas are not available in Location API, so use mock data
    let deviations = mockDeviations;
    if (selectedState !== 'all') {
      deviations = deviations.filter(d => d.state === selectedState);
    }
    const areas = [...new Set(deviations.map(d => d.area))];
    return areas.sort();
  };

  const getAvailableBranches = () => {
    // For NBH/NCH, use API branches
    if ((isNBH || isNCH) && branches.length > 0) {
      return branches.map(b => b.name).sort();
    }
    // For other roles, extract from mock data
    let deviations = mockDeviations;
    if (selectedState !== 'all') {
      deviations = deviations.filter(d => d.state === selectedState);
    }
    if (selectedArea !== 'all') {
      deviations = deviations.filter(d => d.area === selectedArea);
    }
    const mockBranches = [...new Set(deviations.map(d => d.branch))];
    return mockBranches.sort();
  };

  const getAvailableRMs = () => {
    let deviations = mockDeviations;
    if (selectedState !== 'all') {
      deviations = deviations.filter(d => d.state === selectedState);
    }
    if (selectedArea !== 'all') {
      deviations = deviations.filter(d => d.area === selectedArea);
    }
    if (selectedBranch !== 'all') {
      deviations = deviations.filter(d => d.branch === selectedBranch);
    }
    const rms = [...new Set(deviations.map(d => d.oldRM).concat(deviations.map(d => d.proposedRM)).filter(rm => rm !== null))];
    return rms.sort();
  };

  // Filter deviations - for API data, search is handled by API, but we still filter locally for other criteria
  // For mock data, all filters are applied locally
  const filteredDeviations = mockDeviations.filter(d => {
    // Search filter - only apply locally if not using API (API handles search)
    const matchesSearch = (isNBH || isNCH) && deviations.length > 0
      ? true // API handles search
      : d.deviationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter - API handles this, but we apply locally for consistency
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    
    // Multi-tier filters - only work with mock data (API doesn't have state/area/branch)
    const matchesState = selectedState === 'all' || d.state === selectedState || d.state === 'N/A';
    const matchesArea = selectedArea === 'all' || d.area === selectedArea || d.area === 'N/A';
    const matchesBranch = selectedBranch === 'all' || d.branch === selectedBranch || d.branch === 'N/A';
    const matchesRM = selectedRM === 'all' || d.oldRM === selectedRM || d.proposedRM === selectedRM;
    
    return matchesSearch && matchesStatus && matchesState && matchesArea && matchesBranch && matchesRM;
  });

  // Helper function to extract numeric deviation ID from deviationId string (e.g., "DEV123" -> "123")
  const extractDeviationId = (deviationId: string, originalDeviation?: any): string => {
    // If we have the original deviation object, use its deviation_id
    if (originalDeviation?.deviation_id) {
      return originalDeviation.deviation_id.toString();
    }
    // Otherwise, extract from the formatted string (DEV123 -> 123)
    const match = deviationId.match(/DEV(\d+)/);
    return match ? match[1] : deviationId;
  };

  // Refresh deviations list and summary after action
  const refreshData = async () => {
    // Refresh summary
    if (isNBH || isNCH) {
      try {
        const summaryResponse = await getDeviationInboxSummary();
        if (summaryResponse.success && summaryResponse.data) {
          setInboxSummary(summaryResponse.data);
        }
      } catch (err) {
        console.error('Failed to refresh summary:', err);
      }
    }

    // Refresh deviations list
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        const statusMap: Record<string, string> = {
          'Pending': 'pending',
          'Approved': 'approved',
          'Rejected': 'rejected',
        };
        params.status = statusMap[statusFilter] || statusFilter.toLowerCase();
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      if (deviationTypeFilter !== 'all') {
        params.deviation_type = deviationTypeFilter as 'mapping_business' | 'mapping_credit' | 'tagging' | 'other';
      }
      if (Object.keys(params).length > 0 || page > 1) {
        params.page = page;
        params.page_size = 50;
      }

      const response = await listDeviations(Object.keys(params).length > 0 ? params : undefined);
      if (response.success && response.data) {
        setDeviations(response.data.results);
        setTotalCount(response.data.count);
        setHasNext(!!response.data.next);
        setHasPrevious(!!response.data.previous);
      }
    } catch (err) {
      console.error('Failed to refresh deviations:', err);
    }
  };

  const handleApprove = async (deviationId: string) => {
    if (!selectedDeviation) return;

    setProcessingAction(true);
    try {
      const numericId = extractDeviationId(deviationId, selectedDeviation.deviation);
      
      const response = await approveRejectDeviation(numericId, {
        action: 'approve',
      });

      if (response.success) {
        showSuccess('Deviation approved successfully');
    setShowModal(false);
    setSelectedDeviation(null);
    setApprovalComments('');
        // Refresh data
        await refreshData();
      } else {
        throw new Error(response.message || 'Failed to approve deviation');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to approve deviation');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async (deviationId: string) => {
    if (!selectedDeviation) return;

    setProcessingAction(true);
    try {
      const numericId = extractDeviationId(deviationId, selectedDeviation.deviation);
      
      const response = await approveRejectDeviation(numericId, {
        action: 'reject',
        rejection_reason: approvalComments || undefined, // Use approval comments as rejection reason if provided
      });

      if (response.success) {
        showSuccess('Deviation rejected successfully');
    setShowModal(false);
    setSelectedDeviation(null);
    setApprovalComments('');
        // Refresh data
        await refreshData();
      } else {
        throw new Error(response.message || 'Failed to reject deviation');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to reject deviation');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleBulkApprove = () => {
    console.log(`Bulk approved: ${selectedForBulk.join(', ')}`);
    setSelectedForBulk([]);
  };

  const toggleBulkSelection = (deviationId: string) => {
    setSelectedForBulk(prev => 
      prev.includes(deviationId) 
        ? prev.filter(id => id !== deviationId)
        : [...prev, deviationId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Approved': return 'bg-emerald-100 text-emerald-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-3">
        <h1 className="text-gray-900 mb-1">Deviation Inbox</h1>
        <p className="text-gray-500">
          {isNBH && 'Review and approve/reject Business hierarchy deviations (RM & BM changes)'}
          {isNCH && 'Review and approve/reject Credit hierarchy deviations (BCM & CSO changes)'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-3">
        {loadingSummary ? (
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-center">
            <LoadingSpinner size="md" />
            <p className="text-gray-500 text-sm ml-3">Loading summary...</p>
          </div>
        ) : (
        <SummaryCardGrid>
          <SummaryCard
            icon={Clock}
            title="Pending Approval"
              value={inboxSummary?.pending_approval ?? mockDeviations.filter(d => d.status === 'Pending').length}
            variant="warning"
          />
          <SummaryCard
            icon={CheckCircle}
            title="Approved"
              value={inboxSummary?.approved ?? mockDeviations.filter(d => d.status === 'Approved').length}
            variant="success"
          />
          <SummaryCard
            icon={XCircle}
            title="Rejected"
              value={inboxSummary?.rejected ?? mockDeviations.filter(d => d.status === 'Rejected').length}
            variant="danger"
          />
          <SummaryCard
            icon={FileText}
            title="Total Deviations"
              value={inboxSummary?.total_deviations ?? mockDeviations.length}
            variant="default"
          />
        </SummaryCardGrid>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-2.5 mb-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Deviation ID, Application ID, or Customer Name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // Reset to first page on filter change
            }}
            className="px-4 py-2.5 text-sm premium-dropdown rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px] font-semibold"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={deviationTypeFilter}
            onChange={(e) => {
              setDeviationTypeFilter(e.target.value);
              setPage(1); // Reset to first page on filter change
            }}
            className="px-4 py-2.5 text-sm premium-dropdown rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px] font-semibold"
          >
            <option value="all">All Types</option>
            <option value="mapping_business">Business</option>
            <option value="mapping_credit">Credit</option>
            <option value="tagging">Tagging</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedArea('all');
              setSelectedBranch('all');
              setSelectedRM('all');
              // Reset branches when state changes
              if (e.target.value === 'all') {
                setBranches([]);
              }
            }}
            disabled={loadingLocations}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-50"
          >
            <option value="all">All States</option>
            {getAvailableStates().map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {!(isNBH || isNCH) && (
            <select
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setSelectedBranch('all');
                setSelectedRM('all');
              }}
              className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              disabled={selectedState === 'all'}
            >
              <option value="all">All Areas</option>
              {getAvailableAreas().map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          )}
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setSelectedRM('all');
            }}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            disabled={selectedArea === 'all' || loadingLocations}
          >
            <option value="all">All Branches</option>
            {loadingLocations ? (
              <option disabled>Loading branches...</option>
            ) : (
              getAvailableBranches().map(branch => (
              <option key={branch} value={branch}>{branch}</option>
              ))
            )}
          </select>
          <select
            value={selectedRM}
            onChange={(e) => setSelectedRM(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            disabled={selectedBranch === 'all'}
          >
            <option value="all">All RM</option>
            {getAvailableRMs().map(rm => (
              <option key={rm} value={rm}>{rm}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar - Hidden for NBH/NCH */}
      {selectedForBulk.length > 0 && !isNBH && !isNCH && (
        <div className="bg-indigo-600 text-white rounded-lg p-4 mb-6 flex items-center justify-between shadow-lg">
          <p className="font-medium">{selectedForBulk.length} deviation(s) selected</p>
          <div className="flex gap-3">
            <button
              onClick={handleBulkApprove}
              className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => setSelectedForBulk([])}
              className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Deviations Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {loadingDeviations ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 text-sm ml-3">Loading deviations...</p>
          </div>
        ) : (
          <>
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {/* Checkbox column - Hidden for NBH/NCH */}
                {!isNBH && !isNCH && (
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedForBulk.length === filteredDeviations.filter(d => d.status === 'Pending').length && filteredDeviations.filter(d => d.status === 'Pending').length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedForBulk(filteredDeviations.filter(d => d.status === 'Pending').map(d => d.deviationId));
                      } else {
                        setSelectedForBulk([]);
                      }
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Deviation ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Application ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Raised By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Raised On</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDeviations.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={isNBH || isNCH ? 7 : 8} className="px-4 py-12 bg-white">
                    <EmptyState
                      icon={FileText}
                      title="No deviations found"
                      description="There are no deviations matching your current filters. Try adjusting your search criteria."
                    />
                  </td>
                </tr>
              ) : (
                filteredDeviations.map((deviation, index) => (
                  <tr key={deviation.deviationId} className="hover:bg-gray-50 transition-colors bg-white">
                    {/* Checkbox column - Hidden for NBH/NCH */}
                    {!isNBH && !isNCH && (
                    <td className="px-4 py-3">
                      {deviation.status === 'Pending' && (
                        <input
                          type="checkbox"
                          checked={selectedForBulk.includes(deviation.deviationId)}
                          onChange={() => toggleBulkSelection(deviation.deviationId)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    </td>
                    )}
                    <td className="px-4 py-3 text-sm font-medium text-indigo-600">{deviation.deviationId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{deviation.applicationId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{deviation.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{deviation.raisedBy}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(deviation.raisedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={deviation.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedDeviation(deviation);
                          setShowModal(true);
                        }}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

            {/* Pagination */}
            {(hasNext || hasPrevious) && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {deviations.length} of {totalCount} deviations
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

      {/* Deviation Detail Modal */}
      {showModal && selectedDeviation && (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-indigo-200 p-6 flex items-center justify-between">
              <h3 className="text-indigo-800">Deviation Details</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-600 hover:text-slate-800">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 mb-1">Deviation ID</p>
                    <p className="text-indigo-800">{selectedDeviation.deviationId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Application ID</p>
                    <p className="text-indigo-800">{selectedDeviation.applicationId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Customer Name</p>
                    <p className="text-indigo-800">{selectedDeviation.customerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Raised By</p>
                    <p className="text-indigo-800">{selectedDeviation.raisedBy}</p>
                  </div>
                </div>
              </div>

              {/* Tagging Comparison */}
              <div className="bg-white border border-indigo-200 rounded-lg p-4">
                <h4 className="text-indigo-800 mb-4">Tagging Comparison</h4>
                <div className="space-y-4">
                  {/* RM */}
                  {(selectedDeviation.oldRM || selectedDeviation.proposedRM) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-600 mb-2">Old RM</p>
                        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-800">{selectedDeviation.oldRM || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-600 mb-2">Proposed RM</p>
                        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-emerald-800">{selectedDeviation.proposedRM || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BM */}
                  {(selectedDeviation.oldBM || selectedDeviation.proposedBM) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-600 mb-2">Old BM</p>
                        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-800">{selectedDeviation.oldBM || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-600 mb-2">Proposed BM</p>
                        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-emerald-800">{selectedDeviation.proposedBM || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BCM */}
                  {(selectedDeviation.oldBCM || selectedDeviation.proposedBCM) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-600 mb-2">Old BCM</p>
                        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-800">{selectedDeviation.oldBCM || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-600 mb-2">Proposed BCM</p>
                        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-emerald-800">{selectedDeviation.proposedBCM || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CSO */}
                  {(selectedDeviation.oldCSO || selectedDeviation.proposedCSO) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-600 mb-2">Old CSO</p>
                        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-800">{selectedDeviation.oldCSO || 'N/A'}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-600 mb-2">Proposed CSO</p>
                        <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded">
                          <p className="text-emerald-800">{selectedDeviation.proposedCSO || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 mb-2">Deviation Reason</p>
                <p className="text-slate-600">{selectedDeviation.reason}</p>
              </div>

              {/* Comments */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-indigo-800 mb-2">State Head Comments</p>
                <p className="text-slate-600">{selectedDeviation.comments}</p>
              </div>

              {/* National Head Comments */}
              {selectedDeviation.status === 'Pending' && (
                <div>
                  <label className="block text-indigo-800 mb-2">Your Comments</label>
                  <textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    rows={4}
                    placeholder="Add your comments for this decision..."
                    className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              )}

              {/* Actions */}
              {selectedDeviation.status === 'Pending' && (
                <div className="flex gap-3 pt-4 border-t border-indigo-200">
                  <button
                    onClick={() => handleApprove(selectedDeviation.deviationId)}
                    disabled={processingAction}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-['Geist:Medium',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingAction ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Processing...
                      </>
                    ) : (
                      <>
                    <CheckCircle className="w-5 h-5" />
                    Approve
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(selectedDeviation.deviationId)}
                    disabled={processingAction}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-['Geist:Medium',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingAction ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Processing...
                      </>
                    ) : (
                      <>
                    <XCircle className="w-5 h-5" />
                    Reject
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}