import type { GetUserAllImagesUseCase } from '../../../media/application/use-cases/get-user-all-images.js';
import type { GalleryImage } from '../../domain/entities.js';

export interface GalleryImageWithUploadStatus extends GalleryImage {
  isUploaded: boolean;
  uploadedImageId?: string;
}

export class GetUploadedFilesStatusUseCase {
  constructor(
    private readonly getUserAllImagesUseCase: GetUserAllImagesUseCase,
  ) {}

  async execute(
    localImages: GalleryImage[],
  ): Promise<GalleryImageWithUploadStatus[]> {
    try {
      // Get all uploaded images from the server
      const uploadedImages = await this.getUserAllImagesUseCase.execute();
      console.log(uploadedImages);

      // Create a Set of uploaded filenames for fast lookup
      const uploadedFilenames = new Set<string>();
      const uploadedImageMap = new Map<string, string>(); // filename -> id

      uploadedImages.forEach((uploadedImage) => {
        uploadedFilenames.add(uploadedImage.original_filename);
        uploadedImageMap.set(uploadedImage.original_filename, uploadedImage.id);
      });

      // Map local images to include upload status
      return localImages.map((localImage) => ({
        ...localImage,
        isUploaded: localImage.metadata
          ? uploadedFilenames.has(localImage.metadata.name)
          : false,
        uploadedImageId: localImage.metadata
          ? uploadedImageMap.get(localImage.metadata.name)
          : undefined,
      }));
    } catch (error) {
      console.error('Error checking upload status:', error);
      // If we can't check upload status, return all as not uploaded
      return localImages.map((localImage) => ({
        ...localImage,
        isUploaded: false,
      }));
    }
  }
}
