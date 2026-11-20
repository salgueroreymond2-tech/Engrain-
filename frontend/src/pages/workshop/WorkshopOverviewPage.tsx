import React from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MOCK_WORK_ORDERS, MOCK_VEHICLES } from '../../services/mockAdapters';

export const WorkshopOverviewPage: React.FC = () => {
  const activeOrders = MOCK_WORK_ORDERS.filter((wo) => wo.status === 'IN_PROGRESS' || wo.status === 'SCHEDULED');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel del Taller Mecánico"
        description="Gestión integral de órdenes de servicio, vehículos en bahía y diagnósticos telemáticos."
        actions={
          <div className="flex items-center gap-2.5">
            <Link to="/workshop/work-orders">
              <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Nueva Orden de Trabajo
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Órdenes Activas"
          value={activeOrders.length}
          icon={<FileText className="w-5 h-5" />}
          trend={{ value: '+12%', isPositive: true }}
          subtitle="En bahía y programación"
        />
        <StatCard
          title="Vehículos Atendidos"
          value={MOCK_VEHICLES.length}
          icon={<Car className="w-5 h-5" />}
          subtitle="En expediente digital"
        />
        <StatCard
          title="Tiempo Promedio"
          value="1.4 días"
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: '-8%', isPositive: true }}
          subtitle="Ciclo de entrega"
        />
        <StatCard
          title="Score de Confianza"
          value="96%"
          icon={<CheckCircle className="w-5 h-5" />}
          subtitle="Evidencias aprobadas"
        />
      </div>

      {/* Main Grid: Orders & Fast Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-base">Órdenes de Trabajo en Curso</CardTitle>
              <p className="text-xs text-graphite-400 mt-0.5">Seguimiento de intervenciones mecánicas</p>
            </div>
            <Link to="/workshop/work-orders">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Ver todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_WORK_ORDERS.map((wo) => {
              const statusBadges = {
                IN_PROGRESS: <Badge variant="warning" size="sm" dot>EN CURSO</Badge>,
                COMPLETED: <Badge variant="success" size="sm" dot>FINALIZADA</Badge>,
                SCHEDULED: <Badge variant="default" size="sm" dot>PROGRAMADA</Badge>,
                DRAFT: <Badge variant="outline" size="sm">BORRADOR</Badge>,
                CANCELLED: <Badge variant="danger" size="sm">CANCELADA</Badge>,
              };

              return (
                <div
                  key={wo.id}
                  className="p-4 rounded-xl bg-carbon-900 border border-graphite-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-brand">{wo.id}</span>
                      <span className="text-graphite-500">•</span>
                      <p className="text-sm font-semibold text-platinum">{wo.title}</p>
                    </div>
                    {wo.description && (
                      <p className="text-xs text-graphite-400 line-clamp-1">{wo.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {statusBadges[wo.status]}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* AI & Telemetry Sidebar Widget */}
        <div className="space-y-6">
          <Card className="border-brand/30 bg-gradient-to-br from-graphite-800 to-carbon">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                <CardTitle className="text-base text-white">ENGRAIN AI Assistant</CardTitle>
              </div>
              <Badge variant="warning" size="sm">TELEMETRÍA</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-graphite-300 leading-relaxed">
                El sistema detectó 1 vehículo con código DTC <span className="font-mono text-brand font-bold">P0420</span> (baja eficiencia catalizador). Se sugiere prueba de contrapresión de escape.
              </p>
              <Link to="/workshop/diagnostics">
                <Button size="sm" variant="outline" className="w-full text-xs">
                  Revisar Diagnósticos OBD2
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mantenimientos Urgentes</CardTitle>
              <AlertCircle className="w-4 h-4 text-brand" />
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-carbon border border-graphite-700/50">
                <p className="font-bold text-platinum">Mazda CX-5 (NXY-4821)</p>
                <p className="text-graphite-400 mt-0.5">Servicio programado en 3 días (50,000 km)</p>
              </div>
              <div className="p-3 rounded-lg bg-carbon border border-graphite-700/50">
                <p className="font-bold text-platinum">Honda Accord (PAZ-1102)</p>
                <p className="text-trust mt-0.5">Frenos y balatas completados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
