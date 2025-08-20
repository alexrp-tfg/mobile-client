// Shared domain entities
export class ApiError {
  constructor(
    public readonly code: number,
    public readonly message: string,
    public readonly details?: string,
  ) {}
}

export class HttpResponse<T> {
  constructor(
    public readonly data: T | null,
    public readonly error: ApiError | null,
    public readonly success: boolean,
  ) {}

  static success<T>(data: T): HttpResponse<T> {
    return new HttpResponse(data, null, true);
  }

  static failure<T>(error: ApiError): HttpResponse<T> {
    return new HttpResponse<T>(null, error, false);
  }
}
