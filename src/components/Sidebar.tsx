'use client';

import { LayoutDashboard, CheckCircle, Upload, Trophy, Calendar } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: string;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function Sidebar({ activeView, onViewChange, userRole, selectedMonth, onMonthChange }: SidebarProps) {
  const getMonthYearDisplay = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  const menuItems = [
    { id: 'eligible', label: 'Eligible Cases', icon: LayoutDashboard, roles: ['NBH', 'SH Business', 'AH Business', 'BM', 'RM', 'NCH', 'SH Credit', 'AH Credit', 'BCM', 'CSO'] },
    { id: 'deviation-approval', label: 'Deviation Inbox', icon: CheckCircle, roles: ['NBH', 'NCH'] },
    { id: 'hold-upload', label: 'Hold Case Upload', icon: Upload, roles: ['Admin', 'Central Ops'] },
    { id: 'final-cases', label: 'Final Incentive', icon: Trophy, roles: ['NBH', 'SH Business', 'AH Business', 'BM', 'RM', 'NCH', 'SH Credit', 'AH Credit', 'BCM', 'CSO'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
      <nav className="flex-1 p-4 overflow-y-auto min-h-0">
        <ul className="space-y-1">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-['Geist:Medium',sans-serif]">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Incentive Period Selector - Last Element */}
      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 text-gray-700 text-xs mb-2 px-1">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="font-['Geist:Medium',sans-serif]">Incentive Period</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="w-full px-3 py-2 text-xs premium-dropdown rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold mb-2"
        >
          {(() => {
            // Generate last 12 months dynamically
            const options = [];
            const now = new Date();
            for (let i = 0; i < 12; i++) {
              const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const value = `${year}-${month}`;
              const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              options.push(
                <option key={value} value={value}>
                  {label}
                </option>
              );
            }
            return options;
          })()}
        </select>
        <p className="text-gray-500 text-xs mt-1 px-1">{getMonthYearDisplay()}</p>
      </div>
    </div>
  );
}