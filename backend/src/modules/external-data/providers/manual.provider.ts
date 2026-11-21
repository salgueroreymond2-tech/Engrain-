import type { NormalizedPlate, ProviderDefinition, ProviderLookupResult, VehicleInformationProvider } from "./types";

export class ManualPortalProvider implements VehicleInformationProvider {
  constructor(readonly definition: ProviderDefinition) {}

  async lookup(_plate: NormalizedPlate): Promise<ProviderLookupResult> {
    return {
      status: "MANUAL_REQUIRED",
      records: [],
      instructions: "This source has no verified, authorized individual-plate API in ENGRAIN. Open the official portal and attach authorized documentary evidence instead."
    };
  }
}

export class HaciendaProvider extends ManualPortalProvider {
  constructor() {
    super({
      code: "HACIENDA", name: "Ministerio de Hacienda", status: "MANUAL_ONLY", supportsPlateLookup: true, allowsAutomation: false,
      requiresCredentials: false, requiresAgreement: false, documentationUrl: "https://serviciosnet.hacienda.go.cr/autogestion/",
      manualPortalUrl: "https://serviciosnet.hacienda.go.cr/autogestion/", dataClassification: "FINANCIAL",
      termsSummary: "Official web consultation exposes vehicle characteristics, fiscal value and property tax; no documented authorized API was identified."
    });
  }
}

export class INSProvider extends ManualPortalProvider {
  constructor() {
    super({
      code: "INS", name: "Instituto Nacional de Seguros", status: "MANUAL_ONLY", supportsPlateLookup: true, allowsAutomation: false,
      requiresCredentials: false, requiresAgreement: false, documentationUrl: "https://marchamo.ins-cr.com/marchamo/inicio.aspx",
      manualPortalUrl: "https://marchamo.ins-cr.com/marchamo/inicio.aspx", dataClassification: "FINANCIAL",
      termsSummary: "Marchamo is an official web consultation and payment portal. ENGRAIN does not automate its forms or process owner data."
    });
  }
}

export class DekraProvider extends ManualPortalProvider {
  constructor() {
    super({
      code: "DEKRA", name: "DEKRA Costa Rica", status: "MANUAL_ONLY", supportsPlateLookup: true, allowsAutomation: false,
      requiresCredentials: false, requiresAgreement: false, documentationUrl: "https://www.dekra.cr/es/inspeccion-vehicular/",
      manualPortalUrl: "https://www.dekra.cr/es/inspeccion-vehicular/", dataClassification: "PUBLIC_TECHNICAL",
      termsSummary: "The official site documents appointment flows by plate/DUA, not an authorized API for inspection histories or defects."
    });
  }
}

export class CoseviProvider extends ManualPortalProvider {
  constructor() {
    super({
      code: "COSEVI", name: "Consejo de Seguridad Vial", status: "REQUIRES_CREDENTIALS", supportsPlateLookup: false, allowsAutomation: true,
      requiresCredentials: true, requiresAgreement: false, documentationUrl: "https://datosabiertos.csv.go.cr/developers/",
      manualPortalUrl: "https://www.csv.go.cr/web/guest/consulta-infracciones-publica", dataClassification: "PERSONAL_OR_REGISTRY",
      termsSummary: "The open-data API requires an auth key and documents statistical datasets; no authorized individual-plate infraction API was identified."
    });
  }
}

export class RegistroNacionalProvider extends ManualPortalProvider {
  constructor() {
    super({
      code: "REGISTRO_NACIONAL", name: "Registro Nacional de Costa Rica", status: "REQUIRES_AGREEMENT", supportsPlateLookup: false, allowsAutomation: false,
      requiresCredentials: true, requiresAgreement: true, documentationUrl: "https://consultas.registronacional.go.cr/index.htm",
      manualPortalUrl: "https://consultas.registronacional.go.cr/index.htm", dataClassification: "PERSONAL_OR_REGISTRY",
      termsSummary: "Official consultations and certifications use the Registry portal and may require account, payment or authorization. No public integration API was identified."
    });
  }
}

export class ManualDocumentProvider extends ManualPortalProvider {
  constructor() {
    super({
      code: "MANUAL_DOCUMENT", name: "Documento autorizado por usuario", status: "AVAILABLE", supportsPlateLookup: false, allowsAutomation: false,
      requiresCredentials: false, requiresAgreement: false, dataClassification: "USER_PROVIDED",
      termsSummary: "ENGRAIN records document metadata and SHA-256 supplied under the user's authorization; it does not store the file binary in this MVP."
    });
  }
}
