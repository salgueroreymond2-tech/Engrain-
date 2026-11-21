export type DiagnosticCatalogEntry = {
  code: string;
  title: string;
  plainLanguage: string;
  recommendedChecks: string[];
  severity: "INFO" | "WARNING" | "CRITICAL";
};

/** Small offline catalog used for the hackathon and as an AI-provider fallback. */
export const diagnosticCatalog: Record<string, DiagnosticCatalogEntry> = {
  P0128: {
    code: "P0128",
    title: "Temperatura de refrigerante inferior a la esperada",
    plainLanguage: "El motor tardó más de lo esperado en alcanzar su temperatura de operación. Puede requerir revisar el termostato, el sensor o el nivel de refrigerante.",
    recommendedChecks: ["Revisar nivel y estado del refrigerante con el motor frío.", "Comprobar termostato y lectura del sensor de temperatura."],
    severity: "WARNING"
  },
  P0171: {
    code: "P0171",
    title: "Mezcla pobre detectada",
    plainLanguage: "El sistema detectó más aire o menos combustible de lo previsto en el banco 1. Es una señal diagnóstica, no una confirmación de una causa única.",
    recommendedChecks: ["Inspeccionar admisión y mangueras por fugas.", "Revisar lecturas de combustible y sensores según el manual técnico."],
    severity: "WARNING"
  },
  P0300: {
    code: "P0300",
    title: "Fallas de encendido múltiples o aleatorias",
    plainLanguage: "El monitor detectó combustiones irregulares en más de un cilindro o sin un patrón fijo. Conviene una revisión técnica antes de viajes exigentes.",
    recommendedChecks: ["Revisar bujías, bobinas y conectores.", "Confirmar el código con una nueva lectura y una inspección de taller."],
    severity: "WARNING"
  },
  P0420: {
    code: "P0420",
    title: "Eficiencia del catalizador por debajo del umbral",
    plainLanguage: "El monitor de emisiones reportó una eficiencia inferior a su parámetro esperado. La lectura no identifica por sí sola qué componente debe reemplazarse.",
    recommendedChecks: ["Revisar datos de sensores de oxígeno y fugas de escape.", "Solicitar diagnóstico de emisiones con equipo adecuado."],
    severity: "WARNING"
  },
  P0562: {
    code: "P0562",
    title: "Voltaje del sistema bajo",
    plainLanguage: "El módulo detectó voltaje de alimentación inferior al rango esperado durante una lectura.",
    recommendedChecks: ["Comprobar batería, terminales y sistema de carga.", "Registrar voltaje en reposo y durante el arranque."],
    severity: "WARNING"
  }
};

export const catalogEntryFor = (code: string): DiagnosticCatalogEntry | undefined => diagnosticCatalog[code.toUpperCase()];
