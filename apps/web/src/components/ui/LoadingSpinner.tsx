import React from 'react';
import { cn } from '../../lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  className,
  text = 'Loading...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  // Inline spinner (no text, minimal spacing)
  if (size === 'sm' && !text) {
    return (
      <div className={cn('animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full', sizeClasses[size], className)} />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-2">
      <div className={cn('animate-spin border-2 border-gray-300 border-t-blue-600 rounded-full', sizeClasses[size], className)} />
      {text && (
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">{text}</p>
      )}
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="xl" text="Loading MAS Business OS..." />
    </div>
  );
}