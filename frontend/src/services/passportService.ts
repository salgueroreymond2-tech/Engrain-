import { apiClient, ApiError } from '../lib/api-client';
import { Passport, PassportVisibility } from '../types/passport';
import { MOCK_PASSPORT } from './mockAdapters';
import { demoLinkStore } from './demoLinkStore';
import { isExplicitDemoMode } from '../lib/demo-mode';

export const passportService = {
  /**
   * Consulta pública de pasaporte por token público.
   * NO envía encabezado de autorización JWT (acceso público).
   * Respeta los códigos de estado del servidor:
   * - 200: ACTIVO con datos verificados.
   * - 410: REVOCADO o EXPIRADO (sin revelar datos del vehículo).
   * - 404: INVÁLIDO (token desconocido).
   * - 401: RESTRICCIÓN (si el backend requiere auth indebidamente).
   */
  async getPassportByToken(publicToken: string): Promise<Passport> {
    // Si es un token demo o la sesión está en modo demostración explícito:
    if (demoLinkStore.isDemoToken(publicToken) || isExplicitDemoMode()) {
      const demoStatus = demoLinkStore.getStatus(publicToken);
      if (demoStatus === 'REVOKED') {
        throw new ApiError(
          'Este enlace de pasaporte digital ha sido revocado por el propietario.',
          'REVOKED',
          410
        );
      }
      return {
        ...MOCK_PASSPORT,
        publicToken,
        _isDemo: true,
      };
    }

    try {
      const res = await apiClient<any>(`/passports/public/${publicToken}`, {
        skipAuth: true,
      });

      // Si el backend devuelve { passport, vehicle, maintenances }
      if (res?.passport) {
        const p = res.passport;
        const v = res.vehicle || {};
        const mList = res.maintenances || [];
        const normalized: Passport = {
          id: p.id,
          vehicleId: p.vehicleId,
          publicToken: p.publicToken || publicToken,
          visibility: p.visibility || 'PUBLIC',
          status: p.status || 'ACTIVE',
          expiresAt: p.expiresAt,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          _isDemo: false,
          snapshot: p.snapshot || {
            vehicle: {
              vin: v.vin || 'VIN NO DISPONIBLE',
              plate: v.plate || 'S/P',
              make: v.make || 'Vehículo Certificado',
              model: v.model || '',
              year: v.year || new Date().getFullYear(),
              mileageKm: v.mileageKm || 0,
            },
            metrics: {
              trustScore: mList.length > 0 ? 100 : 85,
              totalInterventions: mList.length,
              activeAlertsCount: 0,
              verifiedMileage: true,
              lastInspectionDate: mList[0]?.completedAt || mList[0]?.createdAt,
            },
            records: mList.map((m: any) => ({
              date: m.completedAt || m.createdAt,
              type: 'MAINTENANCE',
              title: m.title || 'Mantenimiento Preventivo',
              source: 'Taller Autorizado ENGRAIN',
              mileageKm: m.mileageKm || v.mileageKm || 0,
              verified: true,
              notes: m.description,
            })),
            generatedAt: p.createdAt || new Date().toISOString(),
          },
        };
        return normalized;
      }

      if (res?.snapshot) {
        return { ...res, _isDemo: false };
      }

      return {
        ...res,
        _isDemo: false,
      };
    } catch (err: any) {
      // NUNCA hacer fallback silencioso a mocks en modo real
      throw err;
    }
  },

  async getPassportById(id: string): Promise<Passport> {
    if (isExplicitDemoMode()) {
      return {
        ...MOCK_PASSPORT,
        id,
        _isDemo: true,
      };
    }

    try {
      const res = await apiClient<Passport>(`/passports/${id}`);
      return {
        ...res,
        _isDemo: false,
      };
    } catch (err: any) {
      throw err;
    }
  },

  async createPassport(
    vehicleId: string,
    visibility: PassportVisibility = 'PUBLIC'
  ): Promise<Passport> {
    if (isExplicitDemoMode()) {
      const demoToken = `engrain-demo-${Math.random().toString(36).substring(2, 9)}`;
      demoLinkStore.setLink(demoToken, 'ACTIVE');
      return {
        ...MOCK_PASSPORT,
        id: `pass-demo-${Date.now()}`,
        vehicleId,
        publicToken: demoToken,
        visibility,
        status: 'ACTIVE',
        _isDemo: true,
      };
    }

    try {
      const res = await apiClient<Passport>('/passports', {
        method: 'POST',
        body: JSON.stringify({ vehicleId, visibility }),
      });
      return {
        ...res,
        _isDemo: false,
      };
    } catch (err: any) {
      throw err;
    }
  },

  async updatePassport(
    id: string,
    updates: { visibility?: PassportVisibility; status?: 'ACTIVE' | 'REVOKED' }
  ): Promise<Passport> {
    if (isExplicitDemoMode()) {
      return {
        ...MOCK_PASSPORT,
        id,
        ...updates,
        _isDemo: true,
      };
    }

    try {
      const res = await apiClient<Passport>(`/passports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return {
        ...res,
        _isDemo: false,
      };
    } catch (err: any) {
      throw err;
    }
  },

  async revokePassport(id: string, publicToken?: string): Promise<Passport> {
    if (publicToken && (demoLinkStore.isDemoToken(publicToken) || isExplicitDemoMode())) {
      demoLinkStore.revoke(publicToken);
    }
    return this.updatePassport(id, { status: 'REVOKED' });
  },

  // Compatibilidad explícita para el modo demostración
  async revokeLink(token: string): Promise<void> {
    demoLinkStore.revoke(token);
  },
};
