import { ApiError, HttpResponse } from '../../domain/entities.js';
import type { IHttpService } from '../../domain/interfaces.js';

export class HttpService implements IHttpService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      Authorization: `Bearer ${authToken}`,
    };
  }

  async post<T>(
    endpoint: string,
    body: BodyInit,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, headers);
  }

  async get<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, headers);
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body?: BodyInit,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        body,
      });

      if (!response.ok) {
        const error = new ApiError(
          response.status,
          response.statusText,
          `HTTP ${response.status}: ${response.statusText}`,
        );
        return HttpResponse.failure<T>(error);
      }

      const data = await response.json();
      return HttpResponse.success<T>(data);
    } catch (error) {
      const apiError = new ApiError(
        0,
        'Network Error',
        error instanceof Error ? error.message : 'Unknown network error',
      );
      return HttpResponse.failure<T>(apiError);
    }
  }
}
