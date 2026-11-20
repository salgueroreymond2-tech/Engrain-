import { apiClient } from '../lib/api-client';
import { EvidenceItem, UploadIntentInput, UploadIntentResponse } from '../types/evidence';

const ENABLE_MOCKS = import.meta.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

export const evidenceService = {
  async createUploadIntent(input: UploadIntentInput): Promise<UploadIntentResponse> {
    try {
      return await apiClient<UploadIntentResponse>('/evidences/upload-intents', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return {
          uploadUrl: `https://mock-storage.engrain.io/upload/${encodeURIComponent(input.fileName)}`,
          storageKey: `evidence/${Date.now()}-${input.fileName}`,
        };
      }
      throw err;
    }
  },

  async registerEvidence(evidence: Omit<EvidenceItem, 'id' | 'createdAt'>): Promise<EvidenceItem> {
    try {
      return await apiClient<EvidenceItem>('/evidences', {
        method: 'POST',
        body: JSON.stringify(evidence),
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return {
          ...evidence,
          id: `evi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
          _isDemo: true,
        };
      }
      throw err;
    }
  },

  async deleteEvidence(id: string): Promise<void> {
    try {
      await apiClient<void>(`/evidences/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (ENABLE_MOCKS && (err.statusCode === 501 || err.code === 'NETWORK_ERROR')) {
        return;
      }
      throw err;
    }
  },
};
