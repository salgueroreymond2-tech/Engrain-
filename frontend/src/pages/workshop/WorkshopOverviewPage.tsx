import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  Wrench,
  Info,
  DollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { workOrderService } from '../../services/workOrderService';
import { vehicleService } from '../../services/vehicleService';
import { maintenanceService } from '../../services/maintenanceService';
import { WorkOrder, WorkOrderStatus } from '../../types/workshop';
import { Vehicle } from '../../types/vehicle';

import { PageLoading } from '../../components/ui/Loading';

// Chart Data (Weekly service trend)
const WEEKLY_SERVICES_DATA = [
  { day: 'Lun', preventivos: 3, correctivos: 2, total: 5 },
  { day: 'Mar', preventivos: 4, correctivos: 3, total: 7 },
  { day: 'Mié', preventivos: 5, correctivos: 1, total: 6 },
  { day: 'Jue', preventivos: 6, correctivos: 4, total: 10 },
  { day: 'Vie', preventivos: 7, correctivos: 3, total: 10 },
  { day: 'Sáb', preventivos: 4, correctivos: 2, total: 6 },
];

export const WorkshopOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ord, veh] = await Promise.all([
          workOrderService.getWorkOrders(),
          vehicleService.getVehicles(),
          maintenanceService.getMaintenances(),
        ]);
        setOrders(ord);
        setVehicles(veh);
      } catch (err) {
        console.error('Error loading workshop overview data', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return <PageLoading message="Cargando panel de control de taller..." />;
  }

  // Metrics calculations
  const activeOrders = orders.filter((o) => o.status === 'IN_PROGRESS');
  const scheduledOrders = orders.filter((o) => o.status === 'SCHEDULED');
  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const pendingApprovalOrders = orders.filter(
    (o) => o.budget?.status === 'PENDING_APPROVAL' || o.status === 'DRAFT'
  );

  // Status Distribution for Donut Chart
  const STATUS_DISTRIBUTION = [
    { name: 'En Curso', value: activeOrders.length || 1, color: '#F97316' },
    { name: 'Programadas', value: scheduledOrders.length || 1, color: '#38BDF8' },
    { name: 'Completadas', value: completedOrders.length || 1, color: '#16A34A' },
    { name: 'Borrador / Prep', value: pendingApprovalOrders.length || 1, color: '#64748B' },
  ];

  const statusBadges: Record<WorkOrderStatus, React.ReactNode> = {
    IN_PROGRESS: <Badge variant="warning" size="sm" dot>EN CURSO</Badge>,
    COMPLETED: <Badge variant="success" size="sm" dot>FINALIZADA</Badge>,
    SCHEDULED: <Badge variant="info" size="sm" dot>PROGRAMADA</Badge>,
    DRAFT: <Badge variant="outline" size="sm">BORRADOR</Badge>,
    CANCELLED: <Badge variant="danger" size="sm">CANCELADA</Badge>,
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer banner for hackathon demo mode */}
      <div className="p-3 rounded-xl bg-graphite-800/80 border border-brand/30 flex items-center justify-between text-xs text-graphite-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand shrink-0" />
          <span>
            <strong className="text-platinum font-semibold">Taller Activo:</strong> Precision Motors & Diagnostics (RFC-PMD880120-K9). Datos sincronizados con contrato REST v1.
          </span>
        </div>
        <Badge variant="outline" size="sm" className="hidden sm:inline-flex text-[10px]">
          MODO DEMOSTRACIÓN TALLER
        </Badge>
      </div>

      <PageHeader
        title="Consola de Gestión del Taller"
        description="Monitoreo en tiempo real de bahías de servicio, órdenes de trabajo, diagnósticos e historial vehicular."
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/workshop/vehicles">
              <Button size="sm" variant="outline" leftIcon={<Car className="w-3.5 h-3.5" />}>
                Recepción
              </Button>
            </Link>
            <Link to="/workshop/work-orders">
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Nueva Orden
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Órdenes Activas en Bahía"
          value={activeOrders.length}
          icon={<Wrench className="w-5 h-5" />}
          trend={{ value: '3 en ejecución', isPositive: true }}
          subtitle="En diagnóstico e intervención"
        />
        <StatCard
          title="Vehículos en Taller"
          value={vehicles.length}
          icon={<Car className="w-5 h-5" />}
          subtitle="Registrados en expediente"
        />
        <StatCard
          title="Presupuestos por Aprobar"
          value={pendingApprovalOrders.length}
          icon={<DollarSign className="w-5 h-5 text-brand" />}
          trend={{ value: 'Atención requerida', isPositive: false }}
          subtitle="Esperando confirmación"
        />
        <StatCard
          title="Servicios Finalizados"
          value={completedOrders.length}
          icon={<CheckCircle2 className="w-5 h-5 text-trust" />}
          trend={{ value: '100% sellados', isPositive: true }}
          subtitle="Incorporados al pasaporte"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Services by Week AreaChart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-base text-white">Servicios Atendidos por Semana</CardTitle>
              <p className="text-xs text-graphite-400 mt-0.5">
                Volumen acumulado de mantenimientos preventivos vs intervenciones correctivas
              </p>
            </div>
            <Badge variant="warning" size="sm">SEMANA 47</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_SERVICES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPreventivos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCorrectivos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#242830" vertical={false} />
                  <XAxis dataKey="day" stroke="#646B80" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                  <YAxis stroke="#646B80" tick={{ fill: '#A0AEC0', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111318', borderColor: '#323743', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: '#F4F5F7', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="preventivos"
                    name="Preventivos"
                    stroke="#16A34A"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPreventivos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="correctivos"
                    name="Correctivos"
                    stroke="#F97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCorrectivos)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Status Distribution Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-white">Distribución de Órdenes</CardTitle>
            <Clock className="w-4 h-4 text-graphite-400" />
          </CardHeader>
          <CardContent>
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {STATUS_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#111318" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111318', borderColor: '#323743', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-graphite-700/50 text-xs">
              {STATUS_DISTRIBUTION.map((st) => (
                <div key={st.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                  <span className="text-graphite-400 truncate">{st.name}:</span>
                  <span className="font-bold text-platinum">{st.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Orders Table & AI Telemetry Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-base text-white">Órdenes de Trabajo Recientes</CardTitle>
              <p className="text-xs text-graphite-400 mt-0.5">Seguimiento de intervenciones mecánicas y asignación</p>
            </div>
            <Link to="/workshop/work-orders">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Ver todas ({orders.length})
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 sm:p-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden / Vehículo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Mecánico</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 5).map((wo) => {
                  const veh = vehicles.find((v) => v.id === wo.vehicleId);
                  return (
                    <TableRow key={wo.id}>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="font-mono text-xs font-bold text-brand">{wo.id}</span>
                          <p className="text-sm font-semibold text-platinum line-clamp-1">{wo.title}</p>
                          {veh && (
                            <p className="text-[11px] text-graphite-400">
                              {veh.year} {veh.make} {veh.model}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-graphite-800 border border-graphite-600/60 text-brand">
                          {veh?.plate || 'SIN PLACA'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-graphite-300">
                        {wo.technicianName || 'Por Asignar'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-graphite-400">
                        {wo.openedAt ? new Date(wo.openedAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) : '—'}
                      </TableCell>
                      <TableCell>
                        {statusBadges[wo.status]}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/workshop/work-orders?id=${wo.id}`)}
                          className="text-xs py-1 px-2"
                        >
                          Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Sidebar: AI Warnings & Urgent Services */}
        <div className="space-y-6">
          <Card className="border-brand/30 bg-gradient-to-br from-graphite-800 to-carbon">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                <CardTitle className="text-base text-white">Alerta Telemática IA</CardTitle>
              </div>
              <Badge variant="warning" size="sm">OBD2 CONNECT</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-graphite-300 leading-relaxed">
                Vehículo <strong className="text-platinum">Mazda CX-5 (NXY-4821)</strong> reportó sensor de oxígeno banco 1 fuera de rango estequiométrico tras último escaneo.
              </p>
              <div className="p-2.5 rounded-lg bg-carbon border border-graphite-700 font-mono text-[11px] text-brand">
                DTC P0420 — Eficiencia catalítica
              </div>
              <Link to="/workshop/diagnostics" className="block">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Inspeccionar Diagnóstico OBD2
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-trust" />
                <CardTitle className="text-base text-white">Servicios Programados</CardTitle>
              </div>
              <Badge variant="outline" size="sm">PRÓXIMOS 7 DÍAS</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-carbon border border-graphite-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-platinum">Audi A4 S-Line</span>
                  <Badge variant="info" size="sm">21 NOV</Badge>
                </div>
                <p className="text-graphite-400">Diagnóstico por testigo EPC intermitente (52,100 km)</p>
              </div>

              <div className="p-3 rounded-xl bg-carbon border border-graphite-700/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-platinum">VW Jetta GLI</span>
                  <Badge variant="default" size="sm">25 NOV</Badge>
                </div>
                <p className="text-graphite-400">Servicio preventivo 30,000 km y fluidos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
