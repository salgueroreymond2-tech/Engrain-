import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Wrench,
  Car,
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-trust/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-graphite-800/80 border border-brand/30 text-xs text-platinum shadow-orange-glow backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono text-brand font-bold uppercase tracking-wider">
              ENGRAIN MVP
            </span>
            <span className="text-graphite-400">|</span>
            <span className="text-graphite-300">Ecosistema Digital de Confianza Vehicular</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-display tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            Historial vehicular verificable.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-orange-400 to-amber-200">
              Cero incertidumbre.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-graphite-300 max-w-2xl mx-auto leading-relaxed">
            Unimos a propietarios, talleres certificados y compradores en una sola línea de tiempo inmutable con diagnósticos OBD2, órdenes de trabajo y pasaporte digital transferible.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Crear Expediente Gratis
              </Button>
            </Link>
            <Link to="/passport/engrain-px78912">
              <Button size="lg" variant="outline" leftIcon={<ShieldCheck className="w-4 h-4 text-brand" />}>
                Explorar Pasaporte Demo
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'Score de Confianza', value: '94/100', detail: 'Algoritmo Multifuente' },
              { label: 'Eventos Verificados', value: '100%', detail: 'Respaldados con Evidencias' },
              { label: 'Lectura OBD2', value: 'ISO 15765-4', detail: 'Protocolo CAN Bus' },
              { label: 'Protección de Privacidad', value: 'Zero-Leak', detail: 'Snapshot Cifrado' },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-graphite-800/40 border border-graphite-700/50 backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black font-display text-white">{stat.value}</p>
                <p className="text-xs font-semibold text-brand mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-graphite-400 mt-1">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Core Modules Section */}
      <section id="modulos" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="warning" size="md">ARQUITECTURA DE PRODUCTO</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Cinco módulos interconectados
          </h2>
          <p className="text-sm text-graphite-400">
            Cada pilar resuelve una brecha crítica en el ciclo de vida del automóvil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Workshop */}
          <Card className="hover:border-brand/40 transition-colors">
            <CardContent className="space-y-4 pt-4">
              <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/30 text-brand flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-platinum">Engrain Workshop</h3>
                <p className="text-xs text-brand font-mono font-semibold mt-0.5">ADMINISTRACIÓN DE TALLERES</p>
              </div>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Recepción de vehículos, creación de órdenes de trabajo, control de mantenimientos e insumos con carga directa de evidencias certificadas.
              </p>
              <div className="pt-2 flex items-center text-xs text-brand font-semibold">
                <Link to="/workshop" className="inline-flex items-center gap-1 hover:underline">
                  Abrir portal de taller <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 2. Owner */}
          <Card className="hover:border-brand/40 transition-colors">
            <CardContent className="space-y-4 pt-4">
              <div className="w-12 h-12 rounded-xl bg-trust/10 border border-trust/30 text-trust flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-platinum">Engrain Owner</h3>
                <p className="text-xs text-trust font-mono font-semibold mt-0.5">APLICACIÓN PROPIETARIO</p>
              </div>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Control absoluto del vehículo: alertas de servicios preventivos, historial acumulado de kilometraje y gestión de permisos de acceso.
              </p>
              <div className="pt-2 flex items-center text-xs text-trust font-semibold">
                <Link to="/owner" className="inline-flex items-center gap-1 hover:underline">
                  Ver cochera digital <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 3. Connect */}
          <Card className="hover:border-brand/40 transition-colors">
            <CardContent className="space-y-4 pt-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-platinum">Engrain Connect</h3>
                <p className="text-xs text-blue-400 font-mono font-semibold mt-0.5">DIAGNÓSTICOS OBD2</p>
              </div>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Lectura de telemetría por adaptador OBD2, interpretación de códigos DTC (falla de motor, frenos, sensores) y registro en línea de tiempo.
              </p>
              <div className="pt-2 flex items-center text-xs text-blue-400 font-semibold">
                <Link to="/owner/diagnostics" className="inline-flex items-center gap-1 hover:underline">
                  Ver escaneo telemático <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 4. Passport */}
          <Card className="hover:border-brand/40 transition-colors border-brand/40 bg-gradient-to-br from-graphite-800 to-carbon">
            <CardContent className="space-y-4 pt-4">
              <div className="w-12 h-12 rounded-xl bg-brand text-white flex items-center justify-center shadow-orange-glow">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold font-display text-platinum">Engrain Passport</h3>
                  <Badge variant="warning" size="sm">ESTRELLA MVP</Badge>
                </div>
                <p className="text-xs text-brand font-mono font-semibold mt-0.5">HISTORIAL COMPARTIBLE</p>
              </div>
              <p className="text-xs text-graphite-400 leading-relaxed">
                El diferenciador principal: pasaporte digital vehicular que un comprador consulta bajo token autorizado. Sin exponer datos sensibles del dueño.
              </p>
              <div className="pt-2 flex items-center text-xs text-brand font-semibold">
                <Link to="/passport/engrain-px78912" className="inline-flex items-center gap-1 hover:underline">
                  Probar pasaporte en vivo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 5. AI */}
          <Card className="hover:border-brand/40 transition-colors">
            <CardContent className="space-y-4 pt-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-platinum">Engrain AI</h3>
                <p className="text-xs text-purple-400 font-mono font-semibold mt-0.5">ASISTENTE INTELIGENTE</p>
              </div>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Explicación contextual en lenguaje simple de fallas mecánicas complejas, análisis de costos potenciales y recomendaciones de seguridad.
              </p>
              <div className="pt-2 flex items-center text-xs text-purple-400 font-semibold">
                <span className="text-graphite-400">Integrado en dashboards</span>
              </div>
            </CardContent>
          </Card>

          {/* 6. Protocol & API */}
          <Card className="bg-graphite-800/30 border-dashed border-graphite-700">
            <CardContent className="space-y-4 pt-4">
              <div className="w-12 h-12 rounded-xl bg-graphite-700/60 text-graphite-300 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-platinum">Arquitectura Abierta</h3>
                <p className="text-xs text-graphite-400 font-mono font-semibold mt-0.5">CONTRATO REST v1</p>
              </div>
              <p className="text-xs text-graphite-400 leading-relaxed">
                Diseñado para integrarse con agencias, aseguradoras y flotillas automotrices con interoperabilidad TypeScript y validación Zod.
              </p>
              <div className="pt-2 flex items-center text-xs text-graphite-300">
                <span className="font-mono text-[11px]">API Contract v1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feature Focus: The Digital Passport */}
      <section id="pasaporte" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-carbon-900 via-graphite-800 to-carbon border border-graphite-700/80 p-8 sm:p-12 relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <Badge variant="warning" size="md">EL DIFERENCIADOR DE MERCADO</Badge>
            <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
              ¿Vas a comprar un auto usado? Pide su Pasaporte Engrain.
            </h2>
            <p className="text-sm sm:text-base text-graphite-300 leading-relaxed">
              Evita estafas con odómetros alterados, siniestros ocultos o códigos de falla borrados antes de la venta. El Pasaporte Digital muestra una fotografía verificada generada directamente desde el taller y el puerto OBD2.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-platinum">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-trust shrink-0" />
                Historial cronológico con fechas ISO y sellos de taller registrado.
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-trust shrink-0" />
                Validación de kilometraje sin saltos temporales sospechosos.
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-trust shrink-0" />
                Protección estricta de datos personales bajo consentimiento.
              </li>
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/passport/engrain-px78912">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Ver Pasaporte en Acción
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Registrar mi Auto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
