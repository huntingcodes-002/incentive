import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
      {text && <p className="text-gray-600 mt-3">{text}</p>}
    </div>
  );
}

export function TableLoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      <span className="ml-3 text-gray-600">Loading data...</span>
    </div>
  );
}
