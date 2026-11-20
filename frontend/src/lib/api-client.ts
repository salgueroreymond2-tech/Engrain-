import { ApiResponse, ApiErrorResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: Array<{ path: string; message: string }>;
  requestId?: string;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    details?: Array<{ path: string; message: string }>,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;
  }
}

let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (token) {
    localStorage.setItem('engrain_token', token);
  } else {
    localStorage.removeItem('engrain_token');
  }
};

export const getAuthToken = (): string | null => {
  if (!currentToken) {
    currentToken = localStorage.getItem('engrain_token');
  }
  return currentToken;
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...customConfig } = options;

  let url = `${API_BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getAuthToken();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...customConfig,
    headers: requestHeaders,
  });

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  let data: ApiResponse<T> | ApiErrorResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      'Respuesta de red inválida o servidor no disponible.',
      'NETWORK_ERROR',
      response.status
    );
  }

  if (!response.ok || !data.success) {
    const errorPayload = !data.success
      ? data.error
      : { code: 'UNKNOWN_ERROR', message: response.statusText };
    const requestId = !data.success ? data.meta?.requestId : undefined;

    throw new ApiError(
      errorPayload.message || 'Error en la petición al servidor',
      errorPayload.code || 'UNKNOWN_ERROR',
      response.status,
      errorPayload.details,
      requestId
    );
  }

  return data.data;
}
