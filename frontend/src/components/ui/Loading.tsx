import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 text-graphite-400', className)}>
      <Loader2 className={cn('animate-spin text-brand', sizes[size])} />
      {label && <p className="text-xs font-medium tracking-wide uppercase">{label}</p>}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-lg bg-graphite-700/60', className)} />
);

export const PageLoading: React.FC<{ message?: string }> = ({
  message = 'Cargando información vehicular...',
}) => (
  <div className="flex-1 min-h-[400px] flex items-center justify-center p-8">
    <LoadingSpinner size="lg" label={message} />
  </div>
);
