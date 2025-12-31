import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['Admin', 'Central Ops']}>
        <RolePage userRole="Admin" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

