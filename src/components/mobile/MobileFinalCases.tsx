import { useState } from 'react';
import { TrendingUp, Award, ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface MobileFinalCasesProps {
  userRole: string;
  userName: string;
  selectedMonth: string;
}

export function MobileFinalCases({ userRole, userName, selectedMonth }: MobileFinalCasesProps) {
  const [showApplications, setShowApplications] = useState(false);
  const [applicationTab, setApplicationTab] = useState<'login' | 'disbursal'>('login');
  const [showFilters, setShowFilters] = useState(false);
  
  // Multi-tier filters
  const [selectedState, setSelectedState] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRM, setSelectedRM] = useState('all');

  const mockLoginApplications = [
    { applicationId: 'APP2025101', customerName: 'Sanjay Gupta', product: 'Personal Loan', productType: 'Unsecured', loanAmount: 300000, applicationDate: '2025-01-13', state: 'Maharashtra', area: 'West', branch: 'Mumbai Central', finalRM: 'Amit Sharma' },
    { applicationId: 'APP2025102', customerName: 'Kavita Menon', product: 'Auto Loan', productType: 'Secured', loanAmount: 550000, applicationDate: '2025-01-14', state: 'Delhi', area: 'North', branch: 'Delhi North', finalRM: 'Vikram Joshi' },
  ];

  const mockDisbursalCases = [
    { applicationId: 'APP2025001', customerName: 'Rajesh Kumar', product: 'Personal Loan', productType: 'Unsecured', loanAmount: 250000, disbursalDate: '2025-01-15', isDirect: false, state: 'Maharashtra', area: 'West', branch: 'Mumbai Central', finalRM: 'Amit Sharma' },
    { applicationId: 'APP2025002', customerName: 'Meena Patel', product: 'Home Loan', productType: 'Secured', loanAmount: 1500000, disbursalDate: '2025-01-16', isDirect: true, state: 'Delhi', area: 'North', branch: 'Delhi North', finalRM: 'Vikram Joshi' },
  ];

  const getAvailableStates = () => {
    const allCases = [...mockLoginApplications, ...mockDisbursalCases];
    return [...new Set(allCases.map(c => c.state))].sort();
  };
  const getAvailableAreas = () => {
    let allCases = [...mockLoginApplications, ...mockDisbursalCases];
    if (selectedState !== 'all') allCases = allCases.filter(c => c.state === selectedState);
    return [...new Set(allCases.map(c => c.area))].sort();
  };
  const getAvailableBranches = () => {
    let allCases = [...mockLoginApplications, ...mockDisbursalCases];
    if (selectedState !== 'all') allCases = allCases.filter(c => c.state === selectedState);
    if (selectedArea !== 'all') allCases = allCases.filter(c => c.area === selectedArea);
    return [...new Set(allCases.map(c => c.branch))].sort();
  };
  const getAvailableRMs = () => {
    let allCases = [...mockLoginApplications, ...mockDisbursalCases];
    if (selectedState !== 'all') allCases = allCases.filter(c => c.state === selectedState);
    if (selectedArea !== 'all') allCases = allCases.filter(c => c.area === selectedArea);
    if (selectedBranch !== 'all') allCases = allCases.filter(c => c.branch === selectedBranch);
    return [...new Set(allCases.map(c => c.finalRM))].sort();
  };

  const calculateConsiderationSummary = () => {
    const loginSecured = mockLoginApplications.filter(app => app.productType === 'Secured').length;
    const loginUnsecured = mockLoginApplications.filter(app => app.productType === 'Unsecured').length;
    const disbursalSecured = mockDisbursalCases.filter(d => d.productType === 'Secured' && !d.isDirect).length;
    const disbursalUnsecured = mockDisbursalCases.filter(d => d.productType === 'Unsecured').length;
    const volumeSecured = mockDisbursalCases.filter(d => d.productType === 'Secured' && !d.isDirect).reduce((sum, d) => sum + d.loanAmount, 0);
    const volumeSecuredDirect = mockDisbursalCases.filter(d => d.productType === 'Secured' && d.isDirect).reduce((sum, d) => sum + d.loanAmount, 0);
    const volumeUnsecured = mockDisbursalCases.filter(d => d.productType === 'Unsecured').reduce((sum, d) => sum + d.loanAmount, 0);
    return { loginSecured, loginUnsecured, disbursalSecured, disbursalUnsecured, volumeSecured, volumeSecuredDirect, volumeUnsecured };
  };

  const calculateIncentiveBreakdown = () => {
    const consideration = calculateConsiderationSummary();
    const volumeIncentiveSecured = consideration.volumeSecured * 0.015;
    const volumeIncentiveSecuredDirect = consideration.volumeSecuredDirect * 0.02;
    const volumeIncentiveUnsecured = consideration.volumeUnsecured * 0.025;
    const effortIncentiveSecured = (consideration.loginSecured + consideration.disbursalSecured) * 500;
    const effortIncentiveUnsecured = (consideration.loginUnsecured + consideration.disbursalUnsecured) * 750;
    const totalMonthlyIncentive = volumeIncentiveSecured + volumeIncentiveSecuredDirect + volumeIncentiveUnsecured + effortIncentiveSecured + effortIncentiveUnsecured;
    return { volumeIncentiveSecured, volumeIncentiveSecuredDirect, volumeIncentiveUnsecured, effortIncentiveSecured, effortIncentiveUnsecured, totalMonthlyIncentive };
  };

  const consideration = calculateConsiderationSummary();
  const incentiveBreakdown = calculateIncentiveBreakdown();
  const milestoneAchieved = incentiveBreakdown.totalMonthlyIncentive >= 100000 ? 'Gold' : incentiveBreakdown.totalMonthlyIncentive >= 50000 ? 'Silver' : 'Bronze';

  return (
    <div className="p-3 pb-20">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-gray-900 mb-1">Final Incentive</h1>
        <p className="text-gray-500 text-xs">Review finalized cases and calculated incentives</p>
      </div>

      {/* Filters (if not RM) */}
      {userRole !== 'RM' && (
        <>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs mb-3"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 space-y-2">
              {(userRole === 'NBH' || userRole === 'NCH') && (
                <>
                  <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedArea('all'); setSelectedBranch('all'); setSelectedRM('all'); }} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="all">All States</option>
                    {getAvailableStates().map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <select value={selectedArea} onChange={(e) => { setSelectedArea(e.target.value); setSelectedBranch('all'); setSelectedRM('all'); }} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" disabled={selectedState === 'all'}>
                    <option value="all">All Areas</option>
                    {getAvailableAreas().map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                  <select value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setSelectedRM('all'); }} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" disabled={selectedArea === 'all'}>
                    <option value="all">All Branches</option>
                    {getAvailableBranches().map(branch => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                  <select value={selectedRM} onChange={(e) => setSelectedRM(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" disabled={selectedBranch === 'all'}>
                    <option value="all">All RMs/CSOs</option>
                    {getAvailableRMs().map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </select>
                </>
              )}
              {(userRole === 'SH Business' || userRole === 'SH Credit') && (
                <>
                  <select value={selectedArea} onChange={(e) => { setSelectedArea(e.target.value); setSelectedBranch('all'); setSelectedRM('all'); }} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="all">All Areas</option>
                    {getAvailableAreas().map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                  <select value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setSelectedRM('all'); }} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" disabled={selectedArea === 'all'}>
                    <option value="all">All Branches</option>
                    {getAvailableBranches().map(branch => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                  <select value={selectedRM} onChange={(e) => setSelectedRM(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" disabled={selectedBranch === 'all'}>
                    <option value="all">All RMs/CSOs</option>
                    {getAvailableRMs().map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </select>
                </>
              )}
              {(userRole === 'AH Business' || userRole === 'AH Credit') && (
                <>
                  <select value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setSelectedRM('all'); }} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="all">All Branches</option>
                    {getAvailableBranches().map(branch => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                  <select value={selectedRM} onChange={(e) => setSelectedRM(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" disabled={selectedBranch === 'all'}>
                    <option value="all">All RMs/CSOs</option>
                    {getAvailableRMs().map(rm => <option key={rm} value={rm}>{rm}</option>)}
                  </select>
                </>
              )}
              {userRole === 'BM' && (
                <select value={selectedRM} onChange={(e) => setSelectedRM(e.target.value)} className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="all">All RMs</option>
                  {getAvailableRMs().map(rm => <option key={rm} value={rm}>{rm}</option>)}
                </select>
              )}
            </div>
          )}
        </>
      )}

      {/* Total Summary Cards */}
      <div className="space-y-3 mb-4">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-4 shadow-sm">
          <p className="text-white/80 text-xs mb-1">Total Monthly Incentive</p>
          <p className="text-white text-2xl">₹{(incentiveBreakdown.totalMonthlyIncentive / 100000).toFixed(2)}L</p>
          <p className="text-white/70 text-xs mt-1">For {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 shadow-sm">
          <p className="text-white/80 text-xs mb-1">Milestone Achieved</p>
          <p className="text-white text-2xl">{milestoneAchieved}</p>
          <p className="text-white/70 text-xs mt-1">Performance Tier</p>
        </div>
      </div>

      {/* Consideration Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Consideration Summary
        </h3>
        <div className="space-y-3">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-gray-600 text-xs mb-2">Logins Count</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Secured:</span>
                <span className="text-gray-900">{consideration.loginSecured}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Unsecured:</span>
                <span className="text-gray-900">{consideration.loginUnsecured}</span>
              </div>
            </div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <p className="text-gray-600 text-xs mb-2">Disbursals Count</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Secured:</span>
                <span className="text-gray-900">{consideration.disbursalSecured}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Unsecured:</span>
                <span className="text-gray-900">{consideration.disbursalUnsecured}</span>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-gray-600 text-xs mb-2">Disbursals Volume</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Secured:</span>
                <span className="text-gray-900">₹{(consideration.volumeSecured / 100000).toFixed(2)}L</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Secured Direct:</span>
                <span className="text-gray-900">₹{(consideration.volumeSecuredDirect / 100000).toFixed(2)}L</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Unsecured:</span>
                <span className="text-gray-900">₹{(consideration.volumeUnsecured / 100000).toFixed(2)}L</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incentive Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <Award className="w-5 h-5 text-amber-600" />
          Incentive Breakdown
        </h3>
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-gray-700 mb-2 text-sm">Disbursal Volume Incentive</p>
            <div className="space-y-1.5 ml-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{'>'} Secured:</span>
                <span className="text-gray-900">₹{incentiveBreakdown.volumeIncentiveSecured.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{'>'} Secured Direct:</span>
                <span className="text-gray-900">₹{incentiveBreakdown.volumeIncentiveSecuredDirect.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{'>'} Unsecured:</span>
                <span className="text-gray-900">₹{incentiveBreakdown.volumeIncentiveUnsecured.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-gray-700 mb-2 text-sm">Effort Incentive</p>
            <div className="space-y-1.5 ml-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{'>'} Secured:</span>
                <span className="text-gray-900">₹{incentiveBreakdown.effortIncentiveSecured.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{'>'} Unsecured:</span>
                <span className="text-gray-900">₹{incentiveBreakdown.effortIncentiveUnsecured.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Considered Applications (Collapsible) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <button
          onClick={() => setShowApplications(!showApplications)}
          className="w-full p-4 flex items-center justify-between"
        >
          <h3 className="text-gray-900 text-sm">Considered Applications</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{mockLoginApplications.length + mockDisbursalCases.length} total</span>
            {showApplications ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
          </div>
        </button>
        {showApplications && (
          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2 mb-3">
              <button onClick={() => setApplicationTab('login')} className={`flex-1 px-3 py-2 rounded-lg text-xs ${applicationTab === 'login' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                Logins ({mockLoginApplications.length})
              </button>
              <button onClick={() => setApplicationTab('disbursal')} className={`flex-1 px-3 py-2 rounded-lg text-xs ${applicationTab === 'disbursal' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                Disbursals ({mockDisbursalCases.length})
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {applicationTab === 'login' && mockLoginApplications.map((app) => (
                <div key={app.applicationId} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-indigo-600 text-xs">{app.applicationId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${app.productType === 'Secured' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {app.productType}
                    </span>
                  </div>
                  <p className="text-gray-900 text-xs mb-1">{app.customerName}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{app.product}</span>
                    <span>₹{app.loanAmount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {applicationTab === 'disbursal' && mockDisbursalCases.map((disb) => (
                <div key={disb.applicationId} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-teal-600 text-xs">{disb.applicationId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${disb.productType === 'Secured' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                      {disb.productType}
                    </span>
                  </div>
                  <p className="text-gray-900 text-xs mb-1">{disb.customerName}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{disb.product}</span>
                    <span>₹{disb.loanAmount.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}