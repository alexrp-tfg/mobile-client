declare let NativeModules: {
  NativeLocalStorageModule: {
    setStorageItem(key: string, value: string): void;
    getStorageItem(key: string): string | null;
    clearStorage(): void;
    getImages(): Array<string>;
    endActivity(): void;
    getImageAsUint8Array(
      imageUrl: string,
    ): {
      data: Uint8Array | null;
    }
  };
};
