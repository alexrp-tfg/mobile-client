// Dependency Injection Container
import { APP_CONFIG } from '../config/app.config.js';

// Shared Services
import { HttpService } from '../modules/shared/infrastructure/services/HttpService.js';
import { StorageService } from '../modules/shared/infrastructure/services/StorageService.js';

// Media Module
import { MediaRepository } from '../modules/media/infrastructure/repositories/MediaRepository.js';
import { MediaProcessingService } from '../modules/media/infrastructure/services/MediaProcessingService.js';
import { UploadImageUseCase } from '../modules/media/application/use-cases/UploadImageUseCase.js';

// Gallery Module
import { GalleryRepository } from '../modules/gallery/infrastructure/repositories/GalleryRepository.js';
import { GetGalleryImagesUseCase } from '../modules/gallery/application/use-cases/GetGalleryImagesUseCase.js';

// Interfaces
import type {
  IHttpService,
  IStorageService,
} from '../modules/shared/domain/interfaces.js';
import type {
  IMediaRepository,
  IMediaProcessingService,
} from '../modules/media/domain/interfaces.js';
import type { IGalleryRepository } from '../modules/gallery/domain/interfaces.js';

class DIContainer {
  private static instance: DIContainer;

  // Shared Services
  private httpService: IHttpService;
  private storageService: IStorageService;

  // Media Services
  private mediaRepository: IMediaRepository;
  private mediaProcessingService: IMediaProcessingService;
  private uploadImageUseCase: UploadImageUseCase;

  // Gallery Services
  private galleryRepository: IGalleryRepository;
  private getGalleryImagesUseCase: GetGalleryImagesUseCase;

  private constructor() {
    // Initialize shared services
    this.httpService = new HttpService(
      APP_CONFIG.API.BASE_URL,
      APP_CONFIG.API.AUTH_TOKEN,
    );
    this.storageService = new StorageService();

    // Initialize media services
    this.mediaProcessingService = new MediaProcessingService();
    this.mediaRepository = new MediaRepository(
      this.httpService,
      this.mediaProcessingService,
    );
    this.uploadImageUseCase = new UploadImageUseCase(
      this.mediaRepository,
      this.storageService,
    );

    // Initialize gallery services
    this.galleryRepository = new GalleryRepository(this.storageService);
    this.getGalleryImagesUseCase = new GetGalleryImagesUseCase(
      this.galleryRepository,
    );
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Use Cases (These are what the presentation layer should use)
  getUploadImageUseCase(): UploadImageUseCase {
    return this.uploadImageUseCase;
  }

  getGetGalleryImagesUseCase(): GetGalleryImagesUseCase {
    return this.getGalleryImagesUseCase;
  }
}

export const diContainer = DIContainer.getInstance();
