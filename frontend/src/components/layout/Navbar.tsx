import React from 'react';
import {
  Menu,
  Bell,
  ExternalLink,
  ShieldAlert,
  User as UserIcon,
  Layers,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Dropdown } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';
import { BrandLogo } from './BrandLogo';

export interface NavbarProps {
  onOpenMobileMenu?: () => void;
  type: 'workshop' | 'owner';
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, type }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleToggle = () => {
    if (type === 'workshop') {
      switchDemoRole('OWNER');
      navigate('/owner');
    } else {
      switchDemoRole('WORKSHOP_ADMIN');
      navigate('/workshop');
    }
  };

  return (
    <header className="h-16 bg-carbon-900/90 border-b border-graphite-700/60 sticky top-0 z-20 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile brand & hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden text-graphite-400 hover:text-platinum p-2 rounded-xl hover:bg-graphite-800 transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="md:hidden">
          <BrandLogo collapsed={true} />
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-mono text-graphite-400 uppercase tracking-wider">
            {type === 'workshop' ? 'Plataforma Taller' : 'Portal Propietario'}
          </span>
          <span className="text-graphite-600">/</span>
          <Badge variant="outline" size="sm" className="text-[10px]">
            API v1 Conectada
          </Badge>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Role Switcher for Hackathon Testing */}
        <button
          onClick={handleRoleToggle}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-graphite-800 border border-graphite-600/60 text-graphite-300 hover:text-platinum hover:border-brand/40 transition-all"
          title="Alternar entre la vista de Taller y Propietario"
        >
          <Layers className="w-3.5 h-3.5 text-brand" />
          <span>Ir a {type === 'workshop' ? 'Propietario' : 'Taller'}</span>
        </button>

        {/* Public passport quick test link */}
        <Link
          to="/passport/engrain-px78912"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand/10 border border-brand/30 text-brand hover:bg-brand hover:text-white transition-all shadow-sm"
          title="Ver demo del Pasaporte Digital Público"
        >
          <span>Pasaporte Demo</span>
          <ExternalLink className="w-3 h-3" />
        </Link>

        {/* Notifications Icon */}
        <button
          className="relative text-graphite-400 hover:text-platinum p-2 rounded-xl hover:bg-graphite-800 transition-colors"
          title="Notificaciones vehiculares"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand ring-2 ring-carbon" />
        </button>

        {/* Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-graphite-800 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-graphite to-carbon border border-graphite-600 text-brand font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
              </div>
            </button>
          }
          items={[
            {
              label: `Sesión: ${user?.email || 'demo@engrain.io'}`,
              onClick: () => {},
              icon: <UserIcon className="w-3.5 h-3.5" />,
            },
            {
              label: `Cambiar a ${type === 'workshop' ? 'Propietario' : 'Taller'}`,
              onClick: handleRoleToggle,
              icon: <Layers className="w-3.5 h-3.5" />,
            },
            {
              label: 'Ver Pasaporte Público',
              onClick: () => navigate('/passport/engrain-px78912'),
              icon: <ShieldAlert className="w-3.5 h-3.5" />,
            },
            {
              label: 'Cerrar Sesión',
              onClick: logout,
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  );
};
