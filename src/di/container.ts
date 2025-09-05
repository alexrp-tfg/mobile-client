// Dependency Injection Container
// Shared Services
import { HttpService } from '../modules/shared/infrastructure/services/HttpService.js';
import { StorageService } from '../modules/shared/infrastructure/services/StorageService.js';
import { DatabaseService } from '../modules/shared/infrastructure/services/DatabaseService.js';

// Media Module
import { MediaRepository } from '../modules/media/infrastructure/repositories/MediaRepository.js';
import { MediaProcessingService } from '../modules/media/infrastructure/services/MediaProcessingService.js';
import { UploadImageUseCase } from '../modules/media/application/use-cases/UploadImageUseCase.js';
import { DeleteImageUseCase } from '../modules/media/application/use-cases/DeleteImageUseCase.js';

// Gallery Module
import { GalleryRepository } from '../modules/gallery/infrastructure/repositories/GalleryRepository.js';
import { GetGalleryImagesUseCase } from '../modules/gallery/application/use-cases/GetGalleryImagesUseCase.js';
import { GetUploadedFilesStatusUseCase } from '../modules/gallery/application/use-cases/GetUploadedFilesStatusUseCase.js';

// Authentication Module
import { LoginUserUseCase } from '../modules/authorization/application/use-cases/login-user.js';
import { LogoutUserUseCase } from '../modules/authorization/application/use-cases/logout-user.js';

// Interfaces
import type {
  IHttpService,
  IStorageService,
  IDatabaseService,
} from '../modules/shared/domain/interfaces.js';
import type {
  IMediaRepository,
  IMediaProcessingService,
} from '../modules/media/domain/interfaces.js';
import type { IGalleryRepository } from '../modules/gallery/domain/interfaces.js';
import { GetUserAllImagesUseCase } from '../modules/media/application/use-cases/get-user-all-images.js';

class DIContainer {
  private static instance: DIContainer;

  // Shared Services
  private httpService: IHttpService;
  private storageService: IStorageService;
  private databaseService: IDatabaseService;

  // Media Services
  private mediaRepository: IMediaRepository;
  private mediaProcessingService: IMediaProcessingService;
  private uploadImageUseCase: UploadImageUseCase;
  private deleteImageUseCase: DeleteImageUseCase;
  private getUserAllImagesUseCase: GetUserAllImagesUseCase;

  // Gallery Services
  private galleryRepository: IGalleryRepository;
  private getGalleryImagesUseCase: GetGalleryImagesUseCase;
  private getUploadedFilesStatusUseCase: GetUploadedFilesStatusUseCase;

  // Authentication Services
  private loginUserUseCase: LoginUserUseCase;
  private logoutUserUseCase: LogoutUserUseCase;

  private constructor() {
    // Get server URL from storage or use fallback
    const serverUrl = this.getServerUrl();

    // Initialize shared services
    this.httpService = new HttpService(serverUrl, '');
    this.storageService = new StorageService();
    this.databaseService = new DatabaseService();

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
    this.deleteImageUseCase = new DeleteImageUseCase(this.mediaRepository);
    this.getUserAllImagesUseCase = new GetUserAllImagesUseCase(
      this.mediaRepository,
    );

    // Initialize gallery services
    this.galleryRepository = new GalleryRepository(this.storageService);
    this.getGalleryImagesUseCase = new GetGalleryImagesUseCase(
      this.galleryRepository,
    );
    this.getUploadedFilesStatusUseCase = new GetUploadedFilesStatusUseCase(
      this.getUserAllImagesUseCase,
    );

    // Initialize authentication services
    this.loginUserUseCase = new LoginUserUseCase(this.httpService);
    this.logoutUserUseCase = new LogoutUserUseCase();
  }

  private getServerUrl(): string {
    try {
      const savedServerUrl =
        NativeModules.NativeLocalStorageModule.getStorageItem('serverUrl');
      return savedServerUrl || 'http://192.168.240.1:8000/api'; // Fallback to default
    } catch (error) {
      console.warn(
        'Could not load server URL from storage, using default:',
        error,
      );
      return 'http://192.168.240.1:8000/api'; // Fallback to default
    }
  }

  // Method to update server URL and reinitialize services
  updateServerUrl(newServerUrl: string) {
    // Update HttpService with new URL
    this.httpService = new HttpService(newServerUrl, '');

    // Reinitialize media services that depend on HttpService
    this.mediaRepository = new MediaRepository(
      this.httpService,
      this.mediaProcessingService,
    );
    this.uploadImageUseCase = new UploadImageUseCase(
      this.mediaRepository,
      this.storageService,
    );
    this.deleteImageUseCase = new DeleteImageUseCase(this.mediaRepository);
    this.getUserAllImagesUseCase = new GetUserAllImagesUseCase(
      this.mediaRepository,
    );
    this.getUploadedFilesStatusUseCase = new GetUploadedFilesStatusUseCase(
      this.getUserAllImagesUseCase,
    );

    // Reinitialize authentication services
    this.loginUserUseCase = new LoginUserUseCase(this.httpService);

    console.log('DI Container updated with new server URL:', newServerUrl);
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Shared Services
  getDatabaseService(): IDatabaseService {
    return this.databaseService;
  }

  getStorageService(): IStorageService {
    return this.storageService;
  }

  getHttpService(): IHttpService {
    return this.httpService;
  }

  // Use Cases (These are what the presentation layer should use)
  getUploadImageUseCase(): UploadImageUseCase {
    return this.uploadImageUseCase;
  }

  getGetGalleryImagesUseCase(): GetGalleryImagesUseCase {
    return this.getGalleryImagesUseCase;
  }

  getGetUploadedFilesStatusUseCase(): GetUploadedFilesStatusUseCase {
    return this.getUploadedFilesStatusUseCase;
  }

  getLoginUserUseCase(): LoginUserUseCase {
    return this.loginUserUseCase;
  }

  getLogoutUserUseCase(): LogoutUserUseCase {
    return this.logoutUserUseCase;
  }

  getGetUserAllImagesUseCase(): GetUserAllImagesUseCase {
    return this.getUserAllImagesUseCase;
  }

  getDeleteImageUseCase(): DeleteImageUseCase {
    return this.deleteImageUseCase;
  }
}

export const diContainer = DIContainer.getInstance();
