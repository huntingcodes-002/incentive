# Incentive IQ - Complete Project Overview

## 🎯 Project Purpose

**Incentive IQ** is a comprehensive **Incentive Management System** for a financial services company (Saarathi Finance). The system manages, calculates, and tracks incentive payments for employees across different roles in the loan origination and credit processing hierarchy.

### Core Business Problem
- Track loan applications and their sourcing hierarchy (RM, BM, CO, BCM)
- Calculate monthly incentives based on performance metrics (logins, disbursals, volumes)
- Handle deviations when employee assignments change
- Manage hold cases through docket uploads
- Provide role-based dashboards for different hierarchy levels

---

## 🏗️ System Architecture

### **Technology Stack**

#### Frontend
- **Framework**: Next.js 14.2.5 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **State Management**: React Context API
- **Authentication**: JWT tokens stored in localStorage

#### Backend
- **Framework**: Django REST Framework
- **Database**: PostgreSQL (implied from Django models)
- **Authentication**: Keycloak integration (JWT-based)
- **File Processing**: Pandas (CSV/Excel parsing)
- **Encryption**: AES-256-CBC (for salary data)

---

## 📊 Data Models & Database Structure

### **Core Models**

#### 1. **IncentiveApplication**
- **Purpose**: Stores loan applications with sourcing hierarchy
- **Key Fields**:
  - `application_number` (PK)
  - `customer_name`, `requested_loan_amount`
  - `sourcing_rm`, `sourcing_bm`, `sourcing_co`, `sourcing_bcm` (FKs to Employee)
  - `incentive_status`: pending, eligible, under_deviation, hold, approved, rejected
  - `application_status`: Disbursed, Under Process, etc.
  - `branch_name`, `state_name`, `product_type`

#### 2. **IncentiveRecord**
- **Purpose**: Stores calculated monthly incentives for employees
- **Key Fields**:
  - `employee` (FK), `role` (RM/BM/CO/BCM)
  - `incentive_period` (YYYY_MM format)
  - Performance metrics: `secured_logins`, `unsecured_logins`, `secured_volume`, etc.
  - Incentive breakdown: `volume_incentive`, `effort_incentive`, `total_incentive`
  - `performance_tier`: BRONZE, SILVER, GOLD, PLATINUM
  - Role-specific JSON fields: `rm_details`, `bm_details`, `co_details`, `bcm_details`
  - `is_final`: Boolean flag for draft vs final incentives

#### 3. **IncentiveDeviation**
- **Purpose**: Tracks deviation requests for correcting employee assignments
- **Key Fields**:
  - `deviation_id` (PK)
  - `case` (FK to IncentiveApplication)
  - `deviation_type`: mapping_business, mapping_credit, tagging, other
  - `raised_by` (FK to Employee - State Head)
  - `assigned_approver` (FK to Employee - National Head)
  - `status`: pending, approved, rejected
  - `reason`, `supporting_docs` (JSON array)

#### 4. **DeviationMapping**
- **Purpose**: Stores old vs proposed employee assignments
- **Key Fields**:
  - `deviation` (FK), `application` (FK)
  - Current: `sourcing_rm`, `sourcing_bm`, `sourcing_co`, `sourcing_bcm`
  - Proposed: `proposed_rm`, `proposed_bm`, `proposed_co`, `proposed_bcm`

#### 5. **IncentiveDocketUpload**
- **Purpose**: Stores docket data uploaded by Operations team for hold cases
- **Key Fields**:
  - `upload_id` (PK)
  - `application` (FK - required, links to IncentiveApplication)
  - Docket-specific: `disbursal_date`, `month`, `days`, `ageing`, `loan_account_no`, `docket_final_remarks`
  - `upload_batch_id`: Groups records from same upload
  - `uploaded_by` (FK to Employee)

#### 6. **IncentiveEmployeeSalary**
- **Purpose**: Stores encrypted employee salary data
- **Key Fields**:
  - `employee` (OneToOne FK)
  - `encrypted_salary` (AES-256-CBC encrypted, base64-encoded)
  - `name`, `joining_date`
  - `uploaded_by` (FK to Employee)

#### 7. **IncentiveApplicationLink**
- **Purpose**: Links incentive records to contributing applications
- **Key Fields**:
  - `incentive_record` (FK)
  - `application` (FK)
  - `application_type`: LOGIN or DISBURSAL

#### 8. **NucleusApplications** & **NucleusDisbursedApplications**
- **Purpose**: Store raw data imported from Nucleus database
- **Usage**: Source data for incentive calculations

---

## 👥 User Roles & Hierarchy

### **Sales Hierarchy** (Business)
1. **RM** (Relationship Manager) - Level 1
   - Views own applications
   - Gets incentives for own logins/disbursals
   - Permission: `view_own_incentive_list`

2. **BM** (Branch Manager) - Level 2
   - Views branch-level applications
   - Sees team members (RMs) and their incentives
   - Permission: `view_branch_incentive_list`

3. **AH Business** (Area Head - Business) - Level 3
   - Views area-level data
   - Permission: `view_state_incentive_list` (area = subset of state)

4. **SH Business** (State Head - Business) - Level 4
   - Views state-level applications
   - Can raise deviations for RM/BM mapping corrections
   - Permission: `view_state_incentive_list`, `incentive_raise_deviation`

5. **NBH** (National Business Head) - Level 5
   - Views all India data
   - Approves/rejects deviations raised by SH Business
   - Permission: `view_all_india_incentive_list`, `incentive_approve_deviation`

### **Credit Hierarchy**
1. **CSO/CO** (Credit and Service Officer) - Level 1
   - Views own applications
   - Permission: `view_own_incentive_list`

2. **BCM** (Branch Credit Manager) - Level 2
   - Views branch-level data
   - Sees team members (COs) and their incentives
   - Permission: `view_branch_incentive_list`

3. **AH Credit** (Area Head - Credit) - Level 3
   - Views area-level data
   - Permission: `view_state_incentive_list`

4. **SH Credit** (State Head - Credit) - Level 4
   - Views state-level data
   - Can raise deviations for BCM/CO mapping corrections
   - Permission: `view_state_incentive_list`, `incentive_raise_deviation`

5. **NCH** (National Credit Head / Chief Credit Officer) - Level 5
   - Views all India data
   - Approves/rejects deviations raised by SH Credit
   - Permission: `view_all_india_incentive_list`, `incentive_approve_deviation`

### **Operations**
- **Central Ops** / **Admin**
  - Upload docket files (hold cases)
  - View all docket cases
  - Permission: `upload_dockets`

### **HR**
- **Assistant Manager - HR**
  - Upload salary CSV files
  - View salary records
  - Permission: `upload_salaries`, `view_salaries`

---

## 🔐 Permission System

### **Permission Constants**
```python
PERM_VIEW_OWN = "employee.view_own_incentive_list"
PERM_VIEW_BRANCH = "employee.view_branch_incentive_list"
PERM_VIEW_STATE = "employee.view_state_incentive_list"
PERM_VIEW_ALL_INDIA = "employee.view_all_india_incentive_list"
PERM_RAISE_DEVIATION = "employee.incentive_raise_deviation"
PERM_APPROVE_DEVIATION = "employee.incentive_approve_deviation"
PERM_VIEW_DEVIATIONS = "employee.incentive_view_deviations"
PERM_UPLOAD_SALARIES = "employee.upload_salaries"
PERM_VIEW_SALARIES = "employee.view_salaries"
PERM_UPLOAD_DOCKETS = "employee.upload_dockets"
```

### **Permission-Based Filtering**
- **View Own**: Filters by `employee = current_user.employee`
- **View Branch**: Filters by `branch = current_user.employee.branch`
- **View State**: Filters by `state = current_user.employee.state`
- **View All India**: No filtering (sees everything)
- **Multiple Permissions**: Additive (union) - user sees data from all their permissions

---

## 🔄 Data Flow & Business Logic

### **1. Application Import Flow**
```
Nucleus Database → Import Scripts → NucleusApplications / NucleusDisbursedApplications
                                 ↓
                    IncentiveApplication (with sourcing hierarchy)
```

### **2. Incentive Calculation Flow**
```
IncentiveApplication (eligible cases)
         +
Employee Salary Data (encrypted)
         +
Business Rules (scripts/risk_scripts/)
         ↓
IncentiveRecord (calculated incentives)
         +
IncentiveApplicationLink (which apps contributed)
```

### **3. Deviation Workflow**
```
1. SH Business/Credit identifies incorrect mapping
2. Raises deviation via POST /deviations/raise_deviation/
   - Creates IncentiveDeviation (status: pending)
   - Creates DeviationMapping (old vs proposed)
   - Sets application.incentive_status = 'under_deviation'
3. NBH/NCH reviews in Deviation Inbox
4. Approves/Rejects via PUT /deviations/{id}/approve_reject/
   - If approved: Updates application sourcing hierarchy from proposed_mapping
   - Sets application.incentive_status = 'eligible'
   - Sets deviation.status = 'approved'
```

### **4. Hold Case Workflow**
```
1. Central Ops uploads docket CSV via POST /dockets/upload/
2. System:
   - Parses CSV (pandas)
   - Links to IncentiveApplication (by application_number)
   - Creates IncentiveDocketUpload records
   - Groups by upload_batch_id
   - Sets application.incentive_status = 'hold'
3. Applications on hold are excluded from incentive calculations
```

### **5. Salary Upload Flow**
```
1. HR uploads salary CSV via POST /salary/upload/
2. System:
   - Parses CSV (Employee Code, Employee Name, Monthly_salary)
   - Encrypts salary using AES-256-CBC
   - Creates/updates IncentiveEmployeeSalary records
   - Returns: total_rows, created, updated, errors, error_details, skipped_employees
```

---

## 📡 API Endpoints Summary

### **Applications** (`/api/incentive-iq/applications/`)
- `GET /applications/` - List applications (month/year required)
- `GET /applications/{application_number}/` - Get application details
- `GET /applications/summary/` - Application summary statistics
- `GET /summary/` - General summary

**Permissions**: `view_own`, `view_branch`, `view_state`, `view_all_india`

### **Deviations** (`/api/incentive-iq/deviations/`)
- `GET /deviations/` - List deviations (no query params by default)
- `GET /deviations/{deviation_id}/` - Get deviation details
- `POST /deviations/raise_deviation/` - Raise deviation (SH only)
- `PUT /deviations/{deviation_id}/approve_reject/` - Approve/reject (NBH/NCH only)
- `GET /deviations/inbox_summary/` - Inbox summary (NBH/NCH only)

**Permissions**: `view_deviations`, `raise_deviation`, `approve_deviation`

### **Dockets** (`/api/incentive-iq/dockets/`)
- `GET /dockets/` - List docket uploads
- `POST /dockets/upload/` - Upload docket CSV/Excel

**Permissions**: `upload_dockets`

### **Salaries** (`/api/incentive-iq/salary/`)
- `GET /salary/` - List salaries
- `POST /salary/upload/` - Upload salary CSV

**Permissions**: `view_salaries`, `upload_salaries`

### **Incentive Records** (`/api/incentive-iq/incentives/`)
- `GET /incentives/my-incentives/` - Own incentives (RM/CO/BM/BCM)
- `GET /incentives/branch-incentives/` - Branch incentives + team (BM/BCM)
- `GET /incentives/aggregated-incentives/` - Aggregated data (Heads)
- `GET /incentives/eligible-cases/` - Eligible cases for period

**Permissions**: Based on view permissions

---

## 🎨 Frontend Features by Role

### **RM (Relationship Manager)**
- **Eligible Cases**: Own applications via `/applications/?sourcing_rm={code}`
- **Final Incentive**: Own incentive breakdown via `/incentives/my-incentives/`
- **Considered Applications**: Login and disbursal applications that contributed

### **BM (Branch Manager)**
- **Eligible Cases**: Branch-level applications
- **Final Incentive**: Branch incentives via `/incentives/branch-incentives/`
  - Own incentive summary
  - Team members table (RMs) with their incentives
  - Team summary cards

### **SH Business / SH Credit**
- **Eligible Cases**: State-level applications
- **Raise Deviation**: Form to submit mapping corrections
  - Auto-sets `deviation_type` (mapping_business / mapping_credit)
  - Proposes new RM/BM/BCM/CO assignments

### **NBH / NCH**
- **Deviation Inbox**: 
  - Summary cards (pending/approved/rejected counts)
  - Deviations table with filters (status, deviation_type, search)
  - Approve/reject functionality
- **Eligible Cases**: All India view

### **Central Ops / Admin**
- **View Cases** (default view): Docket case viewer
  - Search, filters (state, branch, batch ID)
  - Sidebar panel for case details
- **Hold Case Upload**: CSV upload with upload history

### **HR**
- **Upload Salary**: CSV upload with validation
- **View Salary**: Paginated salary list with search

---

## 🔧 Key Technical Features

### **Backend**
1. **Permission-Based Filtering**: Automatic data scoping based on user permissions
2. **Hierarchy Resolution**: Maps designations to roles and hierarchy levels
3. **Encryption**: AES-256-CBC for sensitive salary data
4. **Batch Processing**: CSV uploads with batch IDs for grouping
5. **Incentive Calculation**: Complex scripts calculate incentives based on:
   - Volume (secured/unsecured/direct)
   - Effort (logins + disbursals)
   - Performance tiers
   - Role-specific rules (vintage, TAT, etc.)

### **Frontend**
1. **Role-Based Routing**: PermissionRoute component enforces access
2. **Dynamic Period Selection**: Last 12 months dropdown, current month default
3. **Conditional API Calls**: Different endpoints based on role
4. **Data Transformation**: Maps API responses to UI component formats
5. **Mobile Responsive**: Separate mobile components for < 768px
6. **Toast Notifications**: User feedback for all actions
7. **Loading States**: Spinners during API calls
8. **Empty States**: Graceful handling of no data

---

## 📈 Incentive Calculation Logic

### **Incentive Components**
1. **Volume Incentive**:
   - Secured: 1.5% of secured volume
   - Secured Direct: 2% of secured direct volume
   - Unsecured: 2.5% of unsecured volume

2. **Effort Incentive**:
   - Secured: ₹500 per login + ₹500 per disbursal
   - Unsecured: ₹750 per login + ₹750 per disbursal

3. **Performance Tier**:
   - Based on total incentive amount
   - RM/CO: BRONZE (<₹15k), SILVER (₹15k-30k), GOLD (₹30k-50k), PLATINUM (≥₹50k)
   - BM/BCM: BRONZE (<₹30k), SILVER (₹30k-60k), GOLD (₹60k-100k), PLATINUM (≥₹100k)

### **Role-Specific Rules**
- **RM**: Vintage-based proration (0-3M, 4-6M, BAU)
- **BM**: Branch targets, docking for missed targets
- **CO**: TAT-based scoring (median TAT, applications in defined TAT)
- **BCM**: L2D/L2S TAT scoring, early delinquency tracking

---

## 🔄 Workflow Examples

### **Example 1: RM Views Their Incentives**
1. RM logs in → Redirected to `/bh/rm`
2. Selects "Final Incentive" → Calls `/incentives/my-incentives/?period=2025_01`
3. Backend:
   - Gets employee from JWT
   - Finds IncentiveRecord for employee + period + role=RM
   - Applies `view_own` permission filter
   - Returns incentive breakdown + contributing applications
4. Frontend displays:
   - Consideration summary (logins, disbursals, volumes)
   - Incentive breakdown (volume + effort)
   - Performance tier
   - Considered applications table

### **Example 2: SH Business Raises Deviation**
1. SH Business views "Eligible Cases" → Sees incorrect RM assignment
2. Clicks "Submit Deviation" → Opens RaiseDeviation form
3. Selects case, enters proposed RM, provides reason
4. Frontend calls `POST /deviations/raise_deviation/`:
   ```json
   {
     "case_id": "APPL000123",
     "deviation_type": "mapping_business",
     "proposed_mapping": {"proposed_rm": "SF011"},
     "reason": "Employee transfer"
   }
   ```
5. Backend:
   - Validates `raise_deviation` permission
   - Creates IncentiveDeviation (status: pending)
   - Creates DeviationMapping (old vs proposed)
   - Sets application.incentive_status = 'under_deviation'
   - Assigns to NBH (National Business Head)
6. Application now shows "Under Deviation" status

### **Example 3: NBH Approves Deviation**
1. NBH views "Deviation Inbox" → Sees pending deviations
2. Clicks "View" → Opens deviation details modal
3. Reviews old vs proposed mapping
4. Clicks "Approve" → Calls `PUT /deviations/{id}/approve_reject/`
5. Backend:
   - Validates `approve_deviation` permission
   - Checks deviation is assigned to current user
   - Updates application sourcing hierarchy from proposed_mapping
   - Sets application.incentive_status = 'eligible'
   - Sets deviation.status = 'approved', resolved_at = now
6. Application now has corrected RM assignment

### **Example 4: Central Ops Uploads Docket**
1. Central Ops views "Hold Case Upload"
2. Selects CSV file → Clicks "Validate Upload"
3. Frontend calls `POST /dockets/upload/` with FormData
4. Backend:
   - Parses CSV (pandas)
   - For each row:
     - Finds IncentiveApplication by application_number
     - Creates IncentiveDocketUpload record
     - Sets application.incentive_status = 'hold'
   - Groups by upload_batch_id
   - Returns: batch_id, total_rows, created, errors
5. Frontend displays upload results
6. Upload appears in "Upload History" table

---

## 🎯 Project Goals

1. **Transparency**: Employees can see which applications contributed to their incentives
2. **Accuracy**: Deviation system corrects employee assignments
3. **Efficiency**: Automated incentive calculations from database
4. **Compliance**: Hold cases tracked via docket uploads
5. **Security**: Salary data encrypted, role-based access control
6. **Scalability**: Permission-based filtering supports organizational growth

---

## 🔗 Integration Points

### **External Systems**
- **Nucleus Database**: Source of application and disbursal data
- **Keycloak**: Authentication and authorization (JWT tokens)
- **Employee System**: Employee master data, designations, hierarchy

### **Internal Systems**
- **Incentive Calculation Scripts**: Python scripts that calculate and store IncentiveRecords
- **Management Commands**: Django commands for data import and calculation

---

## 📝 Key Design Decisions

1. **Permission-Based Over Hierarchy-Based**: More flexible, supports multiple permissions per user
2. **Denormalized Fields**: `employee_code`, `employee_name`, `branch_name`, `state_name` stored in IncentiveRecord for faster queries
3. **JSON Fields for Role Details**: Flexible storage for role-specific calculation parameters
4. **Separate DeviationMapping Table**: Normalized structure for old vs proposed mappings
5. **Encrypted Salaries**: Sensitive data encrypted at rest
6. **Batch IDs for Uploads**: Groups related records for audit trail
7. **IncentiveApplicationLink**: Many-to-many relationship between incentives and applications (avoids data redundancy)

---

## 🚀 Future Enhancements (Potential)

1. **Real-time Calculations**: WebSocket updates for incentive calculations
2. **Advanced Analytics**: Charts and graphs for performance trends
3. **Bulk Operations**: Bulk approve/reject deviations
4. **Export Functionality**: PDF/Excel exports for reports
5. **Notification System**: Email/SMS alerts for deviation status changes
6. **Audit Trail**: Detailed logging of all changes
7. **Multi-period Comparison**: Compare incentives across months

---

This system provides a complete end-to-end solution for managing employee incentives in a financial services organization, with robust permission-based access control, deviation management, and comprehensive data tracking.

