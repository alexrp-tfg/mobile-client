import type { IDatabaseService } from '../../domain/interfaces.js';

export class DatabaseService implements IDatabaseService {
  private isInitialized = false;

  // Core database methods
  initializeDatabase(
    dbName: string, 
    version: number, 
    tables: Array<{ name: string; sql: string }>
  ): { success: boolean; error?: string } {
    try {
      const result = NativeModules.NativeLocalStorageModule.initializeDatabase(dbName, version, tables);
      if (result.success) {
        this.isInitialized = true;
      }
      return result;
    } catch (error) {
      console.error('Error initializing database:', error);
      return { success: false, error: String(error) };
    }
  }

  executeSql(
    query: string, 
    params?: Array<string | number | boolean | null>
  ): {
    success: boolean;
    data?: Array<Record<string, string | number | boolean | null>>;
    rowsAffected?: number;
    insertId?: number;
    error?: string;
  } {
    if (!this.isInitialized) {
      return { 
        success: false, 
        error: 'Database not initialized. Call initializeDatabase first.' 
      };
    }

    try {
      return NativeModules.NativeLocalStorageModule.executeSql(query, params);
    } catch (error) {
      console.error('Error executing SQL:', error);
      return { success: false, error: String(error) };
    }
  }

  // Convenience methods
  async createTable(tableName: string, columns: string): Promise<boolean> {
    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
    const result = this.executeSql(query);
    return result.success;
  }

  async insert(
    tableName: string, 
    data: Record<string, string | number | boolean | null>
  ): Promise<{ success: boolean; insertId?: number; error?: string }> {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    const result = this.executeSql(query, values);
    
    return {
      success: result.success,
      insertId: result.insertId,
      error: result.error
    };
  }

  async select(
    tableName: string, 
    where?: string, 
    params?: Array<string | number | boolean | null>
  ): Promise<Array<Record<string, string | number | boolean | null>>> {
    let query = `SELECT * FROM ${tableName}`;
    if (where) {
      query += ` WHERE ${where}`;
    }
    
    const result = this.executeSql(query, params);
    return result.success ? (result.data || []) : [];
  }

  async update(
    tableName: string, 
    data: Record<string, string | number | boolean | null>, 
    where: string, 
    whereParams?: Array<string | number | boolean | null>
  ): Promise<{ success: boolean; rowsAffected?: number; error?: string }> {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    
    if (whereParams) {
      values.push(...whereParams);
    }
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE ${where}`;
    const result = this.executeSql(query, values);
    
    return {
      success: result.success,
      rowsAffected: result.rowsAffected,
      error: result.error
    };
  }

  async delete(
    tableName: string, 
    where?: string, 
    params?: Array<string | number | boolean | null>
  ): Promise<{ success: boolean; rowsAffected?: number; error?: string }> {
    let query = `DELETE FROM ${tableName}`;
    if (where) {
      query += ` WHERE ${where}`;
    }
    
    const result = this.executeSql(query, params);
    
    return {
      success: result.success,
      rowsAffected: result.rowsAffected,
      error: result.error
    };
  }

  // Utility methods
  async vacuum(): Promise<boolean> {
    const result = this.executeSql('VACUUM');
    return result.success;
  }

  async getTableInfo(tableName: string): Promise<Array<Record<string, string | number | boolean | null>>> {
    const query = `PRAGMA table_info(${tableName})`;
    const result = this.executeSql(query);
    return result.success ? (result.data || []) : [];
  }

  async getDatabaseSize(): Promise<number> {
    const query = 'PRAGMA page_count';
    const result = this.executeSql(query);
    if (result.success && result.data && result.data.length > 0) {
      return Number(result.data[0].page_count) || 0;
    }
    return 0;
  }

  // Transaction support
  async beginTransaction(): Promise<boolean> {
    const result = this.executeSql('BEGIN TRANSACTION');
    return result.success;
  }

  async commitTransaction(): Promise<boolean> {
    const result = this.executeSql('COMMIT');
    return result.success;
  }

  async rollbackTransaction(): Promise<boolean> {
    const result = this.executeSql('ROLLBACK');
    return result.success;
  }

  // Execute multiple queries in a transaction
  async executeInTransaction(
    queries: Array<{ query: string; params?: Array<string | number | boolean | null> }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.beginTransaction();
      
      for (const { query, params } of queries) {
        const result = this.executeSql(query, params);
        if (!result.success) {
          await this.rollbackTransaction();
          return { success: false, error: result.error };
        }
      }
      
      await this.commitTransaction();
      return { success: true };
    } catch (error) {
      await this.rollbackTransaction();
      return { success: false, error: String(error) };
    }
  }
}
