import type { ImageData } from '../../shared/domain/entities.js';

// Gallery domain entities
export class GalleryImage {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly thumbnail?: string,
    public readonly metadata?: ImageData,
  ) {}
}

export class Gallery {
  constructor(
    public readonly images: GalleryImage[],
    public readonly totalCount: number,
  ) {}
}
