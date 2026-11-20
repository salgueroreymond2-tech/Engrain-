import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Car,
  Sparkles,
  Info,
  Radio,
  Gauge,
  Thermometer,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { diagnosticService } from '../../services/diagnosticService';
import { vehicleService } from '../../services/vehicleService';
import { Diagnostic } from '../../types/diagnostic';
import { Vehicle } from '../../types/vehicle';
import { PageLoading } from '../../components/ui/Loading';
import { useToast } from '../../hooks/useToast';

export const WorkshopDiagnosticsPage: React.FC = () => {
  const { success } = useToast();
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('veh-001');
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [diag, veh] = await Promise.all([
          diagnosticService.getDiagnostics(),
          vehicleService.getVehicles(),
        ]);
        setDiagnostics(diag);
        setVehicles(veh);
      } catch (err) {
        console.error('Error fetching diagnostics', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleRunScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      success('Escaneo OBD2 finalizado con éxito', 'Se completó la lectura de telemetría CAN Bus y análisis DTC.');
    }, 1600);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const vehicleDiagnostics = diagnostics.filter((d) => d.vehicleId === selectedVehicleId);
  const latestDiagnostic = vehicleDiagnostics[0] || diagnostics[0];

  return (
    <div className="space-y-6">
      {/* Explicit Demo Disclaimer as requested in Section 9 */}
      <div className="p-3.5 rounded-xl bg-graphite-800/90 border border-brand/40 flex items-start justify-between gap-3 text-xs text-graphite-300">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-platinum block">MODO DEMOSTRACIÓN — TELEMETRÍA VEHICULAR</span>
            <p className="mt-0.5">
              Sin adaptador OBD2 físico enlazado en este equipo. Los datos telemáticos corresponden al contrato oficial v1 y adaptadores simulados para validación de UX.
            </p>
          </div>
        </div>
        <Badge variant="warning" size="sm" dot>DEMOSTRACIÓN</Badge>
      </div>

      <PageHeader
        title="Diagnóstico Electrónico y Escáner OBD2"
        description="Lectura telemática del bus CAN vehicular, análisis de códigos de diagnóstico (DTC) y asistencia inteligente."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="primary"
              isLoading={isScanning}
              onClick={handleRunScan}
              leftIcon={<Activity className="w-3.5 h-3.5" />}
            >
              Iniciar Escaneo en Bahía
            </Button>
          </div>
        }
      />

      {/* Vehicle Selector Bar */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-carbon border border-graphite-600/50 flex items-center justify-center text-brand shrink-0">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-graphite-400">
                Vehículo Seleccionado para Diagnóstico
              </p>
              {selectedVehicle && (
                <p className="text-base font-bold text-white">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.plate})
                </p>
              )}
            </div>
          </div>

          <div className="w-full sm:w-72">
            <Select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              options={vehicles.map((v) => ({
                value: v.id,
                label: `${v.plate} — ${v.year} ${v.make} ${v.model}`,
              }))}
            />
          </div>
        </div>
      </Card>

      {/* OBD2 Hardware & Telemetry Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-1">
          <span className="text-[10px] font-mono text-graphite-400 uppercase flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-trust animate-pulse" /> Estado del Enlace OBD2
          </span>
          <p className="text-base font-bold text-trust">Conectado (Simulado)</p>
          <p className="text-[11px] text-graphite-400 font-mono">ISO 15765-4 (CAN 29/500)</p>
        </div>

        <div className="p-4 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-1">
          <span className="text-[10px] font-mono text-graphite-400 uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand" /> Voltaje en Reposo
          </span>
          <p className="text-base font-mono font-bold text-platinum">
            {latestDiagnostic?.payload?.voltage ? `${latestDiagnostic.payload.voltage} V` : '13.8 V'}
          </p>
          <p className="text-[11px] text-trust font-medium">Batería en rango óptimo</p>
        </div>

        <div className="p-4 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-1">
          <span className="text-[10px] font-mono text-graphite-400 uppercase flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-blue-400" /> Temperatura Anticongelante
          </span>
          <p className="text-base font-mono font-bold text-platinum">
            {latestDiagnostic?.payload?.coolantTempC ? `${latestDiagnostic.payload.coolantTempC} °C` : '89 °C'}
          </p>
          <p className="text-[11px] text-trust font-medium">Termostato operativo</p>
        </div>

        <div className="p-4 rounded-xl bg-carbon-900 border border-graphite-700/60 space-y-1">
          <span className="text-[10px] font-mono text-graphite-400 uppercase flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-purple-400" /> Régimen en Ralentí
          </span>
          <p className="text-base font-mono font-bold text-platinum">
            {latestDiagnostic?.payload?.rpm ? `${latestDiagnostic.payload.rpm} RPM` : '720 RPM'}
          </p>
          <p className="text-[11px] text-graphite-400">Estabilidad estequiométrica</p>
        </div>
      </div>

      {isLoading ? (
        <PageLoading message="Sincronizando bus CAN del vehículo..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main DTC Codes List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div>
                <CardTitle className="text-base text-white">Códigos de Falla Detectados (DTC)</CardTitle>
                <p className="text-xs text-graphite-400 mt-0.5">
                  Resultados del barrido de la ECU del motor y subsistemas de emisiones
                </p>
              </div>
              <Badge
                variant={latestDiagnostic?.dtcs?.length ? 'warning' : 'success'}
                size="sm"
                dot
              >
                {latestDiagnostic?.dtcs?.length ? `${latestDiagnostic.dtcs.length} DTCs DETECTADOS` : 'SIN ANOMALÍAS'}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {latestDiagnostic?.dtcs && latestDiagnostic.dtcs.length > 0 ? (
                latestDiagnostic.dtcs.map((dtc) => (
                  <div
                    key={dtc.code}
                    className="p-4 rounded-xl bg-carbon-900 border border-brand/30 space-y-2 hover:border-brand/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-brand shrink-0" />
                        <span className="font-mono text-base font-bold text-brand">{dtc.code}</span>
                        <span className="text-graphite-500">•</span>
                        <Badge variant="warning" size="sm">{dtc.severity || 'MEDIA'}</Badge>
                      </div>
                      <Badge variant="outline" size="sm" className="font-mono">{dtc.status}</Badge>
                    </div>
                    <p className="text-xs text-graphite-200 leading-relaxed pl-7">
                      {dtc.description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl bg-carbon-900 border border-trust/40 flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-trust" />
                  <p className="text-sm font-bold text-white">Línea CAN Bus Limpia</p>
                  <p className="text-xs text-graphite-400 max-w-sm">
                    No se han detectado fallas activas ni códigos pendientes en la memoria permanente de la computadora del vehículo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Diagnostic Explanation Widget */}
          <div className="space-y-6">
            <Card className="border-brand/40 bg-gradient-to-br from-graphite-800 via-carbon to-carbon">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  <CardTitle className="text-base text-white">Interpretación ENGRAIN AI</CardTitle>
                </div>
                <Badge variant="warning" size="sm">ANÁLISIS TÉCNICO</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-xs leading-relaxed">
                <p className="text-graphite-300">
                  El código <span className="font-mono font-bold text-brand">P0420</span> indica que la señal del sensor de oxígeno secundario (Downstream) replica el comportamiento del sensor primario (Upstream), lo que sugiere degradación del convertidor catalítico o residuo de combustión incompleta.
                </p>

                <div className="p-3 rounded-lg bg-carbon border border-graphite-700 space-y-1.5">
                  <span className="font-semibold text-platinum block">Procedimiento Recomendado:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-graphite-400">
                    <li>Inspección de fugas en junta de múltiple de escape.</li>
                    <li>Prueba de banco al sensor MAF y descarbonización.</li>
                    <li>Verificación de mezcla estequiométrica con analizador de 4 gases.</li>
                  </ul>
                </div>

                <div className="pt-2 text-[11px] text-graphite-500 italic">
                  ENGRAIN AI asiste en el triaje de taller y nunca sustituye la inspección física y mediciones de un técnico certificado.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
