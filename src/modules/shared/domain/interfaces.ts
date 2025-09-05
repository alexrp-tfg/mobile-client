import type { HttpResponse, ImageData } from './entities.js';

// Interface for HTTP services
export interface IHttpService {
  login(username: string, password: string): Promise<boolean>;
  post<T>(
    endpoint: string,
    body: BodyInit,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>>;
  get<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>>;
  delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<HttpResponse<T>>;
}

// Interface for local storage services
export interface IStorageService {
  getImages(limit?: number, offset?: number): ImageData[];
  getImageAsUint8Array(imageUrl: string): Uint8Array | null;
}

// Interface for database services
export interface IDatabaseService {
  // Core database methods
  initializeDatabase(
    dbName: string,
    version: number,
    tables: Array<{ name: string; sql: string }>,
  ): { success: boolean; error?: string };

  executeSql(
    query: string,
    params?: Array<string | number | boolean | null>,
  ): {
    success: boolean;
    data?: Array<Record<string, string | number | boolean | null>>;
    rowsAffected?: number;
    insertId?: number;
    error?: string;
  };

  // Convenience methods
  createTable(tableName: string, columns: string): Promise<boolean>;

  insert(
    tableName: string,
    data: Record<string, string | number | boolean | null>,
  ): Promise<{ success: boolean; insertId?: number; error?: string }>;

  select(
    tableName: string,
    where?: string,
    params?: Array<string | number | boolean | null>,
  ): Promise<Array<Record<string, string | number | boolean | null>>>;

  update(
    tableName: string,
    data: Record<string, string | number | boolean | null>,
    where: string,
    whereParams?: Array<string | number | boolean | null>,
  ): Promise<{ success: boolean; rowsAffected?: number; error?: string }>;

  delete(
    tableName: string,
    where?: string,
    params?: Array<string | number | boolean | null>,
  ): Promise<{ success: boolean; rowsAffected?: number; error?: string }>;

  // Transaction methods
  beginTransaction(): Promise<boolean>;
  commitTransaction(): Promise<boolean>;
  rollbackTransaction(): Promise<boolean>;

  executeInTransaction(
    queries: Array<{
      query: string;
      params?: Array<string | number | boolean | null>;
    }>,
  ): Promise<{ success: boolean; error?: string }>;
}
