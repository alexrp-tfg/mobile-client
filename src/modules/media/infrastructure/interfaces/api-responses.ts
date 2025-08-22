// API response interfaces - Infrastructure Layer

export interface MediaUploadApiResponse {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
}

export interface ApiErrorResponse {
  message: string;
}
