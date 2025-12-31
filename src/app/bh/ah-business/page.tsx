import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function AHBusinessPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['AH Business']}>
        <RolePage userRole="AH Business" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

