interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleColor = (role: string) => {
    if (role.includes('NBH') || role.includes('NCH')) {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (role.includes('SH')) {
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    }
    if (role.includes('AH')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    if (role.includes('BM') || role.includes('BCM')) {
      return 'bg-teal-100 text-teal-700 border-teal-200';
    }
    if (role.includes('RM') || role.includes('CSO')) {
      return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    }
    if (role.includes('Admin') || role.includes('Ops')) {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
      {role}
    </span>
  );
}
