'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, FileText, TrendingUp, Users, AlertCircle, DollarSign, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { CaseDetailPanel } from '@/components/CaseDetailPanel';
import { SummaryCard, SummaryCardGrid } from '@/components/ui/SummaryCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { getEligibleCases, EligibleCasesResponse, listApplications, ApplicationListResponse, Application } from '@/lib/incentive-api';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/contexts/AuthContext';

interface EligibleCasesProps {
  userRole: string;
  userName: string;
  selectedMonth: string;
  onNavigateToDeviation?: (caseId: string) => void;
}

export function EligibleCases({ userRole, userName, selectedMonth, onNavigateToDeviation }: EligibleCasesProps) {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [caseCategory, setCaseCategory] = useState<'Disbursed' | 'Login'>('Disbursed');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EligibleCasesResponse | null>(null);
  const [applicationsData, setApplicationsData] = useState<ApplicationListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Multi-tier filters
  const [selectedState, setSelectedState] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRM, setSelectedRM] = useState('all');

  const { error: showError } = useToast();
  const { user } = useAuth();
  const isRM = userRole === 'RM';
  const isLeadershipRole = ['NBH', 'NCH', 'SH Business', 'SH Credit', 'AH Business', 'AH Credit'].includes(userRole);

  // Fetch data - different API for RM vs others
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedMonth) return;
      
      setLoading(true);
      setError(null);
      try {
        if (isRM) {
          // For RM, use applications API
          const [year, month] = selectedMonth.split('-');
          const monthNum = parseInt(month, 10);
          const yearNum = parseInt(year, 10);
          
          // Get user's employee code for filtering
          const employeeCode = user?.employee_code || user?.code || '';
          
          const response = await listApplications({
            month: monthNum,
            year: yearNum,
            incentive_status: 'eligible', // Filter for eligible cases
            ...(employeeCode && { sourcing_rm: employeeCode }), // Filter by RM's employee code
            page_size: 1000, // Get all records
          });
          
          if (response.success && response.data) {
            setApplicationsData(response.data);
            // Transform applications data to match EligibleCasesResponse format
            const transformedData: EligibleCasesResponse = {
              period: selectedMonth.replace('-', '_'),
              summary: {
                total_eligible_cases: response.data.count,
                total_value: response.data.results.reduce((sum, app) => sum + parseFloat(app.requested_loan_amount || '0'), 0),
                disbursed_cases: response.data.results.filter(app => app.application_status === 'Disbursed').length,
                login_applications: response.data.results.filter(app => app.application_status !== 'Disbursed').length,
                deviations_raised: response.data.results.filter(app => app.incentive_status === 'under_deviation').length,
                hold_cases: response.data.results.filter(app => app.incentive_status === 'hold').length,
              },
              login_applications: response.data.results
                .filter(app => app.application_status !== 'Disbursed')
                .map(app => ({
                  application_number: app.application_number,
                  application_type: 'LOGIN' as const,
                  customer_name: app.customer_name,
                  product_type: app.product_type || 'N/A',
                  loan_amount: null, // Login applications don't have loan amounts
                  application_date: app.application_date,
                  branch_name: app.branch_name || 'N/A',
                  state_name: app.state_name || 'N/A',
                  // Include additional fields for transformation
                  sourcing_rm_name: app.sourcing_rm_name || app.sourcing_rm || '',
                  sourcing_rm: app.sourcing_rm || '',
                  sourcing_bm_name: app.sourcing_bm_name || app.sourcing_bm || null,
                  sourcing_bm: app.sourcing_bm || null,
                  sourcing_bcm_name: app.sourcing_bcm_name || app.sourcing_bcm || null,
                  sourcing_bcm: app.sourcing_bcm || null,
                  sourcing_co_name: app.sourcing_co_name || app.sourcing_co || null,
                  sourcing_co: app.sourcing_co || null,
                  incentive_status: app.incentive_status || 'pending',
                  requested_loan_amount: app.requested_loan_amount || '0', // Preserve original value for transformation
                })),
              disbursals: response.data.results
                .filter(app => app.application_status === 'Disbursed')
                .map(app => ({
                  application_number: app.application_number,
                  application_type: 'DISBURSAL' as const,
                  customer_name: app.customer_name,
                  product_type: app.product_type || 'N/A',
                  loan_amount: parseFloat(app.requested_loan_amount || '0'), // Use requested_loan_amount for disbursals
                  application_date: app.application_date,
                  branch_name: app.branch_name || 'N/A',
                  state_name: app.state_name || 'N/A',
                  // Include additional fields for transformation
                  sourcing_rm_name: app.sourcing_rm_name || app.sourcing_rm || '',
                  sourcing_rm: app.sourcing_rm || '',
                  sourcing_bm_name: app.sourcing_bm_name || app.sourcing_bm || null,
                  sourcing_bm: app.sourcing_bm || null,
                  sourcing_bcm_name: app.sourcing_bcm_name || app.sourcing_bcm || null,
                  sourcing_bcm: app.sourcing_bcm || null,
                  sourcing_co_name: app.sourcing_co_name || app.sourcing_co || null,
                  sourcing_co: app.sourcing_co || null,
                  incentive_status: app.incentive_status || 'pending',
                  requested_loan_amount: app.requested_loan_amount || '0', // Preserve original value for transformation
                })),
            };
            setData(transformedData);
          } else {
            throw new Error(response.message || 'Failed to fetch applications');
          }
        } else {
          // For other roles, use eligible-cases API
          const period = selectedMonth.replace('-', '_');
          const response = await getEligibleCases({ period });
          
          if (response.success && response.data) {
            setData(response.data);
          } else {
            throw new Error(response.message || 'Failed to fetch eligible cases');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        showError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth, isRM, user, showError]);

  // Transform API data to component format
  const transformCaseData = (caseItem: any) => {
    // Map incentive_status to display status
    const getDisplayStatus = (incentiveStatus: string) => {
      switch (incentiveStatus?.toLowerCase()) {
        case 'eligible':
          return 'Eligible';
        case 'under_deviation':
          return 'Under Deviation';
        case 'hold':
          return 'Hold';
        case 'approved':
          return 'Finalised';
        case 'rejected':
          return 'Rejected';
        case 'pending':
          return 'Pending';
      default:
          return incentiveStatus || 'Pending'; // Show the actual status or default to Pending
      }
    };

    // Parse loan amount - prioritize requested_loan_amount from applications API
    // Handle both loan_amount (from eligible-cases API) and requested_loan_amount (from applications API)
    // Always use requested_loan_amount if available (from applications API), otherwise use loan_amount
    let loanAmount = 0;
    if (caseItem.requested_loan_amount !== undefined && caseItem.requested_loan_amount !== null) {
      loanAmount = parseFloat(String(caseItem.requested_loan_amount)) || 0;
    } else if (caseItem.loan_amount !== undefined && caseItem.loan_amount !== null) {
      loanAmount = typeof caseItem.loan_amount === 'number' ? caseItem.loan_amount : parseFloat(String(caseItem.loan_amount)) || 0;
    }

    return {
      applicationId: caseItem.application_number,
      customerName: caseItem.customer_name,
      applicationDate: caseItem.application_date,
      product: caseItem.product_type || 'N/A',
      loanAmount: loanAmount,
      state: caseItem.state_name || 'N/A',
      branch: caseItem.branch_name || 'N/A',
      category: caseItem.application_type === 'DISBURSAL' ? 'Disbursed' : 'Login',
      status: getDisplayStatus(caseItem.incentive_status),
      rmName: caseItem.sourcing_rm_name || caseItem.sourcing_rm || '-',
      disbursalDate: caseItem.disbursal_date || null, // Will be null if not available
      bmName: caseItem.sourcing_bm_name || caseItem.sourcing_bm || null,
      bcmName: caseItem.sourcing_bcm_name || caseItem.sourcing_bcm || null,
      csoName: caseItem.sourcing_co_name || caseItem.sourcing_co || null,
    };
  };

  // Get cases from API data
  const allCases = data ? [
    ...(data.disbursals || []).map(transformCaseData),
    ...(data.login_applications || []).map(transformCaseData)
  ] : [];

  // Filter cases based on user role - API already filters by permissions
  // We just need to apply local filters
  const roleFilteredCases = allCases;
  
  // Get unique values for cascading filters
  const getAvailableStates = () => {
    const states = [...new Set(roleFilteredCases.map(c => c.state).filter(s => s && s !== 'N/A'))];
    return states.sort();
  };

  const getAvailableBranches = () => {
    let casesToFilter = roleFilteredCases;
    if (selectedState !== 'all') {
      casesToFilter = casesToFilter.filter(c => c.state === selectedState);
    }
    const branches = [...new Set(casesToFilter.map(c => c.branch).filter(b => b && b !== 'N/A'))];
    return branches.sort();
  };
  
  // Filter by category
  const categoryFilteredCases = roleFilteredCases.filter(c => c.category === caseCategory);
  
  // Apply filters
  const filteredCases = categoryFilteredCases.filter(c => {
    const matchesSearch = 
      c.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesState = selectedState === 'all' || c.state === selectedState;
    const matchesBranch = selectedBranch === 'all' || c.branch === selectedBranch;
    
    return matchesSearch && matchesStatus && matchesState && matchesBranch;
  });

  // Calculate summary from API data
  const displaySummary = data ? {
    totalCases: data.summary.total_eligible_cases || 0,
    totalValue: data.summary.total_value || 0,
    deviationsRaised: data.summary.deviations_raised || 0,
    holds: data.summary.hold_cases || 0,
    disbursedCount: data.summary.disbursed_cases || 0,
    loginCount: data.summary.login_applications || 0,
  } : {
    totalCases: 0,
    totalValue: 0,
    deviationsRaised: 0,
    holds: 0,
    disbursedCount: 0,
    loginCount: 0,
  };

  const getMonthYearDisplay = () => {
    if (!selectedMonth) return 'Select Period';
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Eligible': return 'bg-emerald-100 text-emerald-800';
      case 'Under Deviation': return 'bg-amber-100 text-amber-800';
      case 'Hold': return 'bg-red-100 text-red-800';
      case 'Finalised': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load eligible cases"
          description={error}
          action={{
            label: "Retry",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <EmptyState
          icon={FileText}
          title="No data available"
          description="No eligible cases found for the selected period"
        />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="mb-3 flex-shrink-0 flex items-start justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Eligible Cases – {getMonthYearDisplay()}</h1>
          <p className="text-gray-500 text-sm">Review and manage eligible incentive cases</p>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setCaseCategory('Disbursed')}
            className={`px-4 py-2 rounded-lg transition-all ${
              caseCategory === 'Disbursed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div>
                <p className={`text-xs ${caseCategory === 'Disbursed' ? 'text-indigo-100' : 'text-gray-500'}`}>
                  Disbursed Cases
                </p>
                <p className="mt-0.5 text-sm">{displaySummary.disbursedCount}</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setCaseCategory('Login')}
            className={`px-4 py-2 rounded-lg transition-all ${
              caseCategory === 'Login'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div>
                <p className={`text-xs ${caseCategory === 'Login' ? 'text-teal-100' : 'text-gray-500'}`}>
                  Login Applications
                </p>
                <p className="mt-0.5 text-sm">{displaySummary.loginCount}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Summary Strip for Leadership - Fixed */}
      {isLeadershipRole && (
        <div className="mb-3">
          <SummaryCardGrid>
            <SummaryCard
              icon={FileText}
              title="Total Eligible Cases"
              value={displaySummary.totalCases}
            />
            <SummaryCard
              icon={DollarSign}
              title="Total Value"
              value={`₹${(displaySummary.totalValue / 10000000).toFixed(2)}Cr`}
            />
            <SummaryCard
              icon={AlertCircle}
              title="Deviations Raised"
              value={displaySummary.deviationsRaised}
            />
            <SummaryCard
              icon={Users}
              title="Hold Cases"
              value={displaySummary.holds}
            />
          </SummaryCardGrid>
        </div>
      )}

      {/* Filters & Actions - Fixed */}
      <div className="bg-white border border-gray-200 rounded-lg p-2.5 mb-3 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Application ID, Customer Name, or RM"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm premium-dropdown rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px] font-semibold"
          >
            <option value="all">All Status</option>
            <option value="Eligible">Eligible</option>
            <option value="Under Deviation">Under Deviation</option>
            <option value="Hold">Hold</option>
            <option value="Finalised">Finalised</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Multi-tier filters based on role */}
        {userRole !== 'RM' && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            {/* National Heads - State and Branch filters */}
            {(userRole === 'NBH' || userRole === 'NCH') && (
              <>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedBranch('all');
                  }}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="all">All States</option>
                  {getAvailableStates().map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  disabled={selectedState === 'all'}
                >
                  <option value="all">All Branches</option>
                  {getAvailableBranches().map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </>
            )}

            {/* State Heads - Branch filter */}
            {(userRole === 'SH Business' || userRole === 'SH Credit') && (
                <select
                  value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="all">All Branches</option>
                  {getAvailableBranches().map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
            )}

            {/* Area Heads - Branch filter */}
            {(userRole === 'AH Business' || userRole === 'AH Credit') && (
                <select
                  value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="all">All Branches</option>
                  {getAvailableBranches().map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Cases Table - Scrollable */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full bg-white">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Application ID</th>
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Customer Name</th>
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Product</th>
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Loan Amount</th>
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Application Date</th>
                {caseCategory === 'Disbursed' && (
                  <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Disbursal Date</th>
                )}
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Branch Name</th>
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">RM Name</th>
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Status</th>
                <th className="px-4 py-2 text-left text-gray-700 text-xs font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={caseCategory === 'Disbursed' ? 10 : 9} className="px-4 py-8 text-center text-gray-500">
                    No cases found matching your filters
                  </td>
                </tr>
              ) : (
                filteredCases.map((caseItem) => (
                <tr key={caseItem.applicationId} className="hover:bg-gray-50 transition-colors bg-white">
                  <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{caseItem.applicationId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{caseItem.customerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{caseItem.product}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {caseItem.loanAmount !== undefined && caseItem.loanAmount !== null
                      ? `₹${caseItem.loanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : caseCategory === 'Login' ? '-' : '₹0.00'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {caseItem.applicationDate 
                      ? new Date(caseItem.applicationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '-'}
                  </td>
                  {caseCategory === 'Disbursed' && (
                      <td className="px-4 py-3 text-sm text-gray-700">
                      {caseItem.disbursalDate 
                        ? new Date(caseItem.disbursalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '-'}
                      </td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-700">{caseItem.branch || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{caseItem.rmName || '-'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={caseItem.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedCase(caseItem)}
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
      </div>

      {/* Case Detail Panel */}
      {selectedCase && (
        <CaseDetailPanel
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onRaiseDeviation={() => {
            if (onNavigateToDeviation) {
              onNavigateToDeviation(selectedCase.applicationId);
            }
            setSelectedCase(null);
          }}
          userRole={userRole}
        />
      )}
    </div>
  );
}