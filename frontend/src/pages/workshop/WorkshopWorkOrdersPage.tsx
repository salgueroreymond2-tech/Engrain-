import React, { useState, useEffect } from 'react';
import { Plus, Clock } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { workOrderService } from '../../services/workOrderService';
import { WorkOrder, WorkOrderStatus } from '../../types/workshop';
import { PageLoading } from '../../components/ui/Loading';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../hooks/useToast';

export const WorkshopWorkOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await workOrderService.getWorkOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching work orders', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const statusBadges: Record<WorkOrderStatus, React.ReactNode> = {
    IN_PROGRESS: <Badge variant="warning" size="sm" dot>EN CURSO</Badge>,
    COMPLETED: <Badge variant="success" size="sm" dot>COMPLETADA</Badge>,
    SCHEDULED: <Badge variant="default" size="sm" dot>PROGRAMADA</Badge>,
    DRAFT: <Badge variant="outline" size="sm">BORRADOR</Badge>,
    CANCELLED: <Badge variant="danger" size="sm">CANCELADA</Badge>,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes de Trabajo"
        description="Apertura, seguimiento y cierre de intervenciones mecánicas en bahía."
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nueva Orden
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-brand text-white shadow-sm'
                : 'bg-graphite-800 text-graphite-400 hover:text-platinum hover:bg-graphite-700'
            }`}
          >
            {st === 'ALL' && 'Todas las Órdenes'}
            {st === 'IN_PROGRESS' && 'En Curso'}
            {st === 'SCHEDULED' && 'Programadas'}
            {st === 'COMPLETED' && 'Finalizadas'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoading message="Cargando órdenes de trabajo..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((wo) => (
            <Card key={wo.id} className="hover:border-graphite-500 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-brand">{wo.id}</span>
                  <span className="text-graphite-500">•</span>
                  <CardTitle className="text-base truncate">{wo.title}</CardTitle>
                </div>
                {statusBadges[wo.status]}
              </CardHeader>
              <CardContent className="space-y-3">
                {wo.description && (
                  <p className="text-xs text-graphite-300 line-clamp-2">{wo.description}</p>
                )}
                <div className="pt-2 flex items-center justify-between text-xs text-graphite-400 border-t border-graphite-700/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {wo.openedAt
                      ? new Date(wo.openedAt).toLocaleDateString('es-MX')
                      : 'Sin fecha'}
                  </span>
                  <span className="font-mono text-[11px] text-graphite-400">
                    Vehículo: {wo.vehicleId}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Work Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Orden de Trabajo"
        description="Apertura una nueva orden de servicio técnico para un vehículo."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                success('Orden creada', 'La orden de trabajo fue registrada en estado En Curso.');
                setIsModalOpen(false);
              }}
            >
              Crear Orden
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Título de la Orden" placeholder="Ej. Afinación Mayor y Balatas Delanteras" />
          <Input label="ID de Vehículo o Placa" placeholder="Ej. veh-001 o NXY-4821" />
          <Textarea label="Descripción del Trabajo / Síntomas" placeholder="Detalle los trabajos a ejecutar e indicios del cliente..." />
        </div>
      </Modal>
    </div>
  );
};
