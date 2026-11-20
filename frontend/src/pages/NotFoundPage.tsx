import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-carbon text-platinum flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/30 text-brand flex items-center justify-center mb-6 shadow-orange-glow">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs font-bold text-brand uppercase tracking-widest">
        ERROR 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-2">
        Página no encontrada
      </h1>

      <p className="text-sm text-graphite-400 max-w-md mt-2 mb-8">
        La ruta solicitada no existe en el ecosistema ENGRAIN o ha sido reubicada por políticas de seguridad.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Ir al Inicio
          </Button>
        </Link>
        <button onClick={() => window.history.back()}>
          <Button variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Volver
          </Button>
        </button>
      </div>
    </div>
  );
};
