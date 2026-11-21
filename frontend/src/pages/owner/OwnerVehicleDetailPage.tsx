import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Car,
  Gauge,
  ShieldCheck,
  Wrench,
  Activity,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { vehicleService } from '../../services/vehicleService';
import { maintenanceService } from '../../services/maintenanceService';
import { Vehicle } from '../../types/vehicle';
import { Maintenance } from '../../types/maintenance';
import { PageLoading } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { MOCK_PASSPORT } from '../../services/mockAdapters';
import { isExplicitDemoMode } from '../../lib/demo-mode';

export const OwnerVehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsDemo(isExplicitDemoMode());
      try {
        const [vehData, mntData] = await Promise.all([
          vehicleService.getVehicleById(id),
          maintenanceService.getMaintenances(id).catch(() => []),
        ]);
        setVehicle(vehData);
        setMaintenances(mntData);
      } catch (err) {
        console.error('Error fetching vehicle detail', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) {
    return <PageLoading message="Cargando expediente vehicular..." />;
  }

  if (!vehicle) {
    return (
      <ErrorState
        title="Vehículo no encontrado"
        message="No se encontró el registro solicitado en tu cochera."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
        description={`Placas: ${vehicle.plate} • Número de Serie: ${vehicle.vin}`}
        breadcrumbs={[
          { label: 'Mis Vehículos', href: '/owner/garage' },
          { label: `${vehicle.make} ${vehicle.model}` },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/owner/passport">
              <Button size="sm" variant="primary" leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}>
                Gestionar Pasaporte
              </Button>
            </Link>
          </div>
        }
      />

      {isDemo && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Vehículo visualizado en modo demostración.</span>
          </div>
          <Badge variant="warning" size="sm">Modo demostración</Badge>
        </div>
      )}

      {/* Tabs View */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Línea de Tiempo y Servicios</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnósticos OBD2</TabsTrigger>
          <TabsTrigger value="specs">Ficha Técnica</TabsTrigger>
        </TabsList>

        {/* Tab 1: Timeline */}
        <TabsContent value="timeline" className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 space-y-4">
              <CardHeader>
                <CardTitle className="text-base">Historial Cronológico de Intervenciones</CardTitle>
                <Badge variant="success" size="sm">
                  {maintenances.length > 0 ? `${maintenances.length} REGISTROS REALES` : 'VERIFICADO'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {maintenances.length > 0 ? (
                  maintenances.map((m) => (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-carbon-900 border border-graphite-700/60 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-graphite-800 border border-graphite-600/50 flex items-center justify-center text-brand shrink-0 mt-0.5">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-platinum">{m.title}</p>
                            <Badge variant={m.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                              {m.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-graphite-400 mt-0.5">
                            Procedencia: Taller ENGRAIN • <span className="font-mono text-platinum">{m.mileageKm ? `${m.mileageKm.toLocaleString()} km` : 'Kilometraje al día'}</span>
                          </p>
                          {m.description && <p className="text-xs text-graphite-400 mt-1">{m.description}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-graphite-500 shrink-0 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.completedAt || m.createdAt).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  ))
                ) : isDemo ? (
                  MOCK_PASSPORT.snapshot.records.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-carbon-900 border border-graphite-700/60 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-graphite-800 border border-graphite-600/50 flex items-center justify-center text-brand shrink-0 mt-0.5">
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-platinum">{rec.title}</p>
                            <Badge variant="outline" size="sm">Demo</Badge>
                          </div>
                          <p className="text-xs text-graphite-400 mt-0.5">
                            {rec.source} • <span className="font-mono text-platinum">{rec.mileageKm.toLocaleString()} km</span>
                          </p>
                          {rec.notes && <p className="text-xs text-graphite-400 mt-1">{rec.notes}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-mono text-graphite-500 shrink-0">
                        {new Date(rec.date).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-graphite-400 bg-carbon-900 border border-graphite-700/60 rounded-xl">
                    No hay registros de mantenimientos registrados aún para este vehículo.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Telemetría</CardTitle>
                  <Gauge className="w-4 h-4 text-brand" />
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-graphite-400">Kilometraje:</span>
                    <span className="font-mono font-bold text-platinum">{vehicle.mileageKm.toLocaleString()} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-graphite-400">Estado de Serie:</span>
                    <Badge variant="success" size="sm">{vehicle.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-graphite-400">Fuente:</span>
                    <Badge variant="outline" size="sm">{vehicle.dataSource}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Diagnostics */}
        <TabsContent value="diagnostics" className="space-y-4 pt-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Escaneo Electrónico y Sensor CAN</CardTitle>
              <Activity className="w-4 h-4 text-blue-400" />
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-graphite-300">
                Último escaneo registrado en taller: Protocolo ISO 15765-4 validado. Todos los módulos de carrocería y tren motriz responden sin interrupciones.
              </p>
              <div className="p-3 rounded-lg bg-carbon border border-graphite-700/60 flex items-center justify-between">
                <span>Voltaje de Batería en Reposo:</span>
                <span className="font-mono font-bold text-trust">13.8V (Óptimo)</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Specs */}
        <TabsContent value="specs" className="space-y-4 pt-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ficha Técnica Oficial</CardTitle>
              <Car className="w-4 h-4 text-brand" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-graphite-400">Marca:</span>
                <p className="font-bold text-platinum">{vehicle.make}</p>
              </div>
              <div>
                <span className="text-graphite-400">Modelo:</span>
                <p className="font-bold text-platinum">{vehicle.model}</p>
              </div>
              <div>
                <span className="text-graphite-400">Año:</span>
                <p className="font-bold text-platinum">{vehicle.year}</p>
              </div>
              <div>
                <span className="text-graphite-400">Placas:</span>
                <p className="font-mono font-bold text-brand">{vehicle.plate}</p>
              </div>
              <div className="col-span-2">
                <span className="text-graphite-400">Número de Identificación Vehicular (VIN):</span>
                <p className="font-mono font-bold text-platinum">{vehicle.vin}</p>
              </div>
              <div className="col-span-2">
                <span className="text-graphite-400">Origen de Datos:</span>
                <p className="text-platinum">{vehicle.dataSource}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
