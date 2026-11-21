/**
 * ENGRAIN — Driving Trust
 * Helper to determine if the application is running in explicit demonstration mode.
 * Explicit demo mode is active when:
 * 1. A demo user is stored ('engrain_demo_user').
 * 2. An explicit demo flag is active ('engrain_demo_mode').
 * 3. The current auth token is a demo token ('demo-jwt-token-engrain').
 */

export const isExplicitDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  const demoUser = localStorage.getItem('engrain_demo_user');
  const demoFlag = localStorage.getItem('engrain_demo_mode') === 'true';
  const token = localStorage.getItem('engrain_token');
  return Boolean(demoUser || demoFlag || token === 'demo-jwt-token-engrain');
};

export const setExplicitDemoMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  if (enabled) {
    localStorage.setItem('engrain_demo_mode', 'true');
  } else {
    localStorage.removeItem('engrain_demo_mode');
    localStorage.removeItem('engrain_demo_user');
  }
};
