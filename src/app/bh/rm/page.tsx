import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function RMPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['RM']}>
        <RolePage userRole="RM" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

