import type { GetAllImagesDto } from '../../../shared/infrastructure/dtos/get-all-images.dto.js';
import type { IMediaRepository } from '../../domain/interfaces.js';

export class GetUserAllImagesUseCase {
  constructor(private readonly mediaRepository: IMediaRepository) {}

  async execute(): Promise<GetAllImagesDto[]> {
    try {
      // Fetch all images for the user from the repository
      const images = await this.mediaRepository.getAllImages();
      return images;
    } catch (error) {
      console.error('Error fetching user images:', error);
    }
    return [];
  }
}
