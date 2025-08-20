import type { IGalleryRepository } from '../../domain/interfaces.js';
import { Gallery } from '../../domain/entities.js';

export class GetGalleryImagesUseCase {
  constructor(private readonly galleryRepository: IGalleryRepository) {}

  async execute(limit: number = 5): Promise<Gallery> {
    try {
      return await this.galleryRepository.getImages(limit);
    } catch (error) {
      console.error('Error getting gallery images:', error);
      // Return empty gallery on error
      return new Gallery([], 0);
    }
  }
}
