import React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'interactive' | 'accent';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default:
        'bg-graphite-800/80 border border-graphite-600/50 shadow-automotive backdrop-blur-sm',
      flat:
        'bg-graphite-800/40 border border-graphite-700/40',
      interactive:
        'bg-graphite-800/80 border border-graphite-600/50 shadow-automotive hover:border-brand/50 hover:shadow-orange-glow transition-all duration-200 cursor-pointer',
      accent:
        'bg-gradient-to-br from-graphite-800 to-carbon border border-brand/30 shadow-orange-glow',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-2xl p-5 text-platinum', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('flex items-center justify-between gap-4 mb-4 pb-3 border-b border-graphite-700/50', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-lg font-bold font-display tracking-tight text-platinum', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-graphite-400 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={cn('space-y-4', className)} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('mt-5 pt-3 border-t border-graphite-700/50 flex items-center justify-end gap-3', className)} {...props}>
    {children}
  </div>
);
