import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function BCMPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['BCM']}>
        <RolePage userRole="BCM" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

