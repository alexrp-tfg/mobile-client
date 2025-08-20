// API response interfaces - Infrastructure Layer

// TODO: Define exactly what the media upload API returns
export interface MediaUploadApiResponse {
  success: boolean;
  fileId?: string;
  message?: string;
  url?: string;
  metadata?: {
    size?: number;
    type?: string;
    uploadedAt?: string;
    // TODO: Add other metadata fields that the API might return
  };
}

// TODO: Define error response structure from the API
export interface ApiErrorResponse {
  error: {
    code: number;
    message: string;
    details?: string;
    // TODO: Add other error fields that the API might return
  };
}
