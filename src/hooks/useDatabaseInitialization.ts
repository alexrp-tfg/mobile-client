import { useEffect, useState } from '@lynx-js/react';
import { diContainer } from '../di/container.js';
import type { IDatabaseService } from '../modules/shared/domain/interfaces.js';

export function useDatabaseInitialization() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const databaseService: IDatabaseService = diContainer.getDatabaseService();

    const initializeDatabase = async () => {
      try {
        // Define your app's database schema
        const tables = [
          {
            name: 'users',
            sql: `CREATE TABLE IF NOT EXISTS users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
          },
          {
            name: 'settings',
            sql: `CREATE TABLE IF NOT EXISTS settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            )`,
          },
          {
            name: 'media_cache',
            sql: `CREATE TABLE IF NOT EXISTS media_cache (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              url TEXT UNIQUE NOT NULL,
              local_path TEXT,
              cache_date DATETIME DEFAULT CURRENT_TIMESTAMP,
              metadata TEXT
            )`,
          },
          {
            name: 'user_sessions',
            sql: `CREATE TABLE IF NOT EXISTS user_sessions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id TEXT NOT NULL,
              session_token TEXT NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              expires_at DATETIME
            )`,
          },
        ];

        console.log('Initializing app database...');
        const result = databaseService.initializeDatabase(
          'lynx_app_db',
          1,
          tables,
        );

        if (result.success) {
          console.log('Database initialized successfully');
          setIsInitialized(true);

          // Set default settings if they don't exist
          await setDefaultSettings();
        } else {
          console.error('Failed to initialize database:', result.error);
          setError(result.error || 'Unknown database error');
        }
      } catch (err) {
        console.error('Database initialization error:', err);
        setError(String(err));
      }
    };

    const setDefaultSettings = async () => {
      try {
        // Check if default settings exist, if not, create them
        const existingTheme = await databaseService.select(
          'settings',
          'key = ?',
          ['theme'],
        );
        if (existingTheme.length === 0) {
          await databaseService.insert('settings', {
            key: 'theme',
            value: 'light',
          });
        }

        const existingLanguage = await databaseService.select(
          'settings',
          'key = ?',
          ['language'],
        );
        if (existingLanguage.length === 0) {
          await databaseService.insert('settings', {
            key: 'language',
            value: 'en',
          });
        }

        console.log('Default settings initialized');
      } catch (err) {
        console.error('Error setting default settings:', err);
      }
    };

    initializeDatabase();
  }, []); // Empty dependency array - this should only run once

  return { isInitialized, error };
}
