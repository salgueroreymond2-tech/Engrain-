import React, { useState, useEffect } from 'react';
import { Calendar, Wrench } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { maintenanceService } from '../../services/maintenanceService';
import { Maintenance } from '../../types/maintenance';
import { PageLoading } from '../../components/ui/Loading';

export const WorkshopMaintenancePage: React.FC = () => {
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
        title="Mantenimientos e Intervenciones"
        description="Programación de servicios preventivos y correctivos por kilometraje y fecha."
      />

      {isLoading ? (
        <PageLoading message="Cargando calendario de servicios..." />
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
                      Kilometraje objetivo: {m.mileageKm ? `${m.mileageKm.toLocaleString()} km` : 'No especificado'}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-mono text-graphite-400 flex items-center gap-1.5 sm:text-right shrink-0">
                  <Calendar className="w-4 h-4 text-graphite-500" />
                  <span>
                    {m.dueDate
                      ? new Date(m.dueDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Fecha flexible'}
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
