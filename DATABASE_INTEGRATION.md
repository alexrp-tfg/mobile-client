# Database Service Integration

This document explains how the SQLite database service has been integrated into your Lynx JS application following your established dependency injection pattern.

## Architecture Overview

The database functionality has been properly separated into layers following clean architecture principles:

```
src/
├── modules/shared/domain/interfaces.ts      # IDatabaseService interface
├── modules/shared/infrastructure/services/  # DatabaseService implementation
├── di/container.ts                         # Dependency injection setup
├── hooks/useDatabaseInitialization.ts     # Database initialization hook
├── utils/DatabaseHelper.ts                # Common database operations
└── components/DatabaseDemo.tsx             # Example usage component
```

## Components

### 1. Interface (`IDatabaseService`)
Located in `src/modules/shared/domain/interfaces.ts`

Defines the contract for database operations:
- Core methods: `initializeDatabase()`, `executeSql()`
- Convenience methods: `insert()`, `select()`, `update()`, `delete()`
- Transaction support: `beginTransaction()`, `commitTransaction()`, `rollbackTransaction()`

### 2. Implementation (`DatabaseService`)
Located in `src/modules/shared/infrastructure/services/DatabaseService.ts`

Implements the `IDatabaseService` interface and provides:
- Direct access to native SQLite methods
- Error handling and type safety
- Transaction management
- Database initialization tracking

### 3. Dependency Injection Container
Updated in `src/di/container.ts`

The database service is registered and available through:
```typescript
const databaseService = diContainer.getDatabaseService();
```

### 4. Database Initialization Hook
Located in `src/hooks/useDatabaseInitialization.ts`

Automatically initializes the database when the app starts:
- Creates application tables
- Sets up default settings
- Provides loading/error states

### 5. Database Helper Utility
Located in `src/utils/DatabaseHelper.ts`

Provides high-level operations for common use cases:
- Settings management
- Media caching
- User sessions
- Database maintenance

## Usage Examples

### Basic Database Operations

```typescript
import { diContainer } from '../di/container.js';

// Get the database service from DI container
const databaseService = diContainer.getDatabaseService();

// Insert data
const result = await databaseService.insert('users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Query data
const users = await databaseService.select('users', 'email = ?', ['john@example.com']);

// Update data
await databaseService.update('users', { name: 'Jane Doe' }, 'id = ?', [1]);

// Delete data
await databaseService.delete('users', 'id = ?', [1]);

// Raw SQL
const result = databaseService.executeSql('SELECT COUNT(*) as total FROM users');
```

### Using the Database Helper

```typescript
import { DatabaseHelper } from '../utils/DatabaseHelper.js';

// Settings
await DatabaseHelper.setSetting('theme', 'dark');
const theme = await DatabaseHelper.getSetting('theme');

// Media caching
await DatabaseHelper.cacheMedia('https://example.com/image.jpg', '/local/path/image.jpg');
const cached = await DatabaseHelper.getCachedMedia('https://example.com/image.jpg');

// User sessions
await DatabaseHelper.createUserSession('user123', 'token456');
const session = await DatabaseHelper.getUserSession('token456');

// Transactions
await DatabaseHelper.executeInTransaction([
  { query: 'INSERT INTO users (name) VALUES (?)', params: ['User 1'] },
  { query: 'INSERT INTO users (name) VALUES (?)', params: ['User 2'] }
]);
```

### In React Components

```typescript
import { useState, useEffect } from '@lynx-js/react';
import { diContainer } from '../di/container.js';

export function MyComponent() {
  const [users, setUsers] = useState([]);
  const databaseService = diContainer.getDatabaseService();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await databaseService.select('users');
    setUsers(result);
  };

  const addUser = async (name: string, email: string) => {
    await databaseService.insert('users', { name, email });
    await loadUsers(); // Refresh list
  };

  // ... component JSX
}
```

## Database Schema

The app initializes with these tables:

### `users`
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### `settings`
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
)
```

### `media_cache`
```sql
CREATE TABLE media_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT UNIQUE NOT NULL,
  local_path TEXT,
  cache_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
)
```

### `user_sessions`
```sql
CREATE TABLE user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_token TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
)
```

## Best Practices

### 1. Always Use Dependency Injection
```typescript
// ✅ Good
const databaseService = diContainer.getDatabaseService();

// ❌ Bad
const databaseService = new DatabaseService();
```

### 2. Use Helper Methods for Common Operations
```typescript
// ✅ Good
await DatabaseHelper.setSetting('key', 'value');

// ✅ Also good (for custom operations)
await databaseService.executeSql('INSERT OR REPLACE INTO settings...');
```

### 3. Handle Errors Properly
```typescript
const result = await databaseService.insert('users', userData);
if (!result.success) {
  console.error('Failed to create user:', result.error);
  // Handle error appropriately
}
```

### 4. Use Transactions for Multiple Operations
```typescript
await DatabaseHelper.executeInTransaction([
  { query: 'INSERT INTO table1...', params: [...] },
  { query: 'UPDATE table2...', params: [...] }
]);
```

### 5. Parameterize Queries
```typescript
// ✅ Good (prevents SQL injection)
await databaseService.select('users', 'email = ?', [userEmail]);

// ❌ Bad (SQL injection risk)
await databaseService.executeSql(`SELECT * FROM users WHERE email = '${userEmail}'`);
```

## Database Initialization

The database is automatically initialized when the app starts:

1. `App.tsx` uses `useDatabaseInitialization()` hook
2. Hook creates database schema if it doesn't exist
3. Sets up default settings
4. Shows loading/error states during initialization
5. App renders normally once database is ready

## Migration Strategy

To add new tables or modify existing ones:

1. Update the schema in `useDatabaseInitialization.ts`
2. Increment the database version number
3. The native SQLiteOpenHelper will handle the migration

```typescript
// In useDatabaseInitialization.ts
const result = databaseService.initializeDatabase('lynx_app_db', 2, tables); // Version 2
```

## Performance Tips

1. **Use Indexes**: Create indexes for frequently queried columns
2. **Batch Operations**: Use transactions for multiple related operations
3. **Clean Up**: Regularly clean old data using `DatabaseHelper.clearOldMediaCache()`
4. **Vacuum**: Periodically run `DatabaseHelper.vacuum()` to optimize storage

## Troubleshooting

### Database Not Initialized Error
If you see "Database not initialized" errors:
1. Ensure `useDatabaseInitialization()` is called in `App.tsx`
2. Check that the native module is properly registered
3. Verify the database initialization completed successfully

### Type Errors
If you get TypeScript errors:
1. Ensure you're using the `IDatabaseService` interface
2. Check that all parameters match the interface definition
3. Use proper type casting when needed

### Performance Issues
If database operations are slow:
1. Add indexes for frequently queried columns
2. Use `EXPLAIN QUERY PLAN` to analyze query performance
3. Consider using transactions for bulk operations
4. Run `VACUUM` to optimize storage

This integration provides a robust, type-safe, and maintainable database layer for your Lynx JS application while following your established architectural patterns.
