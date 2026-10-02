const ACCESS_KEY = 'mobilend_access_token';
const REFRESH_KEY = 'mobilend_refresh_token';

/**
 * Thin wrapper around localStorage for JWT persistence.
 *
 * Note: localStorage is readable by any script on the page, so this is
 * vulnerable to XSS token theft in a way an httpOnly cookie wouldn't be.
 * That's an acceptable tradeoff for this project's scope (no BFF layer
 * to set httpOnly cookies from), but worth knowing if this ever needs to
 * harden further.
 */
export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  setAccess(access: string): void {
    localStorage.setItem(ACCESS_KEY, access);
  },
  clear(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
