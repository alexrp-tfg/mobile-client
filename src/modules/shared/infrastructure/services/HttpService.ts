import type { LoginResponseBody } from '../../../authorization/domain/entities.js';
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

  async login(username: string, password: string): Promise<boolean> {
    const response = await this.post<LoginResponseBody>(
      '/login',
      JSON.stringify({ username, password }),
      { 'Content-Type': 'application/json' },
    );

    if (response.success && response.data) {
      this.defaultHeaders.Authorization = `Bearer ${response.data.token}`;
      return true;
    } else {
      return false;
    }
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

      const data = await response.json();
      if (!response.ok) {
        const error = new ApiError(
          response.status,
          data.message,
          `HTTP ${response.status}: ${response.statusText}`,
        );
        return HttpResponse.failure<T>(error);
      }

      return HttpResponse.success<T>(data.data);
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
