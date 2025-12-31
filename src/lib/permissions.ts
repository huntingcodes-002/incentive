/**
 * Permission and role utilities
 * Maps user permissions to roles and determines what UI elements to show
 */

export interface UserPermissions {
  view_own?: boolean;
  view_branch?: boolean;
  view_state?: boolean;
  view_all_india?: boolean;
  raise_deviation?: boolean;
  approve_deviation?: boolean;
  view_deviations?: boolean;
  upload_salaries?: boolean;
  view_salaries?: boolean;
  upload_dockets?: boolean;
}

/**
 * Determine user role from permissions or designation
 * 
 * Priority:
 * 1. user.role (if directly provided)
 * 2. user.designation (from backend user profile API response)
 * 3. user.designation_name (alternative field name)
 * 4. Permissions-based fallback
 * 
 * Backend returns designation field in user profile:
 * {
 *   "designation": "Relationship Manager"  // Maps to 'RM'
 *   "designation": "Branch Manager"        // Maps to 'BM'
 *   // etc.
 * }
 */
export function getUserRole(user: any): string {
  if (!user) return 'Unknown';

  // Check if role is directly provided (highest priority)
  if (user.role) {
    return user.role;
  }

  // Check designation - prioritize designation field from backend
  // Backend API returns: { "designation": "Relationship Manager" }
  const designation = user.designation || user.designation_name || '';
  const designationLower = designation.toLowerCase().trim();

  // Comprehensive mapping of backend designations to frontend roles
  // Map designations to roles (case-insensitive matching)
  
  // Relationship Manager / RM
  if (designationLower === 'relationship manager' || 
      designationLower.includes('relationship manager') || 
      designationLower === 'rm' ||
      designationLower.startsWith('rm ')) {
    return 'RM';
  }
  
  // Branch Manager / BM
  if (designationLower === 'branch manager' || 
      designationLower.includes('branch manager') || 
      designationLower === 'bm' ||
      designationLower.startsWith('bm ')) {
    return 'BM';
  }
  
  // Branch Credit Manager / BCM
  if (designationLower === 'branch credit manager' || 
      designationLower.includes('branch credit manager') || 
      designationLower === 'bcm' ||
      designationLower.startsWith('bcm ')) {
    return 'BCM';
  }
  
  // Credit Officer / CSO / Credit and Service Officer
  if (designationLower === 'credit officer' || 
      designationLower.includes('credit officer') || 
      designationLower === 'cso' ||
      designationLower.startsWith('cso ') ||
      designationLower === 'credit and service officer' ||
      designationLower.includes('credit and service officer')) {
    return 'CSO';
  }
  
  // Area Head - Business
  if ((designationLower.includes('area head') || designationLower.includes('ah')) && 
      (designationLower.includes('business') || designationLower.includes('bh'))) {
    return 'AH Business';
  }
  
  // Area Head - Credit
  if ((designationLower.includes('area head') || designationLower.includes('ah')) && 
      (designationLower.includes('credit') || designationLower.includes('ch'))) {
    return 'AH Credit';
  }
  
  // State Head - Business
  if ((designationLower.includes('state head') || designationLower.includes('sh')) && 
      (designationLower.includes('business') || designationLower.includes('bh'))) {
    return 'SH Business';
  }
  
  // State Head - Credit
  if ((designationLower.includes('state head') || designationLower.includes('sh')) && 
      (designationLower.includes('credit') || designationLower.includes('ch'))) {
    return 'SH Credit';
  }
  
  // National Business Head / NBH
  if (designationLower === 'national business head' || 
      designationLower.includes('national business head') || 
      designationLower === 'nbh' ||
      designationLower.startsWith('nbh ')) {
    return 'NBH';
  }
  
  // National Credit Head / NCH / Chief Credit Officer
  if (designationLower === 'national credit head' || 
      designationLower.includes('national credit head') || 
      designationLower === 'nch' ||
      designationLower.startsWith('nch ') ||
      designationLower.includes('chief credit officer')) {
    return 'NCH';
  }
  
  // Admin / Administrator
  if (designationLower === 'admin' || 
      designationLower === 'administrator' ||
      designationLower.includes('admin') ||
      designationLower.includes('administrator')) {
    return 'Admin';
  }
  
  // Central Ops / Operations
  if (designationLower.includes('central ops') || 
      designationLower.includes('central operations') ||
      (designationLower.includes('ops') && designationLower.includes('central')) ||
      (designationLower.includes('operations') && designationLower.includes('central'))) {
    return 'Central Ops';
  }
  
  // HR / Assistant Manager - HR
  if (designationLower === 'assistant manager - hr' ||
      designationLower.includes('assistant manager') && designationLower.includes('hr') ||
      designationLower === 'hr' ||
      designationLower.includes('hr manager') ||
      designationLower.includes('human resources')) {
    return 'HR';
  }

  // Fallback: try to determine from permissions
  const permissions = getUserPermissions(user);
  
  if (permissions.upload_dockets) {
    return 'Central Ops';
  }
  if (permissions.approve_deviation) {
    if (designationLower.includes('business')) return 'NBH';
    if (designationLower.includes('credit')) return 'NCH';
  }
  if (permissions.raise_deviation) {
    if (designationLower.includes('business')) return 'SH Business';
    if (designationLower.includes('credit')) return 'SH Credit';
  }
  if (permissions.view_all_india) {
    return 'NBH'; // Default to NBH for all-india view
  }
  if (permissions.view_state) {
    return 'SH Business'; // Default to SH Business for state view
  }
  if (permissions.view_branch) {
    return 'BM'; // Default to BM for branch view
  }
  if (permissions.view_own) {
    return 'RM'; // Default to RM for own view
  }

  return 'Unknown';
}

/**
 * Extract permissions from user object
 */
export function getUserPermissions(user: any): UserPermissions {
  if (!user) return {};

  // Check if permissions are directly provided
  if (user.permissions) {
    return {
      view_own: user.permissions.includes('employee.view_own_incentive_list'),
      view_branch: user.permissions.includes('employee.view_branch_incentive_list'),
      view_state: user.permissions.includes('employee.view_state_incentive_list'),
      view_all_india: user.permissions.includes('employee.view_all_india_incentive_list'),
      raise_deviation: user.permissions.includes('employee.incentive_raise_deviation'),
      approve_deviation: user.permissions.includes('employee.incentive_approve_deviation'),
      view_deviations: user.permissions.includes('employee.incentive_view_deviations'),
      upload_salaries: user.permissions.includes('employee.upload_salaries'),
      view_salaries: user.permissions.includes('employee.view_salaries'),
      upload_dockets: user.permissions.includes('employee.upload_dockets'),
    };
  }

  // Check if permissions are in groups
  if (user.groups) {
    const groupNames = Array.isArray(user.groups) 
      ? user.groups.map((g: any) => g.name || g)
      : [];
    
    return {
      view_own: groupNames.some((g: string) => g.toLowerCase().includes('view_own')),
      view_branch: groupNames.some((g: string) => g.toLowerCase().includes('view_branch')),
      view_state: groupNames.some((g: string) => g.toLowerCase().includes('view_state')),
      view_all_india: groupNames.some((g: string) => g.toLowerCase().includes('view_all_india')),
      raise_deviation: groupNames.some((g: string) => g.toLowerCase().includes('raise_deviation')),
      approve_deviation: groupNames.some((g: string) => g.toLowerCase().includes('approve_deviation')),
      view_deviations: groupNames.some((g: string) => g.toLowerCase().includes('view_deviations')),
      upload_salaries: groupNames.some((g: string) => g.toLowerCase().includes('upload_salaries')),
      view_salaries: groupNames.some((g: string) => g.toLowerCase().includes('view_salaries')),
      upload_dockets: groupNames.some((g: string) => g.toLowerCase().includes('upload_dockets')),
    };
  }

  return {};
}

/**
 * Check if user has permission to view a specific menu item
 */
export function canViewMenuItem(userRole: string, menuItem: string): boolean {
  const menuPermissions: Record<string, string[]> = {
    'eligible': ['NBH', 'SH Business', 'AH Business', 'BM', 'RM', 'NCH', 'SH Credit', 'AH Credit', 'BCM', 'CSO'],
    'deviation-approval': ['NBH', 'NCH'],
    'raise-deviation': ['SH Business', 'SH Credit'],
    'hold-upload': ['Admin', 'Central Ops'],
    'final-cases': ['NBH', 'SH Business', 'AH Business', 'BM', 'RM', 'NCH', 'SH Credit', 'AH Credit', 'BCM', 'CSO'],
  };

  return menuPermissions[menuItem]?.includes(userRole) || false;
}

/**
 * Get user's display name
 */
export function getUserDisplayName(user: any): string {
  if (!user) return 'User';
  
  return user.name || user.employee_name || user.username || user.employee_code || 'User';
}

