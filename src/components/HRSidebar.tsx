'use client';

import { Upload, Eye } from 'lucide-react';

interface HRSidebarProps {
  activeView: 'upload' | 'view';
  onViewChange: (view: 'upload' | 'view') => void;
}

export function HRSidebar({ activeView, onViewChange }: HRSidebarProps) {
  const menuItems = [
    { id: 'upload', label: 'Upload Salary', icon: Upload },
    { id: 'view', label: 'View Salary', icon: Eye },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-sm">
      <nav className="flex-1 p-4 overflow-y-auto min-h-0">
        <ul className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id as 'upload' | 'view')}
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
    </div>
  );
}

