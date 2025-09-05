import type { Gallery, GalleryImage } from './entities.js';

// Interface for gallery repository
export interface IGalleryRepository {
  getLocalImages(limit?: number, offset?: number): Promise<Gallery>;
  getImageById(id: string): Promise<GalleryImage | null>;
  getTotalImageCount(): Promise<number>;
}
