import { z } from "zod";

import { env } from "../../config/env";
import { catalogEntryFor } from "./diagnostic-catalog";

export type AiAnalysisKind = "DTC_INTERPRETATION" | "DIAGNOSTIC_EXPLANATION" | "MAINTENANCE_ANALYSIS" | "RECOMMENDATIONS" | "INCONSISTENCIES" | "HISTORY_QUESTION";

export type AiDiagnosticContext = {
  id: string;
  scannedAt: Date;
  mileageKm: number | null;
  isSimulated: boolean;
  troubleCodes: Array<{ code: string; severity: "INFO" | "WARNING" | "CRITICAL"; description: string | null }>;
};

export type AiAnalysisContext = {
  kind: AiAnalysisKind;
  question?: string;
  vehicle: { id: string; make: string; model: string; year: number; mileageKm: number };
  diagnostics: AiDiagnosticContext[];
  maintenances: Array<{ id: string; title: string; performedAt: Date | null; mileageKm: number | null; status: string }>;
  schedules: Array<{ id: string; title: string; intervalKm: number | null; intervalDays: number | null; nextDueMileageKm: number | null; nextDueAt: Date | null }>;
  mileageLogs: Array<{ id: string; mileageKm: number; recordedAt: Date; inconsistencyDetected: boolean; inconsistencyReason: string | null }>;
};

export type AiFinding = {
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
};

export type AiNarrative = {
  summary: string;
  findings: AiFinding[];
  recommendations: string[];
};

export interface AIProvider {
  readonly key: string;
  analyze(context: AiAnalysisContext): Promise<AiNarrative>;
}

const remoteNarrativeSchema = z.object({
  summary: z.string().trim().min(1).max(1400),
  findings: z.array(z.object({
    severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
    title: z.string().trim().min(1).max(160),
    message: z.string().trim().min(1).max(1200)
  })).max(12),
  recommendations: z.array(z.string().trim().min(1).max(500)).max(12)
});

const dated = (value: Date | null) => value ? value.toISOString().slice(0, 10) : "sin fecha";

export class LocalDiagnosticAIProvider implements AIProvider {
  readonly key = "local-diagnostic-catalog";

  async analyze(context: AiAnalysisContext): Promise<AiNarrative> {
    const dtcs = context.diagnostics.flatMap((scan) => scan.troubleCodes.map((code) => ({ ...code, scanId: scan.id, scannedAt: scan.scannedAt })));
    const findings: AiFinding[] = [];
    const recommendations = new Set<string>();

    if (context.kind === "DTC_INTERPRETATION" || context.kind === "DIAGNOSTIC_EXPLANATION" || context.kind === "HISTORY_QUESTION") {
      for (const dtc of dtcs) {
        const catalog = catalogEntryFor(dtc.code);
        findings.push({
          severity: catalog?.severity ?? dtc.severity,
          title: catalog ? `${dtc.code} — ${catalog.title}` : `${dtc.code} — Código sin catálogo local`,
          message: catalog?.plainLanguage ?? dtc.description ?? "El código fue registrado por el escáner y requiere interpretación técnica adicional."
        });
        for (const recommendation of catalog?.recommendedChecks ?? ["Confirmar el código con una nueva lectura y un diagnóstico técnico."]) recommendations.add(recommendation);
      }
    }

    if (context.kind === "MAINTENANCE_ANALYSIS" || context.kind === "HISTORY_QUESTION") {
      const latest = context.maintenances[0];
      findings.push({
        severity: "INFO",
        title: "Historial de mantenimiento",
        message: latest
          ? `Hay ${context.maintenances.length} registros consultables; el más reciente es “${latest.title}” (${dated(latest.performedAt)}).`
          : "No hay registros de mantenimiento autorizados disponibles para este vehículo."
      });
    }

    if (context.kind === "RECOMMENDATIONS" || context.kind === "HISTORY_QUESTION") {
      for (const schedule of context.schedules) {
        const dueByMileage = schedule.nextDueMileageKm !== null && context.vehicle.mileageKm >= schedule.nextDueMileageKm;
        const dueByDate = schedule.nextDueAt !== null && schedule.nextDueAt <= new Date();
        if (dueByMileage || dueByDate) {
          findings.push({ severity: "WARNING", title: `Revisión pendiente: ${schedule.title}`, message: "El intervalo registrado indica que esta revisión merece atención." });
        }
        recommendations.add(`Revisar el intervalo registrado para “${schedule.title}” antes de programar el próximo servicio.`);
      }
      if (context.schedules.length === 0) recommendations.add("Registrar intervalos de mantenimiento recomendados por el fabricante cuando estén disponibles.");
    }

    if (context.kind === "INCONSISTENCIES" || context.kind === "HISTORY_QUESTION") {
      const flagged = context.mileageLogs.filter((item) => item.inconsistencyDetected);
      for (const log of flagged) {
        findings.push({
          severity: "WARNING",
          title: "Lectura de kilometraje para revisión",
          message: log.inconsistencyReason ?? `La lectura de ${log.mileageKm} km requiere revisión frente al historial previo.`
        });
      }
      if (flagged.length > 0) recommendations.add("Comparar las lecturas con documentación y una inspección física durante la revisión; una inconsistencia no atribuye intención ni responsabilidad.");
    }

    if (context.kind === "HISTORY_QUESTION" && findings.length === 0) {
      findings.push({ severity: "INFO", title: "Consulta de historial", message: "La respuesta se limita a los diagnósticos, mantenimientos, intervalos y kilometrajes autorizados disponibles." });
    }
    if (context.kind !== "HISTORY_QUESTION" && findings.length === 0) {
      findings.push({ severity: "INFO", title: "Sin alertas en el conjunto consultado", message: "No se encontraron códigos o señales relevantes en los registros autorizados seleccionados." });
    }

    const summaryByKind: Record<AiAnalysisKind, string> = {
      DTC_INTERPRETATION: `Se interpretaron ${dtcs.length} código(s) DTC con el catálogo local.`,
      DIAGNOSTIC_EXPLANATION: `Se resumieron ${context.diagnostics.length} diagnóstico(s) autorizados.`,
      MAINTENANCE_ANALYSIS: "Se analizó el historial de mantenimiento autorizado disponible.",
      RECOMMENDATIONS: "Las recomendaciones se basan únicamente en los intervalos registrados disponibles.",
      INCONSISTENCIES: "Las señales de inconsistencia requieren revisión; no constituyen una acusación ni una conclusión mecánica.",
      HISTORY_QUESTION: `Respuesta local para la consulta: “${context.question ?? "historial del vehículo"}”.`
    };
    return { summary: summaryByKind[context.kind], findings: findings.slice(0, 12), recommendations: [...recommendations].slice(0, 12) };
  }
}

class OpenAiCompatibleProvider implements AIProvider {
  readonly key = "openai-compatible";

  constructor(private readonly baseUrl: string, private readonly apiKey: string, private readonly model: string, private readonly timeoutMs: number) {}

  async analyze(context: AiAnalysisContext): Promise<AiNarrative> {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
        signal: abort.signal,
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You explain authorized automotive diagnostic history. Never claim a repair occurred, certify a repair, guarantee mechanical condition, diagnose beyond available records, or instruct ECU programming, clearing codes, or component control. Reply with JSON: summary, findings[{severity,title,message}], recommendations." },
            { role: "user", content: JSON.stringify(context) }
          ]
        })
      });
      if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("AI provider returned no content");
      return remoteNarrativeSchema.parse(JSON.parse(content));
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const configuredAiProvider = (): AIProvider | undefined => {
  if (env.AI_PROVIDER !== "openai-compatible" || !env.AI_API_BASE_URL || !env.AI_API_KEY) return undefined;
  return new OpenAiCompatibleProvider(env.AI_API_BASE_URL, env.AI_API_KEY, env.AI_MODEL, env.AI_REQUEST_TIMEOUT_MS);
};
