/**
 * Incentive IQ API service functions
 * All endpoints follow the standard API response format: { success, message, data }
 */

import { apiRequest, ApiResponse } from './api';

// ============== Types ==============

export interface Application {
  application_number: string;
  application_date: string;
  customer_name: string;
  requested_loan_amount: string;
  product_type: string;
  branch_name: string;
  branch_code: string;
  state_name: string;
  application_status: string;
  incentive_status: string;
  sourcing_rm: string;
  sourcing_rm_name: string;
  sourcing_bm: string;
  sourcing_bm_name: string;
  sourcing_co: string;
  sourcing_co_name: string;
  sourcing_bcm: string;
  sourcing_bcm_name: string;
  created_at: string;
  modified_at: string;
}

export interface ApplicationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Application[];
}

export interface ApplicationSummary {
  total_applications: number;
  total_value: number;
  eligible_applications: number;
  under_deviation: number;
  hold_applications: number;
  disbursed_cases: number;
  login_applications: number;
  status_breakdown: {
    eligible: number;
    under_deviation: number;
    hold: number;
    pending: number;
  };
  role_breakdown: {
    rm: number;
    bm: number;
    co: number;
    bcm: number;
  };
}

export interface Deviation {
  deviation_id: number;
  case_id: string;
  case: {
    application_number: string;
    customer_name: string;
  };
  deviation_type: 'mapping_business' | 'mapping_credit' | 'tagging' | 'other';
  raised_by: {
    employee_code: string;
    name: string;
  };
  assigned_approver: {
    employee_code: string;
    name: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  mapping?: {
    sourcing_rm?: string;
    sourcing_rm_name?: string;
    sourcing_bm?: string;
    sourcing_bm_name?: string;
    sourcing_co?: string;
    sourcing_co_name?: string;
    sourcing_bcm?: string;
    sourcing_bcm_name?: string;
    proposed_rm?: string;
    proposed_rm_name?: string;
    proposed_bm?: string;
    proposed_bm_name?: string;
    proposed_co?: string;
    proposed_co_name?: string;
    proposed_bcm?: string;
    proposed_bcm_name?: string;
  };
  reason: string;
  supporting_docs: string[];
  raised_at: string;
  resolved_at: string | null;
  resolved_by: any;
  created_at: string;
  modified_at: string;
}

export interface DeviationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Deviation[];
}

export interface DeviationInboxSummary {
  pending_approval: number;
  approved: number;
  rejected: number;
  total_deviations: number;
  type_breakdown: {
    mapping_business: number;
    mapping_credit: number;
    tagging: number;
    other: number;
  };
}

export interface DocketUpload {
  upload_id: number;
  application: string;
  application_number: string;
  customer_name: string;
  branch_name: string;
  state_name: string;
  product_type: string;
  requested_loan_amount: string;
  disbursal_date: string;
  month: string;
  days: number;
  ageing: string;
  loan_account_no: string;
  customer_id: string;
  docket_final_remarks: string;
  observation: string;
  uploaded_by: number;
  uploaded_by_name: string;
  uploaded_by_code: string;
  upload_batch_id: string;
  file_name: string;
  created_at: string;
  modified_at: string;
}

export interface DocketListResponse {
  count: number;
  next: number | null;
  previous: number | null;
  results: DocketUpload[];
}

export interface DocketUploadResponse {
  batch_id: string;
  total_rows: number;
  created: number;
  updated: number;
  errors: number;
  error_details: any[];
  applications_updated_to_hold: number;
  application_ids_updated: string[];
}

export interface EligibleCase {
  application_number: string;
  application_type: 'LOGIN' | 'DISBURSAL';
  customer_name: string;
  product_type: string;
  loan_amount: number | null;
  application_date: string;
  branch_name: string;
  state_name: string;
}

export interface EligibleCasesResponse {
  period: string;
  summary: {
    total_eligible_cases: number;
    total_value: number;
    disbursed_cases: number;
    login_applications: number;
    deviations_raised: number;
    hold_cases: number;
  };
  login_applications: EligibleCase[];
  disbursals: EligibleCase[];
}

export interface MyIncentive {
  employee_code: string;
  employee_name: string;
  role: string;
  incentive_period: string;
  evaluation_period: {
    start_date: string;
    end_date: string;
  };
  location: {
    state_name: string;
    branch_name: string;
  };
  consideration_summary: {
    logins: {
      secured: number;
      unsecured: number;
      total: number;
    };
    disbursals: {
      secured: number;
      unsecured: number;
      total: number;
    };
    volume: {
      secured: number;
      secured_direct: number;
      unsecured: number;
      total: number;
    };
  };
  incentive_breakdown: {
    disbursal_volume_incentive: {
      secured: number;
      secured_direct: number;
      unsecured: number;
      total: number;
    };
    effort_incentive: {
      secured: number;
      unsecured: number;
      total: number;
    };
  };
  total_monthly_incentive: number;
  performance_tier: string;
  role_specific_details: any;
  login_applications: EligibleCase[];
  disbursals: EligibleCase[];
  metadata: {
    joining_date: string;
    calculation_date: string;
    is_final: boolean;
  };
}

export interface BranchIncentive {
  branch_summary: {
    branch_name: string;
    state_name: string;
    incentive_period: string;
    my_incentive: {
      employee_code: string;
      employee_name: string;
      role: string;
      total_incentive: number;
      volume_incentive: number;
      effort_incentive: number;
      performance_tier: string;
      secured_volume: number;
      unsecured_volume: number;
      secured_logins: number;
      unsecured_logins: number;
    };
    team_summary: {
      total_members: number;
      total_team_incentive: number;
      total_volume: number;
      total_logins: number;
      total_disbursals: number;
    };
  };
  team_members: Array<{
    employee_code: string;
    employee_name: string;
    role: string;
    total_incentive: number;
    secured_volume: number;
    unsecured_volume: number;
    performance_tier: string;
    branch_name: string;
    state_name: string;
  }>;
}

export interface AggregatedIncentive {
  aggregation_level: 'branch' | 'state' | 'national';
  aggregation_key: string;
  incentive_period: string;
  summary: {
    total_employees: number;
    total_incentive: number;
    total_volume: number;
    secured_volume: number;
    unsecured_volume: number;
    total_logins: number;
    secured_logins: number;
    unsecured_logins: number;
    total_disbursals: number;
    breakdown_by_incentive_type: {
      volume_incentive: number;
      effort_incentive: number;
    };
    breakdown_by_role: {
      RM?: { count: number; total_incentive: number };
      BM?: { count: number; total_incentive: number };
      CO?: { count: number; total_incentive: number };
      BCM?: { count: number; total_incentive: number };
    };
    breakdown_by_state?: Array<{
      name: string;
      total_incentive: number;
      total_employees: number;
      total_volume: number;
    }>;
  };
  detailed_records: any[];
}

// ============== Application APIs ==============

export interface ListApplicationsParams {
  month: number;
  year: number;
  application_status?: string;
  incentive_status?: string;
  product_type?: string;
  branch_code?: string;
  state_name?: string;
  sourcing_rm?: string;
  sourcing_bm?: string;
  sourcing_co?: string;
  sourcing_bcm?: string;
  customer_name?: string;
  application_number?: string;
  page?: number;
  page_size?: number;
}

export async function listApplications(
  params: ListApplicationsParams
): Promise<ApiResponse<ApplicationListResponse>> {
  const queryParams = new URLSearchParams();
  queryParams.append('month', params.month.toString());
  queryParams.append('year', params.year.toString());
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params.application_status) queryParams.append('application_status', params.application_status);
  if (params.incentive_status) queryParams.append('incentive_status', params.incentive_status);
  if (params.product_type) queryParams.append('product_type', params.product_type);
  if (params.branch_code) queryParams.append('branch_code', params.branch_code);
  if (params.state_name) queryParams.append('state_name', params.state_name);
  if (params.sourcing_rm) queryParams.append('sourcing_rm', params.sourcing_rm);
  if (params.sourcing_bm) queryParams.append('sourcing_bm', params.sourcing_bm);
  if (params.sourcing_co) queryParams.append('sourcing_co', params.sourcing_co);
  if (params.sourcing_bcm) queryParams.append('sourcing_bcm', params.sourcing_bcm);
  if (params.customer_name) queryParams.append('customer_name', params.customer_name);
  if (params.application_number) queryParams.append('application_number', params.application_number);

  return apiRequest<ApplicationListResponse>(`/api/incentive-iq/applications/?${queryParams.toString()}`);
}

export async function getApplication(
  applicationNumber: string
): Promise<ApiResponse<Application>> {
  return apiRequest<Application>(`/api/incentive-iq/applications/${applicationNumber}/`);
}

export async function getApplicationSummary(
  month: number,
  year: number,
  filters?: Partial<ListApplicationsParams>
): Promise<ApiResponse<ApplicationSummary>> {
  const queryParams = new URLSearchParams();
  queryParams.append('month', month.toString());
  queryParams.append('year', year.toString());
  
  // Add filters if provided
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  return apiRequest<ApplicationSummary>(`/api/incentive-iq/applications/summary/?${queryParams.toString()}`);
}

export async function getGeneralSummary(
  month: number,
  year: number,
  filters?: Partial<ListApplicationsParams>
): Promise<ApiResponse<ApplicationSummary>> {
  const queryParams = new URLSearchParams();
  queryParams.append('month', month.toString());
  queryParams.append('year', year.toString());
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  return apiRequest<ApplicationSummary>(`/api/incentive-iq/summary/?${queryParams.toString()}`);
}

// ============== Deviation APIs ==============

export interface ListDeviationsParams {
  status?: 'pending' | 'approved' | 'rejected';
  deviation_type?: 'mapping_business' | 'mapping_credit' | 'tagging' | 'other';
  search?: string;
  page?: number;
  page_size?: number;
}

export async function listDeviations(
  params?: ListDeviationsParams
): Promise<ApiResponse<DeviationListResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.status) queryParams.append('status', params.status);
    if (params.deviation_type) queryParams.append('deviation_type', params.deviation_type);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
  }

  const queryString = queryParams.toString();
  return apiRequest<DeviationListResponse>(`/api/incentive-iq/deviations/${queryString ? `?${queryString}` : ''}`);
}

export async function getDeviation(
  deviationId: string
): Promise<ApiResponse<Deviation>> {
  return apiRequest<Deviation>(`/api/incentive-iq/deviations/${deviationId}/`);
}

export interface RaiseDeviationRequest {
  case_id: string;
  deviation_type: 'mapping_business' | 'mapping_credit' | 'tagging' | 'other';
  proposed_mapping?: {
    proposed_rm?: string;
    proposed_bm?: string;
    proposed_co?: string;
    proposed_bcm?: string;
  };
  reason: string;
  supporting_docs?: string[];
}

export async function raiseDeviation(
  data: RaiseDeviationRequest
): Promise<ApiResponse<Deviation>> {
  return apiRequest<Deviation>('/api/incentive-iq/deviations/raise_deviation/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface ApproveRejectDeviationRequest {
  action: 'approve' | 'reject';
  rejection_reason?: string;
}

export async function approveRejectDeviation(
  deviationId: string,
  data: ApproveRejectDeviationRequest
): Promise<ApiResponse<Deviation>> {
  return apiRequest<Deviation>(`/api/incentive-iq/deviations/${deviationId}/approve_reject/`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getDeviationInboxSummary(): Promise<ApiResponse<DeviationInboxSummary>> {
  return apiRequest<DeviationInboxSummary>('/api/incentive-iq/deviations/inbox_summary/');
}

// ============== Docket APIs ==============

export interface ListDocketsParams {
  search?: string;
  application_id?: string;
  customer_name?: string;
  branch_name?: string;
  state?: string;
  upload_batch_id?: string;
  page?: number;
  page_size?: number;
}

export async function listDockets(
  params?: ListDocketsParams
): Promise<ApiResponse<DocketListResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const queryString = queryParams.toString();
  return apiRequest<DocketListResponse>(`/api/incentive-iq/dockets/${queryString ? `?${queryString}` : ''}`);
}

export async function uploadDocket(
  file: File
): Promise<ApiResponse<DocketUploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.mysaarathi.in';
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/incentive-iq/dockets/upload/`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ============== Incentive Record APIs ==============

export interface MyIncentivesParams {
  period?: string; // Format: YYYY_MM
  is_final?: boolean;
}

export async function getMyIncentives(
  params?: MyIncentivesParams
): Promise<ApiResponse<MyIncentive>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.period) queryParams.append('period', params.period);
    if (params.is_final !== undefined) queryParams.append('is_final', params.is_final.toString());
  }

  const queryString = queryParams.toString();
  return apiRequest<MyIncentive>(`/api/incentive-iq/incentives/my-incentives/${queryString ? `?${queryString}` : ''}`);
}

export interface BranchIncentivesParams {
  period?: string;
  branch?: string;
  role_filter?: 'RM' | 'CO';
  view_mode?: 'summary' | 'detail';
}

export async function getBranchIncentives(
  params?: BranchIncentivesParams
): Promise<ApiResponse<BranchIncentive>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const queryString = queryParams.toString();
  return apiRequest<BranchIncentive>(`/api/incentive-iq/incentives/branch-incentives/${queryString ? `?${queryString}` : ''}`);
}

export interface AggregatedIncentivesParams {
  period: string; // Required
  aggregation_level: 'branch' | 'state' | 'national'; // Required
  state_code?: string;
  role_filter?: 'RM' | 'BM' | 'CO' | 'BCM';
  branch_filter?: string;
  employee_filter?: string;
}

export async function getAggregatedIncentives(
  params: AggregatedIncentivesParams
): Promise<ApiResponse<AggregatedIncentive>> {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  return apiRequest<AggregatedIncentive>(`/api/incentive-iq/incentives/aggregated-incentives/?${queryParams.toString()}`);
}

export interface EligibleCasesParams {
  period?: string;
  branch?: string;
  rm?: string;
  search?: string;
}

export async function getEligibleCases(
  params?: EligibleCasesParams
): Promise<ApiResponse<EligibleCasesResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const queryString = queryParams.toString();
  return apiRequest<EligibleCasesResponse>(`/api/incentive-iq/incentives/eligible-cases/${queryString ? `?${queryString}` : ''}`);
}

// ============== Salary Management APIs ==============

export interface Salary {
  employee_code: string;
  employee_name: string;
  monthly_salary: number;
  uploaded_at: string;
  uploaded_by: string;
  uploaded_by_name?: string;
}

export interface SalaryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Salary[];
}

export interface SalaryUploadResponse {
  total_rows: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export interface ListSalariesParams {
  search?: string;
  employee_code?: string;
  employee_name?: string;
  page?: number;
  page_size?: number;
}

export async function listSalaries(
  params?: ListSalariesParams
): Promise<ApiResponse<SalaryListResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params) {
    if (params.search) queryParams.append('search', params.search);
    if (params.employee_code) queryParams.append('employee_code', params.employee_code);
    if (params.employee_name) queryParams.append('employee_name', params.employee_name);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.page_size) queryParams.append('page_size', params.page_size.toString());
  }

  const queryString = queryParams.toString();
  return apiRequest<SalaryListResponse>(`/api/incentive-iq/salary/${queryString ? `?${queryString}` : ''}`);
}

export async function uploadSalary(
  file: File
): Promise<ApiResponse<SalaryUploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('id_token') : null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://staging-api.mysaarathi.in';
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/incentive-iq/salary/upload/`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

