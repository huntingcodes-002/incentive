'use client';
import { useState, useEffect } from 'react';
import { Search, Download, Eye, ChevronDown, ChevronUp, TrendingUp, Award, Users } from 'lucide-react';
import { listApplications, ApplicationListResponse, Application, getMyIncentives, MyIncentive, getBranchIncentives, BranchIncentive } from '@/lib/incentive-api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface FinalCasesProps {
  userRole: string;
  userName: string;
  selectedMonth: string;
}

export function FinalCases({ userRole, userName, selectedMonth }: FinalCasesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [showCaseDetail, setShowCaseDetail] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [applicationTab, setApplicationTab] = useState<'login' | 'disbursal'>('login');
  const [loading, setLoading] = useState(false);
  const [applicationsData, setApplicationsData] = useState<ApplicationListResponse | null>(null);
  const [myIncentivesData, setMyIncentivesData] = useState<MyIncentive | null>(null);
  const [branchIncentivesData, setBranchIncentivesData] = useState<BranchIncentive | null>(null);
  const [loadingIncentives, setLoadingIncentives] = useState(false);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string>('all');
  
  // Multi-tier filters
  const [selectedState, setSelectedState] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRM, setSelectedRM] = useState('all');

  const { user } = useAuth();
  const { error: showError } = useToast();
  const isRM = userRole === 'RM';
  const isBM = userRole === 'BM';
  const isBCM = userRole === 'BCM';
  const isIncentiveEligibleRole = ['RM', 'CO', 'BM', 'BCM'].includes(userRole);
  const isBranchRole = ['BM', 'BCM'].includes(userRole);
  const isLeadershipRole = ['NBH', 'NCH', 'SH Business', 'SH Credit', 'AH Business', 'AH Credit'].includes(userRole);

  // Fetch applications data for RM users
  useEffect(() => {
    if (!isRM || !selectedMonth) return;

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const [year, month] = selectedMonth.split('-');
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        
        // Get user's employee code for filtering
        const employeeCode = user?.employee_code || user?.code || '';
        
        const response = await listApplications({
          month: monthNum,
          year: yearNum,
          incentive_status: 'eligible', // Filter for eligible cases
          ...(employeeCode && { sourcing_rm: employeeCode }),
          page_size: 1000, // Get all records
        });
        
        if (response.success && response.data) {
          setApplicationsData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch applications');
        }
      } catch (err: any) {
        showError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [selectedMonth, isRM, user, showError]);

  // Fetch my incentives data for RM/CO/BM/BCM users
  useEffect(() => {
    if (!isIncentiveEligibleRole || !selectedMonth) return;

    const fetchMyIncentives = async () => {
      setLoadingIncentives(true);
      try {
        // Convert selectedMonth from YYYY-MM to YYYY_MM format
        const period = selectedMonth.replace('-', '_');
        
        const response = await getMyIncentives({
          period: period,
          is_final: true, // Get final incentives
        });
        
        if (response.success && response.data) {
          setMyIncentivesData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch incentives');
        }
      } catch (err: any) {
        showError(err.message || 'Failed to load incentives');
      } finally {
        setLoadingIncentives(false);
      }
    };

    fetchMyIncentives();
  }, [selectedMonth, isIncentiveEligibleRole, showError]);

  // Fetch branch incentives data for BM/BCM users
  useEffect(() => {
    if (!isBranchRole || !selectedMonth) return;

    const fetchBranchIncentives = async () => {
      setLoadingIncentives(true);
      try {
        // Convert selectedMonth from YYYY-MM to YYYY_MM format
        const period = selectedMonth.replace('-', '_');
        
        const response = await getBranchIncentives({
          period: period,
          role_filter: isBM ? 'RM' : 'CO', // BM filters by RM, BCM filters by CO
          view_mode: 'detail',
        });
        
        if (response.success && response.data) {
          setBranchIncentivesData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch branch incentives');
        }
      } catch (err: any) {
        showError(err.message || 'Failed to load branch incentives');
      } finally {
        setLoadingIncentives(false);
      }
    };

    fetchBranchIncentives();
  }, [selectedMonth, isBranchRole, isBM, showError]);

  // Transform applications data for RM users
  const transformApplicationData = (app: Application) => {
    // Determine product type (Secured/Unsecured) from product_type
    const getProductType = (productType: string) => {
      if (!productType) return 'Unsecured';
      const lower = productType.toLowerCase();
      if (lower.includes('secured') || lower.includes('home') || lower.includes('auto') || lower.includes('gold')) {
        return 'Secured';
      }
      return 'Unsecured';
    };

    return {
      applicationId: app.application_number,
      customerName: app.customer_name,
      product: app.product_type || 'N/A',
      productType: getProductType(app.product_type || ''),
      loanAmount: parseFloat(app.requested_loan_amount || '0'),
      applicationDate: app.application_date,
      state: app.state_name || 'N/A',
      branch: app.branch_name || 'N/A',
      finalRM: app.sourcing_rm_name || app.sourcing_rm || '-',
      disbursalDate: null, // Applications API doesn't provide disbursal date
      isDirect: false, // Default to false, can be determined from other fields if needed
    };
  };

  // Get applications data - use API data for RM, mock data for others
  const getLoginApplications = () => {
    if (isRM && applicationsData) {
      return applicationsData.results
        .filter(app => app.application_status !== 'Disbursed')
        .map(transformApplicationData);
    }
    // For non-RM users, use mock data (will be replaced when other APIs are integrated)
    return [
    {
      applicationId: 'APP2025101',
      customerName: 'Sanjay Gupta',
      product: 'Personal Loan',
      productType: 'Unsecured',
      loanAmount: 300000,
      applicationDate: '2025-01-13',
      state: 'Maharashtra',
      area: 'West',
      branch: 'Mumbai Central',
      finalRM: 'Amit Sharma',
    },
    {
      applicationId: 'APP2025102',
      customerName: 'Kavita Menon',
      product: 'Auto Loan',
      productType: 'Secured',
      loanAmount: 550000,
      applicationDate: '2025-01-14',
      state: 'Delhi',
      area: 'North',
      branch: 'Delhi North',
      finalRM: 'Vikram Joshi',
    },
    {
      applicationId: 'APP2025103',
      customerName: 'Arjun Prasad',
      product: 'Business Loan',
      productType: 'Secured',
      loanAmount: 890000,
      applicationDate: '2025-01-15',
      state: 'Karnataka',
      area: 'South',
      branch: 'Bangalore East',
      finalRM: 'Deepak Rao',
    },
    {
      applicationId: 'APP2025104',
      customerName: 'Divya Shah',
      product: 'Gold Loan',
      productType: 'Secured',
      loanAmount: 120000,
      applicationDate: '2025-01-16',
      state: 'Maharashtra',
      area: 'West',
      branch: 'Mumbai Central',
      finalRM: 'Amit Sharma',
    },
  ];
  };

  const getDisbursalCases = () => {
    if (isRM && applicationsData) {
      return applicationsData.results
        .filter(app => app.application_status === 'Disbursed')
        .map(transformApplicationData);
    }
    // For non-RM users, use mock data (will be replaced when other APIs are integrated)
    return [
    {
      applicationId: 'APP2025001',
      customerName: 'Rajesh Kumar',
      product: 'Personal Loan',
      productType: 'Unsecured',
      loanAmount: 250000,
      applicationDate: '2025-01-05',
      state: 'Maharashtra',
      area: 'West',
      branch: 'Mumbai Central',
      finalRM: 'Amit Sharma',
      finalBM: 'Priya Singh',
      finalBCM: 'Ravi Verma',
      finalCSO: 'Sunita Reddy',
      finalStatus: 'Finalised',
      disbursalDate: '2025-01-15',
      isDirect: false
    },
    {
      applicationId: 'APP2025002',
      customerName: 'Meena Patel',
      product: 'Home Loan',
      productType: 'Secured',
      loanAmount: 1500000,
      applicationDate: '2025-01-06',
      state: 'Delhi',
      area: 'North',
      branch: 'Delhi North',
      finalRM: 'Vikram Joshi',
      finalBM: 'Anjali Mehta',
      finalBCM: 'Sanjay Kumar',
      finalCSO: 'Kavita Sharma',
      finalStatus: 'Finalised',
      disbursalDate: '2025-01-16',
      isDirect: true
    },
    {
      applicationId: 'APP2025005',
      customerName: 'Mohammed Ali',
      product: 'Auto Loan',
      productType: 'Secured',
      loanAmount: 450000,
      applicationDate: '2025-01-09',
      state: 'Telangana',
      area: 'Central',
      branch: 'Hyderabad Central',
      finalRM: 'Sneha Kulkarni',
      finalBM: 'Priya Singh',
      finalBCM: 'Sanjay Kumar',
      finalCSO: 'Kavita Sharma',
      finalStatus: 'Finalised',
      disbursalDate: '2025-01-19',
      isDirect: false
    },
    {
      applicationId: 'APP2025006',
      customerName: 'Lakshmi Iyer',
      product: 'Gold Loan',
      productType: 'Secured',
      loanAmount: 95000,
      applicationDate: '2025-01-10',
      state: 'Tamil Nadu',
      area: 'South',
      branch: 'Chennai South',
      finalRM: 'Karthik Raman',
      finalBM: 'Anjali Mehta',
      finalBCM: 'Ravi Verma',
      finalCSO: 'Sunita Reddy',
      finalStatus: 'Finalised',
      disbursalDate: '2025-01-20',
      isDirect: false
    },
    {
      applicationId: 'APP2025007',
      customerName: 'Vijay Malhotra',
      product: 'Personal Loan',
      productType: 'Unsecured',
      loanAmount: 320000,
      applicationDate: '2025-01-11',
      state: 'West Bengal',
      area: 'East',
      branch: 'Kolkata East',
      finalRM: 'Neha Sen',
      finalBM: 'Priya Singh',
      finalBCM: null,
      finalCSO: null,
      finalStatus: 'Finalised',
      disbursalDate: '2025-01-21',
      isDirect: false
    },
    {
      applicationId: 'APP2025008',
      customerName: 'Pooja Nair',
      product: 'Home Loan',
      productType: 'Secured',
      loanAmount: 2100000,
      applicationDate: '2025-01-12',
      state: 'Maharashtra',
      area: 'West',
      branch: 'Mumbai Central',
      finalRM: 'Amit Sharma',
      finalBM: 'Anjali Mehta',
      finalBCM: 'Sanjay Kumar',
      finalCSO: 'Kavita Sharma',
      finalStatus: 'Finalised',
      disbursalDate: '2025-01-22',
      isDirect: true
    },
    {
      applicationId: 'APP2025010',
      customerName: 'Arjun Desai',
      product: 'Business Loan',
      productType: 'Secured',
      loanAmount: 850000,
      applicationDate: '2025-01-13',
      state: 'Karnataka',
      area: 'South',
      branch: 'Bangalore East',
      finalRM: 'Deepak Rao',
      finalBM: 'Priya Singh',
      finalBCM: 'Ravi Verma',
      finalCSO: 'Sunita Reddy',
      finalStatus: 'Finalised',
      disbursalDate: '2025-01-23',
      isDirect: false
    }
  ];
  };

  // Get current data
  const loginApplications = getLoginApplications();
  const disbursalCases = getDisbursalCases();

  // Get unique values for cascading filters
  const getAvailableStates = () => {
    const allCases = [...loginApplications, ...disbursalCases];
    const states = [...new Set(allCases.map(c => c.state))];
    return states.sort();
  };

  const getAvailableAreas = () => {
    // Note: API data doesn't have 'area' field, so this will only work for mock data
    let allCases = [...loginApplications, ...disbursalCases];
    if (selectedState !== 'all') {
      allCases = allCases.filter(c => c.state === selectedState);
    }
    const areas = [...new Set(allCases.map((c: any) => c.area).filter(Boolean))];
    return areas.sort();
  };

  const getAvailableBranches = () => {
    let allCases = [...loginApplications, ...disbursalCases];
    if (selectedState !== 'all') {
      allCases = allCases.filter(c => c.state === selectedState);
    }
    if (selectedArea !== 'all') {
      allCases = allCases.filter((c: any) => c.area === selectedArea);
    }
    const branches = [...new Set(allCases.map(c => c.branch))];
    return branches.sort();
  };

  const getAvailableRMs = () => {
    let allCases = [...loginApplications, ...disbursalCases];
    if (selectedState !== 'all') {
      allCases = allCases.filter(c => c.state === selectedState);
    }
    if (selectedArea !== 'all') {
      allCases = allCases.filter((c: any) => c.area === selectedArea);
    }
    if (selectedBranch !== 'all') {
      allCases = allCases.filter(c => c.branch === selectedBranch);
    }
    const rms = [...new Set(allCases.map(c => c.finalRM))];
    return rms.sort();
  };

  // Apply multi-tier filters
  const filteredLoginApplications = loginApplications.filter(app => {
    const matchesState = selectedState === 'all' || app.state === selectedState;
    const matchesArea = selectedArea === 'all' || !('area' in app) || (app as any).area === selectedArea;
    const matchesBranch = selectedBranch === 'all' || app.branch === selectedBranch;
    const matchesRM = selectedRM === 'all' || app.finalRM === selectedRM;
    const matchesSearch = searchTerm === '' || 
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = productFilter === 'all' || app.productType === productFilter;
    
    return matchesState && matchesArea && matchesBranch && matchesRM && matchesSearch && matchesProduct;
  });

  const filteredDisbursalCases = disbursalCases.filter(disb => {
    const matchesState = selectedState === 'all' || disb.state === selectedState;
    const matchesArea = selectedArea === 'all' || !('area' in disb) || (disb as any).area === selectedArea;
    const matchesBranch = selectedBranch === 'all' || disb.branch === selectedBranch;
    const matchesRM = selectedRM === 'all' || disb.finalRM === selectedRM;
    const matchesSearch = searchTerm === '' || 
      disb.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disb.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = productFilter === 'all' || disb.productType === productFilter;
    
    return matchesState && matchesArea && matchesBranch && matchesRM && matchesSearch && matchesProduct;
  });

  // Get Consideration Summary - use API data if available, otherwise calculate
  const getConsiderationSummary = () => {
    // For BM/BCM: Use branch incentives data
    if (isBranchRole && branchIncentivesData?.branch_summary) {
      const branchData = branchIncentivesData.branch_summary;
      const myIncentive = branchData.my_incentive;
      
      // If team member is selected, we don't have detailed breakdown for individual members
      // So show team summary or my incentive data
      if (selectedTeamMember !== 'all') {
        const teamMember = branchIncentivesData.team_members.find(
          member => member.employee_code === selectedTeamMember
        );
        if (teamMember) {
          // Team members have limited data, use what's available
          return {
            loginSecured: 0,
            loginUnsecured: 0,
            disbursalSecured: 0,
            disbursalUnsecured: 0,
            volumeSecured: teamMember.secured_volume || 0,
            volumeSecuredDirect: 0,
            volumeUnsecured: teamMember.unsecured_volume || 0
          };
        }
      }
      
      // Show BM/BCM's own data
      return {
        loginSecured: myIncentive.secured_logins || 0,
        loginUnsecured: myIncentive.unsecured_logins || 0,
        disbursalSecured: 0, // Not available in branch summary
        disbursalUnsecured: 0, // Not available in branch summary
        volumeSecured: myIncentive.secured_volume || 0,
        volumeSecuredDirect: 0, // Not available in branch summary
        volumeUnsecured: myIncentive.unsecured_volume || 0
      };
    }
    
    // For RM/CO: Use my-incentives data
    if (isIncentiveEligibleRole && myIncentivesData?.consideration_summary) {
      const apiData = myIncentivesData.consideration_summary;
      return {
        loginSecured: apiData.logins.secured,
        loginUnsecured: apiData.logins.unsecured,
        disbursalSecured: apiData.disbursals.secured,
        disbursalUnsecured: apiData.disbursals.unsecured,
        volumeSecured: apiData.volume.secured,
        volumeSecuredDirect: apiData.volume.secured_direct,
        volumeUnsecured: apiData.volume.unsecured
      };
    }
    
    // Fallback to calculated values for non-eligible roles or when API data is not available
    const loginSecured = filteredLoginApplications.filter(app => app.productType === 'Secured').length;
    const loginUnsecured = filteredLoginApplications.filter(app => app.productType === 'Unsecured').length;
    
    const disbursalSecured = filteredDisbursalCases.filter(d => d.productType === 'Secured' && !(d as any).isDirect).length;
    const disbursalUnsecured = filteredDisbursalCases.filter(d => d.productType === 'Unsecured').length;
    
    const volumeSecured = filteredDisbursalCases
      .filter(d => d.productType === 'Secured' && !(d as any).isDirect)
      .reduce((sum, d) => sum + d.loanAmount, 0);
    
    const volumeSecuredDirect = filteredDisbursalCases
      .filter(d => d.productType === 'Secured' && (d as any).isDirect)
      .reduce((sum, d) => sum + d.loanAmount, 0);
    
    const volumeUnsecured = filteredDisbursalCases
      .filter(d => d.productType === 'Unsecured')
      .reduce((sum, d) => sum + d.loanAmount, 0);

    return {
      loginSecured,
      loginUnsecured,
      disbursalSecured,
      disbursalUnsecured,
      volumeSecured,
      volumeSecuredDirect,
      volumeUnsecured
    };
  };

  // Get Incentive Breakdown - use API data if available, otherwise calculate
  const getIncentiveBreakdown = () => {
    // For BM/BCM: Use branch incentives data
    if (isBranchRole && branchIncentivesData?.branch_summary) {
      const branchData = branchIncentivesData.branch_summary;
      
      // If team member is selected, show that member's data
      if (selectedTeamMember !== 'all') {
        const teamMember = branchIncentivesData.team_members.find(
          member => member.employee_code === selectedTeamMember
        );
        if (teamMember) {
          // Team members only have total_incentive, not separate volume/effort breakdown
          // We'll show the total incentive only
          return {
            volumeIncentiveSecured: 0,
            volumeIncentiveSecuredDirect: 0,
            volumeIncentiveUnsecured: 0,
            volumeIncentiveTotal: 0, // Not available for team members
            effortIncentiveSecured: 0,
            effortIncentiveUnsecured: 0,
            effortIncentiveTotal: 0, // Not available for team members
            totalMonthlyIncentive: teamMember.total_incentive || 0
          };
        }
      }
      
      // Show BM/BCM's own incentive
      // Note: Branch incentives API doesn't provide detailed breakdown (secured/secured_direct/unsecured)
      // Only provides volume_incentive (total) and effort_incentive (total)
      const myIncentive = branchData.my_incentive;
      return {
        volumeIncentiveSecured: 0, // Not available in branch API
        volumeIncentiveSecuredDirect: 0, // Not available in branch API
        volumeIncentiveUnsecured: 0, // Not available in branch API
        volumeIncentiveTotal: myIncentive.volume_incentive || 0,
        effortIncentiveSecured: 0, // Not available in branch API
        effortIncentiveUnsecured: 0, // Not available in branch API
        effortIncentiveTotal: myIncentive.effort_incentive || 0,
        totalMonthlyIncentive: myIncentive.total_incentive || 0
      };
    }
    
    // For RM/CO: Use my-incentives data
    if (isIncentiveEligibleRole && myIncentivesData?.incentive_breakdown) {
      const apiData = myIncentivesData.incentive_breakdown;
      // Map API response fields to component format
      // disbursal_volume_incentive: { secured, secured_direct, unsecured, total }
      // effort_incentive: { secured, unsecured, total }
      return {
        volumeIncentiveSecured: apiData.disbursal_volume_incentive?.secured || 0,
        volumeIncentiveSecuredDirect: apiData.disbursal_volume_incentive?.secured_direct || 0,
        volumeIncentiveUnsecured: apiData.disbursal_volume_incentive?.unsecured || 0,
        volumeIncentiveTotal: apiData.disbursal_volume_incentive?.total || 0,
        effortIncentiveSecured: apiData.effort_incentive?.secured || 0,
        effortIncentiveUnsecured: apiData.effort_incentive?.unsecured || 0,
        effortIncentiveTotal: apiData.effort_incentive?.total || 0,
        totalMonthlyIncentive: myIncentivesData.total_monthly_incentive || 0
      };
    }
    
    // Fallback to calculated values
    const consideration = getConsiderationSummary();
    
    // Disbursal Volume Incentive (sample rates)
    const volumeIncentiveSecured = consideration.volumeSecured * 0.015; // 1.5%
    const volumeIncentiveSecuredDirect = consideration.volumeSecuredDirect * 0.02; // 2%
    const volumeIncentiveUnsecured = consideration.volumeUnsecured * 0.025; // 2.5%
    
    // Effort Incentive (per count)
    const effortIncentiveSecured = (consideration.loginSecured + consideration.disbursalSecured) * 500;
    const effortIncentiveUnsecured = (consideration.loginUnsecured + consideration.disbursalUnsecured) * 750;
    
    const totalMonthlyIncentive = 
      volumeIncentiveSecured + 
      volumeIncentiveSecuredDirect + 
      volumeIncentiveUnsecured + 
      effortIncentiveSecured + 
      effortIncentiveUnsecured;

    return {
      volumeIncentiveSecured,
      volumeIncentiveSecuredDirect,
      volumeIncentiveUnsecured,
      volumeIncentiveTotal: volumeIncentiveSecured + volumeIncentiveSecuredDirect + volumeIncentiveUnsecured,
      effortIncentiveSecured,
      effortIncentiveUnsecured,
      effortIncentiveTotal: effortIncentiveSecured + effortIncentiveUnsecured,
      totalMonthlyIncentive
    };
  };

  const consideration = getConsiderationSummary();
  const incentiveBreakdown = getIncentiveBreakdown();

  // Get Performance Tier - use API data if available, otherwise calculate
  const getPerformanceTier = () => {
    // For BM/BCM: Use branch incentives data
    if (isBranchRole && branchIncentivesData?.branch_summary) {
      if (selectedTeamMember !== 'all') {
        const teamMember = branchIncentivesData.team_members.find(
          member => member.employee_code === selectedTeamMember
        );
        if (teamMember) {
          return teamMember.performance_tier || 'BRONZE';
        }
      }
      return branchIncentivesData.branch_summary.my_incentive.performance_tier || 'BRONZE';
    }
    
    // For RM/CO: Use my-incentives data
    if (isIncentiveEligibleRole && myIncentivesData?.performance_tier) {
      return myIncentivesData.performance_tier;
    }
    
    // Fallback to calculated milestone
    return incentiveBreakdown.totalMonthlyIncentive >= 100000 ? 'GOLD' : 
           incentiveBreakdown.totalMonthlyIncentive >= 50000 ? 'SILVER' : 'BRONZE';
  };

  const performanceTier = getPerformanceTier();

  return (
    <div className="p-6 flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="mb-3 flex-shrink-0">
        <h1 className="text-gray-900 mb-1">
          {isBranchRole && selectedTeamMember !== 'all' 
            ? (() => {
                const selectedMember = branchIncentivesData?.team_members.find(m => m.employee_code === selectedTeamMember);
                return selectedMember 
                  ? `Final Incentive Summary - ${selectedMember.employee_name}`
                  : 'Final Incentive Summary';
              })()
            : 'Final Incentive Summary'}
        </h1>
        <p className="text-gray-500 text-sm">
          {isBranchRole && selectedTeamMember !== 'all'
            ? 'Review team member\'s finalized cases and calculated incentives'
            : 'Review your finalized cases and calculated incentives'}
        </p>
      </div>

      {/* Multi-tier filters based on role */}
      {userRole !== 'RM' && (
        <div className="bg-white border border-gray-200 rounded-lg p-2 mb-3 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2">
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
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="all">All Branches</option>
                  {getAvailableBranches().map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <select
                  value={selectedRM}
                  onChange={(e) => setSelectedRM(e.target.value)}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
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
                className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              >
                <option value="all">All RMs</option>
                {getAvailableRMs().map(rm => (
                  <option key={rm} value={rm}>{rm}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {/* Team Member Filter for BM/BCM */}
      {isBranchRole && branchIncentivesData && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-700">Filter by Team Member:</label>
            <select
              value={selectedTeamMember}
              onChange={(e) => setSelectedTeamMember(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">My Incentive ({branchIncentivesData.branch_summary.my_incentive.employee_name})</option>
              {branchIncentivesData.team_members.map((member) => (
                <option key={member.employee_code} value={member.employee_code}>
                  {member.employee_name} ({member.employee_code}) - {member.performance_tier}
                </option>
              ))}
            </select>
            {selectedTeamMember !== 'all' && (
              <button
                onClick={() => setSelectedTeamMember('all')}
                className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Team Summary for BM/BCM */}
      {isBranchRole && branchIncentivesData && selectedTeamMember === 'all' && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 mb-4 shadow-sm flex-shrink-0">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Branch Team Summary
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-gray-600 text-xs mb-1">Total Team Members</p>
              <p className="text-lg font-semibold text-gray-900">{branchIncentivesData.branch_summary.team_summary.total_members}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-gray-600 text-xs mb-1">Total Team Incentive</p>
              <p className="text-lg font-semibold text-indigo-700">₹{(branchIncentivesData.branch_summary.team_summary.total_team_incentive / 100000).toFixed(2)}L</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-gray-600 text-xs mb-1">Total Volume</p>
              <p className="text-lg font-semibold text-gray-900">₹{(branchIncentivesData.branch_summary.team_summary.total_volume / 100000).toFixed(2)}L</p>
            </div>
            <div className="bg-white/80 rounded-lg p-3">
              <p className="text-gray-600 text-xs mb-1">Total Logins</p>
              <p className="text-lg font-semibold text-gray-900">{branchIncentivesData.branch_summary.team_summary.total_logins}</p>
            </div>
          </div>
        </div>
      )}

      {/* Consideration Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex-shrink-0">
        <h3 className="text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          {isBranchRole && selectedTeamMember !== 'all' ? 'Team Member Summary' : 'Consideration Summary'}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {/* Logins Count */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <p className="text-gray-600 text-xs mb-2">Logins Count</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Secured:</span>
                <span className="text-sm text-gray-900">{consideration.loginSecured}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Unsecured:</span>
                <span className="text-sm text-gray-900">{consideration.loginUnsecured}</span>
              </div>
            </div>
          </div>

          {/* Disbursals Count */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <p className="text-gray-600 text-xs mb-2">Disbursals Count</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Secured:</span>
                <span className="text-sm text-gray-900">{consideration.disbursalSecured}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Unsecured:</span>
                <span className="text-sm text-gray-900">{consideration.disbursalUnsecured}</span>
              </div>
            </div>
          </div>

          {/* Disbursals Volume */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-gray-600 text-xs mb-2">Disbursals Volume</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Secured:</span>
                <span className="text-sm text-gray-900">₹{(consideration.volumeSecured / 100000).toFixed(2)}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Secured Direct:</span>
                <span className="text-sm text-gray-900">₹{(consideration.volumeSecuredDirect / 100000).toFixed(2)}L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Unsecured:</span>
                <span className="text-sm text-gray-900">₹{(consideration.volumeUnsecured / 100000).toFixed(2)}L</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Total Incentive Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex-shrink-0">
        <h3 className="text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-600" />
          Total Incentive Breakdown
          {(isIncentiveEligibleRole || isBranchRole) && loadingIncentives && (
            <LoadingSpinner size="sm" />
          )}
        </h3>
        {(isIncentiveEligibleRole || isBranchRole) && loadingIncentives ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <LoadingSpinner size="md" />
              <p className="text-gray-500 text-sm mt-2">Loading incentive breakdown...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Disbursal Volume Incentive */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-gray-700 mb-2 text-sm">Disbursal Volume Incentive</p>
              {isBranchRole && selectedTeamMember !== 'all' ? (
                // For team members: Only total incentive is available
                <div className="space-y-1.5 ml-3">
                  <div className="text-xs text-gray-500 italic">Detailed breakdown not available for team members</div>
                </div>
              ) : isBranchRole ? (
                // For BM/BCM's own incentive: Branch API provides volume_incentive total
                <div className="space-y-1.5 ml-3">
                  <div className="flex justify-between pt-1">
                    <span className="text-xs font-medium text-gray-700">Total Volume Incentive:</span>
                    <span className="text-sm font-medium text-gray-900">₹{incentiveBreakdown.volumeIncentiveTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ) : (
                // For RM/CO: Full detailed breakdown available
                <div className="space-y-1.5 ml-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">{'>'} Secured:</span>
                    <span className="text-sm text-gray-900">₹{incentiveBreakdown.volumeIncentiveSecured.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">{'>'} Secured Direct:</span>
                    <span className="text-sm text-gray-900">₹{incentiveBreakdown.volumeIncentiveSecuredDirect.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">{'>'} Unsecured:</span>
                    <span className="text-sm text-gray-900">₹{incentiveBreakdown.volumeIncentiveUnsecured.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-blue-200 mt-1">
                    <span className="text-xs font-medium text-gray-700">Total:</span>
                    <span className="text-sm font-medium text-gray-900">₹{incentiveBreakdown.volumeIncentiveTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Effort Incentive */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-gray-700 mb-2 text-sm">Effort Incentive</p>
              {isBranchRole && selectedTeamMember !== 'all' ? (
                // For team members: Only total incentive is available
                <div className="space-y-1.5 ml-3">
                  <div className="text-xs text-gray-500 italic">Detailed breakdown not available for team members</div>
                </div>
              ) : isBranchRole ? (
                // For BM/BCM's own incentive: Branch API provides effort_incentive total
                <div className="space-y-1.5 ml-3">
                  <div className="flex justify-between pt-1">
                    <span className="text-xs font-medium text-gray-700">Total Effort Incentive:</span>
                    <span className="text-sm font-medium text-gray-900">₹{incentiveBreakdown.effortIncentiveTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ) : (
                // For RM/CO: Full detailed breakdown available
                <div className="space-y-1.5 ml-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">{'>'} Secured:</span>
                    <span className="text-sm text-gray-900">₹{incentiveBreakdown.effortIncentiveSecured.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">{'>'} Unsecured:</span>
                    <span className="text-sm text-gray-900">₹{incentiveBreakdown.effortIncentiveUnsecured.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-purple-200 mt-1">
                    <span className="text-xs font-medium text-gray-700">Total:</span>
                    <span className="text-sm font-medium text-gray-900">₹{incentiveBreakdown.effortIncentiveTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Final Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4 flex-shrink-0">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-4 shadow-sm">
          <p className="text-white/80 text-xs mb-1">Total Monthly Incentive</p>
          {(isIncentiveEligibleRole || isBranchRole) && loadingIncentives ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <p className="text-white/70 text-xs">Loading...</p>
            </div>
          ) : (
            <>
              <p className="text-white text-2xl">₹{(incentiveBreakdown.totalMonthlyIncentive / 100000).toFixed(2)}L</p>
              <p className="text-white/70 text-xs mt-1">
                {isBranchRole && branchIncentivesData
                  ? `For ${branchIncentivesData.branch_summary.incentive_period.replace('_', ' ')}`
                  : myIncentivesData?.incentive_period 
                    ? `For ${myIncentivesData.incentive_period.replace('_', ' ')}`
                    : `For ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
              </p>
            </>
          )}
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 shadow-sm">
          <p className="text-white/80 text-xs mb-1">Milestone Achieved</p>
          {(isIncentiveEligibleRole || isBranchRole) && loadingIncentives ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <p className="text-white/70 text-xs">Loading...</p>
            </div>
          ) : (
            <>
              <p className="text-white text-2xl">{performanceTier}</p>
          <p className="text-white/70 text-xs mt-1">Performance Tier</p>
            </>
          )}
        </div>
      </div>

      {/* Team Members Table for BM/BCM */}
      {isBranchRole && branchIncentivesData && selectedTeamMember === 'all' && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0 mb-4">
          <div className="p-4">
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Team Members ({branchIncentivesData.team_members.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Employee Code</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Employee Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Total Incentive</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Secured Volume</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Unsecured Volume</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Performance Tier</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Branch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {branchIncentivesData.team_members.map((member) => (
                    <tr 
                      key={member.employee_code} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTeamMember(member.employee_code)}
                    >
                      <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{member.employee_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{member.employee_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{member.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₹{member.total_incentive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₹{(member.secured_volume / 100000).toFixed(2)}L
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₹{(member.unsecured_volume / 100000).toFixed(2)}L
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={member.performance_tier} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{member.branch_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Considered Applications (Collapsible) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex-shrink-0 mb-4">
        <button
          onClick={() => setShowApplications(!showApplications)}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-gray-900">Considered Applications</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {loginApplications.length} Logins, {disbursalCases.length} Disbursals
            </span>
            {showApplications ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </button>

        {showApplications && (
          <div className="border-t border-gray-200 p-4">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setApplicationTab('login')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  applicationTab === 'login'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Login Applications ({loginApplications.length})
              </button>
              <button
                onClick={() => setApplicationTab('disbursal')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  applicationTab === 'disbursal'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Disbursals ({disbursalCases.length})
              </button>
            </div>

            {/* Login Applications Tab */}
            {applicationTab === 'login' && (
              <div className="overflow-auto max-h-80">
                <table className="w-full bg-white">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Application ID</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Customer Name</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Product</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Type</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Loan Amount</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Application Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center">
                          <LoadingSpinner size="md" />
                          <p className="text-gray-500 text-sm mt-2">Loading applications...</p>
                        </td>
                      </tr>
                    ) : filteredLoginApplications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">
                          No login applications found
                        </td>
                      </tr>
                    ) : (
                      filteredLoginApplications.map((app) => (
                      <tr key={app.applicationId} className="hover:bg-gray-50 bg-white">
                        <td className="px-4 py-3 text-sm text-indigo-600">{app.applicationId}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{app.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{app.product}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            app.productType === 'Secured' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {app.productType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {app.loanAmount && app.loanAmount > 0
                            ? `₹${app.loanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {app.applicationDate
                            ? new Date(app.applicationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '-'}
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Disbursals Tab */}
            {applicationTab === 'disbursal' && (
              <div className="overflow-auto max-h-80">
                <table className="w-full bg-white">
                  <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Application ID</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Customer Name</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Product</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Type</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Loan Amount</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Disbursal Date</th>
                      <th className="px-4 py-2 text-left text-gray-700 text-xs">Channel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center">
                          <LoadingSpinner size="md" />
                          <p className="text-gray-500 text-sm mt-2">Loading disbursals...</p>
                        </td>
                      </tr>
                    ) : filteredDisbursalCases.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                          No disbursals found
                        </td>
                      </tr>
                    ) : (
                      filteredDisbursalCases.map((disb) => (
                      <tr key={disb.applicationId} className="hover:bg-gray-50 bg-white">
                        <td className="px-4 py-3 text-sm text-indigo-600">{disb.applicationId}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{disb.customerName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{disb.product}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            disb.productType === 'Secured' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {disb.productType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {disb.loanAmount && disb.loanAmount > 0
                            ? `₹${disb.loanAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {disb.disbursalDate
                            ? new Date(disb.disbursalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : (disb.applicationDate
                                ? new Date(disb.applicationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                : '-')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            (disb as any).isDirect 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {(disb as any).isDirect ? 'Direct' : 'Indirect'}
                          </span>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}