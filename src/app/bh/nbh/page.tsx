import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function NBHPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['NBH']}>
        <RolePage userRole="NBH" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

