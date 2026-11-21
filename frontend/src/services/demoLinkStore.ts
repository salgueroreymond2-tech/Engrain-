/**
 * ENGRAIN — Driving Trust
 * demoLinkStore — Almacenamiento local para enlaces de Pasaporte Digital en Modo Demostración.
 *
 * IMPORTANTE:
 * - Se utiliza EXCLUSIVAMENTE para simulación en modo demo.
 * - La persistencia se realiza en localStorage del navegador actual.
 * - NO se sincroniza entre diferentes navegadores o dispositivos.
 * - Los pasaportes reales en producción NUNCA utilizan esta tienda; se validan directamente contra el backend.
 */

const STORAGE_KEY = 'engrain_demo_links';

export interface DemoLinkState {
  token: string;
  status: 'ACTIVE' | 'REVOKED';
  updatedAt: string;
}

export const demoLinkStore = {
  getLinks(): Record<string, DemoLinkState> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  getStatus(token: string): 'ACTIVE' | 'REVOKED' {
    const links = this.getLinks();
    if (links[token]) {
      return links[token].status;
    }
    // Por defecto, si es un token de demo no registrado explícitamente como revocado, está activo
    return 'ACTIVE';
  },

  setLink(token: string, status: 'ACTIVE' | 'REVOKED'): void {
    const links = this.getLinks();
    links[token] = {
      token,
      status,
      updatedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch (e) {
      console.warn('No se pudo persistir el enlace demo en localStorage', e);
    }
  },

  revoke(token: string): void {
    this.setLink(token, 'REVOKED');
  },

  regenerate(oldToken: string, newToken: string): void {
    if (oldToken) {
      this.revoke(oldToken);
    }
    this.setLink(newToken, 'ACTIVE');
  },

  isDemoToken(token: string): boolean {
    return (
      token.startsWith('demo-') ||
      token.startsWith('engrain-demo') ||
      token === 'demo-token-123' ||
      token.startsWith('engrain-')
    );
  },
};
