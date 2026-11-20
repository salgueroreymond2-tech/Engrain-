import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Cpu, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { diagnosticService } from '../../services/diagnosticService';
import { Diagnostic } from '../../types/diagnostic';
import { PageLoading } from '../../components/ui/Loading';
import { useToast } from '../../hooks/useToast';

export const OwnerDiagnosticsPage: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await diagnosticService.getDiagnostics();
        setDiagnostics(data);
      } catch (err) {
        console.error('Error fetching diagnostics', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSimulateSync = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      success('Sincronización completada', 'Adaptador OBD2 en línea y datos actualizados.');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnósticos OBD2 y Salud Electrónica"
        description="Lectura telemática del estado de los sensores de tu vehículo e historial de fallas."
        actions={
          <Button
            size="sm"
            variant="primary"
            isLoading={isScanning}
            onClick={handleSimulateSync}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sincronizar Adaptador OBD2
          </Button>
        }
      />

      {isLoading ? (
        <PageLoading message="Sincronizando con sensor vehicular..." />
      ) : (
        <div className="space-y-6">
          {/* Health summary card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-trust/15 via-graphite-800 to-carbon border border-trust/40 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-trust text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Estado General: Excelente</h3>
                <p className="text-xs text-graphite-300">
                  Luz Check Engine: <span className="text-trust font-bold">Apagada</span> • Todos los monitores de emisiones aprobados.
                </p>
              </div>
            </div>
            <Badge variant="success" size="md">0 FALLAS CRÍTICAS</Badge>
          </div>

          {diagnostics.map((diag) => (
            <Card key={diag.id}>
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <CardTitle className="text-base">Reporte de Escaneo {diag.id}</CardTitle>
                </div>
                <Badge variant="info" size="sm">{diag.source}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {diag.dtcs.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
                      Códigos de Advertencia
                    </p>
                    {diag.dtcs.map((dtc) => (
                      <div
                        key={dtc.code}
                        className="p-3 rounded-xl bg-carbon border border-brand/40 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-brand" />
                          <span className="font-mono text-sm font-bold text-brand">{dtc.code}</span>
                          <span className="text-xs text-graphite-300">— {dtc.description}</span>
                        </div>
                        <Badge variant="warning" size="sm">{dtc.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-trust flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Sin códigos de error registrados.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
