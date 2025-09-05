import { diContainer } from '../di/container.js';
import type { IDatabaseService } from '../modules/shared/domain/interfaces.js';

/**
 * Database utility class with common database operations
 * This can be used throughout your app for database operations
 */
export class DatabaseHelper {
  private static databaseService: IDatabaseService =
    diContainer.getDatabaseService();

  // Settings operations
  static async getSetting(key: string): Promise<string | null> {
    const results = await this.databaseService.select('settings', 'key = ?', [
      key,
    ]);
    return results.length > 0 ? String(results[0].value) : null;
  }

  static async setSetting(key: string, value: string): Promise<boolean> {
    const query = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)';
    const result = this.databaseService.executeSql(query, [key, value]);
    return result.success;
  }

  static async deleteSetting(key: string): Promise<boolean> {
    const result = await this.databaseService.delete('settings', 'key = ?', [
      key,
    ]);
    return result.success;
  }

  static async getAllSettings(): Promise<Record<string, string>> {
    const results = await this.databaseService.select('settings');
    const settings: Record<string, string> = {};
    for (const row of results) {
      settings[String(row.key)] = String(row.value);
    }
    return settings;
  }

  // Media cache operations
  static async cacheMedia(
    url: string,
    localPath: string,
    metadata?: Record<string, unknown>,
  ): Promise<number | null> {
    const result = await this.databaseService.insert('media_cache', {
      url,
      local_path: localPath,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
    return result.success ? result.insertId || null : null;
  }

  static async getCachedMedia(url: string): Promise<{
    id: number;
    url: string;
    local_path: string;
    cache_date: string;
    metadata?: Record<string, unknown>;
  } | null> {
    const results = await this.databaseService.select(
      'media_cache',
      'url = ?',
      [url],
    );
    if (results.length > 0) {
      const row = results[0];
      return {
        id: Number(row.id),
        url: String(row.url),
        local_path: String(row.local_path),
        cache_date: String(row.cache_date),
        metadata: row.metadata ? JSON.parse(String(row.metadata)) : undefined,
      };
    }
    return null;
  }

  static async clearOldMediaCache(daysOld: number = 7): Promise<number> {
    const query = `
      DELETE FROM media_cache 
      WHERE cache_date < datetime('now', '-${daysOld} days')
    `;
    const result = this.databaseService.executeSql(query);
    return result.success ? result.rowsAffected || 0 : 0;
  }

  // User session operations
  static async createUserSession(
    userId: string,
    sessionToken: string,
    expiresAt?: Date,
  ): Promise<number | null> {
    const result = await this.databaseService.insert('user_sessions', {
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    });
    return result.success ? result.insertId || null : null;
  }

  static async getUserSession(sessionToken: string): Promise<{
    id: number;
    user_id: string;
    session_token: string;
    created_at: string;
    expires_at?: string;
  } | null> {
    const results = await this.databaseService.select(
      'user_sessions',
      'session_token = ? AND (expires_at IS NULL OR expires_at > datetime("now"))',
      [sessionToken],
    );
    if (results.length > 0) {
      const row = results[0];
      return {
        id: Number(row.id),
        user_id: String(row.user_id),
        session_token: String(row.session_token),
        created_at: String(row.created_at),
        expires_at: row.expires_at ? String(row.expires_at) : undefined,
      };
    }
    return null;
  }

  static async deleteUserSession(sessionToken: string): Promise<boolean> {
    const result = await this.databaseService.delete(
      'user_sessions',
      'session_token = ?',
      [sessionToken],
    );
    return result.success;
  }

  static async clearExpiredSessions(): Promise<number> {
    const query =
      'DELETE FROM user_sessions WHERE expires_at IS NOT NULL AND expires_at <= datetime("now")';
    const result = this.databaseService.executeSql(query);
    return result.success ? result.rowsAffected || 0 : 0;
  }

  // Generic database operations
  static async executeQuery(
    query: string,
    params?: Array<string | number | boolean | null>,
  ): Promise<{
    success: boolean;
    data?: Array<Record<string, string | number | boolean | null>>;
    rowsAffected?: number;
    insertId?: number;
    error?: string;
  }> {
    return this.databaseService.executeSql(query, params);
  }

  // Database maintenance
  static async vacuum(): Promise<boolean> {
    const result = this.databaseService.executeSql('VACUUM');
    return result.success;
  }

  static async getDatabaseSize(): Promise<number> {
    const query = 'PRAGMA page_count';
    const result = this.databaseService.executeSql(query);
    if (result.success && result.data && result.data.length > 0) {
      return Number(result.data[0].page_count) || 0;
    }
    return 0;
  }

  static async getTableList(): Promise<string[]> {
    const query =
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
    const result = this.databaseService.executeSql(query);
    if (result.success && result.data) {
      return result.data.map((row) => String(row.name));
    }
    return [];
  }

  // Transaction support
  static async executeInTransaction(
    operations: Array<{
      query: string;
      params?: Array<string | number | boolean | null>;
    }>,
  ): Promise<{ success: boolean; error?: string }> {
    return await this.databaseService.executeInTransaction(operations);
  }
}
