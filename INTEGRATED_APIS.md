# Integrated APIs in Next.js Frontend

This document lists all APIs that have been integrated into the `next-incentive-api` frontend application.

## Authentication APIs

All authentication APIs are located in `src/lib/auth.ts` and used in `src/contexts/AuthContext.tsx` and `src/app/login/page.tsx`.

### 1. **POST /api/token/login-pravesh/**
   - **Function**: `login(credentials: LoginCredentials)`
   - **Purpose**: Login with username and password, returns verification code for OTP
   - **Status**: ✅ Integrated
   - **Used in**: `AuthContext.tsx`, `login/page.tsx`

### 2. **POST /api/token/verify-otp/**
   - **Function**: `verifyOTP(request: VerifyOTPRequest)`
   - **Purpose**: Verify OTP and get JWT tokens
   - **Status**: ✅ Integrated
   - **Used in**: `AuthContext.tsx`, `login/page.tsx`

### 3. **POST /api/token/resend-otp/**
   - **Function**: `resendOTP(request: ResendOTPRequest)`
   - **Purpose**: Resend OTP to user
   - **Status**: ✅ Integrated
   - **Used in**: `AuthContext.tsx`, `login/page.tsx`

### 4. **POST /api/token/refresh-token/**
   - **Function**: `refreshToken(refreshToken: string)`
   - **Purpose**: Refresh access token using refresh token
   - **Status**: ✅ Integrated
   - **Used in**: `AuthContext.tsx` (auto-refresh on token expiration)

### 5. **GET /api/token/user-profile/**
   - **Function**: `getUserProfile()`
   - **Purpose**: Get authenticated user's profile information
   - **Status**: ✅ Integrated
   - **Used in**: `AuthContext.tsx` (on mount and after token refresh)

### 6. **GET /api/token/logout/**
   - **Function**: `logout()`
   - **Purpose**: Logout user and clear session
   - **Status**: ✅ Integrated
   - **Used in**: `AuthContext.tsx`, `Header.tsx`

---

## Application APIs

All application APIs are located in `src/lib/incentive-api.ts`.

### 7. **GET /api/incentive-iq/applications/**
   - **Function**: `listApplications(params: ListApplicationsParams)`
   - **Purpose**: List applications with filters (month, year, status, etc.)
   - **Status**: ✅ Integrated
   - **Used in**: 
     - `EligibleCases.tsx` (for RM role)
     - `FinalCases.tsx` (for RM role in "Considered Applications" section)
   - **Permissions**: `employee.view_own_incentive_list`, `employee.view_branch_incentive_list`

### 8. **GET /api/incentive-iq/applications/{application_number}/**
   - **Function**: `getApplication(applicationNumber: string)`
   - **Purpose**: Get application details by application number
   - **Status**: ✅ Integrated
   - **Used in**: `RaiseDeviation.tsx` (to fetch case details when raising deviation)

### 9. **GET /api/incentive-iq/applications/summary/**
   - **Function**: `getApplicationSummary(month: number, year: number, filters?)`
   - **Purpose**: Get application summary statistics
   - **Status**: ⚠️ Defined but not yet used in components

### 10. **GET /api/incentive-iq/summary/**
   - **Function**: `getGeneralSummary(month: number, year: number, filters?)`
   - **Purpose**: Get general summary statistics
   - **Status**: ⚠️ Defined but not yet used in components

---

## Deviation APIs

### 11. **GET /api/incentive-iq/deviations/**
   - **Function**: `listDeviations(params?: ListDeviationsParams)`
   - **Purpose**: List deviations with filters (status, type, search, pagination)
   - **Status**: ⚠️ Defined but not yet used in components
   - **Permissions**: `employee.incentive_view_deviations`

### 12. **GET /api/incentive-iq/deviations/{deviation_id}/**
   - **Function**: `getDeviation(deviationId: string)`
   - **Purpose**: Get deviation details by ID
   - **Status**: ⚠️ Defined but not yet used in components

### 13. **POST /api/incentive-iq/deviations/raise_deviation/**
   - **Function**: `raiseDeviation(data: RaiseDeviationRequest)`
   - **Purpose**: Raise a new deviation (only SH role)
   - **Status**: ✅ Integrated
   - **Used in**: `RaiseDeviation.tsx`
   - **Permissions**: `employee.incentive_raise_deviation`

### 14. **PUT /api/incentive-iq/deviations/{deviation_id}/approve_reject/**
   - **Function**: `approveRejectDeviation(deviationId: string, data: ApproveRejectDeviationRequest)`
   - **Purpose**: Approve or reject a deviation
   - **Status**: ⚠️ Defined but not yet used in components
   - **Permissions**: `employee.incentive_approve_deviation`

### 15. **GET /api/incentive-iq/deviations/inbox_summary/**
   - **Function**: `getDeviationInboxSummary()`
   - **Purpose**: Get deviation inbox summary for approvers
   - **Status**: ⚠️ Defined but not yet used in components
   - **Permissions**: `employee.incentive_approve_deviation`

---

## Docket APIs (Ops)

### 16. **GET /api/incentive-iq/dockets/**
   - **Function**: `listDockets(params?: ListDocketsParams)`
   - **Purpose**: List docket uploads with filters
   - **Status**: ✅ Integrated
   - **Used in**: `HoldCaseUpload.tsx` (to display recent uploads)
   - **Permissions**: `employee.upload_dockets`

### 17. **POST /api/incentive-iq/dockets/upload/**
   - **Function**: `uploadDocket(file: File)`
   - **Purpose**: Upload docket file (CSV/Excel)
   - **Status**: ✅ Integrated
   - **Used in**: `HoldCaseUpload.tsx`
   - **Permissions**: `employee.upload_dockets`

---

## Incentive Record APIs

### 18. **GET /api/incentive-iq/incentives/my-incentives/**
   - **Function**: `getMyIncentives(params?: MyIncentivesParams)`
   - **Purpose**: Get logged-in user's incentive details (RM/CO/BM/BCM)
   - **Status**: ✅ Integrated
   - **Used in**: `FinalCases.tsx` (for "Total Incentive Breakdown" section)
   - **Permissions**: `employee.view_own_incentive_list`
   - **Query Parameters**: 
     - `period` (optional) - Format: YYYY_MM
     - `is_final` (optional) - Boolean, defaults to true

### 19. **GET /api/incentive-iq/incentives/branch-incentives/**
   - **Function**: `getBranchIncentives(params?: BranchIncentivesParams)`
   - **Purpose**: Get branch-level incentives (BM/BCM)
   - **Status**: ⚠️ Defined but not yet used in components
   - **Permissions**: `employee.view_branch_incentive_list`

### 20. **GET /api/incentive-iq/incentives/aggregated-incentives/**
   - **Function**: `getAggregatedIncentives(params?: AggregatedIncentivesParams)`
   - **Purpose**: Get aggregated incentives for heads (NBH, NCH, SH, AH)
   - **Status**: ⚠️ Defined but not yet used in components
   - **Permissions**: `employee.view_state_incentive_list`, `employee.view_branch_incentive_list`, `employee.view_all_india_incentive_list`

### 21. **GET /api/incentive-iq/incentives/eligible-cases/**
   - **Function**: `getEligibleCases(params?: EligibleCasesParams)`
   - **Purpose**: Get eligible cases for a specific period
   - **Status**: ✅ Integrated
   - **Used in**: `EligibleCases.tsx` (for non-RM roles)
   - **Permissions**: `employee.view_own_incentive_list`, `employee.view_state_incentive_list`, `employee.view_branch_incentive_list`, `employee.view_all_india_incentive_list`
   - **Query Parameters**: 
     - `period` (required) - Format: YYYY_MM

---

## Summary

### ✅ Fully Integrated (11 APIs)
1. POST /api/token/login-pravesh/
2. POST /api/token/verify-otp/
3. POST /api/token/resend-otp/
4. POST /api/token/refresh-token/
5. GET /api/token/user-profile/
6. GET /api/token/logout/
7. GET /api/incentive-iq/applications/
8. GET /api/incentive-iq/applications/{application_number}/
9. POST /api/incentive-iq/deviations/raise_deviation/
10. GET /api/incentive-iq/dockets/
11. POST /api/incentive-iq/dockets/upload/
12. GET /api/incentive-iq/incentives/my-incentives/
13. GET /api/incentive-iq/incentives/eligible-cases/

### ⚠️ Defined but Not Yet Used (8 APIs)
1. GET /api/incentive-iq/applications/summary/
2. GET /api/incentive-iq/summary/
3. GET /api/incentive-iq/deviations/
4. GET /api/incentive-iq/deviations/{deviation_id}/
5. PUT /api/incentive-iq/deviations/{deviation_id}/approve_reject/
6. GET /api/incentive-iq/deviations/inbox_summary/
7. GET /api/incentive-iq/incentives/branch-incentives/
8. GET /api/incentive-iq/incentives/aggregated-incentives/

---

## Integration Status by Component

### EligibleCases.tsx
- ✅ `getEligibleCases()` - For non-RM roles
- ✅ `listApplications()` - For RM role

### FinalCases.tsx
- ✅ `getMyIncentives()` - For RM/CO/BM/BCM roles (Total Incentive Breakdown)
- ✅ `listApplications()` - For RM role (Considered Applications table)

### RaiseDeviation.tsx
- ✅ `getApplication()` - Fetch case details
- ✅ `raiseDeviation()` - Submit deviation request

### HoldCaseUpload.tsx
- ✅ `listDockets()` - Display recent uploads
- ✅ `uploadDocket()` - Upload docket file

### AuthContext.tsx
- ✅ `login()` - User login
- ✅ `verifyOTP()` - OTP verification
- ✅ `refreshToken()` - Token refresh
- ✅ `getUserProfile()` - Get user profile
- ✅ `logout()` - User logout

### login/page.tsx
- ✅ `login()` - Login form submission
- ✅ `verifyOTP()` - OTP verification
- ✅ `resendOTP()` - Resend OTP

---

## Notes

- All API functions are defined in `src/lib/incentive-api.ts` and `src/lib/auth.ts`
- All API requests use JWT authentication via `apiRequest()` helper
- Token management is handled automatically in `AuthContext.tsx`
- Error handling and loading states are implemented in components
- Permission-based access control is enforced at the route level using `PermissionRoute` component

