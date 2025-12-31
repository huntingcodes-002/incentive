import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function NCHPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['NCH']}>
        <RolePage userRole="NCH" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

