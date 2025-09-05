// Media domain entities
export class MediaFile {
  constructor(
    public readonly url: string,
    public readonly fileName: string,
    public readonly fileType: string,
    public readonly data: Uint8Array,
  ) {}
}

export class MediaUploadResult {
  public readonly uploaded_at: Date;

  constructor(
    public readonly id: string,
    public readonly filename: string,
    public readonly original_filename: string,
    public readonly file_size: number,
    public readonly content_type: string,
    uploaded_at: string,
  ) {
    this.uploaded_at = new Date(uploaded_at);
  }
}

export class MediaUploadError {
  constructor(
    public readonly message: string,
    public readonly code: number,
  ) {}
}

export class MediaDeleteResult {
  constructor(
    public readonly id: string,
    public readonly message: string,
    public readonly deleted_at: Date = new Date(),
  ) {}
}

export class MediaDeleteError {
  constructor(
    public readonly message: string,
    public readonly code: number,
  ) {}
}
