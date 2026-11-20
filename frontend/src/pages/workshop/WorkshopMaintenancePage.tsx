import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Wrench,
  ShieldCheck,
  Lock,
  Car,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { maintenanceService } from '../../services/maintenanceService';
import { vehicleService } from '../../services/vehicleService';
import { Maintenance } from '../../types/maintenance';
import { Vehicle } from '../../types/vehicle';
import { PageLoading } from '../../components/ui/Loading';

export const WorkshopMaintenancePage: React.FC = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const [mnt, veh] = await Promise.all([
          maintenanceService.getMaintenances(),
          vehicleService.getVehicles(),
        ]);
        setMaintenances(mnt);
        setVehicles(veh);
      } catch (err) {
        console.error('Error fetching maintenances', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredMaintenances = maintenances.filter((m) => {
    if (statusFilter === 'ALL') return true;
    return m.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Mantenimientos e Intervenciones"
        description="Línea de tiempo cronológica de servicios certificados. Base probatoria para el Pasaporte Digital vehicular."
      />

      {/* Epistemological disclaimer per Section 8 instructions */}
      <div className="p-3.5 rounded-xl bg-graphite-800/80 border border-brand/30 flex items-start gap-3 text-xs text-graphite-300">
        <ShieldCheck className="w-4 h-4 text-brand shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-platinum">Criterio de Autenticidad ENGRAIN:</strong> Una fotografía o factura adjunta aporta trazabilidad documental, pero la validez se fortalece mediante la firma criptográfica del taller acreditado y la coherencia del odómetro. Los registros finalizados están blindados contra alteración posterior.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'COMPLETED', 'SCHEDULED', 'IN_PROGRESS'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-brand text-white shadow-sm'
                : 'bg-graphite-800 text-graphite-400 hover:text-platinum hover:bg-graphite-700'
            }`}
          >
            {st === 'ALL' && 'Todos los Mantenimientos'}
            {st === 'COMPLETED' && 'Finalizados y Sellados'}
            {st === 'SCHEDULED' && 'Programados'}
            {st === 'IN_PROGRESS' && 'En Bahía'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoading message="Cargando línea de tiempo de mantenimientos..." />
      ) : (
        <div className="space-y-4">
          {filteredMaintenances.map((m) => {
            const veh = vehicles.find((v) => v.id === m.vehicleId);
            const isCompleted = m.status === 'COMPLETED';

            return (
              <Card
                key={m.id}
                className={`transition-colors ${
                  isCompleted ? 'border-graphite-600/70 hover:border-trust/40' : 'border-brand/30'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Service Details */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                        isCompleted
                          ? 'bg-trust/10 border-trust/40 text-trust'
                          : 'bg-brand/10 border-brand/40 text-brand'
                      }`}
                    >
                      <Wrench className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand">{m.id}</span>
                        <h4 className="text-sm font-bold text-platinum">{m.title}</h4>
                        <Badge
                          variant={isCompleted ? 'success' : 'warning'}
                          size="sm"
                          dot
                        >
                          {m.status}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="outline" size="sm" className="text-[10px] text-trust border-trust/40 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> VERIFICADO CON EVIDENCIAS
                          </Badge>
                        )}
                      </div>

                      {m.description && (
                        <p className="text-xs text-graphite-300 leading-relaxed max-w-2xl">
                          {m.description}
                        </p>
                      )}

                      {veh && (
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-graphite-400 font-mono">
                          <span className="flex items-center gap-1 text-platinum font-semibold">
                            <Car className="w-3.5 h-3.5 text-brand" />
                            {veh.year} {veh.make} {veh.model} ({veh.plate})
                          </span>
                          <span>•</span>
                          <span>VIN: {veh.vin}</span>
                          <span>•</span>
                          <span className="text-brand font-bold">
                            {m.mileageKm ? `${m.mileageKm.toLocaleString()} km` : `${veh.mileageKm.toLocaleString()} km`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Workshop & Security Seal */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-graphite-700/60 text-xs text-graphite-400">
                    <div className="text-left lg:text-right space-y-0.5">
                      <p className="font-semibold text-platinum">Precision Motors & Diagnostics</p>
                      <p className="text-[11px] font-mono text-graphite-400">RFC-PMD880120-K9</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-graphite-500" />
                      <span className="font-mono text-xs text-platinum">
                        {m.completedAt
                          ? new Date(m.completedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
                          : m.dueDate
                          ? `Programado: ${new Date(m.dueDate).toLocaleDateString('es-MX')}`
                          : 'Fecha regular'}
                      </span>
                      {isCompleted && (
                        <span title="Registro inmutable finalizado" className="ml-1 text-trust">
                          <Lock className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
