import type { IGalleryRepository } from '../../domain/interfaces.js';
import { Gallery } from '../../domain/entities.js';

export class GetGalleryImagesUseCase {
  constructor(private readonly galleryRepository: IGalleryRepository) {}

  async execute(limit: number = 20, offset: number = 0): Promise<Gallery> {
    try {
      return await this.galleryRepository.getLocalImages(limit, offset);
    } catch (error) {
      console.error('Error getting gallery images:', error);
      // Return empty gallery on error
      return new Gallery([], 0);
    }
  }

  async getTotalCount(): Promise<number> {
    try {
      return await this.galleryRepository.getTotalImageCount();
    } catch (error) {
      console.error('Error getting total image count:', error);
      return 0;
    }
  }
}
