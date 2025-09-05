import { useState, useEffect } from '@lynx-js/react';
import { DatabaseHelper } from '../../../utils/DatabaseHelper.js';

export function DatabaseDemo() {
  const [theme, setTheme] = useState<string>('light');
  const [dbSize, setDbSize] = useState<number>(0);
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const loadDatabaseInfo = async () => {
    // Load current theme
    const currentTheme = await DatabaseHelper.getSetting('theme');
    if (currentTheme) {
      setTheme(currentTheme);
    }

    // Load database size
    const size = await DatabaseHelper.getDatabaseSize();
    setDbSize(size);

    // Load table list
    const tableList = await DatabaseHelper.getTableList();
    setTables(tableList);
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    const success = await DatabaseHelper.setSetting('theme', newTheme);
    if (success) {
      setTheme(newTheme);
    }
  };

  const clearCache = async () => {
    await DatabaseHelper.clearOldMediaCache(0); // Clear all cache
    await loadDatabaseInfo(); // Refresh info
  };

  const vacuumDatabase = async () => {
    await DatabaseHelper.vacuum();
    await loadDatabaseInfo(); // Refresh info
  };

  const containerStyle = {
    padding: '20px',
    backgroundColor: theme === 'light' ? '#ffffff' : '#333333',
    color: theme === 'light' ? '#000000' : '#ffffff',
    minHeight: '100vh',
  };

  const buttonStyle = {
    padding: '10px 15px',
    margin: '5px',
    backgroundColor: '#007AFF',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  const cardStyle = {
    backgroundColor: theme === 'light' ? '#f5f5f5' : '#444444',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
  };

  return (
    <view style={containerStyle}>
      <text
        style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}
      >
        Database Demo
      </text>

      {/* Theme Setting */}
      <view style={cardStyle}>
        <text style={{ fontSize: '18px', marginBottom: '10px' }}>
          Theme Settings
        </text>
        <text>Current theme: {theme}</text>
        <view style={buttonStyle} bindtap={toggleTheme}>
          <text style={{ color: 'white' }}>Toggle Theme</text>
        </view>
      </view>

      {/* Database Info */}
      <view style={cardStyle}>
        <text style={{ fontSize: '18px', marginBottom: '10px' }}>
          Database Information
        </text>
        <text>Database size: {dbSize} pages</text>
        <text>Tables: {tables.join(', ')}</text>
      </view>

      {/* Database Actions */}
      <view style={cardStyle}>
        <text style={{ fontSize: '18px', marginBottom: '10px' }}>
          Database Actions
        </text>
        <view
          style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}
        >
          <view style={buttonStyle} bindtap={clearCache}>
            <text style={{ color: 'white' }}>Clear Cache</text>
          </view>
          <view style={buttonStyle} bindtap={vacuumDatabase}>
            <text style={{ color: 'white' }}>Vacuum DB</text>
          </view>
          <view style={buttonStyle} bindtap={loadDatabaseInfo}>
            <text style={{ color: 'white' }}>Refresh Info</text>
          </view>
        </view>
      </view>

      {/* Tables List */}
      <view style={cardStyle}>
        <text style={{ fontSize: '18px', marginBottom: '10px' }}>
          Available Tables
        </text>
        {tables.map((table, index) => (
          <text key={index} style={{ marginLeft: '10px' }}>
            • {table}
          </text>
        ))}
      </view>
    </view>
  );
}
