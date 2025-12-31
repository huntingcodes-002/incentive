import { useState } from 'react';
import { Search, ChevronRight, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

interface MobileDeviationApprovalProps {
  userRole: string;
}

export function MobileDeviationApproval({ userRole }: MobileDeviationApprovalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDeviation, setSelectedDeviation] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Multi-tier filters
  const [selectedState, setSelectedState] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRM, setSelectedRM] = useState('all');

  // Determine which hierarchy the approver belongs to
  const isNBH = userRole === 'NBH'; // National Business Head
  const isNCH = userRole === 'NCH'; // National Credit Head

  // Mock deviation data - separated by hierarchy
  const allDeviations = [
    // Business Hierarchy Deviations (RM & BM changes)
    {
      deviationId: 'DEV2025001',
      applicationId: 'APP2025003',
      customerName: 'Suresh Reddy',
      product: 'Business Loan',
      amount: 750000,
      raisedBy: 'Priya Sharma (SH Business)',
      raisedDate: '2025-01-23',
      status: 'Pending',
      state: 'Karnataka',
      area: 'South',
      branch: 'Bangalore East',
      hierarchy: 'Business',
      oldRM: 'Deepak Rao',
      proposedRM: 'Amit Sharma',
      oldBM: 'Priya Singh',
      proposedBM: 'Anjali Mehta',
      reason: 'RM transfer - employee moved to different territory',
      justification: 'Deepak Rao has been transferred to Chennai branch. Amit Sharma is now handling this territory. All cases need to be reassigned for better service continuity.'
    },
    {
      deviationId: 'DEV2025003',
      applicationId: 'APP2025008',
      customerName: 'Mohammed Rizwan',
      product: 'Home Loan',
      amount: 1200000,
      raisedBy: 'Priya Sharma (SH Business)',
      raisedDate: '2025-01-21',
      status: 'Approved',
      state: 'Maharashtra',
      area: 'West',
      branch: 'Mumbai Central',
      hierarchy: 'Business',
      oldRM: 'Sneha Kulkarni',
      proposedRM: 'Vikram Joshi',
      oldBM: 'Priya Singh',
      proposedBM: 'Rohit Desai',
      reason: 'Branch reorganization',
      justification: 'Branch structure changed - reporting hierarchy updated for business team.'
    },
    // Credit Hierarchy Deviations (BCM & CSO changes)
    {
      deviationId: 'DEV2025002',
      applicationId: 'APP2025012',
      customerName: 'Kavita Menon',
      product: 'Business Loan',
      amount: 980000,
      raisedBy: 'Rajesh Kumar (SH Credit)',
      raisedDate: '2025-01-22',
      status: 'Pending',
      state: 'Delhi',
      area: 'North',
      branch: 'Delhi North',
      hierarchy: 'Credit',
      oldBCM: 'Ravi Verma',
      proposedBCM: 'Sanjay Kumar',
      oldCSO: 'Sunita Reddy',
      proposedCSO: 'Kavita Sharma',
      reason: 'BCM transfer - employee moved to different region',
      justification: 'Ravi Verma transferred to South region. Sanjay Kumar taking over credit operations in North. All pending cases to be reassigned.'
    },
    {
      deviationId: 'DEV2025004',
      applicationId: 'APP2025015',
      customerName: 'Anita Patel',
      product: 'Personal Loan',
      amount: 350000,
      raisedBy: 'Rajesh Kumar (SH Credit)',
      raisedDate: '2025-01-20',
      status: 'Rejected',
      state: 'Tamil Nadu',
      area: 'South',
      branch: 'Chennai South',
      hierarchy: 'Credit',
      oldBCM: 'Ravi Verma',
      proposedBCM: 'Manoj Jain',
      oldCSO: 'Sunita Reddy',
      proposedCSO: 'Neeta Rao',
      reason: 'Credit workload redistribution',
      justification: 'High loan volume in this area requires redistribution of credit officers.'
    }
  ];

  // Filter deviations based on user role (hierarchy)
  const mockDeviations = allDeviations.filter(d => {
    if (isNBH) return d.hierarchy === 'Business'; // NBH sees only Business hierarchy deviations
    if (isNCH) return d.hierarchy === 'Credit';   // NCH sees only Credit hierarchy deviations
    return true; // Fallback for other roles
  });

  const getAvailableStates = () => [...new Set(mockDeviations.map(d => d.state))].sort();
  const getAvailableAreas = () => {
    let deviations = mockDeviations;
    if (selectedState !== 'all') deviations = deviations.filter(d => d.state === selectedState);
    return [...new Set(deviations.map(d => d.area))].sort();
  };
  const getAvailableBranches = () => {
    let deviations = mockDeviations;
    if (selectedState !== 'all') deviations = deviations.filter(d => d.state === selectedState);
    if (selectedArea !== 'all') deviations = deviations.filter(d => d.area === selectedArea);
    return [...new Set(deviations.map(d => d.branch))].sort();
  };
  const getAvailableRMs = () => {
    let deviations = mockDeviations;
    if (selectedState !== 'all') deviations = deviations.filter(d => d.state === selectedState);
    if (selectedArea !== 'all') deviations = deviations.filter(d => d.area === selectedArea);
    if (selectedBranch !== 'all') deviations = deviations.filter(d => d.branch === selectedBranch);
    const rms = [...new Set(deviations.map(d => d.oldRM || d.oldBCM).filter(r => r))];
    return rms.sort();
  };

  const handleApprove = (deviationId: string) => {
    alert(`Deviation ${deviationId} approved!`);
    setSelectedDeviation(null);
  };

  const handleReject = (deviationId: string) => {
    alert(`Deviation ${deviationId} rejected!`);
    setSelectedDeviation(null);
  };

  return (
    <div className="p-3 pb-20">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-gray-900 mb-1">Deviation Inbox</h1>
        <p className="text-gray-500 text-xs">
          {isNBH && 'Review Business hierarchy deviations (RM & BM)'}
          {isNCH && 'Review Credit hierarchy deviations (BCM & CSO)'}
        </p>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Deviation ID, App ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Toggle & Status */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs"
        >
          <Filter className="w-4 h-4" />
          Filters
          {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex-1 px-3 py-2.5 text-xs premium-dropdown rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedArea('all');
              setSelectedBranch('all');
              setSelectedRM('all');
            }}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All States</option>
            {getAvailableStates().map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value);
              setSelectedBranch('all');
              setSelectedRM('all');
            }}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            disabled={selectedState === 'all'}
          >
            <option value="all">All Areas</option>
            {getAvailableAreas().map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setSelectedRM('all');
            }}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            disabled={selectedArea === 'all'}
          >
            <option value="all">All Branches</option>
            {getAvailableBranches().map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          <select
            value={selectedRM}
            onChange={(e) => setSelectedRM(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            disabled={selectedBranch === 'all'}
          >
            <option value="all">All RM</option>
            {getAvailableRMs().map(rm => (
              <option key={rm} value={rm}>{rm}</option>
            ))}
          </select>
        </div>
      )}

      {/* Deviations as Cards */}
      <div className="space-y-3">
        {mockDeviations.map((deviation) => (
          <div
            key={deviation.deviationId}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-indigo-600 text-sm">{deviation.deviationId}</p>
                <p className="text-gray-500 text-xs">{deviation.applicationId}</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                {deviation.status}
              </span>
            </div>

            {/* Customer Info */}
            <p className="text-gray-900 text-sm mb-2">{deviation.customerName}</p>

            {/* Details */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Product:</span>
                <span className="text-gray-900">{deviation.product}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Amount:</span>
                <span className="text-gray-900">₹{deviation.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Raised By:</span>
                <span className="text-gray-900">{deviation.raisedBy}</span>
              </div>
            </div>

            {/* View Details Button */}
            <button
              onClick={() => setSelectedDeviation(deviation)}
              className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs hover:bg-indigo-100 transition-colors"
            >
              <span>View Full Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Full-Screen Modal for Details */}
      {selectedDeviation && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-3 flex items-center justify-between">
            <h2 className="text-gray-900">Deviation Details</h2>
            <button
              onClick={() => setSelectedDeviation(null)}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 pb-32">
            {/* IDs */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700">Deviation ID:</span>
                  <span className="text-indigo-900">{selectedDeviation.deviationId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-700">Application ID:</span>
                  <span className="text-indigo-900">{selectedDeviation.applicationId}</span>
                </div>
              </div>
            </div>

            {/* Customer & Product Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="text-gray-900 text-sm mb-3">Case Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Customer:</span>
                  <span className="text-gray-900">{selectedDeviation.customerName}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Product:</span>
                  <span className="text-gray-900">{selectedDeviation.product}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Amount:</span>
                  <span className="text-gray-900">₹{selectedDeviation.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Branch:</span>
                  <span className="text-gray-900">{selectedDeviation.branch}</span>
                </div>
              </div>
            </div>

            {/* Deviation Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="text-gray-900 text-sm mb-3">Deviation Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Raised By:</span>
                  <span className="text-gray-900">{selectedDeviation.raisedBy}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Raised Date:</span>
                  <span className="text-gray-900">
                    {new Date(selectedDeviation.raisedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Justification */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="text-gray-900 text-sm mb-2">Justification</h3>
              <p className="text-gray-700 text-xs leading-relaxed">{selectedDeviation.justification}</p>
            </div>
          </div>

          {/* Fixed Action Buttons */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2">
            <button
              onClick={() => handleApprove(selectedDeviation.deviationId)}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
            >
              Approve Deviation
            </button>
            <button
              onClick={() => handleReject(selectedDeviation.deviationId)}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Reject Deviation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}