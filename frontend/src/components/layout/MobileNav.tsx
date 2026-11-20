import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, Layers, Car, FileText, Calendar, Activity, Settings, Shield, Wrench, LogOut } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'workshop' | 'owner';
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, type }) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const workshopNav = [
    { label: 'Visión General', path: '/workshop', icon: <Layers className="w-4 h-4" /> },
    { label: 'Vehículos en Taller', path: '/workshop/vehicles', icon: <Car className="w-4 h-4" /> },
    { label: 'Órdenes de Trabajo', path: '/workshop/work-orders', icon: <FileText className="w-4 h-4" /> },
    { label: 'Mantenimientos', path: '/workshop/maintenance', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Diagnósticos OBD2', path: '/workshop/diagnostics', icon: <Activity className="w-4 h-4" /> },
    { label: 'Configuración Taller', path: '/workshop/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const ownerNav = [
    { label: 'Mi Cochera', path: '/owner', icon: <Layers className="w-4 h-4" /> },
    { label: 'Mis Vehículos', path: '/owner/garage', icon: <Car className="w-4 h-4" /> },
    { label: 'Mantenimientos', path: '/owner/maintenance', icon: <Wrench className="w-4 h-4" /> },
    { label: 'Diagnósticos OBD2', path: '/owner/diagnostics', icon: <Activity className="w-4 h-4" /> },
    { label: 'Pasaporte Digital', path: '/owner/passport', icon: <Shield className="w-4 h-4" /> },
  ];

  const navItems = type === 'workshop' ? workshopNav : ownerNav;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-carbon-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="relative w-4/5 max-w-xs bg-carbon-900 border-r border-graphite-700 h-full flex flex-col z-10 p-4">
        <div className="flex items-center justify-between pb-4 border-b border-graphite-700/60">
          <BrandLogo />
          <button
            onClick={onClose}
            className="text-graphite-400 hover:text-platinum p-1.5 rounded-lg hover:bg-graphite-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3 flex items-center justify-between border-b border-graphite-700/40">
          <span className="text-xs font-mono text-graphite-400">
            {type === 'workshop' ? 'TALLER MECÁNICO' : 'PROPIETARIO'}
          </span>
          <Badge variant={type === 'workshop' ? 'warning' : 'success'} size="sm">
            {user?.role || (type === 'workshop' ? 'WORKSHOP_ADMIN' : 'OWNER')}
          </Badge>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/workshop' || item.path === '/owner'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                  isActive
                    ? 'bg-brand/10 text-brand border border-brand/30'
                    : 'text-graphite-400 hover:text-platinum hover:bg-graphite-800'
                )
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-graphite-700/60 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-platinum truncate">{user?.name || 'Usuario ENGRAIN'}</p>
            <p className="text-[10px] text-graphite-400 truncate">{user?.email || 'demo@engrain.io'}</p>
          </div>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="text-red-400 hover:text-red-300 p-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
