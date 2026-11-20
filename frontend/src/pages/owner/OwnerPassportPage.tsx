import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  ExternalLink,
  Copy,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';

export const OwnerPassportPage: React.FC = () => {
  const { success } = useToast();
  const [visibility, setVisibility] = useState<'PUBLIC' | 'SHAREABLE' | 'PRIVATE'>('PUBLIC');
  const [token, setToken] = useState('engrain-px78912');
  const [copied, setCopied] = useState(false);

  const passportUrl = `${window.location.origin}/passport/${token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopied(true);
    success('Enlace copiado', 'Puedes enviar este enlace a cualquier interesado o comprador.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRegenerateToken = () => {
    const newToken = `engrain-${Math.random().toString(36).substring(2, 9)}`;
    setToken(newToken);
    success('Token renovado', 'El token anterior ha sido revocado por seguridad.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión del Pasaporte Digital"
        description="Configura la privacidad y comparte el expediente certificado de tu automóvil sin comprometer tus datos personales."
        actions={
          <Link to={`/passport/${token}`} target="_blank">
            <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Ver Vista Pública
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token & Link Generation */}
        <Card className="lg:col-span-2 border-brand/30">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-brand" />
              <CardTitle className="text-base text-white">Enlace de Verificación Activo</CardTitle>
            </div>
            <Badge variant="success" size="sm" dot>ACTIVO</Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
                Enlace Compartible para Compradores
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={passportUrl}
                  className="flex-1 bg-carbon-900 border border-graphite-700/80 rounded-xl px-4 py-2.5 text-xs font-mono text-platinum truncate select-all"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCopy}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              <p className="text-[11px] text-graphite-400">
                Cualquier persona con este enlace podrá consultar el score de confianza y el historial de servicios autorizados.
              </p>
            </div>

            {/* Visibility Selector */}
            <div className="space-y-3 pt-4 border-t border-graphite-700/60">
              <label className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
                Nivel de Visibilidad
              </label>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'PUBLIC', label: 'Público', desc: 'Accesible con el token' },
                  { id: 'SHAREABLE', label: 'Restringido', desc: 'Requiere aprobación previa' },
                  { id: 'PRIVATE', label: 'Privado', desc: 'Solo tú puedes consultarlo' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setVisibility(opt.id as any);
                      success('Visibilidad modificada', `El pasaporte ahora es ${opt.label}`);
                    }}
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

            {/* Revoke / Regenerate */}
            <div className="pt-4 border-t border-graphite-700/60 flex items-center justify-between">
              <span className="text-xs text-graphite-400">
                ¿Sospechas que el enlace se filtró a personas no autorizadas?
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRegenerateToken}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Revocar y Regenerar Token
              </Button>
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
                <span>La información expuesta corresponde exclusivamente a una instantánea (snapshot) autorizada.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
