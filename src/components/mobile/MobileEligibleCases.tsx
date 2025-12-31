import { useState } from 'react';
import { Search, Filter, FileText, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

interface MobileEligibleCasesProps {
  userRole: string;
  userName: string;
  onNavigateToDeviation?: (caseId: string) => void;
}

export function MobileEligibleCases({ userRole, userName, onNavigateToDeviation }: MobileEligibleCasesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryTab, setCategoryTab] = useState<'disbursed' | 'login'>('disbursed');
  const [showFilters, setShowFilters] = useState(false);
  
  // Multi-tier filters
  const [selectedState, setSelectedState] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRM, setSelectedRM] = useState('all');

  const mockDisbursedCases = [
    {
      applicationId: 'APP2025001',
      customerName: 'Rajesh Kumar',
      product: 'Personal Loan',
      loanAmount: 250000,
      status: 'Eligible',
      disbursalDate: '2025-01-15',
      state: 'Maharashtra',
      area: 'West',
      branch: 'Mumbai Central',
      rm: 'Amit Sharma'
    },
    {
      applicationId: 'APP2025002',
      customerName: 'Meena Patel',
      product: 'Home Loan',
      loanAmount: 1500000,
      status: 'On Hold',
      disbursalDate: '2025-01-16',
      state: 'Delhi',
      area: 'North',
      branch: 'Delhi North',
      rm: 'Vikram Joshi'
    },
    {
      applicationId: 'APP2025003',
      customerName: 'Suresh Iyer',
      product: 'Auto Loan',
      loanAmount: 750000,
      status: 'Eligible',
      disbursalDate: '2025-01-17',
      state: 'Karnataka',
      area: 'South',
      branch: 'Bangalore East',
      rm: 'Deepak Rao'
    }
  ];

  const mockLoginApplications = [
    {
      applicationId: 'APP2025101',
      customerName: 'Sanjay Gupta',
      product: 'Personal Loan',
      loanAmount: 300000,
      status: 'Eligible',
      applicationDate: '2025-01-13',
      state: 'Maharashtra',
      area: 'West',
      branch: 'Mumbai Central',
      rm: 'Amit Sharma'
    },
    {
      applicationId: 'APP2025102',
      customerName: 'Kavita Menon',
      product: 'Auto Loan',
      loanAmount: 550000,
      status: 'Eligible',
      applicationDate: '2025-01-14',
      state: 'Delhi',
      area: 'North',
      branch: 'Delhi North',
      rm: 'Vikram Joshi'
    }
  ];

  const getAvailableStates = () => {
    const allCases = [...mockDisbursedCases, ...mockLoginApplications];
    return [...new Set(allCases.map(c => c.state))].sort();
  };

  const getAvailableAreas = () => {
    let allCases = [...mockDisbursedCases, ...mockLoginApplications];
    if (selectedState !== 'all') {
      allCases = allCases.filter(c => c.state === selectedState);
    }
    return [...new Set(allCases.map(c => c.area))].sort();
  };

  const getAvailableBranches = () => {
    let allCases = [...mockDisbursedCases, ...mockLoginApplications];
    if (selectedState !== 'all') allCases = allCases.filter(c => c.state === selectedState);
    if (selectedArea !== 'all') allCases = allCases.filter(c => c.area === selectedArea);
    return [...new Set(allCases.map(c => c.branch))].sort();
  };

  const getAvailableRMs = () => {
    let allCases = [...mockDisbursedCases, ...mockLoginApplications];
    if (selectedState !== 'all') allCases = allCases.filter(c => c.state === selectedState);
    if (selectedArea !== 'all') allCases = allCases.filter(c => c.area === selectedArea);
    if (selectedBranch !== 'all') allCases = allCases.filter(c => c.branch === selectedBranch);
    return [...new Set(allCases.map(c => c.rm))].sort();
  };

  const currentCases = categoryTab === 'disbursed' ? mockDisbursedCases : mockLoginApplications;

  return (
    <div className="p-3 pb-20">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-gray-900 mb-1">Eligible Cases</h1>
        <p className="text-gray-500 text-xs">Review and manage your eligible incentive cases</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setCategoryTab('disbursed')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all ${
            categoryTab === 'disbursed'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Disbursed ({mockDisbursedCases.length})
        </button>
        <button
          onClick={() => setCategoryTab('login')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all ${
            categoryTab === 'login'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          Login Apps ({mockLoginApplications.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, product..."
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
          <option value="Eligible">Eligible</option>
          <option value="On Hold">On Hold</option>
          <option value="Deviation Raised">Deviation Raised</option>
        </select>
      </div>

      {/* Collapsible Filters */}
      {showFilters && userRole !== 'RM' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
          {/* National Heads - All filters */}
          {(userRole === 'NBH' || userRole === 'NCH') && (
            <>
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
                <option value="all">All RMs/CSOs</option>
                {getAvailableRMs().map(rm => (
                  <option key={rm} value={rm}>{rm}</option>
                ))}
              </select>
            </>
          )}

          {/* State Heads - Area, Branch, RM/CSO */}
          {(userRole === 'SH Business' || userRole === 'SH Credit') && (
            <>
              <select
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setSelectedBranch('all');
                  setSelectedRM('all');
                }}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                <option value="all">All RMs/CSOs</option>
                {getAvailableRMs().map(rm => (
                  <option key={rm} value={rm}>{rm}</option>
                ))}
              </select>
            </>
          )}

          {/* Area Heads - Branch, RM/CSO */}
          {(userRole === 'AH Business' || userRole === 'AH Credit') && (
            <>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value);
                  setSelectedRM('all');
                }}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
                <option value="all">All RMs/CSOs</option>
                {getAvailableRMs().map(rm => (
                  <option key={rm} value={rm}>{rm}</option>
                ))}
              </select>
            </>
          )}

          {/* BM - RM only */}
          {userRole === 'BM' && (
            <select
              value={selectedRM}
              onChange={(e) => setSelectedRM(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All RMs</option>
              {getAvailableRMs().map(rm => (
                <option key={rm} value={rm}>{rm}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Cases as Cards */}
      <div className="space-y-3">
        {currentCases.map((caseItem) => (
          <div
            key={caseItem.applicationId}
            className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
          >
            {/* Header Row */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-indigo-600 text-sm">{caseItem.applicationId}</p>
                <p className="text-gray-900 text-xs mt-0.5">{caseItem.customerName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                caseItem.status === 'Eligible' 
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {caseItem.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Product:</span>
                <span className="text-gray-900">{caseItem.product}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Amount:</span>
                <span className="text-gray-900">₹{caseItem.loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">
                  {categoryTab === 'disbursed' ? 'Disbursal Date:' : 'Application Date:'}
                </span>
                <span className="text-gray-900">
                  {new Date(categoryTab === 'disbursed' ? (caseItem as any).disbursalDate : (caseItem as any).applicationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Branch:</span>
                <span className="text-gray-900">{caseItem.branch}</span>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full flex items-center justify-between px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs hover:bg-indigo-100 transition-colors">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Deviation button for State Heads */}
            {(userRole === 'SH Business' || userRole === 'SH Credit') && caseItem.status === 'On Hold' && (
              <button
                onClick={() => onNavigateToDeviation?.(caseItem.applicationId)}
                className="w-full mt-2 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs hover:bg-amber-100 transition-colors"
              >
                Raise Deviation
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
