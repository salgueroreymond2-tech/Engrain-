import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Sparkles } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { maintenanceService } from '../../services/maintenanceService';
import { Maintenance } from '../../types/maintenance';
import { PageLoading } from '../../components/ui/Loading';

export const OwnerMaintenancePage: React.FC = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await maintenanceService.getMaintenances();
        setMaintenances(data);
      } catch (err) {
        console.error('Error fetching maintenances', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mantenimientos y Servicios"
        description="Historial de intervenciones preventivas y recordatorios inteligentes de kilometraje."
      />

      {/* AI Smart Suggestion */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-graphite-800 to-carbon border border-purple-500/30 flex items-start gap-3.5">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-platinum">Recomendación Predictiva ENGRAIN AI</p>
          <p className="text-graphite-300">
            Con base en tu promedio mensual de 1,200 km recorridos, tu próximo cambio de aceite sintético y rotación de neumáticos deberá realizarse en aproximadamente 24 días.
          </p>
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="Consultando bitácora de servicios..." />
      ) : (
        <div className="space-y-3">
          {maintenances.map((m) => (
            <Card key={m.id} className="hover:border-graphite-500 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-carbon border border-graphite-600/50 flex items-center justify-center text-brand shrink-0 mt-0.5">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-platinum">{m.title}</h4>
                      <Badge variant={m.status === 'COMPLETED' ? 'success' : 'warning'} size="sm" dot>
                        {m.status}
                      </Badge>
                    </div>
                    {m.description && <p className="text-xs text-graphite-400 mt-0.5">{m.description}</p>}
                    <p className="text-xs text-graphite-500 mt-1 font-mono">
                      Kilometraje: {m.mileageKm ? `${m.mileageKm.toLocaleString()} km` : 'Al corriente'}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono text-graphite-400 flex items-center gap-1.5 sm:text-right shrink-0">
                  <Calendar className="w-4 h-4 text-graphite-500" />
                  <span>
                    {m.completedAt
                      ? `Completado el ${new Date(m.completedAt).toLocaleDateString('es-MX')}`
                      : m.dueDate
                      ? `Programado para ${new Date(m.dueDate).toLocaleDateString('es-MX')}`
                      : 'Fecha programada'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
