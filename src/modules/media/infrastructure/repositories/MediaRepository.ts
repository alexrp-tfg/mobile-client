import type { IHttpService } from '../../../shared/domain/interfaces.js';
import type { HttpResponse } from '../../../shared/domain/entities.js';
import type {
  IMediaRepository,
  IMediaProcessingService,
} from '../../domain/interfaces.js';
import { MediaFile, MediaUploadError, MediaUploadResult } from '../../domain/entities.js';
import type { MediaUploadApiResponse } from '../interfaces/api-responses.js';
import type { GetAllImagesDto } from '../../../shared/infrastructure/dtos/get-all-images.dto.js';

export class MediaRepository implements IMediaRepository {
  constructor(
    private readonly httpService: IHttpService,
    private readonly mediaProcessingService: IMediaProcessingService,
  ) {}

  async uploadImage(mediaFile: MediaFile): Promise<MediaUploadResult | MediaUploadError> {
    try {
      // Use processing service to create multipart body
      const multipartData = this.mediaProcessingService.createMultipartBody(
        mediaFile.data,
        mediaFile.fileName,
        mediaFile.fileType,
      );

      const headers = {
        'Content-Type': `multipart/form-data; boundary=${multipartData.boundary}`,
        'x-file-size': `${mediaFile.data.length}`,
      };

      // Call API through HTTP service
      const response: HttpResponse<MediaUploadApiResponse> =
        await this.httpService.post('/media/upload', multipartData.data, headers);

      if (response.success && response.data) {
        const { data } = response;
        return new MediaUploadResult(
          data.id, data.filename, data.original_filename, data.file_size, data.content_type, data.uploaded_at
        );
      } else {
        return new MediaUploadError(
          response.error?.message || 'Error uploading image',
          response.error?.code || 500,
        );
      }
    } catch (error) {
      return new MediaUploadError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        500,
      );
    }
  }

  async getAllImages(): Promise<GetAllImagesDto[]> {
    try {
      const response = await this.httpService.get<GetAllImagesDto[]>(
        '/media',
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error?.message || 'Error fetching images');
      }
    } catch (error) {
      console.error('Error fetching all images:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
    }
  }
}
