# SQLite Database Integration for Lynx JS

This implementation provides a flexible SQLite database access layer for your Lynx JS application. Instead of creating specific native methods for each database operation, it provides two core methods that allow you to execute any SQL query.

## Features

- **Generic SQL Execution**: Execute any SQL query (SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, etc.)
- **Database Initialization**: Set up your database schema with multiple tables
- **Type Safety**: Full TypeScript support with proper type definitions
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Convenience Methods**: High-level methods for common operations (insert, select, update, delete)
- **Raw SQL Support**: Direct SQL execution for complex queries

## Setup

### 1. Database Initialization

Before using the database, you need to initialize it with your schema:

```typescript
import { StorageService } from './StorageService.js';

const storageService = new StorageService();

// Define your tables
const tables = [
  {
    name: 'users',
    sql: `CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
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
    )`
  }
];

// Initialize the database
const result = storageService.initializeDatabase('my_app_db', 1, tables);
if (result.success) {
  console.log('Database ready!');
} else {
  console.error('Database initialization failed:', result.error);
}
```

### 2. Basic Operations

#### Insert Data
```typescript
// Using convenience method
const insertResult = await storageService.insert('users', {
  name: 'John Doe',
  email: 'john@example.com'
});

if (insertResult.success) {
  console.log('User created with ID:', insertResult.insertId);
}

// Using raw SQL
const result = storageService.executeSql(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['Jane Smith', 'jane@example.com']
);
```

#### Query Data
```typescript
// Using convenience method
const users = await storageService.select('users');
const specificUser = await storageService.select('users', 'id = ?', [1]);

// Using raw SQL for complex queries
const result = storageService.executeSql(`
  SELECT u.name, COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  GROUP BY u.id
  ORDER BY post_count DESC
`);

if (result.success) {
  console.log('Query results:', result.data);
}
```

#### Update Data
```typescript
// Using convenience method
const updateResult = await storageService.update(
  'users',
  { name: 'John Updated' },
  'id = ?',
  [1]
);

console.log('Rows affected:', updateResult.rowsAffected);

// Using raw SQL
const result = storageService.executeSql(
  'UPDATE users SET name = ? WHERE id = ?',
  ['New Name', 1]
);
```

#### Delete Data
```typescript
// Using convenience method
const deleteResult = await storageService.delete('users', 'id = ?', [1]);

// Using raw SQL
const result = storageService.executeSql(
  'DELETE FROM users WHERE created_at < ?',
  ['2023-01-01']
);
```

## Core Methods

### `initializeDatabase(dbName, version, tables)`
Initializes the SQLite database with the specified name, version, and table definitions.

**Parameters:**
- `dbName`: String - Name of the database file
- `version`: Number - Database version (for migrations)
- `tables`: Array of objects with `name` and `sql` properties

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
}
```

### `executeSql(query, params?)`
Executes any SQL query with optional parameters.

**Parameters:**
- `query`: String - SQL query to execute
- `params`: Array - Optional parameters for prepared statements

**Returns:**
```typescript
{
  success: boolean;
  data?: Array<Record<string, any>>;      // For SELECT queries
  rowsAffected?: number;                  // For UPDATE/DELETE
  insertId?: number;                      // For INSERT queries
  error?: string;                         // If success is false
}
```

## Convenience Methods

The `StorageService` class provides high-level methods for common operations:

- `insert(tableName, data)` - Insert a record
- `select(tableName, where?, params?)` - Query records
- `update(tableName, data, where, params?)` - Update records
- `delete(tableName, where?, params?)` - Delete records
- `createTable(tableName, columns)` - Create a new table

## Advanced Usage

### Transactions
```typescript
// Begin transaction
storageService.executeSql('BEGIN TRANSACTION');

try {
  // Multiple operations
  storageService.executeSql('INSERT INTO users (name) VALUES (?)', ['User 1']);
  storageService.executeSql('INSERT INTO users (name) VALUES (?)', ['User 2']);
  
  // Commit transaction
  storageService.executeSql('COMMIT');
} catch (error) {
  // Rollback on error
  storageService.executeSql('ROLLBACK');
}
```

### Database Maintenance
```typescript
// Get database info
const tableInfo = storageService.executeSql('PRAGMA table_info(users)');
const dbSize = storageService.executeSql('PRAGMA page_count');

// Optimize database
storageService.executeSql('VACUUM');

// Create indexes
storageService.executeSql('CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)');
```

### Complex Queries
```typescript
// Joins, aggregations, subqueries - all supported
const complexQuery = `
  WITH user_stats AS (
    SELECT 
      user_id,
      COUNT(*) as total_posts,
      MAX(created_at) as last_post_date
    FROM posts 
    GROUP BY user_id
  )
  SELECT 
    u.name,
    u.email,
    COALESCE(us.total_posts, 0) as posts,
    us.last_post_date
  FROM users u
  LEFT JOIN user_stats us ON u.id = us.user_id
  WHERE u.created_at > ?
  ORDER BY posts DESC, u.name ASC
`;

const result = storageService.executeSql(complexQuery, ['2023-01-01']);
```

## Error Handling

All methods return a success flag and error message:

```typescript
const result = storageService.executeSql('SELECT * FROM nonexistent_table');

if (!result.success) {
  console.error('SQL Error:', result.error);
  // Handle the error appropriately
}
```

## Performance Tips

1. **Use Prepared Statements**: Always use parameter binding to prevent SQL injection and improve performance
2. **Create Indexes**: Add indexes for frequently queried columns
3. **Use Transactions**: Group multiple operations in transactions for better performance
4. **Limit Results**: Use `LIMIT` clause for large datasets
5. **Optimize Queries**: Use `EXPLAIN QUERY PLAN` to analyze query performance

## Security

- **Always use parameter binding** instead of string concatenation to prevent SQL injection
- **Validate input data** before executing queries
- **Use appropriate database permissions** in production

This implementation gives you the full power of SQLite without the need to create new native methods for each use case. You can execute any SQL query while maintaining type safety and proper error handling.
