// Gallery domain entities
export class GalleryImage {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly thumbnail?: string,
    // TODO: Define what metadata we want to store for each image
    public readonly metadata?: unknown,
  ) {}
}

export class Gallery {
  constructor(
    public readonly images: GalleryImage[],
    public readonly totalCount: number,
  ) {}
}
