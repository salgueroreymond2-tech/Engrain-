import React from 'react';
import { PackageOpen } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed border-graphite-600/60 bg-graphite-800/30 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-graphite-700/60 text-graphite-400 flex items-center justify-center mb-4 border border-graphite-600/40">
        {icon || <PackageOpen className="w-6 h-6 text-graphite-400" />}
      </div>
      <h4 className="text-base font-bold font-display text-platinum">{title}</h4>
      <p className="text-xs text-graphite-400 mt-1 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="outline" className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
