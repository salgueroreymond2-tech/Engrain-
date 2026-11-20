import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  Info,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { workOrderService } from '../../services/workOrderService';
import { vehicleService } from '../../services/vehicleService';
import { maintenanceService } from '../../services/maintenanceService';
import { evidenceService } from '../../services/evidenceService';
import { WorkOrder, WorkOrderStatus, WorkOrderItem } from '../../types/workshop';
import { Vehicle } from '../../types/vehicle';
import { EvidenceItem } from '../../types/evidence';
import { PageLoading } from '../../components/ui/Loading';
import { useToast } from '../../hooks/useToast';
import { MOCK_WORKSHOP_MEMBERS } from '../../services/mockAdapters';

const STEPS = [
  { id: 1, name: 'Recepción' },
  { id: 2, name: 'Diagnóstico' },
  { id: 3, name: 'Presupuesto' },
  { id: 4, name: 'Aprobación' },
  { id: 5, name: 'Ejecución' },
  { id: 6, name: 'Evidencias' },
  { id: 7, name: 'Finalización' },
];

export const WorkshopWorkOrdersPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { success, warning, error: toastError } = useToast();

  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Detail Modal & Step Workflow states
  const [activeOrder, setActiveOrder] = useState<WorkOrder | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Work Order Form states
  const [newVehicleId, setNewVehicleId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMileage, setNewMileage] = useState(45000);
  const [newTechnician, setNewTechnician] = useState('mem-001');

  // Evidence upload simulator states
  const [evidenceCategory, setEvidenceCategory] = useState<'BEFORE' | 'AFTER' | 'INVOICE' | 'DOCUMENT'>('BEFORE');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  // New Item / Budget procedure states
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemType, setNewItemType] = useState<'PROCEDURE' | 'PART' | 'DIAGNOSTIC' | 'SUPPLY'>('PROCEDURE');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(500);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ord, veh] = await Promise.all([
          workOrderService.getWorkOrders(),
          vehicleService.getVehicles(),
        ]);
        setOrders(ord);
        setVehicles(veh);

        // Check if query param specifies an order id
        const queryOrderId = searchParams.get('id');
        if (queryOrderId) {
          const found = ord.find((o) => o.id === queryOrderId);
          if (found) {
            setActiveOrder(found);
            setCurrentStep(found.workflowStep || 1);
          }
        }
      } catch (err) {
        console.error('Error fetching work orders', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [searchParams]);

  const handleOpenDetail = (order: WorkOrder) => {
    setActiveOrder(order);
    setCurrentStep(order.workflowStep || 1);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleId || !newTitle) {
      warning('Campos requeridos', 'Selecciona un vehículo e ingresa un título de servicio.');
      return;
    }

    try {
      const techMember = MOCK_WORKSHOP_MEMBERS.find((m) => m.id === newTechnician);
      const created = await workOrderService.createWorkOrder({
        vehicleId: newVehicleId,
        title: newTitle,
        description: newDescription,
        receptionMileageKm: Number(newMileage),
        technicianId: newTechnician,
        technicianName: techMember?.name || 'Ing. Roberto Sánchez',
        status: 'IN_PROGRESS',
        workflowStep: 1,
      });

      setOrders([created, ...orders]);
      success('Orden creada exitosamente', `Orden ${created.id} abierta para intervención.`);
      setIsCreateModalOpen(false);
      setActiveOrder(created);
      setCurrentStep(1);
    } catch (err: any) {
      toastError('Error al crear orden', err.message);
    }
  };

  // Step 3: Add item to budget
  const handleAddItemToBudget = async () => {
    if (!activeOrder || !newItemDesc) return;
    const itemTotal = newItemQty * newItemPrice;
    const newItem: WorkOrderItem = {
      id: `item-${Date.now()}`,
      type: newItemType,
      description: newItemDesc,
      quantity: newItemQty,
      unitPrice: newItemPrice,
      totalPrice: itemTotal,
      completed: false,
    };

    const currentItems = activeOrder.items || [];
    const updatedItems = [...currentItems, newItem];
    const subtotal = updatedItems.reduce((acc, it) => acc + it.totalPrice, 0);
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    const updated = await workOrderService.updateWorkOrder(activeOrder.id, {
      items: updatedItems,
      budget: {
        subtotal,
        tax,
        total,
        status: activeOrder.budget?.status || 'PENDING_APPROVAL',
      },
    });

    if (updated) {
      setActiveOrder(updated);
      setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
      setNewItemDesc('');
      success('Procedimiento agregado', 'El presupuesto ha sido actualizado.');
    }
  };

  // Step 4: Toggle client approval (Simulated / Contract demo)
  const handleToggleApproval = async (status: 'APPROVED' | 'REJECTED') => {
    if (!activeOrder) return;
    const updated = await workOrderService.updateWorkOrder(activeOrder.id, {
      budget: {
        ...(activeOrder.budget || { subtotal: 0, tax: 0, total: 0 }),
        status,
        approvedAt: new Date().toISOString(),
        approvedBy: status === 'APPROVED' ? 'Confirmación digital del Propietario (Demo)' : undefined,
      },
      workflowStep: status === 'APPROVED' ? 5 : 4,
    });
    if (updated) {
      setActiveOrder(updated);
      setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
      if (status === 'APPROVED') {
        success('Presupuesto aprobado', 'La orden avanza automáticamente a la etapa de Ejecución.');
        setCurrentStep(5);
      } else {
        warning('Presupuesto rechazado', 'Se notificó al propietario para revisión de costos.');
      }
    }
  };

  // Step 5: Toggle procedure completion in execution checklist
  const handleToggleProcedureCompletion = async (itemId: string) => {
    if (!activeOrder || !activeOrder.items) return;
    const updatedItems = activeOrder.items.map((it) =>
      it.id === itemId ? { ...it, completed: !it.completed } : it
    );
    const updated = await workOrderService.updateWorkOrder(activeOrder.id, {
      items: updatedItems,
    });
    if (updated) {
      setActiveOrder(updated);
      setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
    }
  };

  // Step 6: Evidence upload handling
  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !evidenceFile) {
      warning('Selecciona un archivo', 'Elige una fotografía o documento en formato JPG, PNG o PDF.');
      return;
    }

    // Size limit check (< 10MB)
    if (evidenceFile.size > 10 * 1024 * 1024) {
      toastError('Archivo demasiado pesado', 'El tamaño máximo permitido es 10 MB.');
      return;
    }

    setIsUploadingEvidence(true);
    try {
      const registered = await evidenceService.registerEvidence({
        workOrderId: activeOrder.id,
        type: evidenceFile.type.includes('pdf') ? 'PDF' : 'IMAGE',
        category: evidenceCategory,
        fileName: evidenceFile.name,
        mimeType: evidenceFile.type,
        sizeBytes: evidenceFile.size,
        previewUrl: URL.createObjectURL(evidenceFile),
        notes: evidenceNotes,
      });

      const updatedEvidences = [...(activeOrder.evidences || []), registered];
      const updated = await workOrderService.updateWorkOrder(activeOrder.id, {
        evidences: updatedEvidences,
      });

      if (updated) {
        setActiveOrder(updated);
        setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
        setEvidenceFile(null);
        setEvidenceNotes('');
        success('Evidencia registrada', 'El archivo se integró a la bitácora técnica de la orden.');
      }
    } catch (err: any) {
      toastError('Error al subir evidencia', err.message);
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  // Step 7: Finalize work order & seal into vehicle timeline
  const handleFinalizeWorkOrder = async () => {
    if (!activeOrder) return;
    try {
      const updated = await workOrderService.updateWorkOrder(activeOrder.id, {
        status: 'COMPLETED',
        workflowStep: 7,
        closedAt: new Date().toISOString(),
      });

      // Create permanent certified maintenance in history
      await maintenanceService.createMaintenance({
        vehicleId: activeOrder.vehicleId,
        status: 'COMPLETED',
        title: activeOrder.title,
        description: `${activeOrder.description || ''} • Intervención técnica finalizada en Precision Motors.`,
        completedAt: new Date().toISOString(),
        mileageKm: activeOrder.receptionMileageKm || 46200,
      });

      if (updated) {
        setActiveOrder(updated);
        setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
        success('Orden Finalizada y Sellada', 'El mantenimiento fue incorporado con éxito al historial digital.');
      }
    } catch (err: any) {
      toastError('Error al finalizar orden', err.message);
    }
  };

  const statusBadges: Record<WorkOrderStatus, React.ReactNode> = {
    IN_PROGRESS: <Badge variant="warning" size="sm" dot>EN CURSO</Badge>,
    COMPLETED: <Badge variant="success" size="sm" dot>COMPLETADA</Badge>,
    SCHEDULED: <Badge variant="info" size="sm" dot>PROGRAMADA</Badge>,
    DRAFT: <Badge variant="outline" size="sm">BORRADOR</Badge>,
    CANCELLED: <Badge variant="danger" size="sm">CANCELADA</Badge>,
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes de Trabajo y Proceso Técnico"
        description="Flujo paso a paso desde recepción y diagnóstico hasta presupuesto, ejecución de repuestos y evidencias."
        actions={
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Aperturar Nueva Orden
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Buscar por ID, servicio o síntoma..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['ALL', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED', 'DRAFT'].map((st) => (
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
              {st === 'COMPLETED' && 'Completadas'}
              {st === 'DRAFT' && 'Borrador'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="Cargando órdenes de trabajo..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((wo) => {
            const veh = vehicles.find((v) => v.id === wo.vehicleId);
            return (
              <Card
                key={wo.id}
                className="hover:border-brand/40 transition-all cursor-pointer flex flex-col justify-between"
                onClick={() => handleOpenDetail(wo)}
              >
                <div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">{wo.id}</span>
                      <span className="text-graphite-500">•</span>
                      <CardTitle className="text-sm truncate text-white">{wo.title}</CardTitle>
                    </div>
                    {statusBadges[wo.status]}
                  </CardHeader>
                  <CardContent className="space-y-3 pt-1">
                    {veh && (
                      <div className="flex items-center justify-between text-xs text-graphite-300">
                        <span>Vehículo:</span>
                        <span className="font-semibold text-platinum">
                          {veh.year} {veh.make} {veh.model} ({veh.plate})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-graphite-400">
                      <span>Mecánico:</span>
                      <span className="text-graphite-300">{wo.technicianName || 'Sin asignar'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-graphite-400">
                      <span>Presupuesto:</span>
                      <span className="font-mono font-bold text-platinum">
                        ${wo.budget?.total.toLocaleString() || '0'} MXN
                      </span>
                    </div>
                    {wo.description && (
                      <p className="text-xs text-graphite-400 line-clamp-2 pt-1 border-t border-graphite-700/40">
                        {wo.description}
                      </p>
                    )}
                  </CardContent>
                </div>

                <div className="p-4 pt-2 border-t border-graphite-700/50 flex items-center justify-between text-xs text-graphite-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    Paso {wo.workflowStep || 1}/7
                  </span>
                  <span className="text-brand font-semibold flex items-center gap-0.5">
                    Gestionar flujo <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Aperturar Orden de Trabajo"
        description="Ingresa los datos iniciales para asignar una bahía de trabajo y técnico responsable."
        size="lg"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <Select
            label="Vehículo en Bahía"
            value={newVehicleId}
            onChange={(e) => setNewVehicleId(e.target.value)}
            placeholder="Selecciona el vehículo..."
            options={vehicles.map((v) => ({
              value: v.id,
              label: `${v.plate} — ${v.year} ${v.make} ${v.model} (${v.mileageKm.toLocaleString()} km)`,
            }))}
          />

          <Input
            label="Título de la Orden de Trabajo"
            placeholder="Ej. Servicio de Afinación Mayor y Balatas Cerámicas"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kilometraje Actual (km)"
              type="number"
              value={newMileage}
              onChange={(e) => setNewMileage(Number(e.target.value))}
            />
            <Select
              label="Técnico Responsable Asignado"
              value={newTechnician}
              onChange={(e) => setNewTechnician(e.target.value)}
              options={MOCK_WORKSHOP_MEMBERS.map((m) => ({
                value: m.id,
                label: `${m.name} (${m.role})`,
              }))}
            />
          </div>

          <Textarea
            label="Descripción del Trabajo y Síntomas Reportados"
            placeholder="Indicios del cliente, ruidos o revisiones solicitadas..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={3}
          />

          <div className="pt-3 border-t border-graphite-700/60 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Crear Orden
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAILED WORK ORDER FLOW MODAL (7 STEPS) */}
      {activeOrder && (
        <Modal
          isOpen={!!activeOrder}
          onClose={() => setActiveOrder(null)}
          title={`Orden ${activeOrder.id}: ${activeOrder.title}`}
          description={`Vehículo: ${vehicles.find((v) => v.id === activeOrder.vehicleId)?.make} ${vehicles.find((v) => v.id === activeOrder.vehicleId)?.model} (${vehicles.find((v) => v.id === activeOrder.vehicleId)?.plate})`}
          size="xl"
          footer={
            <div className="flex items-center justify-between w-full text-xs">
              <div className="flex items-center gap-2">
                {activeOrder.status === 'COMPLETED' ? (
                  <Badge variant="success" size="sm" dot>ORDEN FINALIZADA Y SELLADA</Badge>
                ) : (
                  <Badge variant="warning" size="sm" dot>ORDEN ACTIVA EN BAHÍA</Badge>
                )}
                {activeOrder.status === 'COMPLETED' && (
                  <span className="text-graphite-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-trust" /> Protegido
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Anterior
                </Button>
                {currentStep < 7 ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                  >
                    Siguiente Paso
                  </Button>
                ) : (
                  activeOrder.status !== 'COMPLETED' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={handleFinalizeWorkOrder}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Finalizar y Sellar Orden
                    </Button>
                  )
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Step Breadcrumb / Progress Bar */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 border-b border-graphite-700/60">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    currentStep === s.id
                      ? 'bg-brand text-white shadow-orange-glow'
                      : currentStep > s.id
                      ? 'bg-trust/15 text-trust border border-trust/30'
                      : 'bg-carbon text-graphite-400 hover:text-platinum'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-graphite-800 text-[10px] flex items-center justify-center font-mono">
                    {s.id}
                  </span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>

            {/* STEP 1: RECEPCIÓN */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-brand">Paso 1:</span> Recepción e Inventario Inicial
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60">
                    <span className="text-graphite-400 block">Kilometraje al Recibir:</span>
                    <span className="font-mono font-bold text-base text-platinum">
                      {activeOrder.receptionMileageKm?.toLocaleString() || 46200} km
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60">
                    <span className="text-graphite-400 block">Técnico Asignado:</span>
                    <span className="font-bold text-sm text-platinum">
                      {activeOrder.technicianName || 'Ing. Roberto Sánchez'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-1 text-xs">
                  <span className="text-graphite-400 font-semibold block">Síntomas / Motivo de Visita:</span>
                  <p className="text-graphite-200 leading-relaxed">
                    {activeOrder.symptoms || activeOrder.description || 'Revisión periódica y mantenimiento regular.'}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: DIAGNÓSTICO */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-brand">Paso 2:</span> Diagnóstico Técnico y Códigos DTC
                </h4>
                <div className="p-4 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-graphite-300">Códigos de Falla Escaneados (OBD2)</span>
                    <Badge variant={activeOrder.diagnosticDtcCodes?.length ? 'warning' : 'success'} size="sm">
                      {activeOrder.diagnosticDtcCodes?.length ? `${activeOrder.diagnosticDtcCodes.length} DTCs` : 'Sin Códigos'}
                    </Badge>
                  </div>
                  {activeOrder.diagnosticDtcCodes?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {activeOrder.diagnosticDtcCodes.map((code) => (
                        <span key={code} className="px-2.5 py-1 rounded-lg bg-carbon border border-brand/40 font-mono text-xs text-brand font-bold">
                          {code}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-trust flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Línea CAN Bus limpia.
                    </p>
                  )}
                  <div className="pt-2 border-t border-graphite-700/60">
                    <span className="text-xs text-graphite-400 block mb-1">Dictamen Técnico:</span>
                    <p className="text-xs text-graphite-200">
                      {activeOrder.technicalDiagnosis || 'Se ejecutó prueba visual de 25 puntos y lectura de parámetros en ralentí.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PRESUPUESTO */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-brand">Paso 3:</span> Presupuesto y Desglose de Procedimientos
                </h4>

                {/* Table of items */}
                <div className="rounded-xl border border-graphite-700/60 overflow-hidden">
                  <table className="w-full text-left text-xs text-platinum">
                    <thead className="bg-carbon-900 border-b border-graphite-700 text-graphite-400 uppercase">
                      <tr>
                        <th className="p-2.5">Tipo</th>
                        <th className="p-2.5">Descripción</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">Unitario</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-graphite-700/40 bg-graphite-800/40">
                      {activeOrder.items?.map((it) => (
                        <tr key={it.id}>
                          <td className="p-2.5">
                            <Badge variant="outline" size="sm" className="text-[10px]">{it.type}</Badge>
                          </td>
                          <td className="p-2.5 font-medium">{it.description}</td>
                          <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                          <td className="p-2.5 text-right font-mono">${it.unitPrice.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-brand">${it.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60 flex justify-end">
                  <div className="w-64 space-y-1 text-xs">
                    <div className="flex justify-between text-graphite-400">
                      <span>Subtotal:</span>
                      <span className="font-mono text-platinum">${activeOrder.budget?.subtotal.toLocaleString() || 0} MXN</span>
                    </div>
                    <div className="flex justify-between text-graphite-400">
                      <span>IVA (16%):</span>
                      <span className="font-mono text-platinum">${activeOrder.budget?.tax.toLocaleString() || 0} MXN</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-graphite-700">
                      <span>Total Presupuestado:</span>
                      <span className="font-mono text-brand">${activeOrder.budget?.total.toLocaleString() || 0} MXN</span>
                    </div>
                  </div>
                </div>

                {/* Add procedure form */}
                {activeOrder.status !== 'COMPLETED' && (
                  <div className="p-3 rounded-xl bg-carbon border border-graphite-700/60 space-y-2">
                    <span className="text-xs font-semibold text-graphite-300">Añadir Procedimiento o Refacción</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <Input
                        placeholder="Descripción de procedimiento / pieza..."
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        className="sm:col-span-2 text-xs"
                      />
                      <Input
                        type="number"
                        placeholder="Precio unitario"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(Number(e.target.value))}
                        className="text-xs"
                      />
                      <Button size="sm" variant="primary" onClick={handleAddItemToBudget}>
                        Añadir
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: APROBACIÓN */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-brand">Paso 4:</span> Aprobación del Propietario
                </h4>

                <div className="p-4 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-graphite-300">Estado de Consentimiento:</span>
                    <Badge
                      variant={
                        activeOrder.budget?.status === 'APPROVED'
                          ? 'success'
                          : activeOrder.budget?.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {activeOrder.budget?.status || 'PENDIENTE DE APROBACIÓN'}
                    </Badge>
                  </div>

                  <p className="text-xs text-graphite-400 leading-relaxed">
                    Total a pagar:{' '}
                    <strong className="text-brand font-mono">${activeOrder.budget?.total.toLocaleString() || 0} MXN</strong>
                    . El propietario recibe el desglose en su app Engrain Owner antes de autorizar la apertura de refacciones.
                  </p>

                  <div className="p-3 rounded-lg bg-carbon border border-graphite-700/50 text-[11px] text-graphite-400">
                    <Info className="w-3.5 h-3.5 text-brand inline mr-1" />
                    <strong>Aviso de Demostración:</strong> La aprobación final requiere firma digital del cliente en la API. En este entorno puedes simular la autorización para continuar con el flujo técnico.
                  </div>

                  {activeOrder.status !== 'COMPLETED' && (
                    <div className="pt-2 flex gap-3">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleToggleApproval('APPROVED')}
                      >
                        Registrar Aprobación de Cliente
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleToggleApproval('REJECTED')}
                      >
                        Marcar como Rechazado
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: EJECUCIÓN */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-brand">Paso 5:</span> Ejecución de Actividades Técnicas
                </h4>

                <div className="space-y-2">
                  <p className="text-xs text-graphite-400">
                    Marca cada actividad completada por el técnico responsable para validar el cumplimiento:
                  </p>
                  {activeOrder.items?.map((it) => (
                    <div
                      key={it.id}
                      onClick={() => activeOrder.status !== 'COMPLETED' && handleToggleProcedureCompletion(it.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                        it.completed
                          ? 'bg-trust/10 border-trust/40 text-platinum'
                          : 'bg-carbon-900 border-graphite-700/60 text-graphite-400 hover:border-graphite-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            it.completed ? 'bg-trust border-trust text-white' : 'border-graphite-500 bg-carbon'
                          }`}
                        >
                          {it.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{it.description}</p>
                          <span className="text-[10px] text-graphite-400 font-mono">
                            {it.type} • Cantidad: {it.quantity}
                          </span>
                        </div>
                      </div>
                      <Badge variant={it.completed ? 'success' : 'outline'} size="sm">
                        {it.completed ? 'COMPLETADO' : 'PENDIENTE'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: EVIDENCIAS */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-brand">Paso 6:</span> Sistema de Evidencias Fotográficas y Facturas
                </h4>

                <div className="p-3 rounded-xl bg-carbon-900 border border-brand/30 text-xs text-graphite-300">
                  <Info className="w-3.5 h-3.5 text-brand inline mr-1" />
                  <strong>Certificación Inmutable:</strong> Las fotos antes/después y facturas respaldan el pasaporte vehicular. No se guardan documentos en servidores públicos sin cifrado.
                </div>

                {/* Evidence Gallery */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {activeOrder.evidences?.map((evi) => (
                    <div key={evi.id} className="p-3 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="warning" size="sm">{evi.category}</Badge>
                        <span className="text-[10px] font-mono text-graphite-400">
                          {(evi.sizeBytes / 1024).toFixed(0)} KB
                        </span>
                      </div>
                      {evi.previewUrl ? (
                        <img
                          src={evi.previewUrl}
                          alt={evi.fileName}
                          className="w-full h-28 object-cover rounded-lg border border-graphite-700"
                        />
                      ) : (
                        <div className="w-full h-28 rounded-lg bg-carbon border border-graphite-700 flex items-center justify-center text-graphite-500">
                          <FileCheck className="w-8 h-8" />
                        </div>
                      )}
                      <p className="text-xs font-semibold text-platinum truncate">{evi.fileName}</p>
                      {evi.notes && <p className="text-[11px] text-graphite-400 line-clamp-1">{evi.notes}</p>}
                    </div>
                  ))}
                </div>

                {/* Upload Form */}
                {activeOrder.status !== 'COMPLETED' && (
                  <form onSubmit={handleUploadEvidence} className="p-4 rounded-xl bg-carbon border border-graphite-700/60 space-y-3">
                    <span className="text-xs font-semibold text-white block">Adjuntar Nueva Evidencia</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Select
                        label="Categoría"
                        value={evidenceCategory}
                        onChange={(e) => setEvidenceCategory(e.target.value as any)}
                        options={[
                          { value: 'BEFORE', label: 'Fotografía Antes' },
                          { value: 'AFTER', label: 'Fotografía Después' },
                          { value: 'INVOICE', label: 'Factura / Nota Fiscal' },
                          { value: 'DOCUMENT', label: 'Reporte Técnico PDF' },
                        ]}
                      />
                      <div className="sm:col-span-2">
                        <Input
                          label="Observaciones de la evidencia"
                          placeholder="Ej. Pieza sustituida con número de lote visible..."
                          value={evidenceNotes}
                          onChange={(e) => setEvidenceNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(e) => e.target.files?.[0] && setEvidenceFile(e.target.files[0])}
                        className="text-xs text-graphite-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-graphite-700 file:text-platinum hover:file:bg-graphite-600"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="primary"
                        isLoading={isUploadingEvidence}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                      >
                        Registrar Evidencia
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* STEP 7: FINALIZACIÓN */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="text-brand">Paso 7:</span> Resumen de Orden y Sellado Criptográfico
                </h4>

                <div className="p-4 rounded-2xl bg-carbon-900 border border-graphite-700/60 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-graphite-700/60 pb-3">
                    <div>
                      <span className="font-mono text-sm font-bold text-brand">{activeOrder.id}</span>
                      <h3 className="text-base font-bold text-white">{activeOrder.title}</h3>
                    </div>
                    {statusBadges[activeOrder.status]}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-graphite-400 block">Técnico Acreditado:</span>
                      <span className="font-semibold text-platinum">{activeOrder.technicianName}</span>
                    </div>
                    <div>
                      <span className="text-graphite-400 block">Kilometraje Final:</span>
                      <span className="font-mono font-semibold text-platinum">
                        {activeOrder.receptionMileageKm?.toLocaleString()} km
                      </span>
                    </div>
                    <div>
                      <span className="text-graphite-400 block">Evidencias Adjuntas:</span>
                      <span className="font-semibold text-trust">{activeOrder.evidences?.length || 0} certificadas</span>
                    </div>
                    <div>
                      <span className="text-graphite-400 block">Importe Facturado:</span>
                      <span className="font-mono font-bold text-brand">${activeOrder.budget?.total.toLocaleString() || 0} MXN</span>
                    </div>
                  </div>

                  {activeOrder.status === 'COMPLETED' ? (
                    <div className="p-3.5 rounded-xl bg-trust/10 border border-trust/40 flex items-center gap-3 text-trust">
                      <ShieldCheck className="w-6 h-6 shrink-0" />
                      <div>
                        <p className="font-bold">Mantenimiento Sellado e Incorporado</p>
                        <p className="text-[11px] text-graphite-300">
                          Este evento técnico ya forma parte permanente del Pasaporte Digital del vehículo y cuenta con respaldo contra manipulación.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-platinum">Listo para Finalizar</p>
                        <p className="text-[11px] text-graphite-400">
                          Al presionar finalizar, la orden se marcará como COMPLETADA y se transmitirá al historial del automóvil.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={handleFinalizeWorkOrder}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Sellar Orden Ahora
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
