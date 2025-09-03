declare let NativeModules: {
  NativeLocalStorageModule: {
    setStorageItem(key: string, value: string): void;
    getStorageItem(key: string): string | null;
    clearStorage(): void;
    getImages(
      limit?: number,
      offset?: number,
    ): Array<{
      name: string;
      contentUri: string;
      size: number;
    }>;
    endActivity(): void;
    getImageAsUint8Array(imageUrl: string): {
      data: Uint8Array | null;
    };
    // SQLite database methods
    executeSql(
      query: string,
      params?: Array<string | number | boolean | null>,
    ): {
      success: boolean;
      data?: Array<Record<string, string | number | boolean | null>>;
      rowsAffected?: number;
      insertId?: number;
      error?: string;
    };
    initializeDatabase(
      dbName: string,
      version: number,
      tables: Array<{
        name: string;
        sql: string;
      }>,
    ): {
      success: boolean;
      error?: string;
    };
  };
};
