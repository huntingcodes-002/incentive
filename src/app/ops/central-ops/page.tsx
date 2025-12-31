import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function CentralOpsPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['Admin', 'Central Ops']}>
        <RolePage userRole="Central Ops" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

