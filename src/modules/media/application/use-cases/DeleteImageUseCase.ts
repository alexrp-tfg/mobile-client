import type { IMediaRepository } from '../../domain/interfaces.js';
import type {
  MediaDeleteResult,
  MediaDeleteError,
} from '../../domain/entities.js';

export class DeleteImageUseCase {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  async execute(
    mediaId: string,
  ): Promise<MediaDeleteResult | MediaDeleteError> {
    if (!mediaId || mediaId.trim() === '') {
      throw new Error('Media ID is required');
    }

    return await this.mediaRepository.deleteImage(mediaId.trim());
  }
}
