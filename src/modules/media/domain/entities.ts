// Media domain entities
export class MediaFile {
  constructor(
    public readonly url: string,
    public readonly fileName: string,
    public readonly fileType: string,
    public readonly data?: Uint8Array,
  ) {}
}

export class MediaUploadResult {
  constructor(
    public readonly success: boolean,
    public readonly fileId?: string,
    public readonly error?: string,
    // TODO: Define what exactly the API returns on successful upload
    public readonly metadata?: unknown,
  ) {}
}
