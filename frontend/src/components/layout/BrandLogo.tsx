import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/cn';

export interface BrandLogoProps {
  className?: string;
  collapsed?: boolean;
  to?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className, collapsed = false, to = '/' }) => {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5 group select-none', className)}>
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand via-brand-600 to-carbon border border-brand/40 flex items-center justify-center text-white shadow-orange-glow group-hover:scale-105 transition-transform duration-200">
        <ShieldCheck className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-trust ring-2 ring-carbon" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-wider font-display text-platinum flex items-center gap-1">
            ENGRAIN
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-brand font-semibold -mt-1">
            DRIVING TRUST
          </span>
        </div>
      )}
    </Link>
  );
};
