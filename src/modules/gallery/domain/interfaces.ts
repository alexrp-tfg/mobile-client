import type { Gallery, GalleryImage } from './entities.js';

// Interface for gallery repository
export interface IGalleryRepository {
  getImages(limit?: number): Promise<Gallery>;
  getImageById(id: string): Promise<GalleryImage | null>;
}
