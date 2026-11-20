import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Cpu, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { diagnosticService } from '../../services/diagnosticService';
import { Diagnostic } from '../../types/diagnostic';
import { PageLoading } from '../../components/ui/Loading';
import { useToast } from '../../hooks/useToast';

export const WorkshopDiagnosticsPage: React.FC = () => {
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

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      success('Escaneo OBD2 finalizado', 'Lectura de telemetría y DTCs almacenada en el expediente.');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Diagnósticos OBD2 y Telemetría"
        description="Lectura telemática desde el conector OBD2 para análisis de códigos DTC y parámetros en vivo."
        actions={
          <Button
            size="sm"
            variant="primary"
            isLoading={isScanning}
            onClick={handleSimulateScan}
            leftIcon={<Activity className="w-3.5 h-3.5" />}
          >
            Iniciar Escaneo en Bahía
          </Button>
        }
      />

      {isLoading ? (
        <PageLoading message="Conectando con adaptador OBD2..." />
      ) : (
        <div className="space-y-6">
          {diagnostics.map((diag) => (
            <Card key={diag.id} className="border-graphite-600/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-carbon border border-graphite-600/60 flex items-center justify-center text-blue-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Diagnóstico Telemático {diag.id}</CardTitle>
                      <Badge variant="info" size="sm">{diag.source}</Badge>
                    </div>
                    <p className="text-xs text-graphite-400 font-mono mt-0.5">
                      Vehículo: {diag.vehicleId} • Kilometraje: {diag.mileageKm?.toLocaleString()} km
                    </p>
                  </div>
                </div>
                <Badge variant={diag.dtcs.length > 0 ? 'warning' : 'success'} size="sm" dot>
                  {diag.dtcs.length > 0 ? `${diag.dtcs.length} CÓDIGOS DTC` : 'SIN CÓDIGOS DE FALLA'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* DTC list */}
                {diag.dtcs.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
                      Códigos de Diagnóstico Detectados (DTC)
                    </p>
                    {diag.dtcs.map((dtc) => (
                      <div
                        key={dtc.code}
                        className="p-3 rounded-xl bg-carbon-900 border border-brand/30 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                          <div>
                            <span className="font-mono text-sm font-bold text-brand">{dtc.code}</span>
                            <p className="text-xs text-graphite-300 mt-0.5">{dtc.description}</p>
                          </div>
                        </div>
                        <Badge variant="warning" size="sm">{dtc.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-trust/10 border border-trust/30 flex items-center gap-2.5 text-xs text-trust">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Línea CAN Bus limpia: No se detectan anomalías en motor, transmisión ni emisiones.</span>
                  </div>
                )}

                {/* Telemetry Payload Parameters */}
                {diag.payload && (
                  <div className="pt-2 border-t border-graphite-700/50">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-graphite-400 mb-2">
                      Parámetros de Telemetría Registrados
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      {Object.entries(diag.payload).map(([k, v]) => (
                        <div key={k} className="p-2 rounded-lg bg-carbon border border-graphite-700/40">
                          <span className="text-[10px] text-graphite-500 uppercase block">{k}</span>
                          <span className="font-bold text-platinum">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
