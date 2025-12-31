'use client';

import { MobileNav } from '@/components/mobile/MobileNav';

interface MobileHeaderProps {
  userName: string;
  userRole: string;
  onRoleChange: (role: string) => void; // Kept for compatibility but not used
  activeView: string;
  onViewChange: (view: string) => void;
}

export function MobileHeader({ userName, userRole, activeView, onViewChange }: MobileHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Top Row - Logo & Menu */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav activeView={activeView} onViewChange={onViewChange} userRole={userRole} />
          <div>
            <h1 className="text-gray-900 text-sm">Incentive Portal</h1>
            <p className="text-gray-500 text-xs">{userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
