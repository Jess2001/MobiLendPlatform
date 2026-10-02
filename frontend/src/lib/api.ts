import { tokenStorage } from './tokenStorage';

const API_BASE = `${(import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8000'}/api/v1`;

// ---------------------------------------------------------------------------
// Types matching the backend exactly (apps/accounts/serializers.py)
// ---------------------------------------------------------------------------

export type Role =
  'CUSTOMER' | 'PARTNER_ADMIN' | 'CREDIT_OFFICER' | 'OPERATIONS' | 'FINANCE' | 'SUPERADMIN';

export interface User {
  id: number;
  email: string;
  phone_number: string | null;
  role: Role;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export type LoginFailureReason = 'invalid_credentials' | 'account_inactive' | 'too_many_attempts';
export type VerifyFailureReason =
  'wrong_code' | 'expired' | 'used' | 'too_many_attempts' | 'already_verified';
export type ResetFailureReason = 'invalid_or_expired';

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

/**
 * Thrown for any non-2xx response. `detail`/`reason` carry the backend's
 * {"detail": "...", "reason": "..."} shape used by login/verify/reset.
 * `fieldErrors` carries DRF's default per-field validation shape, used by
 * registration ({"email": ["..."], "password": ["..."]}).
 */
export class ApiError extends Error {
  status: number;
  detail?: string;
  reason?: string;
  fieldErrors?: Record<string, string[]>;
  // Present on 429s (see apps/core/exceptions.py's mobilend_exception_handler)
  retryAfterSeconds?: number;

  constructor(status: number, body: any) {
    const detail = typeof body?.detail === 'string' ? body.detail : undefined;
    super(detail ?? 'Request failed');
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.reason = typeof body?.reason === 'string' ? body.reason : undefined;
    this.retryAfterSeconds =
      typeof body?.retry_after_seconds === 'number' ? body.retry_after_seconds : undefined;

    if (!detail && body && typeof body === 'object') {
      // Shape is field-name -> string[] (DRF default validation errors)
      this.fieldErrors = body as Record<string, string[]>;
    }
  }
}

// A generic, connection-level failure (backend unreachable, CORS, etc).
export class NetworkError extends Error {
  constructor() {
    super("We couldn't reach MobiLend right now. Check your connection and try again.");
    this.name = 'NetworkError';
  }
}

// ---------------------------------------------------------------------------
// Core request function, with one-shot refresh-and-retry on 401
// ---------------------------------------------------------------------------

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // attach Authorization header
  isRetry?: boolean; // internal — prevents infinite refresh loops
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, isRetry = false } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const access = tokenStorage.getAccess();
    if (access) headers['Authorization'] = `Bearer ${access}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status === 401 && auth && !isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...options, isRetry: true });
    }
    tokenStorage.clear();
  }

  let data: any = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // non-JSON body — leave data null
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data as T;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStorage.setAccess(data.access);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Auth API surface
// ---------------------------------------------------------------------------

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
}

export interface LoginPayload {
  email_or_phone: string;
  password: string;
}

export const authApi = {
  register(payload: RegisterPayload) {
    return request<AuthResponse>('/auth/register/', { method: 'POST', body: payload });
  },

  login(payload: LoginPayload) {
    return request<AuthResponse>('/auth/login/', { method: 'POST', body: payload });
  },

  me() {
    return request<User>('/auth/me/', { auth: true });
  },

  verify(code: string) {
    return request<{ detail: string; user: User }>('/auth/verify/', {
      method: 'POST',
      body: { code },
      auth: true,
    });
  },

  resendVerification() {
    return request<{ detail: string }>('/auth/verify/resend/', {
      method: 'POST',
      auth: true,
    });
  },

  forgotPassword(email_or_phone: string) {
    return request<{ detail: string }>('/auth/password/forgot/', {
      method: 'POST',
      body: { email_or_phone },
    });
  },

  resetPassword(payload: { email_or_phone: string; code: string; new_password: string }) {
    return request<{ detail: string }>('/auth/password/reset/', {
      method: 'POST',
      body: payload,
    });
  },
};
