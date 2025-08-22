import { diContainer } from '../../../../di/container.js';
import type { IDatabaseService } from '../../domain/interfaces.js';

export class DatabaseExample {
  private databaseService: IDatabaseService;

  constructor() {
    this.databaseService = diContainer.getDatabaseService();
  }

  async initializeAppDatabase(): Promise<boolean> {
    // Initialize the database with some tables
    const tables = [
      {
        name: 'users',
        sql: `CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      },
      {
        name: 'posts',
        sql: `CREATE TABLE posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          title TEXT NOT NULL,
          content TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )`,
      },
      {
        name: 'settings',
        sql: `CREATE TABLE settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )`,
      },
    ];

    const result = this.databaseService.initializeDatabase(
      'app_database',
      1,
      tables,
    );

    if (result.success) {
      console.log('Database initialized successfully');
      return true;
    } else {
      console.error('Failed to initialize database:', result.error);
      return false;
    }
  }

  // Example usage methods
  async createUser(
    name: string,
    email: string,
  ): Promise<{ success: boolean; userId?: number; error?: string }> {
    const result = await this.databaseService.insert('users', { name, email });
    return {
      success: result.success,
      userId: result.insertId,
      error: result.error,
    };
  }

  async getUsers(): Promise<
    Array<{ id: number; name: string; email: string; created_at: string }>
  > {
    const users = await this.databaseService.select('users');
    return users as Array<{
      id: number;
      name: string;
      email: string;
      created_at: string;
    }>;
  }

  async getUserById(
    id: number,
  ): Promise<{
    id: number;
    name: string;
    email: string;
    created_at: string;
  } | null> {
    const users = await this.databaseService.select('users', 'id = ?', [id]);
    return users.length > 0
      ? (users[0] as {
          id: number;
          name: string;
          email: string;
          created_at: string;
        })
      : null;
  }

  async updateUser(
    id: number,
    data: { name?: string; email?: string },
  ): Promise<boolean> {
    const result = await this.databaseService.update('users', data, 'id = ?', [
      id,
    ]);
    return result.success;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.databaseService.delete('users', 'id = ?', [id]);
    return result.success;
  }

  async createPost(
    userId: number,
    title: string,
    content: string,
  ): Promise<{ success: boolean; postId?: number }> {
    const result = await this.databaseService.insert('posts', {
      user_id: userId,
      title,
      content,
    });
    return {
      success: result.success,
      postId: result.insertId,
    };
  }

  async getPostsByUser(
    userId: number,
  ): Promise<Array<Record<string, string | number | boolean | null>>> {
    return await this.databaseService.select('posts', 'user_id = ?', [userId]);
  }

  // Example of using raw SQL for complex queries
  async getUsersWithPostCount(): Promise<
    Array<Record<string, string | number | boolean | null>>
  > {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(p.id) as post_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY post_count DESC
    `;

    const result = this.databaseService.executeSql(query);
    return result.success ? result.data || [] : [];
  }

  // Settings management
  async setSetting(key: string, value: string): Promise<boolean> {
    // Use INSERT OR REPLACE for upsert functionality
    const query = 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)';
    const result = this.databaseService.executeSql(query, [key, value]);
    return result.success;
  }

  async getSetting(key: string): Promise<string | null> {
    const settings = await this.databaseService.select('settings', 'key = ?', [
      key,
    ]);
    return settings.length > 0 ? String(settings[0].value) : null;
  }

  // Database maintenance
  async vacuum(): Promise<boolean> {
    const result = this.databaseService.executeSql('VACUUM');
    return result.success;
  }

  async getTableInfo(
    tableName: string,
  ): Promise<Array<Record<string, string | number | boolean | null>>> {
    const query = `PRAGMA table_info(${tableName})`;
    const result = this.databaseService.executeSql(query);
    return result.success ? result.data || [] : [];
  }

  async getDatabaseSize(): Promise<number> {
    const query = 'PRAGMA page_count';
    const result = this.databaseService.executeSql(query);
    if (result.success && result.data && result.data.length > 0) {
      return Number(result.data[0].page_count) || 0;
    }
    return 0;
  }
}
