import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Gauge, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types/vehicle';
import { PageLoading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';

export const OwnerGaragePage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
      } catch (err) {
        console.error('Error fetching owner vehicles', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis Vehículos Registrados"
        description="Administra los expedientes y dispositivos telemáticos de tu flota personal."
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Registrar Vehículo
          </Button>
        }
      />

      {isLoading ? (
        <PageLoading message="Cargando tu garaje digital..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <Card key={v.id} className="hover:border-brand/40 transition-all flex flex-col justify-between">
              <div>
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-carbon border border-graphite-600/50 flex items-center justify-center text-brand shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-white">
                        {v.year} {v.make}
                      </CardTitle>
                      <p className="text-xs text-graphite-300 font-semibold">{v.model}</p>
                    </div>
                  </div>
                  <Badge variant={v.status === 'ACTIVE' ? 'success' : 'default'} size="sm" dot>
                    {v.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-graphite-400">Placas:</span>
                      <span className="font-mono font-bold text-brand">{v.plate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-graphite-400">Kilometraje:</span>
                      <span className="font-mono font-bold text-platinum flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-graphite-500" />
                        {v.mileageKm.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-graphite-400">Fuente:</span>
                      <Badge variant="outline" size="sm">{v.dataSource}</Badge>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-graphite-700/40 mt-4">
                <Link to="/owner/passport" className="text-xs text-brand font-semibold hover:underline inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Pasaporte
                </Link>
                <Link to={`/owner/vehicles/${v.id}`}>
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Expediente
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Register Vehicle Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Vincular Vehículo a tu Cochera"
        description="Ingresa el número de serie y placas del automóvil para iniciar la trazabilidad."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                success('Vehículo añadido', 'Se ha guardado en tu cochera digital.');
                setIsModalOpen(false);
              }}
            >
              Registrar Auto
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="VIN (17 Caracteres)" placeholder="Ej. 1HGCR2F83HA019482" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Placas" placeholder="PAZ-1102" />
            <Input label="Año" placeholder="2022" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca" placeholder="Honda" />
            <Input label="Modelo" placeholder="Accord" />
          </div>
          <Input label="Kilometraje Actual (km)" placeholder="78000" type="number" />
        </div>
      </Modal>
    </div>
  );
};
