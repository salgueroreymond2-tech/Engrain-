import React, { useState, useEffect } from 'react';
import { Car, Search, Plus, Gauge } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types/vehicle';
import { PageLoading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';

export const WorkshopVehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await vehicleService.getVehicles();
        setVehicles(data);
      } catch (err) {
        console.error('Error fetching vehicles', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vehículos en Taller"
        description="Expedientes de los automóviles atendidos e historial de kilometraje."
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

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Buscar por placa, VIN o modelo..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs font-mono text-graphite-400">
          {filtered.length} VEHÍCULOS REGISTRADOS
        </span>
      </div>

      {isLoading ? (
        <PageLoading message="Consultando inventario vehicular..." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehículo</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Número de Serie (VIN)</TableHead>
              <TableHead>Kilometraje</TableHead>
              <TableHead>Origen Datos</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-semibold text-white">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-carbon border border-graphite-600/50 flex items-center justify-center text-brand shrink-0">
                      <Car className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-platinum">{v.year} {v.make} {v.model}</p>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Registration Modal Simulation */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Recepción de Nuevo Vehículo"
        description="Registra la unidad para aperturar su expediente digital en ENGRAIN."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                success('Vehículo registrado', 'Se ha aperturado el expediente en taller.');
                setIsModalOpen(false);
              }}
            >
              Guardar Expediente
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="VIN (17 Caracteres)" placeholder="Ej. 3N1AB7AP6HY218940" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Placa" placeholder="Ej. ABC-1234" />
            <Input label="Año" placeholder="2023" type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Marca" placeholder="Ej. Toyota" />
            <Input label="Modelo" placeholder="Ej. RAV4" />
          </div>
          <Input label="Kilometraje Actual (km)" placeholder="Ej. 45000" type="number" />
        </div>
      </Modal>
    </div>
  );
};
