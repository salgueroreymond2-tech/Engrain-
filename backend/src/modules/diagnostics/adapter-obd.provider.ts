import { AppError } from "../../shared/errors/app-error";
import type { ObdDiagnosticReading, ObdProvider, PhysicalObdAdapter } from "./obd.types";

/**
 * Read-only bridge for a vendor adapter. No concrete hardware driver is shipped in the MVP.
 * The guard deliberately prevents this provider from being represented as operational until a
 * compatible physical adapter has been validated.
 */
export class AdapterObdProvider implements ObdProvider {
  readonly key: string;
  readonly isSimulated = false;

  constructor(private readonly adapter: PhysicalObdAdapter) {
    this.key = `adapter:${adapter.adapterName}`;
  }

  async read(): Promise<ObdDiagnosticReading> {
    if (!this.adapter.hardwareVerified) {
      throw new AppError(503, "OBD_HARDWARE_UNVERIFIED", "Physical OBD2 connectivity is not enabled until compatible hardware is validated.");
    }
    const snapshot = await this.adapter.readSnapshot();
    return { ...snapshot, providerKey: this.key, isSimulated: false, physicalConnectionVerified: true };
  }
}
