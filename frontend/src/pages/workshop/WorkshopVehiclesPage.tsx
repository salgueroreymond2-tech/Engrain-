import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Search,
  Plus,
  Gauge,
  Lock,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Modal } from '../../components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { vehicleService } from '../../services/vehicleService';
import { workOrderService } from '../../services/workOrderService';
import { Vehicle } from '../../types/vehicle';
import { WorkOrder } from '../../types/workshop';
import { PageLoading } from '../../components/ui/Loading';
import { useToast } from '../../hooks/useToast';

// Reception Form Schema with Zod strictly validating vehicle contract specifications
const vehicleReceptionSchema = z.object({
  vin: z
    .string()
    .length(17, 'El VIN debe tener exactamente 17 caracteres alfanuméricos')
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Formato VIN estándar no válido (no admite I, O ni Q)'),
  plate: z.string().min(3, 'Ingresa una placa válida').max(10, 'Placa demasiado larga'),
  make: z.string().min(2, 'La marca es obligatoria'),
  model: z.string().min(1, 'El modelo es obligatorio'),
  year: z
    .number({ invalid_type_error: 'Año inválido' })
    .min(1980, 'Año mínimo 1980')
    .max(2027, 'Año máximo 2027'),
  mileageKm: z
    .number({ invalid_type_error: 'Kilometraje numérico requerido' })
    .min(0, 'El kilometraje no puede ser negativo')
    .max(1000000, 'Kilometraje excede rango'),
  reason: z.string().min(5, 'Especifica el motivo de ingreso o síntoma del cliente'),
  fuelLevel: z.string().optional(),
});

type VehicleReceptionFormData = z.infer<typeof vehicleReceptionSchema>;

export const WorkshopVehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  
  // Modal states
  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleReceptionFormData>({
    resolver: zodResolver(vehicleReceptionSchema),
    defaultValues: {
      vin: '',
      plate: '',
      make: '',
      model: '',
      year: 2022,
      mileageKm: 45000,
      reason: '',
      fuelLevel: '1/2',
    },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [veh, wo] = await Promise.all([
          vehicleService.getVehicles(),
          workOrderService.getWorkOrders(),
        ]);
        setVehicles(veh);
        setWorkOrders(wo);
      } catch (err) {
        console.error('Error fetching vehicles', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleReceptionSubmit = async (data: VehicleReceptionFormData) => {
    try {
      // 1. Create/register vehicle in system
      const newVeh = await vehicleService.createVehicle({
        vin: data.vin.toUpperCase(),
        plate: data.plate.toUpperCase(),
        make: data.make,
        model: data.model,
        year: Number(data.year),
        mileageKm: Number(data.mileageKm),
        dataSource: 'WORKSHOP',
      });

      // 2. Open initial work order for this reception
      await workOrderService.createWorkOrder({
        vehicleId: newVeh.id,
        title: `Recepción: ${data.reason.slice(0, 40)}`,
        description: `Motivo: ${data.reason}. Nivel de combustible: ${data.fuelLevel || 'No especificado'}.`,
        receptionMileageKm: Number(data.mileageKm),
        status: 'IN_PROGRESS',
        workflowStep: 1,
      });

      setVehicles([newVeh, ...vehicles]);
      success('Vehículo recibido con éxito', `Se ha generado el expediente para ${newVeh.make} ${newVeh.model}`);
      reset();
      setIsReceptionModalOpen(false);
    } catch (err: any) {
      toastError('Error al registrar vehículo', err.message || 'No fue posible guardar la recepción.');
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = sourceFilter === 'ALL' || v.dataSource === sourceFilter;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parque Vehicular del Taller"
        description="Expedientes de las unidades recibidas, trazabilidad de odómetro e historial de intervenciones."
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsReceptionModalOpen(true)}
          >
            Recepción de Vehículo
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Buscar por placa, VIN o modelo..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['ALL', 'OBD2', 'WORKSHOP', 'MANUAL'].map((src) => (
            <button
              key={src}
              onClick={() => setSourceFilter(src)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                sourceFilter === src
                  ? 'bg-brand text-white'
                  : 'bg-graphite-800 text-graphite-400 hover:text-platinum hover:bg-graphite-700'
              }`}
            >
              {src === 'ALL' && 'Todos los Orígenes'}
              {src === 'OBD2' && 'Telemática OBD2'}
              {src === 'WORKSHOP' && 'Taller Certificado'}
              {src === 'MANUAL' && 'Registro Manual'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="Consultando inventario vehicular..." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehículo / Modelo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Número de Serie (VIN)</TableHead>
              <TableHead>Odómetro</TableHead>
              <TableHead>Procedencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.map((v) => {
              const ordersCount = workOrders.filter((wo) => wo.vehicleId === v.id).length;
              return (
                <TableRow key={v.id}>
                  <TableCell className="font-semibold text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-carbon border border-graphite-600/50 flex items-center justify-center text-brand shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-platinum">{v.year} {v.make} {v.model}</p>
                        <p className="text-[11px] text-graphite-400 font-mono">
                          {ordersCount} órdenes registradas
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-graphite-800 border border-graphite-600/60 text-brand">
                      {v.plate}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-graphite-300">
                    {v.vin}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-platinum font-semibold flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-graphite-400" />
                      {v.mileageKm.toLocaleString()} km
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.dataSource === 'OBD2' ? 'warning' : 'default'} size="sm">
                      {v.dataSource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={v.status === 'ACTIVE' ? 'success' : 'default'} size="sm" dot>
                      {v.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedVehicleForDetail(v)}
                        className="text-xs"
                      >
                        Ficha Técnica
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/workshop/work-orders?vehicleId=${v.id}`)}
                        className="text-xs"
                      >
                        Órdenes
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* MODAL 1: Recepción de Vehículo con Validación Zod */}
      <Modal
        isOpen={isReceptionModalOpen}
        onClose={() => setIsReceptionModalOpen(false)}
        title="Protocolo de Recepción Vehicular"
        description="Apertura formal de expediente para ingreso a bahía de servicio y diagnóstico inicial."
        size="lg"
      >
        <form onSubmit={handleSubmit(handleReceptionSubmit)} className="space-y-4">
          <Input
            label="Número de Serie (VIN - 17 Caracteres)"
            placeholder="Ej. 3N1AB7AP6HY218940"
            error={errors.vin?.message}
            {...register('vin')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Placa de Circulación"
              placeholder="Ej. NXY-4821"
              error={errors.plate?.message}
              {...register('plate')}
            />
            <Input
              label="Año del Modelo"
              type="number"
              placeholder="2022"
              error={errors.year?.message}
              {...register('year', { valueAsNumber: true })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Marca"
              placeholder="Ej. Mazda, Toyota, Honda..."
              error={errors.make?.message}
              {...register('make')}
            />
            <Input
              label="Modelo / Versión"
              placeholder="Ej. CX-5 Signature 2.5T"
              error={errors.model?.message}
              {...register('model')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kilometraje Actual al Ingreso (km)"
              type="number"
              placeholder="Ej. 46200"
              error={errors.mileageKm?.message}
              {...register('mileageKm', { valueAsNumber: true })}
            />
            <Input
              label="Nivel de Combustible"
              placeholder="Ej. 1/4, 1/2, Lleno"
              {...register('fuelLevel')}
            />
          </div>

          <Textarea
            label="Motivo de Visita / Síntomas Reportados por el Propietario"
            placeholder="Detalla ruidos, testigos encendidos, mantenimientos preventivos solicitados o incidentes previos..."
            rows={3}
            error={errors.reason?.message}
            {...register('reason')}
          />

          <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60 text-xs text-graphite-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-trust shrink-0 mt-0.5" />
            <span>
              La recepción generará una orden de trabajo en estado <strong>EN CURSO</strong> vinculada a este taller y respaldará el kilometraje inicial en el expediente.
            </span>
          </div>

          <div className="pt-3 border-t border-graphite-700/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsReceptionModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Completar Recepción
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Ficha Técnica & Historial de Visitas al Taller */}
      {selectedVehicleForDetail && (
        <Modal
          isOpen={!!selectedVehicleForDetail}
          onClose={() => setSelectedVehicleForDetail(null)}
          title={`Ficha Técnica — ${selectedVehicleForDetail.year} ${selectedVehicleForDetail.make} ${selectedVehicleForDetail.model}`}
          description={`Expediente digital certificado bajo el protocolo ENGRAIN.`}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-graphite-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-trust" />
                Los registros finalizados están blindados contra alteración.
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const vehId = selectedVehicleForDetail.id;
                  setSelectedVehicleForDetail(null);
                  navigate(`/workshop/work-orders?vehicleId=${vehId}`);
                }}
              >
                Aperturar Nueva Orden
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Identity Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60">
                <span className="text-[10px] font-mono text-graphite-400 uppercase">Placa</span>
                <p className="text-sm font-mono font-bold text-brand mt-0.5">{selectedVehicleForDetail.plate}</p>
              </div>
              <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60">
                <span className="text-[10px] font-mono text-graphite-400 uppercase">Odómetro Certificado</span>
                <p className="text-sm font-mono font-bold text-platinum mt-0.5">
                  {selectedVehicleForDetail.mileageKm.toLocaleString()} km
                </p>
              </div>
              <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60 col-span-2">
                <span className="text-[10px] font-mono text-graphite-400 uppercase">VIN (Serie)</span>
                <p className="text-xs font-mono font-bold text-platinum mt-0.5 truncate">{selectedVehicleForDetail.vin}</p>
              </div>
            </div>

            {/* Visit History for this vehicle */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-graphite-400 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-brand" />
                Historial de Visitas a este Taller ({workOrders.filter((wo) => wo.vehicleId === selectedVehicleForDetail.id).length})
              </h4>

              {workOrders.filter((wo) => wo.vehicleId === selectedVehicleForDetail.id).length > 0 ? (
                <div className="space-y-2">
                  {workOrders
                    .filter((wo) => wo.vehicleId === selectedVehicleForDetail.id)
                    .map((wo) => (
                      <div
                        key={wo.id}
                        className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-brand">{wo.id}</span>
                            <span className="text-platinum font-semibold">{wo.title}</span>
                          </div>
                          <p className="text-graphite-400">
                            Atendido por: <strong className="text-graphite-300">{wo.technicianName || 'Técnico Especialista'}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={wo.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                            {wo.status}
                          </Badge>
                          {wo.status === 'COMPLETED' && (
                            <span title="Registro protegido"><Lock className="w-3.5 h-3.5 text-trust" /></span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-graphite-400 p-4 rounded-xl bg-carbon-900 text-center">
                  Primera visita registrada para este vehículo en las instalaciones.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
