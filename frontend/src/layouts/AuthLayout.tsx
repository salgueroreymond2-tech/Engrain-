import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { BrandLogo } from '../components/layout/BrandLogo';
import { Shield, CheckCircle2, Cpu, Wrench } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-carbon flex flex-col md:flex-row text-platinum selection:bg-brand selection:text-white">
      {/* Left Automotive Showcase Hero (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-carbon-950 via-carbon to-graphite-800 p-12 flex-col justify-between border-r border-graphite-700/60 relative overflow-hidden">
        {/* Subtle decorative background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#242830_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Ambient Orange Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <BrandLogo />
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-brand text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            TELEMETRÍA Y CONFIANZA VEHICULAR
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold font-display leading-tight tracking-tight text-white">
            El expediente digital transparente para la nueva era automotriz.
          </h2>

          <p className="text-sm text-graphite-300 leading-relaxed">
            Conectamos propietarios, talleres mecánicos certificados y compradores. Trazabilidad respaldada por diagnósticos OBD2 en tiempo real y evidencias criptográficamente verificables.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-graphite-700/60">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-trust shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-platinum">Pasaporte Verificable</p>
                <p className="text-[11px] text-graphite-400">Historial protegido con token público único.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Wrench className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-platinum">Gestión de Taller</p>
                <p className="text-[11px] text-graphite-400">Órdenes de trabajo, diagnósticos e insumos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom security assurance */}
        <div className="relative z-10 flex items-center justify-between text-xs text-graphite-400 pt-6 border-t border-graphite-800">
          <span className="flex items-center gap-1.5 text-trust">
            <Shield className="w-4 h-4" /> Encriptación AES & API REST v1
          </span>
          <span className="font-mono text-[11px]">ENGRAIN PROTOCOL © 2026</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 relative">
        <div className="lg:hidden w-full max-w-md mb-8 flex justify-between items-center">
          <BrandLogo />
          <Link to="/" className="text-xs font-semibold text-graphite-400 hover:text-platinum">
            Volver al inicio
          </Link>
        </div>

        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
