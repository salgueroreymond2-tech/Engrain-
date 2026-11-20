import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ShieldCheck,
  Wrench,
  Activity,
  Plus,
  ArrowRight,
  Gauge,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MOCK_VEHICLES } from '../../services/mockAdapters';

export const OwnerOverviewPage: React.FC = () => {
  const primaryVehicle = MOCK_VEHICLES[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Cochera Digital"
        description="Supervisión en tiempo real de tus vehículos, servicios preventivos y pasaporte de confianza."
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/owner/garage">
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Agregar Vehículo
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Vehículos en Garaje"
          value={MOCK_VEHICLES.length}
          icon={<Car className="w-5 h-5" />}
          subtitle="Registrados y custodiados"
        />
        <StatCard
          title="Score de Confianza"
          value="94/100"
          icon={<ShieldCheck className="w-5 h-5" />}
          trend={{ value: 'Excelente', isPositive: true }}
          subtitle="Mazda CX-5 Signature"
        />
        <StatCard
          title="Próximo Servicio"
          value="en 3,800 km"
          icon={<Wrench className="w-5 h-5" />}
          subtitle="Rotación y alineación"
        />
        <StatCard
          title="Diagnóstico OBD2"
          value="Saludable"
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: '0 DTCs graves', isPositive: true }}
          subtitle="Sensor CAN actualizado"
        />
      </div>

      {/* Featured Vehicle & Quick Access to Passport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Vehicle Card */}
        <Card className="lg:col-span-2 border-brand/30">
          <CardHeader>
            <div>
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-xl text-white">
                  {primaryVehicle.year} {primaryVehicle.make} {primaryVehicle.model}
                </CardTitle>
                <Badge variant="warning" size="sm">PRINCIPAL</Badge>
              </div>
              <p className="text-xs text-brand font-mono font-bold mt-1">
                PLACA: {primaryVehicle.plate} • VIN: {primaryVehicle.vin}
              </p>
            </div>
            <Link to={`/owner/vehicles/${primaryVehicle.id}`}>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Ver expediente
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-carbon border border-graphite-700/60">
                <span className="text-[10px] font-mono text-graphite-400 uppercase">Kilometraje Certificado</span>
                <p className="text-base font-bold text-platinum mt-1 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-brand" />
                  {primaryVehicle.mileageKm.toLocaleString()} km
                </p>
              </div>
              <div className="p-3 rounded-xl bg-carbon border border-graphite-700/60">
                <span className="text-[10px] font-mono text-graphite-400 uppercase">Origen de Datos</span>
                <p className="text-base font-bold text-trust mt-1">
                  {primaryVehicle.dataSource} Directo
                </p>
              </div>
              <div className="p-3 rounded-xl bg-carbon border border-graphite-700/60 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-graphite-400 uppercase">Pasaporte Digital</span>
                <div className="mt-1">
                  <Link to="/owner/passport" className="text-xs text-brand font-bold hover:underline inline-flex items-center gap-1">
                    Activo y Compartible <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-carbon-900 border border-graphite-700/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-platinum">Recomendación ENGRAIN AI</p>
                  <p className="text-[11px] text-graphite-400">
                    Tu vehículo tiene buen rendimiento de combustible y el sistema catalítico opera dentro de tolerancias.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passport Quick Promotion */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-carbon via-graphite-800 to-carbon border-brand/40">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand" />
                <CardTitle className="text-base text-white">Pasaporte Compartible</CardTitle>
              </div>
              <Badge variant="success" size="sm">TOKEN ACTIVO</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-graphite-300 leading-relaxed">
                ¿Vas a vender o rentar tu automóvil? Comparte el enlace público verificado. Tus datos privados nunca se revelarán.
              </p>
              <div className="p-2.5 rounded-lg bg-carbon border border-graphite-700/60 font-mono text-[11px] text-brand truncate">
                engrain.io/passport/engrain-px78912
              </div>
              <Link to="/owner/passport" className="block w-full">
                <Button size="sm" variant="primary" className="w-full text-xs">
                  Gestionar Privacidad del Pasaporte
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
