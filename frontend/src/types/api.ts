/**
 * Centralized API Contract Types - ENGRAIN v1
 * strictly matching docs/API_CONTRACT.md
 */

export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiValidationErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiValidationErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
  meta?: {
    requestId?: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
