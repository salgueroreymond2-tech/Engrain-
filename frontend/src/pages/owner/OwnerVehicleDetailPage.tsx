import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Car,
  Gauge,
  ShieldCheck,
  Wrench,
  Activity,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types/vehicle';
import { PageLoading } from '../../components/ui/Loading';
import { ErrorState } from '../../components/ui/ErrorState';
import { MOCK_PASSPORT } from '../../services/mockAdapters';

export const OwnerVehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const data = await vehicleService.getVehicleById(id);
        setVehicle(data);
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
                <Badge variant="success" size="sm">100% VERIFICADO</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_PASSPORT.snapshot.records.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-carbon-900 border border-graphite-700/60 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-graphite-800 border border-graphite-600/50 flex items-center justify-center text-brand shrink-0 mt-0.5">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-platinum">{rec.title}</p>
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
                ))}
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
                    <Badge variant="success" size="sm">ACTIVO</Badge>
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
              <CardTitle className="text-base">Ficha Técnica Identificativa</CardTitle>
              <Car className="w-4 h-4 text-graphite-400" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-graphite-400 block">Marca:</span>
                  <span className="font-bold text-platinum">{vehicle.make}</span>
                </div>
                <div>
                  <span className="text-graphite-400 block">Modelo:</span>
                  <span className="font-bold text-platinum">{vehicle.model}</span>
                </div>
                <div>
                  <span className="text-graphite-400 block">Año:</span>
                  <span className="font-bold text-platinum">{vehicle.year}</span>
                </div>
                <div>
                  <span className="text-graphite-400 block">Número de Serie (VIN):</span>
                  <span className="font-mono font-bold text-platinum">{vehicle.vin}</span>
                </div>
                <div>
                  <span className="text-graphite-400 block">Placas:</span>
                  <span className="font-mono font-bold text-brand">{vehicle.plate}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
