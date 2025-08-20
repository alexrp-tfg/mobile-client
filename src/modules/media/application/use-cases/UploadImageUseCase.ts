import type { IMediaRepository } from '../../domain/interfaces.js';
import type { IStorageService } from '../../../shared/domain/interfaces.js';
import { MediaFile, MediaUploadResult } from '../../domain/entities.js';

export class UploadImageUseCase {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    imageUrl: string,
    fileName?: string,
    fileType?: string,
  ): Promise<MediaUploadResult> {
    try {
      // Get image data from storage
      const imageData = this.storageService.getImageAsUint8Array(imageUrl);

      if (!imageData) {
        return new MediaUploadResult(
          false,
          undefined,
          'Could not retrieve image data',
        );
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
      return new MediaUploadResult(
        false,
        undefined,
        error instanceof Error
          ? error.message
          : 'Unknown error while uploading image',
      );
    }
  }
}
