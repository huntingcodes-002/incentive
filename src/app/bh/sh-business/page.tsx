import { RolePage } from '@/components/RolePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionRoute } from '@/components/PermissionRoute';

export default function SHBusinessPage() {
  return (
    <ProtectedRoute>
      <PermissionRoute allowedRoles={['SH Business']}>
        <RolePage userRole="SH Business" />
      </PermissionRoute>
    </ProtectedRoute>
  );
}

