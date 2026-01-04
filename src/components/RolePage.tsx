'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { WelcomeBanner } from '@/components/WelcomeBanner';
import { EligibleCases } from '@/components/EligibleCases';
import { RaiseDeviation } from '@/components/RaiseDeviation';
import { DeviationApproval } from '@/components/DeviationApproval';
import { HoldCaseUpload } from '@/components/HoldCaseUpload';
import { ViewCases } from '@/components/ViewCases';
import { FinalCases } from '@/components/FinalCases';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { MobileWelcomeBanner } from '@/components/mobile/MobileWelcomeBanner';
import { MobileEligibleCases } from '@/components/mobile/MobileEligibleCases';
import { MobileRaiseDeviation } from '@/components/mobile/MobileRaiseDeviation';
import { MobileDeviationApproval } from '@/components/mobile/MobileDeviationApproval';
import { MobileHoldCaseUpload } from '@/components/mobile/MobileHoldCaseUpload';
import { MobileFinalCases } from '@/components/mobile/MobileFinalCases';
import { Calendar } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRole, getUserDisplayName } from '@/lib/permissions';

interface RolePageProps {
  userRole?: string; // Optional, will be determined from auth context if not provided
}

export function RolePage({ userRole: propUserRole }: RolePageProps) {
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [actualUserRole, setActualUserRole] = useState(propUserRole || 'Unknown');

  // Set default view based on role
  const getDefaultView = (role: string) => {
    if (role === 'Central Ops' || role === 'Admin') {
      return 'view-cases';
    }
    return 'eligible';
  };

  const [activeView, setActiveView] = useState(getDefaultView(propUserRole || 'Unknown'));
  const [selectedCaseForDeviation, setSelectedCaseForDeviation] = useState<string | undefined>(undefined);

  // Initialize with current month (YYYY-MM format)
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isMobile, setIsMobile] = useState(false);

  // Toast functionality
  const { toasts, removeToast } = useToast();

  // Determine user role and name from auth context
  // Priority: Use actual user role from backend (designation) over propUserRole
  // propUserRole is mainly for route protection, but UI should reflect actual user role
  useEffect(() => {
    if (user) {
      // Always use the actual user role from backend (based on designation)
      // This ensures UI reflects the user's actual role, not just the route they're on
      const role = getUserRole(user) || propUserRole || 'Unknown';
      const name = getUserDisplayName(user);
      setActualUserRole(role);
      setUserName(name);
      // Set default view based on actual role
      const defaultViewForRole = getDefaultView(role);
      setActiveView(prevView => {
        // Only change if we're still on the initial default view
        const initialDefault = getDefaultView(propUserRole || 'Unknown');
        if (prevView === initialDefault) {
          return defaultViewForRole;
        }
        return prevView;
      });
    }
  }, [user, propUserRole]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigateToDeviation = (caseId: string) => {
    setSelectedCaseForDeviation(caseId);
    setActiveView('raise-deviation');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'eligible':
        return <EligibleCases userRole={actualUserRole} userName={userName} selectedMonth={selectedMonth} onNavigateToDeviation={handleNavigateToDeviation} />;
      case 'raise-deviation':
        return (
          <RaiseDeviation
            userRole={actualUserRole}
            preSelectedCase={selectedCaseForDeviation}
            onCancel={() => setActiveView('eligible')}
            onSuccess={() => setActiveView('eligible')}
          />
        );
      case 'deviation-approval':
        return <DeviationApproval userRole={actualUserRole} />;
      case 'hold-upload':
        return <HoldCaseUpload userRole={actualUserRole} />;
      case 'view-cases':
        return <ViewCases userRole={actualUserRole} />;
      case 'final-cases':
        return <FinalCases userRole={actualUserRole} userName={userName} selectedMonth={selectedMonth} />;
      default:
        return <EligibleCases userRole={actualUserRole} userName={userName} selectedMonth={selectedMonth} onNavigateToDeviation={handleNavigateToDeviation} />;
    }
  };

  const renderMobileContent = () => {
    switch (activeView) {
      case 'eligible':
        return <MobileEligibleCases userRole={actualUserRole} userName={userName} onNavigateToDeviation={handleNavigateToDeviation} />;
      case 'raise-deviation':
        return <MobileRaiseDeviation selectedCaseId={selectedCaseForDeviation} onBack={() => setActiveView('eligible')} userRole={actualUserRole} />;
      case 'deviation-approval':
        return <MobileDeviationApproval userRole={actualUserRole} />;
      case 'hold-upload':
        return <MobileHoldCaseUpload />;
      case 'view-cases':
        return <ViewCases userRole={actualUserRole} />;
      case 'final-cases':
        return <MobileFinalCases userRole={actualUserRole} userName={userName} selectedMonth={selectedMonth} />;
      default:
        return <MobileEligibleCases userRole={actualUserRole} userName={userName} onNavigateToDeviation={handleNavigateToDeviation} />;
    }
  };

  const getMonthYearDisplay = () => {
    const [year, month] = selectedMonth.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <MobileHeader
          userName={userName}
          userRole={actualUserRole}
          onRoleChange={() => { }} // No role change in mobile
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {/* Mobile Welcome Banner */}
        <div className="p-3 pt-0">
          <MobileWelcomeBanner userName={userName} />
        </div>

        {/* Mobile Content */}
        <main className="bg-gray-50">
          {renderMobileContent()}
        </main>

        {/* Mobile Month Selector - Fixed at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-20">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex-1 px-3 py-2 text-xs premium-dropdown rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
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
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-8 py-4">
          <Header userName={userName} userRole={actualUserRole} />
        </div>
      </div>

      {/* Fixed Welcome Banner - Below Header */}
      <div className="fixed top-[76px] left-0 right-0 z-40 border-b border-indigo-800">
        <WelcomeBanner />
      </div>

      {/* Main Layout - accounts for fixed header + welcome banner */}
      <div className="flex pt-[140px]">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 w-64 h-[calc(100vh-140px)] border-r border-gray-200 bg-white shadow-sm overflow-hidden z-30">
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
            userRole={actualUserRole}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* Main Content Area - with left margin for sidebar */}
        <div className="flex-1 ml-64 flex flex-col h-[calc(100vh-140px)]">
          {/* Module Content - scrollable */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {renderContent()}
          </main>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

