import type { GetAllImagesDto } from '../../shared/infrastructure/dtos/get-all-images.dto.js';
import type { MediaFile, MediaUploadError, MediaUploadResult } from './entities.js';

// Interface for media services in the domain
export interface IMediaRepository {
  uploadImage(mediaFile: MediaFile): Promise<MediaUploadResult | MediaUploadError>;
  getAllImages(): Promise<GetAllImagesDto[]>;
}

// Interface for media processing services
export interface IMediaProcessingService {
  createMultipartBody(
    imageData: Uint8Array,
    fileName: string,
    fileType: string,
  ): {
    data: Uint8Array;
    boundary: string;
  };
}
