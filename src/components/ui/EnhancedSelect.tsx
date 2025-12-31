'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'indigo' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedSelect = forwardRef<HTMLSelectElement, EnhancedSelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    icon, 
    variant = 'default',
    size = 'md',
    className,
    children,
    disabled,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base'
    };

    const variantClasses = {
      default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
      indigo: 'border-indigo-300 focus:border-indigo-500 focus:ring-indigo-500 bg-indigo-50/30',
      outline: 'border-gray-400 focus:border-indigo-500 focus:ring-indigo-500'
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full rounded-lg border bg-white font-medium',
              'transition-all duration-300 ease-in-out',
              'shadow-sm cursor-pointer appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'hover:shadow-md hover:border-indigo-400',
              'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60',
              'disabled:hover:shadow-sm disabled:hover:border-gray-300',
              sizeClasses[size],
              variantClasses[variant],
              icon && 'pl-10',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
              className
            )}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${error ? 'ef4444' : '4f46e5'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.1em 1.1em',
              paddingRight: '2.75rem'
            }}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown 
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                error ? 'text-red-400' : 'text-indigo-500',
                disabled && 'text-gray-400'
              )} 
            />
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span className="text-red-500">•</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

EnhancedSelect.displayName = 'EnhancedSelect';

