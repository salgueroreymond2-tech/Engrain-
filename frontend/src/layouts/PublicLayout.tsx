import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BrandLogo } from '../components/layout/BrandLogo';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-carbon text-platinum flex flex-col selection:bg-brand selection:text-white">
      {/* Public Header */}
      <header className="h-20 border-b border-graphite-700/60 bg-carbon-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
        <BrandLogo />

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-graphite-300">
          <a href="#solucion" className="hover:text-brand transition-colors">Solución</a>
          <a href="#modulos" className="hover:text-brand transition-colors">Módulos</a>
          <a href="#pasaporte" className="hover:text-brand transition-colors">Pasaporte Digital</a>
          <a href="#seguridad" className="hover:text-brand transition-colors">Seguridad</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Iniciar Sesión</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Registrarse
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-graphite-700/60 bg-carbon-950 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <BrandLogo />
            <p className="text-xs text-graphite-400 max-w-sm text-center md:text-left mt-2">
              Ecosistema digital de confianza vehicular. Trazabilidad respaldada por diagnósticos OBD2, eventos de taller y evidencias verificables.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-graphite-400">
            <Link to="/passport/engrain-px78912" className="hover:text-platinum transition-colors">Pasaporte Demo</Link>
            <Link to="/login" className="hover:text-platinum transition-colors">Acceso Talleres</Link>
            <Link to="/login" className="hover:text-platinum transition-colors">Acceso Propietarios</Link>
            <span className="flex items-center gap-1.5 text-trust">
              <ShieldCheck className="w-4 h-4" /> Protocolo Seguro v1
            </span>
          </div>

          <div className="text-xs text-graphite-500 flex items-center gap-2">
            <span>Hackathon Noviembre 2026</span>
            <span>•</span>
            <span>ENGRAIN — Driving Trust</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
