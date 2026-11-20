import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/cn';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtitle,
  className,
}) => {
  return (
    <Card className={cn('relative overflow-hidden group', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
            {title}
          </p>
          <p className="text-2xl font-black font-display tracking-tight text-platinum mt-1">
            {value}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-graphite-700/60 border border-graphite-600/40 text-brand flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          {icon}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-graphite-700/50 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-semibold',
                trend.isPositive ? 'text-trust' : 'text-red-400'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-graphite-400 truncate">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
