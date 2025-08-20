import type { MediaFile, MediaUploadResult } from './entities.js';

// Interface for media services in the domain
export interface IMediaRepository {
  uploadImage(mediaFile: MediaFile): Promise<MediaUploadResult>;
}

// Interface for media processing services
export interface IMediaProcessingService {
  createMultipartBody(
    imageData: Uint8Array,
    fileName: string,
    fileType: string,
  ): Uint8Array;
}
