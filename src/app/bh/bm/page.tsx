import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function BMPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['BM']}>
        <RolePage userRole="BM" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

