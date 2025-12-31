import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function SHCreditPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['SH Credit']}>
        <RolePage userRole="SH Credit" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

