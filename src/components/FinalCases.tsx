'use client';
import { useState, useEffect } from 'react';
import { Search, Download, Eye, ChevronDown, ChevronUp, TrendingUp, Award } from 'lucide-react';
import { listApplications, ApplicationListResponse, Application, getMyIncentives, MyIncentive, getBranchIncentives, BranchIncentive, getAggregatedIncentives, AggregatedIncentive, getAllStates, getUserStateBranches, State, Branch, getEligibleCases } from '@/lib/incentive-api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

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
  const [aggregatedIncentivesData, setAggregatedIncentivesData] = useState<AggregatedIncentive | null>(null);
  const [loadingIncentives, setLoadingIncentives] = useState(false);

  // Multi-tier filters
  const [selectedState, setSelectedState] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRM, setSelectedRM] = useState('all');

  // BM specific filter
  const [incentiveType, setIncentiveType] = useState<'branch' | 'my_incentive'>('branch');

  // Location data from API
  const [states, setStates] = useState<State[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const { user } = useAuth();
  const { error: showError } = useToast();
  const isRM = userRole === 'RM';
  const isIncentiveEligibleRole = ['RM', 'CO', 'BM', 'BCM', 'CSO'].includes(userRole);
  const isLeadershipRole = ['NBH', 'NCH', 'SH Business', 'SH Credit', 'AH Business', 'AH Credit'].includes(userRole);
  const isAggregatedRole = ['AH Business', 'AH Credit', 'SH Business', 'SH Credit', 'NBH', 'NCH'].includes(userRole);

  // Fetch applications data for RM users and leadership roles
  useEffect(() => {
    // Skip for NBH as they use eligible-cases API
    if ((!isRM && !isAggregatedRole) || !selectedMonth || userRole === 'NBH') return;

    const fetchApplications = async () => {
      setLoading(true);
      try {
        const [year, month] = selectedMonth.split('-');
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        const params: any = {
          month: monthNum,
          year: yearNum,
          incentive_status: 'approved', // Get finalized applications for considered applications table
          page_size: 1000, // Get all records
        };

        // For RM, filter by RM's employee code
        if (isRM) {
          const employeeCode = user?.employee_code || user?.code || '';
          if (employeeCode) {
            params.sourcing_rm = employeeCode;
          }
        }

        // For leadership roles, apply filters if selected
        if (isAggregatedRole) {
          if (selectedState !== 'all') {
            params.state_name = selectedState;
          }
          // Note: branch filter would need branch_code, which we don't have from the dropdown
          // The API will handle permission-based filtering automatically
        }

        const response = await listApplications(params);

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
  }, [selectedMonth, isRM, isAggregatedRole, user, selectedState, showError]);

  // Fetch incentives data for RM/CO/BM/BCM/CSO users
  useEffect(() => {
    if (!isIncentiveEligibleRole || !selectedMonth) return;

    const fetchIncentives = async () => {
      setLoadingIncentives(true);
      try {
        // Convert selectedMonth from YYYY-MM to YYYY_MM format
        const period = selectedMonth.replace('-', '_');

        // For BM role, handle based on incentiveType
        if (userRole === 'BM') {
          if (incentiveType === 'branch') {
            // Fetch Branch Incentives
            const response = await getBranchIncentives({
              period: period,
            });

            if (response.success && response.data) {
              setBranchIncentivesData(response.data);
              // Set my incentives data from branch summary for compatibility when in branch view
              if (response.data.branch_summary?.my_incentive) {
                const myIncentive = response.data.branch_summary.my_incentive;
                setMyIncentivesData({
                  incentive_period: response.data.branch_summary.incentive_period,
                  total_monthly_incentive: myIncentive.total_incentive,
                  incentive_breakdown: {
                    disbursal_volume_incentive: {
                      secured: 0,
                      secured_direct: 0,
                      unsecured: 0,
                      total: myIncentive.volume_incentive,
                    },
                    effort_incentive: {
                      secured: 0,
                      unsecured: 0,
                      total: myIncentive.effort_incentive,
                    },
                  },
                  performance_tier: myIncentive.performance_tier,
                  // Add consideration summary for cards
                  consideration_summary: {
                    logins: {
                      secured: myIncentive.secured_logins || 0,
                      unsecured: myIncentive.unsecured_logins || 0,
                      total: (myIncentive.secured_logins || 0) + (myIncentive.unsecured_logins || 0)
                    },
                    disbursals: {
                      secured: 0, // Not available in branch summary
                      unsecured: 0, // Not available in branch summary
                      total: 0
                    },
                    volume: {
                      secured: myIncentive.secured_volume || 0,
                      secured_direct: 0, // Not available
                      unsecured: myIncentive.unsecured_volume || 0,
                      total: (myIncentive.secured_volume || 0) + (myIncentive.unsecured_volume || 0)
                    }
                  }
                } as MyIncentive);
              }
            } else {
              throw new Error(response.message || 'Failed to fetch branch incentives');
            }
          } else {
            // Fetch My Incentives for BM
            const response = await getMyIncentives({
              period: period,
              is_final: true,
            });

            if (response.success && response.data) {
              setMyIncentivesData(response.data);
              // We don't overwrite branchIncentivesData here to keep the team table if needed, 
              // or we could clear it if we want to hide team data in "My Incentive" view.
              // For now, let's keep it but the UI will prioritize myIncentivesData for the cards.
            } else {
              throw new Error(response.message || 'Failed to fetch my incentives');
            }
          }
        } else {
          // For RM, CO, BCM, CSO roles, fetch my incentives
          const response = await getMyIncentives({
            period: period,
            is_final: true, // Get final incentives
          });

          if (response.success && response.data) {
            setMyIncentivesData(response.data);
          } else {
            throw new Error(response.message || 'Failed to fetch incentives');
          }
        }
      } catch (err: any) {
        showError(err.message || 'Failed to load incentives');
      } finally {
        setLoadingIncentives(false);
      }
    };

    fetchIncentives();
  }, [selectedMonth, isIncentiveEligibleRole, userRole, showError, incentiveType]);

  // Fetch aggregated incentives for AH, SH, NBH, NCH roles
  useEffect(() => {
    if (!isAggregatedRole || !selectedMonth) return;

    const fetchAggregatedIncentives = async () => {
      setLoadingIncentives(true);
      try {
        // Convert selectedMonth from YYYY-MM to YYYY_MM format
        const period = selectedMonth.replace('-', '_');

        // Determine aggregation level based on role
        let aggregationLevel: 'branch' | 'state' | 'national' = 'state';
        if (userRole === 'NBH' || userRole === 'NCH') {
          aggregationLevel = 'national';
        } else if (userRole === 'AH Business' || userRole === 'AH Credit') {
          aggregationLevel = 'state'; // AH views state-level aggregation
        } else if (userRole === 'SH Business' || userRole === 'SH Credit') {
          aggregationLevel = 'state';
        }

        // Build params with filters if selected
        const params: any = {
          period: period,
          aggregation_level: aggregationLevel,
        };

        // Add state filter if selected (for all aggregation levels, including national)
        if (selectedState !== 'all') {
          // Send state name (API accepts both state code and state name)
          params.state_code = selectedState;
        }

        // Add branch filter if selected (for all aggregation levels)
        if (selectedBranch !== 'all') {
          params.branch_filter = selectedBranch;
        }

        // Add role filter if needed (can be added later if needed)
        // params.role_filter = 'RM' | 'BM' | 'CO' | 'BCM';

        const response = await getAggregatedIncentives(params);

        if (response.success && response.data) {
          setAggregatedIncentivesData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch aggregated incentives');
        }
      } catch (err: any) {
        showError(err.message || 'Failed to load aggregated incentives');
      } finally {
        setLoadingIncentives(false);
      }
    };

    fetchAggregatedIncentives();
  }, [selectedMonth, isAggregatedRole, userRole, selectedState, selectedBranch, showError]);

  // Fetch states for leadership roles
  useEffect(() => {
    // For SH Business/SH Credit, always fetch states on mount
    const shouldFetchStates = isLeadershipRole; // Removed SH Business/Credit from explicit check as they shouldn't fetch states
    if (!shouldFetchStates) return;

    const fetchStates = async () => {
      // SH Business/Credit should not fetch all states
      if (userRole === 'SH Business' || userRole === 'SH Credit') return;

      setLoadingLocations(true);
      try {
        const statesResponse: any = await getAllStates();
        console.log('States API response (raw):', statesResponse);

        // Handle both response formats: direct array or wrapped in { success, data }
        let statesArray: State[] = [];
        if (Array.isArray(statesResponse)) {
          // Direct array response (what the backend is actually returning)
          statesArray = statesResponse;
          console.log('States API returned direct array, length:', statesArray.length);
        } else if (statesResponse && typeof statesResponse === 'object' && 'success' in statesResponse) {
          // Wrapped in ApiResponse format
          const apiResponse = statesResponse as { success: boolean; data?: State[] };
          if (apiResponse.success && apiResponse.data && Array.isArray(apiResponse.data)) {
            statesArray = apiResponse.data;
            console.log('States API returned wrapped format, length:', statesArray.length);
          }
        } else if (statesResponse && typeof statesResponse === 'object' && 'data' in statesResponse) {
          // Sometimes data is directly available
          const dataResponse = statesResponse as { data: State[] };
          if (Array.isArray(dataResponse.data)) {
            statesArray = dataResponse.data;
            console.log('States API returned data property, length:', statesArray.length);
          }
        }

        console.log('Final states array to set:', statesArray);
        if (statesArray.length > 0) {
          setStates(statesArray);
          console.log('States set successfully, length:', statesArray.length);
        } else {
          console.error('No states found in response');
          showError('Failed to load states - no data received');
        }
      } catch (err: any) {
        console.error('Error fetching states:', err);
        showError('Failed to load states: ' + (err.message || 'Unknown error'));
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchStates();
  }, [isLeadershipRole, userRole, showError]);

  // Fetch branches based on selected state/area for leadership roles
  useEffect(() => {
    if (!isLeadershipRole && userRole !== 'SH Business' && userRole !== 'SH Credit') return;

    const fetchBranches = async () => {
      setLoadingLocations(true);
      try {
        // Determine which state to fetch branches for
        let stateToFetch: string | undefined = undefined;

        // For SH Business/SH Credit, we don't use selectedArea anymore as the dropdown is removed
        // The API getUserStateBranches without arguments will fetch branches for the user's assigned state(s)
        if (userRole === 'SH Business' || userRole === 'SH Credit') {
          stateToFetch = undefined; // Let API handle user context
        }
        // For other leadership roles, use selectedState
        else if (isLeadershipRole && selectedState !== 'all') {
          stateToFetch = selectedState;
        }

        console.log('Fetching branches for state:', stateToFetch || 'default (user state)');
        const branchesResponse: any = await getUserStateBranches(stateToFetch);
        console.log('Branches API response:', branchesResponse);

        let branchesArray: Branch[] = [];
        if (branchesResponse && typeof branchesResponse === 'object') {
          if (Array.isArray(branchesResponse.branches)) {
            // Direct format: { branches: [...] }
            branchesArray = branchesResponse.branches;
            console.log('Branches from direct format, length:', branchesArray.length);
          } else if (branchesResponse.success && branchesResponse.data && Array.isArray(branchesResponse.data.branches)) {
            // Wrapped format: { success: true, data: { branches: [...] } }
            branchesArray = branchesResponse.data.branches;
            console.log('Branches from wrapped format, length:', branchesArray.length);
          }
        }

        if (branchesArray.length > 0) {
          setBranches(branchesArray);
          console.log('Branches set successfully, length:', branchesArray.length);
        } else {
          console.warn('No branches found in response');
          setBranches([]);
        }
      } catch (err: any) {
        console.error('Error fetching branches:', err);
        showError('Failed to load branches: ' + (err.message || 'Unknown error'));
        setBranches([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchBranches();
  }, [isLeadershipRole, userRole, selectedState, selectedArea, showError]);

  // Debug: Log states whenever they change
  useEffect(() => {
    if (userRole === 'SH Business' || userRole === 'SH Credit') {
      console.log('States state updated:', states);
      console.log('Available areas:', getAvailableAreas());
    }
  }, [states, userRole]);

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

  // Transform eligible case data to component format
  const transformEligibleCaseData = (caseItem: any) => {
    const getProductType = (productType: string) => {
      if (!productType) return 'Unsecured';
      const lower = productType.toLowerCase();
      if (lower.includes('secured') || lower.includes('home') || lower.includes('auto') || lower.includes('gold')) {
        return 'Secured';
      }
      return 'Unsecured';
    };

    return {
      applicationId: caseItem.application_number,
      customerName: caseItem.customer_name,
      product: caseItem.product_type || 'N/A',
      productType: getProductType(caseItem.product_type || ''),
      loanAmount: caseItem.loan_amount ? parseFloat(String(caseItem.loan_amount)) : 0,
      applicationDate: caseItem.application_date,
      state: caseItem.state_name || 'N/A',
      branch: caseItem.branch_name || 'N/A',
      finalRM: caseItem.sourcing_rm_name || caseItem.sourcing_rm || '-',
      disbursalDate: null,
      isDirect: false,
    };
  };

  // Fetch eligible cases data for Considered Applications table
  const [eligibleCasesData, setEligibleCasesData] = useState<any>(null);

  useEffect(() => {
    // Only fetch for specific roles
    if (!['RM', 'BM', 'SH Business', 'NBH'].includes(userRole) || !selectedMonth) return;

    const fetchEligibleCases = async () => {
      try {
        const period = selectedMonth.replace('-', '_');

        // Build params with period and filters
        const params: any = { period };

        // Add state filter if selected
        if (selectedState !== 'all') {
          params.state_name = selectedState; // API accepts both state code and state name
        }

        // Add branch filter if selected
        if (selectedBranch !== 'all') {
          params.branch = selectedBranch; // Send branch name
        }

        const response = await getEligibleCases(params);

        if (response.success && response.data) {
          setEligibleCasesData(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch eligible cases for considered applications table:', err);
      }
    };

    fetchEligibleCases();
  }, [selectedMonth, userRole, selectedState, selectedBranch]);

  // Get applications data - use API data from eligible cases API for specific roles
  const getLoginApplications = () => {
    // For RM, BM, SH Business, NBH use eligible cases API data
    if (['RM', 'BM', 'SH Business', 'NBH'].includes(userRole) && eligibleCasesData) {
      return (eligibleCasesData.login_applications || []).map(transformEligibleCaseData);
    }

    // For RM, use applications API data (legacy fallback)
    if (isRM && applicationsData) {
      return applicationsData.results
        .filter(app => app.application_status !== 'Disbursed')
        .map(transformApplicationData);
    }

    // For leadership roles, use applications API data (fetched with filters) (legacy fallback)
    if (isAggregatedRole && applicationsData) {
      return applicationsData.results
        .filter(app => app.application_status !== 'Disbursed')
        .map(transformApplicationData);
    }

    // For CO, BCM, CSO - use login_applications from my-incentives API
    if (isIncentiveEligibleRole && myIncentivesData?.login_applications) {
      return myIncentivesData.login_applications.map(transformEligibleCaseData);
    }

    // Fallback to empty array if no API data available
    return [];
  };

  const getDisbursalCases = () => {
    // For RM, BM, SH Business, NBH use eligible cases API data
    if (['RM', 'BM', 'SH Business', 'NBH'].includes(userRole) && eligibleCasesData) {
      return (eligibleCasesData.disbursals || []).map(transformEligibleCaseData);
    }

    // For RM, use applications API data (legacy fallback)
    if (isRM && applicationsData) {
      return applicationsData.results
        .filter(app => app.application_status === 'Disbursed')
        .map(transformApplicationData);
    }

    // For leadership roles, use applications API data (fetched with filters) (legacy fallback)
    if (isAggregatedRole && applicationsData) {
      return applicationsData.results
        .filter(app => app.application_status === 'Disbursed')
        .map(transformApplicationData);
    }

    // For CO, BCM, CSO - use disbursals from my-incentives API
    if (isIncentiveEligibleRole && myIncentivesData?.disbursals) {
      return myIncentivesData.disbursals.map(transformEligibleCaseData);
    }

    // Fallback to empty array if no API data available
    return [];
  };

  // Get current data
  const loginApplications = getLoginApplications();
  const disbursalCases = getDisbursalCases();

  // Get unique values for cascading filters
  const getAvailableStates = () => {
    // For leadership roles, use API states
    if (isLeadershipRole && states.length > 0) {
      return states.map(s => s.name).sort();
    }
    // For other roles, extract from cases data
    const allCases = [...loginApplications, ...disbursalCases];
    const caseStates = [...new Set(allCases.map(c => c.state))];
    return caseStates.sort();
  };

  const getAvailableAreas = () => {
    // For SH Business/SH Credit, "Areas" dropdown should show all states from Location API
    if (userRole === 'SH Business' || userRole === 'SH Credit') {
      // Always return states for SH Business/SH Credit
      if (states && states.length > 0) {
        const stateNames = states.map(s => s && s.name ? s.name : '').filter(Boolean).sort();
        console.log('SH Business/SH Credit - Available areas (states):', stateNames, 'from states:', states);
        return stateNames;
      }
      console.log('SH Business/SH Credit - No states available yet, states:', states);
      return [];
    }
    // Note: API data doesn't have 'area' field, so this will only work for mock data
    let allCases = [...loginApplications, ...disbursalCases];
    if (selectedState !== 'all') {
      allCases = allCases.filter(c => c.state === selectedState);
    }
    const areas = [...new Set(allCases.map((c: any) => c.area).filter(Boolean))];
    return areas.sort();
  };

  const getAvailableBranches = () => {
    // For leadership roles, use API branches - use city as branch name
    if (isLeadershipRole && branches.length > 0) {
      const branchNames = branches.map(b => b.name).filter(Boolean).sort();
      console.log('Available branches (names):', branchNames, 'from branches:', branches);
      return branchNames;
    }
    // For other roles, extract from cases data
    let allCases = [...loginApplications, ...disbursalCases];
    if (selectedState !== 'all') {
      allCases = allCases.filter(c => c.state === selectedState);
    }
    if (selectedArea !== 'all') {
      allCases = allCases.filter((c: any) => c.area === selectedArea);
    }
    const caseBranches = [...new Set(allCases.map(c => c.branch))];
    return caseBranches.sort();
  };

  const getAvailableRMs = () => {
    // For BM role, use team members from branch incentives
    if (userRole === 'BM' && branchIncentivesData?.team_members) {
      return branchIncentivesData.team_members
        .filter(member => member.role === 'RM')
        .map(member => member.employee_name || member.employee_code)
        .sort();
    }

    // For other roles, use existing logic
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
  const filteredLoginApplications = loginApplications.filter((app: any) => {
    // For NBH/leadership roles using eligible-cases API, skip state/branch filtering
    // as the API already returns filtered data
    const isUsingFilteredAPI = ['NBH', 'NCH', 'SH Business', 'AH Business', 'AH Credit'].includes(userRole);

    const matchesState = isUsingFilteredAPI ? true : (selectedState === 'all' || app.state === selectedState);
    const matchesArea = selectedArea === 'all' || !('area' in app) || (app as any).area === selectedArea;
    const matchesBranch = isUsingFilteredAPI ? true : (selectedBranch === 'all' || app.branch === selectedBranch);
    const matchesRM = selectedRM === 'all' || app.finalRM === selectedRM;
    const matchesSearch = searchTerm === '' ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = productFilter === 'all' || app.productType === productFilter;

    return matchesState && matchesArea && matchesBranch && matchesRM && matchesSearch && matchesProduct;
  });

  const filteredDisbursalCases = disbursalCases.filter((disb: any) => {
    // For NBH/leadership roles using eligible-cases API, skip state/branch filtering
    // as the API already returns filtered data
    const isUsingFilteredAPI = ['NBH', 'NCH', 'SH Business', 'AH Business', 'AH Credit'].includes(userRole);

    const matchesState = isUsingFilteredAPI ? true : (selectedState === 'all' || disb.state === selectedState);
    const matchesArea = selectedArea === 'all' || !('area' in disb) || (disb as any).area === selectedArea;
    const matchesBranch = isUsingFilteredAPI ? true : (selectedBranch === 'all' || disb.branch === selectedBranch);
    const matchesRM = selectedRM === 'all' || disb.finalRM === selectedRM;
    const matchesSearch = searchTerm === '' ||
      disb.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disb.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = productFilter === 'all' || disb.productType === productFilter;

    return matchesState && matchesArea && matchesBranch && matchesRM && matchesSearch && matchesProduct;
  });

  // Get Consideration Summary - use API data if available, otherwise calculate
  const getConsiderationSummary = () => {
    // For leadership roles, use aggregated incentives summary
    if (isAggregatedRole && aggregatedIncentivesData?.summary) {
      const summary = aggregatedIncentivesData.summary;
      return {
        loginSecured: summary.secured_logins || 0,
        loginUnsecured: summary.unsecured_logins || 0,
        disbursalSecured: 0, // Not directly available in aggregated summary
        disbursalUnsecured: 0, // Not directly available in aggregated summary
        volumeSecured: summary.secured_volume || 0,
        volumeSecuredDirect: 0, // Not available in aggregated summary
        volumeUnsecured: summary.unsecured_volume || 0,
      };
    }

    // For BM role
    if (userRole === 'BM') {
      // If viewing My Incentive, use my incentives consideration summary
      if (incentiveType === 'my_incentive') {
        // Check if we have valid data with consideration_summary
        if (myIncentivesData?.consideration_summary) {
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
        // If no consideration summary (e.g. "No incentive record found"), return zeros
        return {
          loginSecured: 0,
          loginUnsecured: 0,
          disbursalSecured: 0,
          disbursalUnsecured: 0,
          volumeSecured: 0,
          volumeSecuredDirect: 0,
          volumeUnsecured: 0
        };
      }

      // If viewing Branch Incentive (or fallback), use branch summary data
      if (branchIncentivesData?.branch_summary?.my_incentive) {
        const myIncentive = branchIncentivesData.branch_summary.my_incentive;
        return {
          loginSecured: myIncentive?.secured_logins || 0,
          loginUnsecured: myIncentive?.unsecured_logins || 0,
          disbursalSecured: 0, // Not available in branch summary
          disbursalUnsecured: 0, // Not available in branch summary
          volumeSecured: myIncentive?.secured_volume || 0,
          volumeSecuredDirect: 0, // Not available in branch summary
          volumeUnsecured: myIncentive?.unsecured_volume || 0,
        };
      }
    }

    // For RM, CO, BCM, CSO - use my incentives consideration summary
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
    const loginSecured = filteredLoginApplications.filter((app: any) => app.productType === 'Secured').length;
    const loginUnsecured = filteredLoginApplications.filter((app: any) => app.productType === 'Unsecured').length;

    const disbursalSecured = filteredDisbursalCases.filter((d: any) => d.productType === 'Secured' && !(d as any).isDirect).length;
    const disbursalUnsecured = filteredDisbursalCases.filter((d: any) => d.productType === 'Unsecured').length;

    const volumeSecured = filteredDisbursalCases
      .filter((d: any) => d.productType === 'Secured' && !(d as any).isDirect)
      .reduce((sum: number, d: any) => sum + d.loanAmount, 0);

    const volumeSecuredDirect = filteredDisbursalCases
      .filter((d: any) => d.productType === 'Secured' && (d as any).isDirect)
      .reduce((sum: number, d: any) => sum + d.loanAmount, 0);

    const volumeUnsecured = filteredDisbursalCases
      .filter((d: any) => d.productType === 'Unsecured')
      .reduce((sum: number, d: any) => sum + d.loanAmount, 0);

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
    // For leadership roles, use aggregated incentives breakdown
    if (isAggregatedRole && aggregatedIncentivesData?.summary) {
      const summary = aggregatedIncentivesData.summary;
      const breakdown = summary.breakdown_by_incentive_type || {};
      return {
        volumeIncentiveSecured: 0, // Not available in aggregated breakdown
        volumeIncentiveSecuredDirect: 0, // Not available in aggregated breakdown
        volumeIncentiveUnsecured: 0, // Not available in aggregated breakdown
        volumeIncentiveTotal: breakdown.volume_incentive || 0,
        effortIncentiveSecured: 0, // Not available in aggregated breakdown
        effortIncentiveUnsecured: 0, // Not available in aggregated breakdown
        effortIncentiveTotal: breakdown.effort_incentive || 0,
        totalMonthlyIncentive: summary.total_incentive || 0
      };
    }

    // For BM role
    if (userRole === 'BM') {
      // If viewing My Incentive, use my incentives breakdown
      if (incentiveType === 'my_incentive') {
        // Check if we have valid data with incentive_breakdown
        if (myIncentivesData?.incentive_breakdown) {
          const apiData = myIncentivesData.incentive_breakdown;
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
        // If no incentive breakdown (e.g. "No incentive record found"), return zeros
        return {
          volumeIncentiveSecured: 0,
          volumeIncentiveSecuredDirect: 0,
          volumeIncentiveUnsecured: 0,
          volumeIncentiveTotal: 0,
          effortIncentiveSecured: 0,
          effortIncentiveUnsecured: 0,
          effortIncentiveTotal: 0,
          totalMonthlyIncentive: myIncentivesData?.total_monthly_incentive || 0
        };
      }
    }

    // For RM, CO, BCM, CSO - use my incentives breakdown
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
    // For leadership roles, performance tier is not applicable (aggregated view)
    // Return null or empty string
    if (isAggregatedRole) {
      return null; // Aggregated view doesn't have a single performance tier
    }

    // For BM role
    if (userRole === 'BM') {
      // If viewing My Incentive, use my incentives performance tier
      if (incentiveType === 'my_incentive') {
        return myIncentivesData?.performance_tier || '-';
      }
      // If viewing Branch Incentive (or fallback), use branch summary performance tier
      if (branchIncentivesData?.branch_summary?.my_incentive?.performance_tier) {
        return branchIncentivesData.branch_summary.my_incentive.performance_tier;
      }
    }

    // For RM, CO, BCM, CSO - use performance tier from my incentives
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
        <h1 className="text-gray-900 mb-1">Final Incentive Summary</h1>
        <p className="text-gray-500 text-sm">Review your finalized cases and calculated incentives</p>
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
                {!(userRole === 'NBH' || userRole === 'NCH') && (
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
                  disabled={selectedState === 'all'}
                >
                  <option value="all">All Branches</option>
                  {(() => {
                    const availableBranches = getAvailableBranches();
                    console.log('Rendering branches dropdown (AH) - availableBranches:', availableBranches, 'branches state:', branches);
                    if (availableBranches.length === 0) {
                      return <option disabled>No branches available (branches.length: {branches.length})</option>;
                    }
                    return availableBranches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ));
                  })()}
                </select>
              </>
            )}

            {/* State Heads - Branch, RM/CSO */}
            {(userRole === 'SH Business' || userRole === 'SH Credit') && (
              <>
                {/* Area dropdown removed as per requirement */}
                <select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSelectedRM('all');
                  }}
                  disabled={loadingLocations}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-50"
                >
                  <option value="all">All Branches</option>
                  {(() => {
                    const availableBranches = getAvailableBranches();
                    console.log('Rendering branches dropdown (SH) - availableBranches:', availableBranches, 'branches state:', branches, 'loadingLocations:', loadingLocations);
                    if (loadingLocations) {
                      return <option disabled>Loading branches...</option>;
                    }
                    if (availableBranches.length === 0) {
                      return <option disabled>No branches available (branches.length: {branches.length})</option>;
                    }
                    return availableBranches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ));
                  })()}
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
                  disabled={selectedState === 'all' || loadingLocations}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white disabled:opacity-50"
                >
                  <option value="all">All Branches</option>
                  {(() => {
                    const availableBranches = getAvailableBranches();
                    console.log('Rendering branches dropdown (SH - second) - availableBranches:', availableBranches, 'branches state:', branches, 'loadingLocations:', loadingLocations);
                    if (loadingLocations) {
                      return <option disabled>Loading branches...</option>;
                    }
                    if (availableBranches.length === 0) {
                      return <option disabled>No branches available (branches.length: {branches.length})</option>;
                    }
                    return availableBranches.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ));
                  })()}
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

            {/* BM - Incentive Type Selection */}
            {userRole === 'BM' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Incentive Type:</span>
                <select
                  value={incentiveType}
                  onChange={(e) => setIncentiveType(e.target.value as 'branch' | 'my_incentive')}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="branch">Branch Incentive</option>
                  <option value="my_incentive">My Incentive</option>
                </select>

                {/* Show RM filter only when in Branch Incentive mode */}
                {/* {incentiveType === 'branch' && (
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
                )} */}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consideration Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex-shrink-0">
        <h3 className="text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Consideration Summary
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
          {isIncentiveEligibleRole && loadingIncentives && (
            <LoadingSpinner size="sm" />
          )}
        </h3>
        {isIncentiveEligibleRole && loadingIncentives ? (
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
            </div>

            {/* Effort Incentive */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-gray-700 mb-2 text-sm">Effort Incentive</p>
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
            </div>
          </div>
        )}
      </div>

      {/* Final Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4 flex-shrink-0">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg p-4 shadow-sm">
          <p className="text-white/80 text-xs mb-1">Total Monthly Incentive</p>
          {isIncentiveEligibleRole && loadingIncentives ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <p className="text-white/70 text-xs">Loading...</p>
            </div>
          ) : (
            <>
              <p className="text-white text-2xl">₹{(incentiveBreakdown.totalMonthlyIncentive / 100000).toFixed(2)}L</p>
              <p className="text-white/70 text-xs mt-1">
                {branchIncentivesData?.branch_summary?.incentive_period
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
          {isIncentiveEligibleRole && loadingIncentives ? (
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

      {/* Team Members List - BM Role Only */}
      {userRole === 'BM' && branchIncentivesData?.team_members && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex-shrink-0">
          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Team Members ({branchIncentivesData.team_members.length})
          </h3>
          {branchIncentivesData.branch_summary?.team_summary && (
            <div className="mb-4 grid grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Total Members</p>
                <p className="text-lg font-semibold text-gray-900">{branchIncentivesData.branch_summary.team_summary.total_members}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Team Incentive</p>
                <p className="text-lg font-semibold text-green-700">₹{(branchIncentivesData.branch_summary.team_summary.total_team_incentive / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Total Volume</p>
                <p className="text-lg font-semibold text-purple-700">₹{(branchIncentivesData.branch_summary.team_summary.total_volume / 100000).toFixed(2)}L</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Total Logins</p>
                <p className="text-lg font-semibold text-orange-700">{branchIncentivesData.branch_summary.team_summary.total_logins}</p>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Employee Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Employee Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Total Incentive</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Secured Volume</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Unsecured Volume</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Performance Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Branch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branchIncentivesData.team_members
                  .filter(member => selectedRM === 'all' || member.employee_name === selectedRM || member.employee_code === selectedRM)
                  .map((member, index) => (
                    <tr key={member.employee_code || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-indigo-600 font-medium">{member.employee_code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{member.employee_name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{member.role || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        ₹{member.total_incentive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₹{(member.secured_volume / 100000).toFixed(2)}L
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        ₹{(member.unsecured_volume / 100000).toFixed(2)}L
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${member.performance_tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                          member.performance_tier === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                            member.performance_tier === 'BRONZE' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                          {member.performance_tier || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{member.branch_name || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
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
                className={`px-4 py-2 rounded-lg text-sm transition-all ${applicationTab === 'login'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Login Applications ({loginApplications.length})
              </button>
              <button
                onClick={() => setApplicationTab('disbursal')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${applicationTab === 'disbursal'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                Disbursals ({disbursalCases.length})
              </button>
            </div>

            {/* Login Applications Tab */}
            {applicationTab === 'login' && (
              <div className="overflow-auto max-h-96">
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
                      filteredLoginApplications.map((app: any) => (
                        <tr key={app.applicationId} className="hover:bg-gray-50 bg-white">
                          <td className="px-4 py-3 text-sm text-indigo-600">{app.applicationId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{app.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{app.product}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${app.productType === 'Secured'
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
              <div className="overflow-auto max-h-96">
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
                      filteredDisbursalCases.map((disb: any) => (
                        <tr key={disb.applicationId} className="hover:bg-gray-50 bg-white">
                          <td className="px-4 py-3 text-sm text-indigo-600">{disb.applicationId}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{disb.customerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{disb.product}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${disb.productType === 'Secured'
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
                            <span className={`px-2 py-1 rounded-full text-xs ${(disb as any).isDirect
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