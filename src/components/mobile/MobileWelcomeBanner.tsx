import { TrendingUp, Target, Award } from 'lucide-react';

interface MobileWelcomeBannerProps {
  userName: string;
}

export function MobileWelcomeBanner({ userName }: MobileWelcomeBannerProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-4 text-white mb-4">
      <h2 className="text-white mb-1">Welcome, {userName}!</h2>
      <p className="text-indigo-100 text-xs mb-4">Track and manage your incentive cases</p>
      
      {/* Stats - Stacked */}
      <div className="space-y-2">
        <div className="bg-white rounded-lg p-3 border border-indigo-300 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span className="text-gray-700 text-xs font-medium">This Month</span>
          </div>
          <p className="text-indigo-900 text-xl font-semibold">₹2.45L</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-indigo-300 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-amber-600" />
            <span className="text-gray-700 text-xs font-medium">Target Achievement</span>
          </div>
          <p className="text-indigo-900 text-xl font-semibold">82%</p>
        </div>
        
        <div className="bg-white rounded-lg p-3 border border-indigo-300 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-gray-700 text-xs font-medium">Pending Cases</span>
          </div>
          <p className="text-indigo-900 text-xl font-semibold">12</p>
        </div>
      </div>
    </div>
  );
}
