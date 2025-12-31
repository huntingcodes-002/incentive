import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function CSOPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['CSO']}>
        <RolePage userRole="CSO" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

