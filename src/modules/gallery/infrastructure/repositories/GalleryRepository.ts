import type { IStorageService } from '../../../shared/domain/interfaces.js';
import type { IGalleryRepository } from '../../domain/interfaces.js';
import { Gallery, GalleryImage } from '../../domain/entities.js';

export class GalleryRepository implements IGalleryRepository {
  constructor(private readonly storageService: IStorageService) {}

  async getLocalImages(
    limit: number = 20,
    offset: number = 0,
  ): Promise<Gallery> {
    try {
      const imageData = this.storageService.getImages(limit, offset);

      const galleryImages = imageData.map(
        (data, index) =>
          new GalleryImage(
            `image-${offset + index}`,
            data.contentUri,
            undefined,
            data,
          ),
      );

      return new Gallery(galleryImages, galleryImages.length);
    } catch (error) {
      console.error('Error getting images from storage:', error);
      return new Gallery([], 0);
    }
  }

  async getTotalImageCount(): Promise<number> {
    try {
      // Get all images with a large limit to determine total count
      // Using a high limit to get all images - 10000 should be sufficient for most use cases
      const allImages = this.storageService.getImages(10000, 0);
      return allImages.length;
    } catch (error) {
      console.error('Error getting total image count:', error);
      return 0;
    }
  }

  async getImageById(id: string): Promise<GalleryImage | null> {
    try {
      // Use a reasonable limit to get images for finding by ID
      const imageData = this.storageService.getImages(1000, 0);
      const index = parseInt(id.replace('image-', ''), 10);

      if (index >= 0 && index < imageData.length) {
        const data = imageData[index];
        return new GalleryImage(id, data.contentUri, undefined, data);
      }

      return null;
    } catch (error) {
      console.error('Error getting image by ID:', error);
      return null;
    }
  }
}
