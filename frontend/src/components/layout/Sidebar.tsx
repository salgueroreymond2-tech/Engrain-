import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Wrench,
  Car,
  FileText,
  Calendar,
  Activity,
  Settings,
  Shield,
  Layers,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export interface SidebarProps {
  type: 'workshop' | 'owner';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  type,
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  const { user, logout } = useAuth();

  const workshopNav: NavItem[] = [
    { label: 'Visión General', path: '/workshop', icon: <Layers className="w-4 h-4" /> },
    { label: 'Vehículos en Taller', path: '/workshop/vehicles', icon: <Car className="w-4 h-4" /> },
    { label: 'Órdenes de Trabajo', path: '/workshop/work-orders', icon: <FileText className="w-4 h-4" />, badge: '3 Activas' },
    { label: 'Mantenimientos', path: '/workshop/maintenance', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Diagnósticos OBD2', path: '/workshop/diagnostics', icon: <Activity className="w-4 h-4" /> },
    { label: 'Configuración Taller', path: '/workshop/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const ownerNav: NavItem[] = [
    { label: 'Mi Cochera', path: '/owner', icon: <Layers className="w-4 h-4" /> },
    { label: 'Mis Vehículos', path: '/owner/garage', icon: <Car className="w-4 h-4" /> },
    { label: 'Mantenimientos', path: '/owner/maintenance', icon: <Wrench className="w-4 h-4" /> },
    { label: 'Diagnósticos OBD2', path: '/owner/diagnostics', icon: <Activity className="w-4 h-4" />, badge: 'Connect' },
    { label: 'Pasaporte Digital', path: '/owner/passport', icon: <Shield className="w-4 h-4" /> },
  ];

  const navItems = type === 'workshop' ? workshopNav : ownerNav;

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-carbon-900 border-r border-graphite-700/60 h-screen sticky top-0 transition-all duration-300 z-30 select-none',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-graphite-700/60">
        <BrandLogo collapsed={isCollapsed} to={type === 'workshop' ? '/workshop' : '/owner'} />
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-graphite-400 hover:text-platinum p-1.5 rounded-lg hover:bg-graphite-800 transition-colors"
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Role / Module Tag */}
      {!isCollapsed && (
        <div className="px-4 py-3 bg-graphite-800/40 border-b border-graphite-700/40 flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider uppercase text-graphite-400">
            {type === 'workshop' ? 'Módulo Taller' : 'Módulo Propietario'}
          </span>
          <Badge variant={type === 'workshop' ? 'warning' : 'success'} size="sm" dot>
            {type === 'workshop' ? 'WORKSHOP' : 'OWNER'}
          </Badge>
        </div>
      )}

      {/* Nav list */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/workshop' || item.path === '/owner'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative',
                isActive
                  ? 'bg-brand/10 text-brand border border-brand/30 shadow-sm'
                  : 'text-graphite-400 hover:text-platinum hover:bg-graphite-800/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'shrink-0 transition-colors',
                    isActive ? 'text-brand' : 'text-graphite-400 group-hover:text-platinum'
                  )}
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <Badge variant="outline" size="sm" className="text-[10px] py-0">
                    {item.badge}
                  </Badge>
                )}
                {isCollapsed && (
                  <span className="sr-only">{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* AI Assistant teaser link */}
        <div className="pt-4 mt-4 border-t border-graphite-700/40">
          <div
            className={cn(
              'flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-brand/10 via-graphite-800/40 to-carbon border border-brand/20',
              isCollapsed && 'justify-center p-2'
            )}
          >
            <Sparkles className="w-4 h-4 text-brand shrink-0 animate-pulse" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-platinum flex items-center gap-1">
                  ENGRAIN AI
                  <span className="text-[9px] bg-brand text-white px-1 rounded uppercase">MVP</span>
                </p>
                <p className="text-[10px] text-graphite-400 truncate">Asistente y diagnóstico OBD2</p>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* User profile & Logout footer */}
      <div className="p-3 border-t border-graphite-700/60 bg-carbon-950/40">
        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : 'justify-between')}>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-platinum truncate">
                {user?.name || (type === 'workshop' ? 'Taller Precisión' : 'Propietario Demo')}
              </p>
              <p className="text-[10px] text-graphite-400 truncate">{user?.email || 'demo@engrain.io'}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="text-graphite-400 hover:text-red-400 p-2 rounded-lg hover:bg-graphite-800/50 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
