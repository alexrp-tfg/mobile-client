import type { IHttpService } from '../../../shared/domain/interfaces.js';
import type { HttpResponse } from '../../../shared/domain/entities.js';
import type {
  IMediaRepository,
  IMediaProcessingService,
} from '../../domain/interfaces.js';
import { MediaFile, MediaUploadResult } from '../../domain/entities.js';
import type { MediaUploadApiResponse } from '../interfaces/api-responses.js';

export class MediaRepository implements IMediaRepository {
  constructor(
    private readonly httpService: IHttpService,
    private readonly mediaProcessingService: IMediaProcessingService,
  ) {}

  async uploadImage(mediaFile: MediaFile): Promise<MediaUploadResult> {
    try {
      if (!mediaFile.data) {
        return new MediaUploadResult(
          false,
          undefined,
          'No image data to upload',
        );
      }

      // Use processing service to create multipart body
      const body = this.mediaProcessingService.createMultipartBody(
        mediaFile.data,
        mediaFile.fileName,
        mediaFile.fileType,
      );

      const boundary =
        '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
      const headers = {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      };

      // Call API through HTTP service
      const response: HttpResponse<MediaUploadApiResponse> =
        await this.httpService.post('/media/upload', body, headers);

      if (response.success && response.data) {
        return new MediaUploadResult(
          true,
          response.data.fileId,
          undefined,
          response.data.metadata,
        );
      } else {
        return new MediaUploadResult(
          false,
          undefined,
          response.error?.message || 'Error uploading image',
        );
      }
    } catch (error) {
      return new MediaUploadResult(
        false,
        undefined,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
