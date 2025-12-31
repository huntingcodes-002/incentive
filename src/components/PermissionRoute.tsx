'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getUserRole, getUserPermissions, canViewMenuItem } from '@/lib/permissions';

interface PermissionRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermission?: string;
  redirectTo?: string;
}

/**
 * Route protection based on user role and permissions
 * Only allows access if user has the required role or permission
 */
export function PermissionRoute({ 
  children, 
  allowedRoles = [], 
  requiredPermission,
  redirectTo 
}: PermissionRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    const userRole = getUserRole(user);
    const permissions = getUserPermissions(user);

    let access = false;

    // Check role-based access
    if (allowedRoles.length > 0) {
      access = allowedRoles.includes(userRole);
    }

    // Check permission-based access
    if (requiredPermission) {
      const permissionMap: Record<string, keyof typeof permissions> = {
        'view_own': 'view_own',
        'view_branch': 'view_branch',
        'view_state': 'view_state',
        'view_all_india': 'view_all_india',
        'raise_deviation': 'raise_deviation',
        'approve_deviation': 'approve_deviation',
        'view_deviations': 'view_deviations',
        'upload_dockets': 'upload_dockets',
      };

      const permissionKey = permissionMap[requiredPermission];
      if (permissionKey && permissions[permissionKey]) {
        access = true;
      }
    }

    if (!access) {
      // Redirect to default route based on user role
      const defaultRoutes: Record<string, string> = {
        'RM': '/bh/rm',
        'BM': '/bh/bm',
        'BCM': '/ch/bcm',
        'CSO': '/ch/cso',
        'AH Business': '/bh/ah-business',
        'AH Credit': '/ch/ah-credit',
        'SH Business': '/bh/sh-business',
        'SH Credit': '/ch/sh-credit',
        'NBH': '/bh/nbh',
        'NCH': '/ch/nch',
        'Admin': '/ops/admin',
        'Central Ops': '/ops/central-ops',
        'HR': '/hr',
      };

      const defaultRoute = defaultRoutes[userRole] || redirectTo || '/ops/admin';
      router.push(defaultRoute);
    } else {
      setHasAccess(true);
    }

    setChecking(false);
  }, [isAuthenticated, isLoading, user, router, allowedRoles, requiredPermission, redirectTo]);

  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

