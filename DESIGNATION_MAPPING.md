# Designation to Role Mapping

This document describes how backend user profile `designation` fields are mapped to frontend role codes used throughout the UI.

## Backend Response Format

The user profile API (`GET /api/token/user-profile/`) returns:

```json
{
  "success": true,
  "data": {
    "id": "8b118c92-9ba1-40c8-9a80-68a48fd0da8f",
    "username": "sf0499_rm_1@saarathifinance.com",
    "email": "sf0499_rm_1@saarathifinance.com",
    "first_name": "IAM03",
    "last_name": "TEST",
    "designation": "Relationship Manager",
    "employee_code": "SF0499",
    "permissions": [...]
  }
}
```

## Designation Mapping

The `getUserRole()` function in `src/lib/permissions.ts` maps backend designations to frontend role codes:

| Backend Designation | Frontend Role Code | Route Path | Description |
|---------------------|-------------------|------------|-------------|
| `Relationship Manager` | `RM` | `/bh/rm` | Relationship Manager |
| `Branch Manager` | `BM` | `/bh/bm` | Branch Manager |
| `Branch Credit Manager` | `BCM` | `/ch/bcm` | Branch Credit Manager |
| `Credit Officer` | `CSO` | `/ch/cso` | Credit Officer |
| `Credit and Service Officer` | `CSO` | `/ch/cso` | Credit and Service Officer |
| `Area Head Business` | `AH Business` | `/bh/ah-business` | Area Head - Business |
| `Area Head Credit` | `AH Credit` | `/ch/ah-credit` | Area Head - Credit |
| `State Head Business` | `SH Business` | `/bh/sh-business` | State Head - Business |
| `State Head Credit` | `SH Credit` | `/ch/sh-credit` | State Head - Credit |
| `National Business Head` | `NBH` | `/bh/nbh` | National Business Head |
| `National Credit Head` | `NCH` | `/ch/nch` | National Credit Head |
| `Admin` / `Administrator` | `Admin` | `/ops/admin` | Administrator |
| `Central Ops` / `Central Operations` | `Central Ops` | `/ops/central-ops` | Central Operations |

## Mapping Logic

The mapping function:
1. **First checks** `user.role` if directly provided
2. **Then checks** `user.designation` (primary field from backend)
3. **Falls back to** `user.designation_name` (alternative field)
4. **Finally uses** permissions-based inference if designation is not found

### Case-Insensitive Matching

All designation matching is case-insensitive. Examples:
- `"Relationship Manager"` → `RM`
- `"relationship manager"` → `RM`
- `"RELATIONSHIP MANAGER"` → `RM`
- `"RM"` → `RM`

### Partial Matching

The function uses partial matching for flexibility:
- `"Area Head Business"` → `AH Business`
- `"Area Head - Business"` → `AH Business`
- `"AH Business"` → `AH Business`

## UI Behavior Based on Role

### Role-Based Features

| Role | Eligible Cases | Raise Deviation | Deviation Approval | Hold Upload | Final Incentive |
|------|---------------|-----------------|-------------------|-------------|-----------------|
| `RM` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `BM` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `BCM` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `CSO` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `AH Business` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `AH Credit` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `SH Business` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `SH Credit` | ✅ | ✅ | ❌ | ❌ | ✅ |
| `NBH` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `NCH` | ✅ | ❌ | ✅ | ❌ | ✅ |
| `Admin` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `Central Ops` | ❌ | ❌ | ❌ | ✅ | ❌ |

### API Access Based on Role

| Role | Applications API | My Incentives | Eligible Cases | Branch Incentives | Aggregated Incentives |
|------|-----------------|---------------|----------------|-------------------|----------------------|
| `RM` | ✅ (own) | ✅ | ✅ | ❌ | ❌ |
| `BM` | ✅ (branch) | ✅ | ✅ | ✅ | ❌ |
| `BCM` | ✅ (branch) | ✅ | ✅ | ✅ | ❌ |
| `CSO` | ✅ (branch) | ❌ | ✅ | ❌ | ❌ |
| `AH Business` | ✅ (state) | ❌ | ✅ | ❌ | ✅ |
| `AH Credit` | ✅ (state) | ❌ | ✅ | ❌ | ✅ |
| `SH Business` | ✅ (state) | ❌ | ✅ | ❌ | ✅ |
| `SH Credit` | ✅ (state) | ❌ | ✅ | ❌ | ✅ |
| `NBH` | ✅ (all) | ❌ | ✅ | ❌ | ✅ |
| `NCH` | ✅ (all) | ❌ | ✅ | ❌ | ✅ |

## Implementation Details

### Where Role is Determined

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Fetches user profile after login
   - Stores user object with `designation` field
   - User object is available via `useAuth()` hook

2. **RolePage** (`src/components/RolePage.tsx`)
   - Uses `getUserRole(user)` to determine actual role
   - Passes role to child components (EligibleCases, FinalCases, etc.)
   - Role determines which UI sections are visible

3. **PermissionRoute** (`src/components/PermissionRoute.tsx`)
   - Uses `getUserRole(user)` for route protection
   - Redirects unauthorized users to their default route

4. **Sidebar** (`src/components/Sidebar.tsx`)
   - Uses role to filter visible menu items
   - Only shows menu items user has access to

### Example Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { getUserRole } from '@/lib/permissions';

function MyComponent() {
  const { user } = useAuth();
  const userRole = getUserRole(user); // Returns 'RM', 'BM', etc.
  
  // Use role to conditionally render UI
  if (userRole === 'RM') {
    // Show RM-specific UI
  }
}
```

## Testing Designation Mapping

To test if a designation maps correctly:

```typescript
import { getUserRole } from '@/lib/permissions';

const testUser = {
  designation: "Relationship Manager"
};

const role = getUserRole(testUser);
console.log(role); // Should output: "RM"
```

## Notes

- The mapping is **case-insensitive** and uses **partial matching**
- If designation is not found, the function falls back to **permission-based inference**
- The `designation` field from backend takes **priority** over any hardcoded role props
- All UI components should use `getUserRole(user)` instead of hardcoded role values

