import type { IStorageService } from '../../domain/interfaces.js';
import type { ImageData } from '../../domain/entities.js';

export class StorageService implements IStorageService {
  getImages(limit?: number, offset?: number): ImageData[] {
    try {
      return NativeModules.NativeLocalStorageModule.getImages(limit, offset);
    } catch (error) {
      console.error('Error getting images from storage:', error);
      return [];
    }
  }

  getImageAsUint8Array(imageUrl: string): Uint8Array | null {
    try {
      const result =
        NativeModules.NativeLocalStorageModule.getImageAsUint8Array(imageUrl);
      return result.data || null;
    } catch (error) {
      console.error('Error getting image as Uint8Array:', error);
      return null;
    }
  }
}
