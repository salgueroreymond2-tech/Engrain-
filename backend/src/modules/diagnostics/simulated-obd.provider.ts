import type { ObdDiagnosticReading, ObdMeasurement, ObdProvider, ObdTroubleCode } from "./obd.types";

export const simulatedObdScenarios = ["healthy", "misfire", "catalyst", "cooling"] as const;
export type SimulatedObdScenario = (typeof simulatedObdScenarios)[number];

const measurement = (
  metric: string,
  label: string,
  rawValue: string,
  normalizedValue: number | undefined,
  unit: string | undefined,
  capturedAt: Date
): ObdMeasurement => ({ metric, label, rawValue, normalizedValue, unit, capturedAt });

const baseMeasurements = (capturedAt: Date): ObdMeasurement[] => [
  measurement("engine_rpm", "RPM del motor", "780", 780, "rpm", capturedAt),
  measurement("coolant_temperature", "Temperatura del refrigerante", "89", 89, "°C", capturedAt),
  measurement("vehicle_speed", "Velocidad del vehículo", "0", 0, "km/h", capturedAt),
  measurement("fuel_level", "Nivel de combustible", "62.4", 62.4, "%", capturedAt),
  measurement("short_term_fuel_trim_bank_1", "Ajuste corto de combustible banco 1", "1.6", 1.6, "%", capturedAt),
  measurement("oxygen_sensor_1_voltage", "Voltaje sensor O2 banco 1 sensor 1", "0.72", 0.72, "V", capturedAt),
  measurement("control_module_voltage", "Voltaje del módulo", "13.9", 13.9, "V", capturedAt),
  measurement("catalyst_monitor", "Monitor de catalizador", "COMPLETE", undefined, undefined, capturedAt),
  measurement("evap_monitor", "Monitor EVAP", "COMPLETE", undefined, undefined, capturedAt)
];

const scenarioData = (scenario: SimulatedObdScenario, capturedAt: Date): { troubleCodes: ObdTroubleCode[]; measurements: ObdMeasurement[] } => {
  const measurements = baseMeasurements(capturedAt);
  if (scenario === "misfire") {
    return {
      troubleCodes: [{ code: "P0300", status: "ACTIVE", severity: "WARNING", description: "Random/multiple cylinder misfire detected." }],
      measurements: measurements.map((item) => item.metric === "engine_rpm" ? measurement(item.metric, item.label, "920", 920, "rpm", capturedAt) : item)
    };
  }
  if (scenario === "catalyst") {
    return {
      troubleCodes: [{ code: "P0420", status: "ACTIVE", severity: "WARNING", description: "Catalyst system efficiency below threshold." }],
      measurements: measurements.map((item) => item.metric === "oxygen_sensor_1_voltage" ? measurement(item.metric, item.label, "0.15", 0.15, "V", capturedAt) : item)
    };
  }
  if (scenario === "cooling") {
    return {
      troubleCodes: [{ code: "P0128", status: "ACTIVE", severity: "WARNING", description: "Coolant thermostat temperature below regulating temperature." }],
      measurements: measurements.map((item) => item.metric === "coolant_temperature" ? measurement(item.metric, item.label, "68", 68, "°C", capturedAt) : item)
    };
  }
  return { troubleCodes: [], measurements };
};

/** Hackathon-only generator. Every emitted record is explicitly marked as simulated. */
export class SimulatedObdProvider implements ObdProvider {
  readonly key = "simulated-obd";
  readonly isSimulated = true;

  async read(request: { vehicleVin: string; scenario?: string }): Promise<ObdDiagnosticReading> {
    const scenario = simulatedObdScenarios.includes(request.scenario as SimulatedObdScenario)
      ? request.scenario as SimulatedObdScenario
      : "healthy";
    const capturedAt = new Date();
    const data = scenarioData(scenario, capturedAt);

    return {
      providerKey: this.key,
      providerMetadata: { scenario, purpose: "hackathon-demo" },
      isSimulated: true,
      physicalConnectionVerified: false,
      vin: request.vehicleVin,
      capturedAt,
      status: "SUCCESS",
      mileageKm: 72_450,
      troubleCodes: data.troubleCodes,
      measurements: data.measurements,
      rawPayload: {
        simulated: true,
        scenario,
        protocol: "SIMULATED-OBD2",
        generatedAt: capturedAt.toISOString(),
        measurements: data.measurements.map(({ metric, rawValue, unit }) => ({ metric, rawValue, ...(unit ? { unit } : {}) })),
        troubleCodes: data.troubleCodes.map((item) => item.code)
      }
    };
  }
}
