'use client';

import { useState } from 'react';
import { Menu, X, LayoutDashboard, CheckCircle, Upload, Trophy, FileText } from 'lucide-react';

interface MobileNavProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
}

export function MobileNav({ activeView, onViewChange, userRole }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'eligible', label: 'Eligible Cases', icon: LayoutDashboard, roles: ['NBH', 'SH Business', 'AH Business', 'BM', 'RM', 'NCH', 'SH Credit', 'AH Credit', 'BCM', 'CSO'] },
    { id: 'deviation-approval', label: 'Deviation Inbox', icon: CheckCircle, roles: ['NBH', 'NCH'] },
    { id: 'view-cases', label: 'View Cases', icon: FileText, roles: ['Admin', 'Central Ops'] },
    { id: 'hold-upload', label: 'Hold Case Upload', icon: Upload, roles: ['Admin', 'Central Ops'] },
    { id: 'final-cases', label: 'Final Incentive', icon: Trophy, roles: ['NBH', 'SH Business', 'AH Business', 'BM', 'RM', 'NCH', 'SH Credit', 'AH Credit', 'BCM', 'CSO'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-gray-900">Incentive Portal</h2>
            <p className="text-gray-600 text-xs mt-0.5">Deviation</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 overflow-y-auto h-[calc(100%-80px)]">
          <ul className="space-y-1">
            {visibleItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
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