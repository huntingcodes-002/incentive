'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getUserRole } from '@/lib/permissions';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Redirect to user's default route based on role
        const userRole = getUserRole(user);
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

        const defaultRoute = defaultRoutes[userRole] || '/ops/admin';
        router.push(defaultRoute);
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return null;
}
