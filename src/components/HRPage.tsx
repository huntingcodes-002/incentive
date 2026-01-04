'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HRSidebar } from './HRSidebar';
import { UploadSalary } from './UploadSalary';
import { ViewSalary } from './ViewSalary';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRole, getUserDisplayName } from '@/lib/permissions';

export function HRPage() {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('HR');
  const [activeView, setActiveView] = useState<'upload' | 'view'>('upload');

  useEffect(() => {
    if (user) {
      const role = getUserRole(user);
      const name = getUserDisplayName(user);
      setUserRole(role);
      setUserName(name);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-8 py-4">
          <Header userName={userName} userRole={userRole} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex pt-20">
        {/* Sidebar */}
        <HRSidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {activeView === 'upload' && <UploadSalary />}
            {activeView === 'view' && <ViewSalary />}
          </div>
        </div>
      </div>
    </div>
  );
}

