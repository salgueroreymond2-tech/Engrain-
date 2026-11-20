import { apiClient } from '../lib/api-client';
import { AssistantResponse } from '../types/ai';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

export const assistantService = {
  async sendMessage(content: string, vehicleId?: string, conversationId?: string): Promise<AssistantResponse> {
    try {
      return await apiClient<AssistantResponse>('/assistant/messages', {
        method: 'POST',
        body: JSON.stringify({ content, vehicleId, conversationId }),
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return {
          conversationId: conversationId || `conv-${Date.now()}`,
          message: {
            id: `msg-${Date.now()}`,
            role: 'ASSISTANT',
            content: `He analizado tu consulta sobre el vehículo. Como asistente inteligente de ENGRAIN, puedo indicarte que los mantenimientos registrados están al corriente y no se detectan fallas críticas en los sensores principales.`,
            createdAt: new Date().toISOString(),
          },
          disclaimers: [
            'ENGRAIN AI asiste con explicaciones y análisis de riesgos basados en datos.',
            'No sustituye una inspección física ni diagnóstico certificado en taller.',
          ],
        };
      }
      throw err;
    }
  },
};
