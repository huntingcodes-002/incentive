import { HRPage } from '@/components/HRPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function HRPageRoute() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['HR']}>
        <HRPage />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

