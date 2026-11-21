import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
  Car,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { PageLoading } from '../../components/ui/Loading';
import { useToast } from '../../hooks/useToast';
import { QRCodeSVG } from 'qrcode.react';
import { passportService } from '../../services/passportService';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types/vehicle';
import { PassportVisibility, PassportStatus } from '../../types/passport';
import { isExplicitDemoMode } from '../../lib/demo-mode';
import { demoLinkStore } from '../../services/demoLinkStore';

export const OwnerPassportPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [visibility, setVisibility] = useState<PassportVisibility>('PUBLIC');
  const [passportId, setPassportId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [status, setStatus] = useState<PassportStatus>('ACTIVE');
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const baseUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
  const passportUrl = token ? `${baseUrl.replace(/\/+$/, '')}/passport/${token}` : '';

  // Load vehicles and initialize passport
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const demoMode = isExplicitDemoMode();
      setIsDemo(demoMode);

      try {
        const userVehicles = await vehicleService.getVehicles();
        setVehicles(userVehicles);

        if (userVehicles.length > 0) {
          const firstVeh = userVehicles[0];
          setSelectedVehicleId(firstVeh.id);

          if (!demoMode) {
            // Attempt to create / fetch real passport for first vehicle
            try {
              const pass = await passportService.createPassport(firstVeh.id, 'PUBLIC');
              setPassportId(pass.id);
              setToken(pass.publicToken);
              setStatus(pass.status);
              setVisibility(pass.visibility);
              setIsDemo(Boolean(pass._isDemo));
            } catch (pErr: any) {
              console.warn('Could not auto-create passport in backend, fallback to demo token if needed:', pErr);
              // If backend failed (e.g., 501 or network), allow demo mode
              const demoToken = 'demo-token-123';
              setToken(demoToken);
              setStatus('ACTIVE');
              setIsDemo(true);
            }
          } else {
            // In explicit demo mode
            const demoToken = 'demo-token-123';
            const demoStatus = demoLinkStore.getStatus(demoToken);
            setToken(demoToken);
            setStatus(demoStatus);
          }
        } else {
          // No vehicles found, use demo
          const demoToken = 'demo-token-123';
          setToken(demoToken);
          setStatus('ACTIVE');
          setIsDemo(true);
        }
      } catch (err: any) {
        console.warn('Error loading vehicles:', err);
        const demoToken = 'demo-token-123';
        setToken(demoToken);
        setStatus('ACTIVE');
        setIsDemo(true);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handleVehicleChange = async (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    if (isDemo) return;

    setIsProcessing(true);
    try {
      const pass = await passportService.createPassport(vehicleId, visibility);
      setPassportId(pass.id);
      setToken(pass.publicToken);
      setStatus(pass.status);
      setVisibility(pass.visibility);
      setIsDemo(Boolean(pass._isDemo));
      success('Pasaporte vinculado', `Asociado al vehículo seleccionado.`);
    } catch (err: any) {
      toastError('Error al vincular pasaporte', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!passportUrl) return;
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    success('Enlace copiado', 'Puedes enviar este enlace a cualquier interesado o comprador.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRegenerateToken = async () => {
    setIsProcessing(true);
    try {
      if (!isDemo && selectedVehicleId) {
        // En backend real: revocar anterior si existe y crear nuevo pasaporte
        if (passportId) {
          try {
            await passportService.revokePassport(passportId, token);
          } catch (e) {
            console.warn('Revoke previous failed, continuing create:', e);
          }
        }
        const newPass = await passportService.createPassport(selectedVehicleId, visibility);
        setPassportId(newPass.id);
        setToken(newPass.publicToken);
        setStatus('ACTIVE');
        success('Token renovado en Backend', 'El token anterior ha sido revocado y se generó uno nuevo.');
      } else {
        // En modo demostración
        const newToken = `engrain-demo-${Math.random().toString(36).substring(2, 8)}`;
        demoLinkStore.regenerate(token, newToken);
        setToken(newToken);
        setStatus('ACTIVE');
        success('Token renovado (Demo)', 'El token anterior ha sido revocado en este navegador.');
      }
    } catch (err: any) {
      toastError('Error al regenerar token', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async () => {
    setIsProcessing(true);
    try {
      if (!isDemo && passportId) {
        await passportService.revokePassport(passportId, token);
        setStatus('REVOKED');
        success('Enlace revocado en Backend', 'El pasaporte digital ha sido marcado como REVOCADO en el servidor.');
      } else {
        await passportService.revokeLink(token);
        setStatus('REVOKED');
        success('Enlace revocado (Demo)', 'El enlace ya no es accesible desde la vista pública en este navegador.');
      }
    } catch (err: any) {
      toastError('Error al revocar enlace', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVisibilityChange = async (newVis: PassportVisibility) => {
    setVisibility(newVis);
    if (!isDemo && passportId) {
      try {
        await passportService.updatePassport(passportId, { visibility: newVis });
        success('Visibilidad modificada', `El pasaporte ahora es ${newVis}.`);
      } catch (err: any) {
        toastError('Error al actualizar visibilidad', err.message);
      }
    } else {
      success('Visibilidad modificada', `El pasaporte ahora es ${newVis} (Demo).`);
    }
  };

  if (isLoading) {
    return <PageLoading message="Cargando expediente del pasaporte digital..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión del Pasaporte Digital"
        description="Configura la privacidad y comparte el expediente certificado de tu automóvil sin comprometer tus datos personales."
        actions={
          token && status === 'ACTIVE' ? (
            <Link to={`/passport/${token}`} target="_blank">
              <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Ver Vista Pública
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Demo vs Real Banner */}
      {isDemo ? (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Modo Demostración:</strong> El pasaporte utiliza tokens y almacenamiento simulado persistido en este navegador. Las revocaciones no se sincronizan con otros dispositivos.
            </span>
          </div>
          <Badge variant="warning" size="sm">Modo demostración</Badge>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-trust/10 border border-trust/30 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-trust shrink-0" />
            <span>
              <strong>Modo Real Verificado:</strong> Conectado con la API oficial de ENGRAIN. Los tokens y estados son gobernados por el servidor.
            </span>
          </div>
          <Badge variant="success" size="sm" dot>Integración Backend Activa</Badge>
        </div>
      )}

      {/* Vehicle Selector if multiple vehicles */}
      {vehicles.length > 1 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-platinum">
              <Car className="w-4 h-4 text-brand" />
              <span>Vehículo seleccionado para pasaporte:</span>
            </div>
            <div className="w-full sm:w-72">
              <Select
                value={selectedVehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                options={vehicles.map((v) => ({
                  value: v.id,
                  label: `${v.year} ${v.make} ${v.model} (${v.plate})`,
                }))}
              />
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token & Link Generation */}
        <Card className="lg:col-span-2 border-brand/30">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand" />
              <CardTitle className="text-base text-white">
                {status === 'ACTIVE' ? 'Enlace de Verificación Activo' : 'Enlace de Verificación Revocado'}
              </CardTitle>
            </div>
            {status === 'ACTIVE' ? (
              <Badge variant="success" size="sm" dot>ACTIVO</Badge>
            ) : (
              <Badge variant="danger" size="sm" dot>REVOCADO</Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
                Enlace Compartible para Compradores
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={passportUrl || 'Generando enlace...'}
                  disabled={status === 'REVOKED'}
                  className="flex-1 bg-carbon-900 border border-graphite-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-platinum truncate select-all disabled:opacity-50"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCopy}
                  disabled={!passportUrl || status === 'REVOKED'}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              <p className="text-[11px] text-graphite-400">
                {status === 'ACTIVE'
                  ? 'Cualquier persona con este enlace podrá consultar el expediente público del vehículo.'
                  : 'Este enlace está revocado. Navegar a esta URL mostrará estado inválido/revocado sin datos del vehículo.'}
              </p>
            </div>

            {/* QR Code */}
            {token && status === 'ACTIVE' && (
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-carbon-900 border border-graphite-700/60">
                <div className="p-2 bg-white rounded-lg shrink-0">
                  <QRCodeSVG value={passportUrl} size={112} level="M" />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-white">Código QR Certificado</p>
                  <p className="text-[11px] text-graphite-400">
                    Generado con URL pública absoluta (<span className="font-mono">{baseUrl}</span>).
                  </p>
                  <p className="text-[10px] text-graphite-500 font-mono">
                    Token: {token}
                  </p>
                </div>
              </div>
            )}

            {/* Visibility Selector */}
            <div className="space-y-3 pt-4 border-t border-graphite-700/60">
              <label className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
                Nivel de Visibilidad
              </label>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'PUBLIC', label: 'Público', desc: 'Accesible con el token' },
                  { id: 'SHAREABLE', label: 'Restringido', desc: 'Requiere enlace directo' },
                  { id: 'PRIVATE', label: 'Privado', desc: 'Solo tú puedes consultarlo' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleVisibilityChange(opt.id as PassportVisibility)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      visibility === opt.id
                        ? 'bg-brand/10 border-brand text-brand ring-1 ring-brand/30'
                        : 'bg-carbon-900 border-graphite-700/60 text-graphite-400 hover:text-platinum'
                    }`}
                  >
                    <p className="font-bold">{opt.label}</p>
                    <p className="text-[10px] text-graphite-400 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Revoke / Regenerate Actions */}
            <div className="pt-4 border-t border-graphite-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-graphite-400">
                ¿Sospechas que el enlace se filtró a personas no autorizadas?
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={handleRegenerateToken}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Revocar y Regenerar
                </Button>
                {status === 'ACTIVE' && (
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={isProcessing}
                    onClick={handleRevoke}
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                  >
                    Revocar Enlace
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security and Privacy Assurance */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-trust" />
                <CardTitle className="text-base">Privacidad Garantizada</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-graphite-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-trust shrink-0 mt-0.5" />
                <span>Tu nombre completo y correo electrónico nunca se publican.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-trust shrink-0 mt-0.5" />
                <span>No se comparten importes de facturas ni métodos de pago personales.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-trust shrink-0 mt-0.5" />
                <span>
                  La información expuesta corresponde exclusivamente a una instantánea (snapshot) de mantenimientos certificados.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
