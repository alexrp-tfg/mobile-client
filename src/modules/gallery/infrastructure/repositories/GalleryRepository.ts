import type { IStorageService } from '../../../shared/domain/interfaces.js';
import type { IGalleryRepository } from '../../domain/interfaces.js';
import { Gallery, GalleryImage } from '../../domain/entities.js';

export class GalleryRepository implements IGalleryRepository {
  constructor(private readonly storageService: IStorageService) {}

  async getLocalImages(limit: number = 5): Promise<Gallery> {
    try {
      const imageUrls = this.storageService.getImages();
      const limitedUrls = imageUrls.slice(0, limit);

      const galleryImages = limitedUrls.map(
        (url: string, index: number) => new GalleryImage(`image-${index}`, url),
      );

      return new Gallery(galleryImages, galleryImages.length);
    } catch (error) {
      console.error('Error getting images from storage:', error);
      return new Gallery([], 0);
    }
  }

  async getImageById(id: string): Promise<GalleryImage | null> {
    try {
      const imageUrls = this.storageService.getImages();
      const index = parseInt(id.replace('image-', ''), 10);

      if (index >= 0 && index < imageUrls.length) {
        return new GalleryImage(id, imageUrls[index]);
      }

      return null;
    } catch (error) {
      console.error('Error getting image by ID:', error);
      return null;
    }
  }
}
