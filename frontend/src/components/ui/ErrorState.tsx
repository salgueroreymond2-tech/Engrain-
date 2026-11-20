import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
  requestId?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ha ocurrido un error inesperado',
  message = 'No fue posible completar la solicitud con el servidor.',
  code,
  requestId,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-red-500/30 bg-red-500/5 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold font-display text-platinum">{title}</h4>
      <p className="text-xs text-graphite-300 mt-1 max-w-sm">{message}</p>
      
      {(code || requestId) && (
        <div className="mt-4 p-2.5 rounded-lg bg-carbon border border-graphite-700/60 font-mono text-[11px] text-graphite-400 text-left space-y-0.5 max-w-xs w-full">
          {code && <p><span className="text-graphite-500">CÓDIGO:</span> {code}</p>}
          {requestId && <p className="truncate"><span className="text-graphite-500">REQUEST ID:</span> {requestId}</p>}
        </div>
      )}

      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="secondary" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} className="mt-5">
          Reintentar
        </Button>
      )}
    </div>
  );
};
