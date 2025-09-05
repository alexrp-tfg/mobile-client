import type { IMediaRepository } from '../../domain/interfaces.js';
import type { IStorageService } from '../../../shared/domain/interfaces.js';
import {
  MediaFile,
  MediaUploadError,
  MediaUploadResult,
} from '../../domain/entities.js';

export class UploadImageUseCase {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    imageUrl: string,
    fileName?: string,
    fileType?: string,
  ): Promise<MediaUploadResult | MediaUploadError> {
    try {
      // Get image data from storage
      const imageData = this.storageService.getImageAsUint8Array(imageUrl);

      if (!imageData) {
        return new MediaUploadError('Image data not found', 404);
      }

      // Create the MediaFile domain object
      const mediaFile = new MediaFile(
        imageUrl,
        fileName || 'image.jpg',
        fileType || 'image/jpeg',
        imageData,
      );

      // Delegate upload to repository
      return await this.mediaRepository.uploadImage(mediaFile);
    } catch (error) {
      return new MediaUploadError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
      );
    }
  }
}
