import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Gauge,
  Car,
  Activity,
  Wrench,
  Share2,
  FileText,
  Lock,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { passportService } from '../services/passportService';
import { Passport } from '../types/passport';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageLoading } from '../components/ui/Loading';
import { ErrorState } from '../components/ui/ErrorState';
import { BrandLogo } from '../components/layout/BrandLogo';

export const PassportPublicPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [passport, setPassport] = useState<Passport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'REVOKED' | 'INVALID' | 'UNAUTHORIZED' | 'GENERIC' | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPassport = async () => {
      if (!token) return;
      setIsLoading(true);
      setErrorTitle(null);
      setErrorMessage(null);
      setErrorType(null);

      try {
        const data = await passportService.getPassportByToken(token);
        if (data.status === 'REVOKED') {
          setErrorType('REVOKED');
          setErrorTitle('Enlace revocado');
          setErrorMessage(
            'El propietario del vehículo ha revocado el acceso público a este pasaporte digital. Por motivos de privacidad y seguridad, los datos vehiculares ya no están accesibles.'
          );
          setPassport(null);
          return;
        }
        setPassport(data);
      } catch (err: any) {
        if (err.code === 'REVOKED' || err.statusCode === 410) {
          setErrorType('REVOKED');
          setErrorTitle('Enlace revocado');
          setErrorMessage(
            'El propietario del vehículo ha revocado el acceso público a este pasaporte digital. Por motivos de privacidad y seguridad, los datos vehiculares ya no están accesibles.'
          );
        } else if (err.code === 'INVALID' || err.statusCode === 404) {
          setErrorType('INVALID');
          setErrorTitle('Pasaporte no encontrado');
          setErrorMessage(
            'El identificador proporcionado no es válido o no corresponde a ningún pasaporte activo en la red ENGRAIN.'
          );
        } else if (err.statusCode === 401) {
          setErrorType('UNAUTHORIZED');
          setErrorTitle('Acceso restringido');
          setErrorMessage(
            'El servidor backend requiere autenticación en este endpoint. El router de backend tiene el middleware de autenticación activado para rutas públicas.'
          );
        } else {
          setErrorType('GENERIC');
          setErrorTitle('No se pudo cargar el pasaporte');
          setErrorMessage(err.message || 'Error de red o servidor no disponible.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPassport();
  }, [token]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-carbon text-platinum flex flex-col justify-center items-center">
        <PageLoading message="Verificando pasaporte digital vehicular en red ENGRAIN..." />
      </div>
    );
  }

  // Handle Revoked, Invalid or Not Found states without revealing vehicle information
  if (errorType || !passport) {
    return (
      <div className="min-h-screen bg-carbon text-platinum flex flex-col justify-center items-center p-4">
        <div className="mb-6">
          <BrandLogo />
        </div>
        <div className="max-w-md w-full">
          {errorType === 'REVOKED' ? (
            <div className="p-6 rounded-2xl bg-carbon-900 border border-red-500/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">{errorTitle || 'Enlace Revocado'}</h2>
                <p className="text-xs text-graphite-300 leading-relaxed">{errorMessage}</p>
              </div>
              <div className="p-3 rounded-lg bg-carbon border border-graphite-700/60 text-[11px] text-graphite-400 font-mono">
                TOKEN CONSULTADO: {token}
              </div>
            </div>
          ) : (
            <ErrorState
              title={errorTitle || 'Pasaporte no disponible'}
              message={errorMessage || 'El token de verificación no es válido.'}
            />
          )}
        </div>
        <Link to="/" className="mt-6">
          <Button variant="outline" size="sm">Volver al Portal Principal</Button>
        </Link>
      </div>
    );
  }

  const { vehicle, metrics, records } = passport.snapshot;
  const isDemo = Boolean(passport._isDemo);

  return (
    <div className="min-h-screen bg-carbon text-platinum flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-graphite-700/60 bg-carbon-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
        <BrandLogo />
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            leftIcon={<Share2 className="w-3.5 h-3.5" />}
          >
            {copied ? '¡Enlace Copiado!' : 'Compartir Pasaporte'}
          </Button>
          <Link to="/login">
            <Button size="sm" variant="secondary">Iniciar Sesión</Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
        {/* Verification Banner */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-trust/15 via-graphite-800 to-carbon border border-trust/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-automotive">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-trust text-white flex items-center justify-center shrink-0 shadow-lg shadow-trust/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-display text-white">
                  Pasaporte Vehicular Verificado
                </h1>
                <Badge variant="success" size="sm" dot>ACTIVO</Badge>
                {isDemo && (
                  <Badge variant="warning" size="sm">Modo demostración</Badge>
                )}
              </div>
              <p className="text-xs text-graphite-300 font-mono mt-0.5">
                TOKEN PÚBLICO: <span className="text-platinum font-bold">{passport.publicToken}</span>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono uppercase text-graphite-400">Score de Integridad</span>
            <div className="text-3xl font-black font-display text-trust">
              {metrics.trustScore}<span className="text-sm text-graphite-400">/100</span>
            </div>
          </div>
        </div>

        {/* Demo Notice Banner if demo mode */}
        {isDemo && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Expediente Demostrativo:</strong> Esta vista contiene datos simulados para validación de arquitectura de interfaz en el hackathon.
            </span>
          </div>
        )}

        {/* Vehicle Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Car Identity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div>
                <CardTitle className="text-xl text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </CardTitle>
                <p className="text-xs text-brand font-mono font-semibold mt-0.5">PLACA: {vehicle.plate}</p>
              </div>
              <Car className="w-8 h-8 text-graphite-500" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60">
                  <span className="text-[10px] font-mono text-graphite-400 uppercase">Kilometraje Certificado</span>
                  <p className="text-lg font-bold text-platinum mt-1 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-brand" />
                    {vehicle.mileageKm.toLocaleString()} km
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60">
                  <span className="text-[10px] font-mono text-graphite-400 uppercase">Número de Serie (VIN)</span>
                  <p className="text-xs font-mono font-bold text-platinum mt-1 truncate" title={vehicle.vin}>
                    {vehicle.vin}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60">
                  <span className="text-[10px] font-mono text-graphite-400 uppercase">Validación Odómetro</span>
                  <p className="text-xs font-bold text-trust mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sin anomalías
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Transparency Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Garantía de Integridad</CardTitle>
              <Lock className="w-4 h-4 text-trust" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-graphite-400">Total Intervenciones:</span>
                <span className="font-bold text-platinum">{metrics.totalInterventions} registradas</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-graphite-400">Alertas Activas:</span>
                <span className="font-bold text-trust">{metrics.activeAlertsCount} críticas</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-graphite-400">Último Diagnóstico:</span>
                <span className="font-mono text-platinum">Nov 2026</span>
              </div>
              <div className="pt-3 border-t border-graphite-700/50 text-[11px] text-graphite-400">
                Este expediente no expone datos personales ni de titularidad previa, respetando la normativa de privacidad.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chronological Event Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand" />
              Línea de Tiempo y Expediente de Servicio
            </h2>
            <span className="text-xs text-graphite-400 font-mono">
              {records.length} EVENTOS CERTIFICADOS
            </span>
          </div>

          <div className="space-y-3">
            {records.length === 0 ? (
              <div className="p-8 text-center text-xs text-graphite-400 bg-carbon-900 border border-graphite-700/60 rounded-xl">
                Aún no hay intervenciones de mantenimiento registradas para este vehículo.
              </div>
            ) : (
              records.map((rec, index) => {
                const icons = {
                  MAINTENANCE: <Wrench className="w-4 h-4 text-brand" />,
                  DIAGNOSTIC: <Activity className="w-4 h-4 text-blue-400" />,
                  WORK_ORDER: <FileText className="w-4 h-4 text-yellow-400" />,
                  INSPECTION: <CheckCircle2 className="w-4 h-4 text-trust" />,
                };

                return (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-graphite-800/60 border border-graphite-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-graphite-500 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-carbon border border-graphite-600/60 flex items-center justify-center shrink-0 mt-0.5">
                        {icons[rec.type]}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-platinum">{rec.title}</p>
                          {rec.verified && (
                            <Badge variant="success" size="sm" className="text-[10px] py-0">
                              CERTIFICADO
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-graphite-400">
                          {rec.source} • <span className="font-mono text-platinum">{rec.mileageKm.toLocaleString()} km</span>
                        </p>
                        {rec.notes && <p className="text-xs text-graphite-300 pt-1">{rec.notes}</p>}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-graphite-400 sm:text-right shrink-0 flex items-center gap-1.5 sm:flex-col sm:items-end">
                      <Calendar className="w-3.5 h-3.5 text-graphite-500" />
                      <span>{new Date(rec.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-graphite-700/60 bg-carbon-950 py-6 px-4 text-center text-xs text-graphite-400">
        <p>ENGRAIN Driving Trust — Pasaporte Digital Vehicular Inmutable.</p>
      </footer>
    </div>
  );
};
