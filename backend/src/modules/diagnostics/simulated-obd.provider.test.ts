import { describe, expect, it } from "vitest";

import { AdapterObdProvider } from "./adapter-obd.provider";
import { SimulatedObdProvider } from "./simulated-obd.provider";

describe("SimulatedObdProvider", () => {
  it("emits explicitly simulated read-only data with the core OBD2 measurements", async () => {
    const reading = await new SimulatedObdProvider().read({ vehicleVin: "1HGCM82633A004352", scenario: "misfire" });

    expect(reading).toMatchObject({
      isSimulated: true,
      physicalConnectionVerified: false,
      vin: "1HGCM82633A004352",
      status: "SUCCESS"
    });
    expect(reading.troubleCodes).toContainEqual(expect.objectContaining({ code: "P0300" }));
    expect(reading.measurements.map((item) => item.metric)).toEqual(expect.arrayContaining([
      "engine_rpm", "coolant_temperature", "vehicle_speed", "fuel_level", "control_module_voltage", "catalyst_monitor"
    ]));
    expect(reading.rawPayload).toMatchObject({ simulated: true, scenario: "misfire" });
  });

  it("refuses to represent an unverified physical adapter as connected", async () => {
    const provider = new AdapterObdProvider({
      adapterName: "demo-adapter",
      hardwareVerified: false,
      readSnapshot: async () => { throw new Error("must not be called"); }
    });

    await expect(provider.read()).rejects.toMatchObject({ code: "OBD_HARDWARE_UNVERIFIED", statusCode: 503 });
  });
});
