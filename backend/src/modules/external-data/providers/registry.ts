import { CoseviProvider, DekraProvider, HaciendaProvider, INSProvider, ManualDocumentProvider, RegistroNacionalProvider } from "./manual.provider";
import { MockVehicleProvider } from "./mock.provider";
import type { ProviderCode, VehicleInformationProvider } from "./types";

const providers: VehicleInformationProvider[] = [
  new HaciendaProvider(), new INSProvider(), new DekraProvider(), new CoseviProvider(), new RegistroNacionalProvider(), new ManualDocumentProvider(), new MockVehicleProvider()
];

export const vehicleInformationProviders = (): VehicleInformationProvider[] => providers;
export const vehicleInformationProvider = (code: ProviderCode): VehicleInformationProvider | undefined => providers.find((provider) => provider.definition.code === code);
