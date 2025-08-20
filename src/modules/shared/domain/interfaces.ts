import type { HttpResponse } from './entities.js';

// Interface for HTTP services
export interface IHttpService {
  post<T>(
    endpoint: string,
    body: BodyInit,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>>;
  get<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>>;
}

// Interface for local storage services
export interface IStorageService {
  getImages(): string[];
  getImageAsUint8Array(imageUrl: string): Uint8Array | null;
}
