import type { IStorageService } from '../../domain/interfaces.js';

export class StorageService implements IStorageService {
  getImages(): string[] {
    try {
      return NativeModules.NativeLocalStorageModule.getImages();
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
