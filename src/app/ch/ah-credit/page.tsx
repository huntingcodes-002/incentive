import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function AHCreditPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['AH Credit']}>
        <RolePage userRole="AH Credit" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

