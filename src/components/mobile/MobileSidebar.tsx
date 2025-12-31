import { LayoutDashboard, CheckCircle, Upload, Trophy, X } from 'lucide-react';

interface MobileSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ activeView, onViewChange, userRole, isOpen, onClose }: MobileSidebarProps) {
  const menuItems = [
    { id: 'eligible', label: 'Eligible Cases', icon: LayoutDashboard, roles: ['NBH', 'SH Business', 'AH Business', 'BM', 'RM', 'NCH', 'SH Credit', 'AH Credit', 'BCM', 'CSO'] },
    { id: 'deviation-approval', label: 'Deviation Inbox', icon: CheckCircle, roles: ['NBH', 'NCH'] },
    { id: 'hold-upload', label: 'Hold Case Upload', icon: Upload, roles: ['Admin', 'Central Ops'] },
    { id: 'final-cases', label: 'Final Cases & Incentive', icon: Trophy, roles: ['NBH', 'SH Business', 'AH Business', 'BM', 'RM', 'NCH', 'SH Credit', 'AH Credit', 'BCM', 'CSO'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleViewChange = (viewId: string) => {
    onViewChange(viewId);
    onClose(); // Close menu after selection
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-gray-900">Incentive Portal</h2>
            <p className="text-gray-600 text-sm mt-1">Deviation</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}