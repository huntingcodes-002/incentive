import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function SummaryCard({ title, value, icon: Icon, subtitle, trend, variant = 'default' }: SummaryCardProps) {
  const variants = {
    default: 'bg-white border-gray-200 text-gray-900',
    primary: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-red-50 border-red-200 text-red-900'
  };

  const iconColors = {
    default: 'text-gray-600',
    primary: 'text-indigo-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600'
  };

  return (
    <div className={`border rounded-lg p-3 ${variants[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {trend && (
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${variant === 'default' ? 'bg-gray-100' : 'bg-white'}`}>
          <Icon className={`w-5 h-5 ${iconColors[variant]}`} />
        </div>
      </div>
    </div>
  );
}

interface SummaryCardGridProps {
  children: React.ReactNode;
}

export function SummaryCardGrid({ children }: SummaryCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
      {children}
    </div>
  );
}
