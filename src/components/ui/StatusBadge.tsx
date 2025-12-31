'use client';

import { CheckCircle2, Clock, XCircle, FileCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'default' | 'outline' | 'solid';
}

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
  solidBg: string;
  solidText: string;
}

export function StatusBadge({ 
  status, 
  size = 'md',
  showIcon = true,
  variant = 'default'
}: StatusBadgeProps) {
  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 text-xs gap-1',
      icon: 'w-3 h-3',
      dot: 'w-1.5 h-1.5'
    },
    md: {
      container: 'px-2.5 py-1 text-xs gap-1.5',
      icon: 'w-3.5 h-3.5',
      dot: 'w-2 h-2'
    },
    lg: {
      container: 'px-3 py-1.5 text-sm gap-2',
      icon: 'w-4 h-4',
      dot: 'w-2.5 h-2.5'
    }
  };

  const getStatusConfig = (status: string): StatusConfig => {
    const normalized = status.toLowerCase();
    
    // Eligible / Approved / Finalised / Active
    if (normalized.includes('eligible') || normalized.includes('approved') || normalized.includes('finalised') || normalized.includes('active')) {
      return {
        icon: CheckCircle2,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
        solidBg: 'bg-emerald-600',
        solidText: 'text-white'
      };
    }
    
    // Pending / Under Deviation / Hold
    if (normalized.includes('pending') || normalized.includes('under deviation') || normalized.includes('deviation') || normalized.includes('hold')) {
      return {
        icon: Clock,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        dotColor: 'bg-amber-500',
        solidBg: 'bg-amber-600',
        solidText: 'text-white'
      };
    }
    
    // Rejected / Failed
    if (normalized.includes('reject') || normalized.includes('failed') || normalized.includes('inactive')) {
      return {
        icon: XCircle,
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
        dotColor: 'bg-red-500',
        solidBg: 'bg-red-600',
        solidText: 'text-white'
      };
    }
    
    // Processing / In Progress
    if (normalized.includes('processing') || normalized.includes('in progress')) {
      return {
        icon: Loader2,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-500',
        solidBg: 'bg-blue-600',
        solidText: 'text-white'
      };
    }
    
    // Default / Unknown
    return {
      icon: FileCheck,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      dotColor: 'bg-gray-500',
      solidBg: 'bg-gray-600',
      solidText: 'text-white'
    };
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const isAnimated = status.toLowerCase().includes('processing') || status.toLowerCase().includes('in progress');

  const variantClasses = {
    default: `${config.bgColor} ${config.textColor} ${config.borderColor} border`,
    outline: `bg-white ${config.textColor} ${config.borderColor} border-2`,
    solid: `${config.solidBg} ${config.solidText} border-transparent`
  };

  // Handle long status text like "Under Deviation" - use shorter text or truncate
  const getDisplayStatus = (status: string): string => {
    if (status.toLowerCase().includes('under deviation')) {
      return 'Deviation';
    }
    return status;
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-200',
        'shadow-sm hover:shadow-md whitespace-nowrap',
        sizeClasses[size].container,
        variantClasses[variant],
        isAnimated && 'animate-pulse'
      )}
    >
      {showIcon && (
        <Icon 
          className={cn(
            sizeClasses[size].icon,
            'flex-shrink-0',
            config.textColor,
            variant === 'solid' && config.solidText,
            isAnimated && 'animate-spin'
          )} 
        />
      )}
      {!showIcon && variant === 'default' && (
        <span className={cn('rounded-full flex-shrink-0', sizeClasses[size].dot, config.dotColor)} />
      )}
      <span className="font-['Geist:Medium',sans-serif] leading-none whitespace-nowrap">{getDisplayStatus(status)}</span>
    </span>
  );
}
